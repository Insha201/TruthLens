import os

from dotenv import load_dotenv

from llm import complete
from dataclasses import dataclass, field
from storage.vector_store import search_documents
from text_utils import normalize_text

load_dotenv()


@dataclass
class NarrativeResult:
    narrative: str
    confidence: float
    status: str
    sources: list = field(default_factory=list)      # RAG doc texts used
    source_ids: list = field(default_factory=list)   # their Chroma ids


def draft_narrative(claim: str) -> NarrativeResult:
    """
    Retrieve supporting information and generate
    a counter-narrative using Groq.
    """

    results = search_documents(claim, limit=3)

    documents = results.get("documents", [[]])[0]
    document_ids = results.get("ids", [[]])[0]

    if not documents:
        return NarrativeResult(
            narrative="No supporting information found.",
            confidence=0.0,
            status="no_evidence"
        )

    supporting_information = "\n".join(documents)

    prompt = f"""
You are a responsible misinformation response agent.

The following claim may contain misinformation:

CLAIM:
{claim}

Use ONLY the following retrieved evidence:

EVIDENCE:
{supporting_information}

Write a short, factual counter-narrative that:
- Corrects the misleading claim.
- Uses only the provided evidence.
- Does not invent facts.
- Does not exaggerate.
- Uses a neutral and respectful tone.

Return only the counter-narrative.
"""

    narrative = normalize_text(complete(prompt))

    return NarrativeResult(
        narrative=narrative,
        confidence=0.8,
        status="drafted",
        sources=list(documents),
        source_ids=list(document_ids),
    )