import sys

# Windows consoles default to cp1252; ingestion/agents log unicode. Make
# stdout/stderr UTF-8 so a log line can never crash a request.
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from agents.narrative_drafter import draft_narrative
from agents.claim_detector import detect_claim
from agents.origin_tracer import trace_origin
from agents.spread_predictor import predict_spread
from graph.neo4j_client import (
    create_claim_node,
    save_review,
    get_review,
    create_audit_event,
    list_claims,
    verify_claim_chain,
)
from workflow.graph import misinformation_graph, _claim_id
from ingestion.ingestion_manager import fetch_all_posts, fetch_single_post, get_source_status
from storage.vector_store import add_document, list_documents, count_documents
from translate import translate_text, translate_fields, LANGUAGE_NAMES
from graph.neo4j_client import claim_usage_by_evidence, upsert_claim
from datetime import datetime, timezone

app = FastAPI(
    title="Misinformation Containment System",
    description="Multi-Agent Misinformation Detection & Response Platform",
    version="1.0.0"
)

# Allow the frontend adapter (server.ts on :3000) and local tools to call us.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Health Check ────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "misinformation-containment-backend"
    }


def _graph_input(post: dict) -> dict:
    """Build the LangGraph state from an ingested post, carrying its
    source metadata so the pipeline can label + trace it."""
    return {
        "text": post["text"],
        "post_source": post.get("source", ""),
        "platform": post.get("platform", "") or "manual",
        "url": post.get("url", ""),
        "author": post.get("author", ""),
        "published_at": post.get("published_at", ""),
        "suspicion_score": float(post.get("suspicion_score", 0.0)),
    }


# ─── Manual single post ingest ───────────────────────────────
@app.post("/api/ingest")
def ingest_single_post(text: str, source: str = "manual"):
    """
    Manually submit a single post into the pipeline.
    Runs the real multi-agent graph and persists the result in Neo4j.
    """
    post = fetch_single_post(text, source=source)
    result = misinformation_graph.invoke(_graph_input(post))
    claim_text = result.get("claim") or post["text"]
    return {
        "claim_id": _claim_id(claim_text),
        "post": post,
        "pipeline_result": result
    }


# ─── List every processed claim (real Neo4j history) ─────────
@app.get("/api/claims")
def get_claims(limit: int = 100):
    """
    Return all claims processed so far, newest first, with their
    persisted detector / origin / spread / narrative fields, review
    decision and audit trail.
    """
    claims = list_claims(limit=limit)
    review_queue = [
        c for c in claims
        if c.get("detection_status") == "review_required" and not c.get("review_status")
    ]
    dispatched = [c for c in claims if c.get("review_status") == "approved"]
    return {
        "claims": claims,
        "metrics": {
            "activeIncidentsCount": len(claims),
            "gatedReviewQueueLength": len(review_queue),
            "dispatchesTodayCount": len(dispatched),
        },
    }


# ─── RAG evidence store (real Chroma vector DB) ──────────────
@app.get("/api/evidence")
def get_evidence(limit: int = 200):
    """
    List the fact-check documents currently indexed in the RAG vector store
    (the same store the Narrative Drafter retrieves from).
    """
    docs = list_documents(limit=limit)

    # Link each document back to the claims whose counter-narrative actually
    # used it, so the UI can say "this evidence rebuts these claims".
    usage = claim_usage_by_evidence()
    for d in docs:
        d["used_by"] = usage.get(d["id"], [])

    return {"count": count_documents(), "documents": docs}


@app.post("/api/evidence")
def add_evidence(text: str, doc_id: str = ""):
    """Index a new verified fact-check snippet into the RAG store."""
    text = text.strip()
    if not text:
        return {"ok": False, "error": "text is required"}
    new_id = doc_id.strip() or f"doc-{_claim_id(text)}"
    add_document(new_id, text)
    return {"ok": True, "id": new_id, "count": count_documents()}


# ─── Publish an approved counter-narrative ───────────────────
@app.post("/api/claims/{claim_id}/publish")
def publish_narrative(claim_id: str, channel: str = "internal_register"):
    """
    Record that a reviewer released this counter-narrative.

    NOTE: this does NOT transmit anything to any external or government
    body. It only writes the decision and its timestamp into Neo4j so the
    audit trail shows who released what and when. Wiring a real outbound
    channel (PIB Fact Check, X Community Notes, a public page) is a
    separate, deliberate step.
    """
    claim_text = claim_id
    existing = [c for c in list_claims(limit=300) if c.get("id") == claim_id]
    if existing:
        claim_text = existing[0].get("text") or claim_id

    published_at = datetime.now(timezone.utc).isoformat()
    upsert_claim(claim_text, {
        "published_at": published_at,
        "published_channel": channel,
    })
    create_audit_event(
        claim_text,
        "narrative_published",
        f"Counter-narrative released to '{channel}' by a reviewer. "
        "Recorded locally; no external submission was made.",
    )
    return {
        "ok": True,
        "claim_id": claim_id,
        "channel": channel,
        "published_at": published_at,
        "transmitted_externally": False,
    }


# ─── Available ingestion sources ─────────────────────────────
@app.get("/api/sources")
def list_sources():
    """
    Report every ingestion source and whether its API key is configured.
    `live` connectors run today; the rest are staged scaffolds.
    """
    return {"sources": get_source_status()}


# ─── Bulk ingest from all sources ────────────────────────────
@app.post("/api/ingest/bulk")
def ingest_bulk(
    include_news: bool = True,
    include_youtube: bool = True,
    include_rss: bool = True,
    include_twitter: bool = False,
    include_telegram: bool = False,
    include_reddit: bool = False,
    include_tiktok: bool = False,
    max_total: int = 10
):
    """
    Fetch posts from all connected sources, keep the `max_total` most
    suspicious (heuristic score), and run those through the full pipeline.
    Pass max_total=0 to process every fetched post.

    The social sources are off by default; set their flag to true
    once the matching API key is present in backend/.env.
    """
    posts = fetch_all_posts(
        include_news=include_news,
        include_youtube=include_youtube,
        include_rss=include_rss,
        include_twitter=include_twitter,
        include_telegram=include_telegram,
        include_reddit=include_reddit,
        include_tiktok=include_tiktok,
        max_per_source=10,
        max_total=max_total,
    )

    results = []
    for post in posts:
        try:
            result = misinformation_graph.invoke(_graph_input(post))
            results.append({
                "post": post,
                "pipeline_result": result
            })
        except Exception as e:
            results.append({
                "post": post,
                "error": str(e)
            })

    return {
        "total_ingested": len(posts),
        "results": results
    }


# ─── Background bulk ingest (non-blocking) ───────────────────
@app.post("/api/ingest/bulk/background")
def ingest_bulk_background(background_tasks: BackgroundTasks):
    """
    Run bulk ingestion in the background.
    Returns immediately, processes in background.
    Perfect for large batches.
    """
    def run_ingestion():
        posts = fetch_all_posts(max_per_source=10, max_total=10)
        for post in posts:
            try:
                misinformation_graph.invoke(_graph_input(post))
            except Exception as e:
                print(f"Pipeline error: {e}")

    background_tasks.add_task(run_ingestion)

    return {
        "status": "ingestion started in background",
        "message": "Posts are being fetched and processed. Check Neo4j for results."
    }


# ─── Individual agent endpoints ──────────────────────────────
@app.post("/api/claims/detect")
def detect_misinformation(text: str):
    result = detect_claim(text)
    return {
        "claim": result.claim,
        "confidence": result.confidence,
        "is_misinformation": result.is_misinformation,
        "severity": result.severity,
        "status": result.status
    }


@app.post("/api/claims/trace")
def trace_claim_origin(
    claim: str,
    platform: str = "",
    url: str = "",
    author: str = "",
    published_at: str = "",
    source_name: str = "",
):
    result = trace_origin(
        claim,
        platform=platform,
        url=url,
        author=author,
        published_at=published_at,
        source_name=source_name,
    )
    return {
        "source": result.source,
        "confidence": result.confidence,
        "status": result.status,
        "first_seen": result.first_seen,
        "outlet_count": result.outlet_count,
        "timeline": result.timeline,
        "summary": result.summary,
    }


@app.post("/api/claims/predict-spread")
def predict_claim_spread(
    claim: str,
    severity: int = 5,
    suspicion_score: float = 0.0,
    is_misinformation: bool = True,
    detection_confidence: float = 0.6,
    outlet_count: int = 1,
):
    result = predict_spread(
        claim,
        severity=severity,
        suspicion_score=suspicion_score,
        is_misinformation=is_misinformation,
        detection_confidence=detection_confidence,
        outlet_count=outlet_count,
    )
    return {
        "risk_score": result.risk_score,
        "predicted_reach": result.predicted_reach,
        "status": result.status,
        "r0": result.r0,
        "current_reach_est": result.current_reach_est,
        "projected_6h_uncontained": result.projected_6h_uncontained,
        "projected_6h_contained": result.projected_6h_contained,
        "reduction_pct": result.reduction_pct,
        "velocity_outlets_per_day": result.velocity_outlets_per_day,
        "drivers": result.drivers,
    }


@app.post("/api/claims/draft")
def draft_claim_narrative(claim: str):
    result = draft_narrative(claim)
    return {
        "narrative": result.narrative,
        "confidence": result.confidence,
        "status": result.status
    }


# ─── Human review endpoints ───────────────────────────────────
@app.post("/api/claims/{claim_id}/review")
def review_claim(claim_id: str, approved: bool):
    status = "approved" if approved else "rejected"
    save_review(claim_id, approved)
    create_audit_event(
        claim_id,
        "review_approved" if approved else "review_rejected",
        "Human reviewer approved the claim" if approved else "Human reviewer rejected the claim"
    )
    return {
        "claim_id": claim_id,
        "approved": approved,
        "status": status
    }


@app.get("/api/claims/{claim_id}/review")
def get_claim_review(claim_id: str):
    review = get_review(claim_id)
    if review is None:
        return {
            "claim_id": claim_id,
            "status": "not_reviewed"
        }
    return {
        "claim_id": claim_id,
        "approved": review["approved"],
        "status": review["status"]
    }


@app.post("/api/translate")
def translate_payload(payload: dict):
    """
    Translate agent output for display.

    Body: {"target": "hi" | "mr" | "en", "fields": {"name": "text", ...}}

    The analysis itself is always produced and verified in English, because the
    evidence corpus grounding it is English. This endpoint renders that verified
    analysis for a Hindi or Marathi reader; the UI labels the result as a
    machine translation so it is not mistaken for the verified original.
    """
    target = str(payload.get("target") or "en")
    if target not in LANGUAGE_NAMES:
        return {"target": "en", "fields": payload.get("fields") or {}, "translated": False}

    fields = payload.get("fields") or {}
    if not isinstance(fields, dict):
        return {"target": target, "fields": {}, "translated": False}

    return {
        "target": target,
        "fields": translate_fields(fields, target),
        "translated": target != "en",
    }


@app.get("/api/claims/{claim_id}/verify-chain")
def verify_chain(claim_id: str):
    """
    Recompute this claim's SHA-256 audit chain and report whether it is intact.

    Returns valid=false together with the sequence number of the first event
    whose stored hash no longer matches its contents, which is what makes the
    audit trail tamper-evident rather than merely present.
    """
    return verify_claim_chain(claim_id)


@app.post("/api/claims")
def create_claim(claim: str):
    create_claim_node(claim)
    create_audit_event(claim, "claim_created", "Claim stored in the system")
    return {
        "claim": claim,
        "status": "stored"
    }


# ─── Full workflow ────────────────────────────────────────────
@app.post("/api/workflow/run")
def run_workflow(text: str):
    result = misinformation_graph.invoke({"text": text})
    return result