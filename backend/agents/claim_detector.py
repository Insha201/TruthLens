import os
import re

from dataclasses import dataclass
from dotenv import load_dotenv
from groq import Groq


load_dotenv()

groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


@dataclass
class DetectionResult:
    claim: str
    confidence: float
    is_misinformation: bool
    severity: int
    status: str


def detect_claim(text: str) -> DetectionResult:
    """
    Classify a social media claim using Groq.
    """

    prompt = f"""
You are a misinformation detection agent.

Analyze the following social media post:

"{text}"

Determine whether the post contains a factual claim that could be misinformation.


Return ONLY these four lines:

MISINFORMATION: true or false
CONFIDENCE: number between 0 and 1
SEVERITY: whole number between 1 and 10
CLAIM: the main factual claim from the post

Do not provide explanations. Severity 8 or higher requires human review.
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

    result = response.choices[0].message.content
    print("FULL GROQ RESPONSE:", repr(result))

    misinformation_match = re.search(
        r"MISINFORMATION:\s*(true|false)",
        result,
        re.IGNORECASE
    )

    confidence_match = re.search(
        r"CONFIDENCE:\s*([0-9]*\.?[0-9]+)",
        result,
        re.IGNORECASE
    )

    severity_match = re.search(
        r"SEVERITY:\s*(\d+)",
        result,
        re.IGNORECASE
    )

    claim_match = re.search(
        r"CLAIM:\s*(.*)",
        result,
        re.IGNORECASE
    )

    misinformation = (
        misinformation_match.group(1).lower() == "true"
        if misinformation_match
        else False
    )

    confidence = (
        float(confidence_match.group(1))
        if confidence_match
        else 0.0
    )

    severity = (
        int(severity_match.group(1))
        if severity_match
        else 1
    )

    claim = (
        claim_match.group(1).strip()
        if claim_match
        else text
    )

    status = (
        "review_required"
        if severity >= 8 and confidence >= 0.6
        else ("pending" if confidence >= 0.6 else "dropped")
    )

    return DetectionResult(
        claim=claim,
        confidence=confidence,
        is_misinformation=misinformation,
        severity=severity,
        status=status
    )