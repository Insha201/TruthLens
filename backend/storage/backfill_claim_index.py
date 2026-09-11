"""
Register every existing Neo4j claim in the semantic claim index.

Without this, claims that were ingested before semantic dedup existed are
invisible to `resolve_claim()`, so a new post making the same assertion would
create a second node instead of merging onto the original.

This only ADDS existing canonical claims to the index — it never merges or
rewrites anything already in Neo4j.

Run from backend/:

    python -m storage.backfill_claim_index
"""

import sys

from graph.neo4j_client import driver
from storage.claim_index import _key, claim_collection, index_size


def backfill() -> int:
    with driver.session() as session:
        rows = session.run("MATCH (c:Claim) RETURN c.text AS text")
        claims = [r["text"] for r in rows if r["text"]]

    existing = set(claim_collection.get().get("ids") or [])
    new_ids, new_docs = [], []

    for text in claims:
        key = _key(text)
        if key in existing:
            continue
        existing.add(key)
        new_ids.append(key)
        new_docs.append(text)

    if new_ids:
        # Chroma handles batches fine; chunk to stay well within limits.
        for i in range(0, len(new_ids), 200):
            claim_collection.add(ids=new_ids[i:i + 200], documents=new_docs[i:i + 200])

    print(f"Neo4j claims: {len(claims)} | newly indexed: {len(new_ids)} | index size: {index_size()}")
    return len(new_ids)


if __name__ == "__main__":
    sys.exit(0 if backfill() >= 0 else 1)
