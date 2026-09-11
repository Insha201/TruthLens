import os
import re

from dataclasses import dataclass, field
from dotenv import load_dotenv

from llm import complete
from text_utils import normalize_text


load_dotenv()

# Severity 9-10 claims are the only ones that should stop the pipeline for a
# human. Previously this was 8, which sent ~53% of everything to review.
REVIEW_SEVERITY_THRESHOLD = int(os.getenv("REVIEW_SEVERITY_THRESHOLD", "9"))

# Subject domains. Claims and evidence share this taxonomy so the UI can
# group "this misinformation is about healthcare" with the healthcare evidence.
VALID_CATEGORIES = {
    "public_health", "elections_civic", "emergency_disaster",
    "financial_panic", "geopolitics", "science_tech", "other",
}


@dataclass
class DetectionResult:
    claim: str
    confidence: float
    is_misinformation: bool
    severity: int
    status: str
    # Grounded explanation of the numbers above.
    rationale: str = ""                       # why this severity, in one sentence
    techniques: list = field(default_factory=list)   # manipulation tactics found
    keywords: list = field(default_factory=list)     # exact phrases from the text
    harm: str = ""                            # concrete harm if believed
    category: str = "other"                   # subject domain


def _list_from(line: str) -> list:
    """Split a comma-separated model line into a clean list."""
    if not line:
        return []
    parts = [normalize_text(p).strip(" .;") for p in line.split(",")]
    out = []
    for p in parts:
        if p and p.lower() not in {"none", "n/a", "na", "-"} and p not in out:
            out.append(p)
    return out[:6]


def detect_claim(text: str) -> DetectionResult:
    """
    Classify a post with Groq and make it justify the numbers it returns.

    The prompt pins severity to an explicit rubric so the score means the same
    thing across runs, and requires a rationale plus the specific manipulation
    techniques and phrases the judgement rests on. Neutral factual reporting is
    explicitly excluded so routine news stops being flagged as severity 8.
    """

    prompt = f"""
You are a misinformation detection agent. Analyse this post:

"{text}"

FIRST decide whether this is even a misinformation candidate.
Set MISINFORMATION: false and SEVERITY: 1 when the post is
  - neutral factual reporting by a news outlet,
  - a fact-check or debunk of a false claim,
  - clearly labelled opinion, satire or fiction,
  - or a statement that is broadly accepted as true.
Reporting THAT a false claim exists is not itself misinformation.

SEVERITY ANCHORS (do not invent your own scale):
 10 could kill/injure if acted on. 9 serious harm to many (fake cure, fake
 election fraud, bank-run rumour). 7-8 real but narrower harm (anti-vaccine
 framing, fabricated quote). 4-6 misleading, limited harm. 2-3 trivial.
 1 not misinformation.

CONFIDENCE means: how certain are you the post is misinformation, judged on
the evidence in the text itself. Use the full 0-1 range. Be under 0.5 when the
claim is plausible, partly true, or you cannot tell without outside sources.

Return ONLY these lines, nothing else:

MISINFORMATION: true or false
CONFIDENCE: number between 0 and 1
SEVERITY: whole number 1-10
CLAIM: the core assertion as a short declarative statement, max 12 words.
  Strip attribution and framing ("residents say", "BREAKING", "doctors
  confirm") so two posts making the same claim produce the same sentence.
RATIONALE: one sentence naming the rubric anchor you chose and why.
HARM: one short phrase for the concrete harm if a reader believed it, or "none".
TECHNIQUES: up to 4 comma-separated manipulation tactics actually present
  (e.g. fabricated authority, false urgency, missing source, cherry-picked
  statistic, emotional appeal, conspiracy framing), or "none".
KEYWORDS: up to 5 comma-separated phrases copied verbatim from the post that
  drove your judgement, or "none".
CATEGORY: one of public_health, elections_civic, emergency_disaster,
  financial_panic, geopolitics, science_tech, other
"""

    result = complete(prompt)

    def grab(pattern, default=""):
        m = re.search(pattern, result, re.IGNORECASE)
        return m.group(1).strip() if m else default

    misinformation = grab(r"MISINFORMATION:\s*(true|false)", "false").lower() == "true"

    try:
        confidence = float(grab(r"CONFIDENCE:\s*([0-9]*\.?[0-9]+)", "0") or 0)
    except ValueError:
        confidence = 0.0
    confidence = min(max(confidence, 0.0), 1.0)

    try:
        severity = int(grab(r"SEVERITY:\s*(\d+)", "1") or 1)
    except ValueError:
        severity = 1
    severity = min(max(severity, 1), 10)

    claim = normalize_text(grab(r"CLAIM:\s*(.*)")) or normalize_text(text)
    rationale = normalize_text(grab(r"RATIONALE:\s*(.*)"))
    harm = normalize_text(grab(r"HARM:\s*(.*)"))
    techniques = _list_from(grab(r"TECHNIQUES:\s*(.*)"))
    keywords = _list_from(grab(r"KEYWORDS:\s*(.*)"))
    category = normalize_text(grab(r"CATEGORY:\s*(\w+)", "other")).lower()
    if category not in VALID_CATEGORIES:
        category = "other"

    if harm.lower() in {"none", "n/a", ""}:
        harm = ""

    # A post the model judged NOT to be misinformation should never be
    # escalated, whatever severity number it happened to emit.
    if not misinformation:
        severity = min(severity, 3)

    # Routing. Confidence is now properly calibrated (the model returns 0.2-0.4
    # for plausible / partly-true claims), so a flat "confidence < 0.6 -> drop"
    # rule would silently bin genuinely harmful claims it is merely unsure
    # about. Drop only when the stakes AND the certainty are both low.
    if severity >= REVIEW_SEVERITY_THRESHOLD and confidence >= 0.6:
        status = "review_required"
    elif not misinformation and severity <= 3:
        status = "dropped"                       # clearly not misinformation
    elif confidence < 0.4 and severity <= 4:
        status = "dropped"                       # low stakes and low certainty
    else:
        status = "pending"                       # analysed, not escalated

    return DetectionResult(
        claim=claim,
        confidence=confidence,
        is_misinformation=misinformation,
        severity=severity,
        status=status,
        rationale=rationale,
        techniques=techniques,
        keywords=keywords,
        harm=harm,
        category=category,
    )
