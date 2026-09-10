import os

from dotenv import load_dotenv
from groq import Groq
from dataclasses import dataclass
from storage.vector_store import search_documents

load_dotenv()

groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


@dataclass
class NarrativeResult:
    narrative: str
    confidence: float
    status: str


def draft_narrative(claim: str) -> NarrativeResult:
    """
    Retrieve supporting information and generate
    a counter-narrative using Groq.
    """

    results = search_documents(claim, limit=3)

    documents = results.get("documents", [[]])[0]

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

    response = groq_client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    narrative = response.choices[0].message.content.strip()

    return NarrativeResult(
        narrative=narrative,
        confidence=0.8,
        status="drafted"
    )