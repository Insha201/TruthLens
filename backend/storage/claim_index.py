"""
Semantic claim identity.

The Claim Detector phrases the same underlying assertion differently depending
on the wording of the post it came from:

    BBC article     -> "5G towers cause cancer"
    YouTube video   -> "5G radiation causes cancer"

Neo4j MERGEs claims on exact text, so those became two separate :Claim nodes
with one source each. The Origin Tracer then had no propagation chain to
follow and the Spread Predictor saw outlet_count=0 / velocity=0.

This module keeps a Chroma collection of *canonical* claim texts. Every newly
detected claim is matched against it: a close enough neighbour means "this is
the same assertion we already track", and the existing canonical text is
reused so all downstream writes land on one node.

Tuning: CLAIM_DEDUP_MAX_DISTANCE (squared-L2, all-MiniLM-L6-v2).

Measured on this collection:
  0.13  "vaccines cause autism in children" / "vaccines are linked to autism in kids"  MERGE
  0.38  "5G towers cause cancer"            / "5G radiation causes cancer in humans"   MERGE
  0.48  "drinking bleach cures covid"       / "bleach solution cures coronavirus"      MERGE
  0.57  "the moon landing was faked"        / "Apollo 11 was staged by NASA"           MERGE
  0.58  "5G towers cause cancer"            / "5G masts are linked to cancer spikes"   MERGE
  ----- decision boundary -----
  0.80  "vaccines cause autism"             / "vaccines cause infertility"             SEPARATE
  1.75  "the moon landing was faked"        / "5G towers cause cancer"                 SEPARATE

0.70 sits in the gap between the widest true paraphrase seen in live ingestion
(0.653 - "residents near the 5G mast report a rise in cancer" vs "5G radiation
is causing cancer") and the closest genuinely different claim (0.80). Raise it
to merge more aggressively; lower it if distinct claims start getting fused.

The Claim Detector prompt also normalises extracted claims into short
attribution-free assertions, which keeps true paraphrases well under the line.
"""

import hashlib
import os

import chromadb

client = chromadb.PersistentClient(path="./chroma_db")

# Separate from the evidence collection - these are claims, not fact-checks.
claim_collection = client.get_or_create_collection(name="claim_index")

MAX_DISTANCE = float(os.getenv("CLAIM_DEDUP_MAX_DISTANCE", "0.70"))


def _key(text: str) -> str:
    return "claim-" + hashlib.md5(text.strip().lower().encode()).hexdigest()[:12]


def resolve_claim(claim: str) -> tuple[str, bool, float]:
    """
    Map a freshly detected claim onto a canonical claim.

    Returns (canonical_text, is_new, distance).
      is_new=True  -> this claim had no semantic match and is now canonical
      is_new=False -> it matched an existing claim; use that node instead
    """
    claim = (claim or "").strip()
    if not claim:
        return claim, True, 0.0

    try:
        if claim_collection.count() > 0:
            res = claim_collection.query(query_texts=[claim], n_results=1)
            docs = (res.get("documents") or [[]])[0]
            dists = (res.get("distances") or [[]])[0]
            if docs and dists and dists[0] <= MAX_DISTANCE:
                canonical = docs[0]
                if canonical.strip().lower() != claim.strip().lower():
                    print(
                        f"[dedup] '{claim[:60]}' -> merged into "
                        f"'{canonical[:60]}' (distance {dists[0]:.3f})"
                    )
                return canonical, False, float(dists[0])
    except Exception as e:  # pragma: no cover - never block the pipeline
        print(f"Claim dedup lookup failed ({e}); treating claim as new")
        return claim, True, 0.0

    # No match - register this claim as canonical.
    try:
        claim_collection.add(ids=[_key(claim)], documents=[claim])
    except Exception as e:  # pragma: no cover - duplicate id etc.
        print(f"Claim index write failed ({e})")

    return claim, True, 0.0


def index_size() -> int:
    try:
        return claim_collection.count()
    except Exception:
        return 0
