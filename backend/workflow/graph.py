from graph.neo4j_client import create_claim_node, create_audit_event
from typing import TypedDict

from langgraph.graph import StateGraph, END

from agents.claim_detector import detect_claim
from agents.origin_tracer import trace_origin
from agents.spread_predictor import predict_spread
from agents.narrative_drafter import draft_narrative


class MisinformationState(TypedDict):
    text: str
    claim: str
    detection_confidence: float
    severity: int
    is_misinformation: bool
    detection_status: str
    source: str
    origin_confidence: float
    origin_status: str
    risk_score: float
    predicted_reach: int
    spread_status: str
    narrative: str
    narrative_confidence: float
    narrative_status: str


def detect_node(state: MisinformationState):
    result = detect_claim(state["text"])

    if result.confidence >= 0.6:
        create_claim_node(result.claim)
        create_audit_event(
            result.claim,
            "claim_detected",
            "Claim passed the confidence threshold and was accepted"
        )

    if result.confidence < 0.6:
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
    if state["detection_status"] == "review_required":
        create_audit_event(
            state["claim"],
            "review_required",
            "High-severity claim routed for human review"
        )
        return "review"

    if state["detection_status"] == "dropped":
        return "end"

    return "trace"
def review_node(state: MisinformationState):
    return {
        "narrative": "",
        "narrative_confidence": 0.0,
        "narrative_status": "awaiting_human_review"
    }

def trace_node(state: MisinformationState):
    result = trace_origin(state["claim"])

    create_audit_event(
        state["claim"],
        "origin_traced",
        "Origin tracing completed"
    )

    return {
        "source": result.source,
        "origin_confidence": result.confidence,
        "origin_status": result.status
    }


def spread_node(state: MisinformationState):
    result = predict_spread(state["claim"])

    create_audit_event(
        state["claim"],
        "spread_predicted",
        "Spread prediction completed"
    )

    return {
        "risk_score": result.risk_score,
        "predicted_reach": result.predicted_reach,
        "spread_status": result.status
    }


def narrative_node(state: MisinformationState):
    result = draft_narrative(state["claim"])

    create_audit_event(
        state["claim"],
        "narrative_drafted" if result.status == "drafted" else "narrative_no_evidence",
        "Counter-narrative drafting completed"
        if result.status == "drafted"
        else "No supporting evidence found for counter-narrative"
    )

    return {
        "narrative": result.narrative,
        "narrative_confidence": result.confidence,
        "narrative_status": result.status
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
        "review": "review",
        "end": END,
        "trace": "trace"
    }
)
workflow.add_edge("trace", "spread")
workflow.add_edge("spread", "narrative")
workflow.add_edge("narrative", END)

misinformation_graph = workflow.compile()