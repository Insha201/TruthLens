import hashlib
import json

from graph.neo4j_client import (
    create_claim_node,
    create_audit_event,
    upsert_claim,
    add_claim_alias,
)
from storage.claim_index import resolve_claim
from typing import TypedDict

from langgraph.graph import StateGraph, END


def _claim_id(claim: str) -> str:
    """Stable id for a claim so re-running the same text updates one node."""
    return "clm-" + hashlib.md5(claim.strip().lower().encode()).hexdigest()[:10]

from agents.claim_detector import detect_claim
from agents.origin_tracer import trace_origin
from agents.spread_predictor import predict_spread
from agents.narrative_drafter import draft_narrative


class MisinformationState(TypedDict, total=False):
    text: str
    # Ingestion metadata for the post that carried this claim (optional —
    # single /api/ingest calls only pass `text`).
    post_source: str      # e.g. "newsapi", "BBC News", "youtube"
    platform: str         # e.g. "news", "youtube", "rss", "manual"
    url: str
    author: str
    published_at: str
    suspicion_score: float
    claim: str
    detection_confidence: float
    severity: int
    is_misinformation: bool
    detection_status: str
    detection_rationale: str
    detection_harm: str
    detection_techniques: str
    detection_keywords: str
    category: str
    source: str
    origin_confidence: float
    origin_status: str
    origin_first_seen: str
    origin_outlet_count: int
    origin_summary: str
    origin_timeline: str
    risk_score: float
    predicted_reach: int
    spread_status: str
    spread_r0: float
    spread_current_reach: int
    spread_proj_uncontained: int
    spread_proj_contained: int
    spread_reduction_pct: float
    spread_velocity: float
    spread_drivers: str
    narrative: str
    narrative_confidence: float
    narrative_status: str
    rag_sources: str


def detect_node(state: MisinformationState):
    result = detect_claim(state["text"])

    # Store only what the detector actually accepted. This used to gate on
    # `confidence >= 0.6`, which let through claims the detector had already
    # marked "dropped" (e.g. neutral news it scored at high confidence) - they
    # ended up in Neo4j and in the UI despite being rejected.
    if result.status != "dropped":
        # Resolve the freshly worded claim onto a canonical one so that two
        # outlets phrasing the same assertion differently land on ONE node.
        # This is what gives the Origin Tracer a chain to follow and the
        # Spread Predictor a real outlet count / velocity.
        canonical, is_new, distance = resolve_claim(result.claim)

        fields = {
            "id": _claim_id(canonical),
            "original_text": state["text"],
            "claim": canonical,
            "detection_confidence": float(result.confidence),
            "severity": int(result.severity),
            "is_misinformation": bool(result.is_misinformation),
            "detection_status": result.status,
            "detection_rationale": result.rationale,
            "detection_harm": result.harm,
            "detection_techniques": json.dumps(result.techniques),
            "detection_keywords": json.dumps(result.keywords),
            "category": result.category,
            "stage": "detector",
            # Carry the ingestion metadata onto the claim node so the UI
            # can show which source (news / youtube / rss) it came from.
            "platform": state.get("platform", "") or "manual",
            "post_source": state.get("post_source", ""),
            "url": state.get("url", ""),
            "author": state.get("author", ""),
            "published_at": state.get("published_at", ""),
            "suspicion_score": float(state.get("suspicion_score", 0.0)),
        }

        create_claim_node(canonical)
        upsert_claim(canonical, fields)

        if not is_new and result.claim.strip().lower() != canonical.strip().lower():
            # Keep the alternate wording on the node for transparency.
            add_claim_alias(canonical, result.claim)
            create_audit_event(
                canonical,
                "claim_merged",
                f'Variant "{result.claim[:80]}" merged into this claim '
                f"(semantic distance {distance:.3f})",
            )
        else:
            create_audit_event(
                canonical,
                "claim_detected",
                f"severity {result.severity}/10, confidence {result.confidence:.2f} - "
                + (result.rationale or "no rationale returned")
            )

        return {
            "claim": canonical,
            "detection_confidence": result.confidence,
            "is_misinformation": result.is_misinformation,
            "severity": result.severity,
            "detection_status": result.status,
            "detection_rationale": result.rationale,
            "detection_harm": result.harm,
            "detection_techniques": json.dumps(result.techniques),
            "detection_keywords": json.dumps(result.keywords),
            "category": result.category,
        }

    create_audit_event(
        result.claim,
        "claim_dropped",
        "Claim was dropped because confidence was below 0.6"
    )

    return {
        "claim": result.claim,
        "detection_confidence": result.confidence,
        "is_misinformation": result.is_misinformation,
        "severity": result.severity,
        "detection_status": result.status
    }
def route_after_detection(state: MisinformationState):
    # Only genuinely low-confidence claims are dropped. Everything else —
    # including high-severity "review_required" claims — runs the full
    # origin -> spread -> narrative analysis first, then the human gate.
    if state["detection_status"] == "dropped":
        return "end"

    return "trace"


def route_after_narrative(state: MisinformationState):
    if state.get("detection_status") == "review_required":
        return "review"
    return "end"


def review_node(state: MisinformationState):
    # The full pipeline already ran; here we just flag the completed
    # analysis for a human reviewer without discarding the draft.
    create_audit_event(
        state["claim"],
        "review_required",
        "High-severity claim flagged for human review after full analysis"
    )
    upsert_claim(state["claim"], {
        "stage": "hitl_gate",
        "review_pending": True,
    })
    return {"narrative_status": state.get("narrative_status", "awaiting_human_review")}

def trace_node(state: MisinformationState):
    result = trace_origin(
        state["claim"],
        platform=state.get("platform", ""),
        url=state.get("url", ""),
        author=state.get("author", ""),
        published_at=state.get("published_at", ""),
        source_name=state.get("post_source", ""),
    )

    upsert_claim(state["claim"], {
        "source": result.source,
        "origin_confidence": float(result.confidence),
        "origin_status": result.status,
        "origin_first_seen": result.first_seen or "",
        "origin_outlet_count": int(result.outlet_count),
        "origin_summary": result.summary or "",
        "origin_timeline": json.dumps(result.timeline),
        "stage": "origin_tracer",
    })

    create_audit_event(
        state["claim"],
        "origin_traced",
        result.summary or "Origin tracing completed"
    )

    return {
        "source": result.source,
        "origin_confidence": result.confidence,
        "origin_status": result.status,
        "origin_first_seen": result.first_seen,
        "origin_outlet_count": result.outlet_count,
        "origin_summary": result.summary,
        "origin_timeline": json.dumps(result.timeline),
    }


def spread_node(state: MisinformationState):
    try:
        timeline = json.loads(state.get("origin_timeline") or "[]")
    except (ValueError, TypeError):
        timeline = []

    result = predict_spread(
        state["claim"],
        severity=state.get("severity", 5),
        suspicion_score=state.get("suspicion_score", 0.0),
        is_misinformation=state.get("is_misinformation", True),
        detection_confidence=state.get("detection_confidence", 0.6),
        outlet_count=state.get("origin_outlet_count", 1),
        timeline=timeline,
    )

    upsert_claim(state["claim"], {
        "risk_score": float(result.risk_score),
        "predicted_reach": int(result.predicted_reach),
        "spread_status": result.status,
        "spread_r0": float(result.r0),
        "spread_current_reach": int(result.current_reach_est),
        "spread_proj_uncontained": int(result.projected_6h_uncontained),
        "spread_proj_contained": int(result.projected_6h_contained),
        "spread_reduction_pct": float(result.reduction_pct),
        "spread_velocity": float(result.velocity_outlets_per_day),
        "spread_drivers": json.dumps(result.drivers),
        "stage": "spread_predictor",
    })

    create_audit_event(
        state["claim"],
        "spread_predicted",
        f"Spread risk {result.risk_score:.2f}, R0 {result.r0}, "
        f"~{result.current_reach_est:,} reached, "
        f"6h projection {result.projected_6h_uncontained:,} uncontained "
        f"vs {result.projected_6h_contained:,} contained"
    )

    return {
        "risk_score": result.risk_score,
        "predicted_reach": result.predicted_reach,
        "spread_status": result.status,
        "spread_r0": result.r0,
        "spread_current_reach": result.current_reach_est,
        "spread_proj_uncontained": result.projected_6h_uncontained,
        "spread_proj_contained": result.projected_6h_contained,
        "spread_reduction_pct": result.reduction_pct,
        "spread_velocity": result.velocity_outlets_per_day,
        "spread_drivers": json.dumps(result.drivers),
    }


def narrative_node(state: MisinformationState):
    result = draft_narrative(state["claim"])

    rag_sources = json.dumps(result.sources)

    upsert_claim(state["claim"], {
        "narrative": result.narrative,
        "narrative_confidence": float(result.confidence),
        "narrative_status": result.status,
        "rag_sources": rag_sources,
        "rag_source_ids": json.dumps(result.source_ids),
        "rag_source_count": len(result.sources),
        # Analysis complete; awaits human review/dispatch, so stop at rag_drafter.
        "stage": "rag_drafter",
    })

    create_audit_event(
        state["claim"],
        "narrative_drafted" if result.status == "drafted" else "narrative_no_evidence",
        f"Counter-narrative drafted from {len(result.sources)} RAG source(s)"
        if result.status == "drafted"
        else "No supporting evidence found in the RAG store for this claim"
    )

    return {
        "narrative": result.narrative,
        "narrative_confidence": result.confidence,
        "narrative_status": result.status,
        "rag_sources": rag_sources,
    }


workflow = StateGraph(MisinformationState)

workflow.add_node("detect", detect_node)
workflow.add_node("review", review_node)
workflow.add_node("trace", trace_node)
workflow.add_node("spread", spread_node)
workflow.add_node("narrative", narrative_node)

workflow.set_entry_point("detect")

workflow.add_conditional_edges(
    "detect",
    route_after_detection,
    {
        "end": END,
        "trace": "trace"
    }
)
workflow.add_edge("trace", "spread")
workflow.add_edge("spread", "narrative")
workflow.add_conditional_edges(
    "narrative",
    route_after_narrative,
    {
        "review": "review",
        "end": END
    }
)
workflow.add_edge("review", END)

misinformation_graph = workflow.compile()