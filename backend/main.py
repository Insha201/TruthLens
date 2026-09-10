from fastapi import FastAPI
from agents.narrative_drafter import draft_narrative
from agents.claim_detector import detect_claim
from agents.origin_tracer import trace_origin
from agents.spread_predictor import predict_spread
from graph.neo4j_client import create_claim_node, save_review, get_review, create_audit_event
from workflow.graph import misinformation_graph
app = FastAPI(
    title="Misinformation Containment System",
    description="Multi-Agent Misinformation Detection & Response Platform",
    version="1.0.0"
)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "misinformation-containment-backend"
    }

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
def trace_claim_origin(claim: str):
    result = trace_origin(claim)

    return {
        "source": result.source,
        "confidence": result.confidence,
        "status": result.status
    }

@app.post("/api/claims/predict-spread")
def predict_claim_spread(claim: str):
    result = predict_spread(claim)

    return {
        "risk_score": result.risk_score,
        "predicted_reach": result.predicted_reach,
        "status": result.status
    }

@app.post("/api/claims/draft")
def draft_claim_narrative(claim: str):
    result = draft_narrative(claim)

    return {
        "narrative": result.narrative,
        "confidence": result.confidence,
        "status": result.status
    }
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

@app.post("/api/claims")
def create_claim(claim: str):
    create_claim_node(claim)
    create_audit_event(claim, "claim_created", "Claim stored in the system")

    return {
        "claim": claim,
        "status": "stored"
    }

@app.post("/api/workflow/run")
def run_workflow(text: str):
    result = misinformation_graph.invoke({
        "text": text
    })

    return result

@app.post("/api/ingest")
def ingest_claim(text: str):
    result = misinformation_graph.invoke({"text": text})
    return result