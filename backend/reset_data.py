"""
Clear generated pipeline data so the system can be re-seeded from scratch.

DESTRUCTIVE. Deletes from Neo4j: :Claim, :Source, :AuditEvent, :Review, and
every relationship between them. Also clears the semantic claim index.

It does NOT touch the RAG evidence store (use
`python -m storage.seed_evidence --purge` for that), and it does not touch
your .env or any credentials.

Run from backend/:

    python reset_data.py           # shows what would be deleted, then asks
    python reset_data.py --yes     # skip the prompt
"""

import sys

from graph.neo4j_client import driver
from storage.claim_index import claim_collection, index_size

LABELS = ["Claim", "Source", "AuditEvent", "Review"]


def counts() -> dict:
    out = {}
    with driver.session() as session:
        for label in LABELS:
            out[label] = session.run(
                f"MATCH (n:{label}) RETURN count(n) AS n"
            ).single()["n"]
    return out


def wipe():
    with driver.session() as session:
        for label in LABELS:
            session.run(f"MATCH (n:{label}) DETACH DELETE n")

    ids = claim_collection.get().get("ids") or []
    if ids:
        claim_collection.delete(ids=ids)
    return len(ids)


def main() -> int:
    before = counts()
    print("About to delete from Neo4j:")
    for label, n in before.items():
        print(f"   {label:12} {n}")
    print(f"   claim_index  {index_size()} canonical claims")

    if not any(before.values()) and index_size() == 0:
        print("\nNothing to delete.")
        return 0

    if "--yes" not in sys.argv:
        answer = input("\nType 'delete' to confirm: ").strip().lower()
        if answer != "delete":
            print("Aborted; nothing was deleted.")
            return 1

    cleared = wipe()
    after = counts()
    print("\nDeleted. Remaining:")
    for label, n in after.items():
        print(f"   {label:12} {n}")
    print(f"   claim_index  {index_size()} (cleared {cleared})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
