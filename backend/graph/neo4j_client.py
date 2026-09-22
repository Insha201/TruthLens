import hashlib
import json
import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from neo4j import GraphDatabase


load_dotenv()


NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")


driver = GraphDatabase.driver(
    NEO4J_URI,
    auth=(NEO4J_USERNAME, NEO4J_PASSWORD)
)


# ---------------------------------------------------------------- audit chain
# First event on a claim links to this sentinel instead of a real predecessor.
GENESIS_HASH = "0" * 64

# Append-only mirror of each chain's newest hash, deliberately kept outside
# Neo4j so that rewriting the graph alone cannot hide a tampered trail.
_CHAIN_TIP_LOG = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "audit_chain_tips.log",
)


def close_driver():
    driver.close()

def create_claim_node(claim: str):
    with driver.session() as session:
        session.run(
            """
            MERGE (c:Claim {text: $claim})
            ON CREATE SET c.created_at = datetime()
            """,
            claim=claim
        )


def upsert_claim(claim: str, fields: dict):
    """
    Merge a :Claim node by its text and persist the latest pipeline
    output on it (detector / origin / spread / narrative fields).
    Lets GET /api/claims replay the full result later.
    """
    with driver.session() as session:
        session.run(
            """
            MERGE (c:Claim {text: $claim})
            ON CREATE SET c.created_at = datetime()
            SET c += $fields,
                c.updated_at = datetime()
            """,
            claim=claim,
            fields=fields,
        )


def add_claim_alias(claim: str, alias: str):
    """
    Record an alternate wording that was merged into this canonical claim,
    so the UI can show "also reported as ...".
    """
    with driver.session() as session:
        session.run(
            """
            MATCH (c:Claim {text: $claim})
            SET c.aliases = CASE
                    WHEN c.aliases IS NULL       THEN [$alias]
                    WHEN $alias IN c.aliases     THEN c.aliases
                    ELSE c.aliases + $alias
                END
            SET c.alias_count = size(c.aliases)
            """,
            claim=claim,
            alias=alias,
        )


def list_claims(limit: int = 100):
    """
    Return every stored claim (newest first) with its persisted pipeline
    fields, its review decision and its audit trail. Powers GET /api/claims.
    """
    with driver.session() as session:
        result = session.run(
            """
            MATCH (c:Claim)
            OPTIONAL MATCH (r:Review {claim_id: c.text})
            OPTIONAL MATCH (a:AuditEvent {claim_id: c.text})
            WITH c, r, a
            ORDER BY a.timestamp ASC
            WITH c, r,
                 collect(CASE WHEN a IS NULL THEN NULL ELSE {
                     action: a.action,
                     details: a.details,
                     timestamp: toString(a.timestamp)
                 } END) AS audit
            WITH c, r, [x IN audit WHERE x IS NOT NULL] AS audit_trail
            RETURN c AS claim,
                   r.status AS review_status,
                   r.approved AS review_approved,
                   audit_trail
            ORDER BY coalesce(
                c.updated_at,
                c.created_at,
                CASE WHEN size(audit_trail) > 0
                     THEN datetime(audit_trail[-1].timestamp)
                     ELSE datetime({epochMillis: 0}) END
            ) DESC
            LIMIT $limit
            """,
            limit=limit,
        )

        claims = []
        for record in result:
            node = record["claim"]
            data = dict(node)
            for key in ("created_at", "updated_at"):
                if key in data and data[key] is not None:
                    data[key] = str(data[key])
            data["review_status"] = record["review_status"]
            data["review_approved"] = record["review_approved"]
            data["audit_trail"] = record["audit_trail"]
            claims.append(data)

        return claims

def save_review(claim_id: str, approved: bool):
    with driver.session() as session:
        session.run(
            """
            MERGE (r:Review {claim_id: $claim_id})
            SET r.approved = $approved,
                r.status = CASE
                    WHEN $approved THEN "approved"
                    ELSE "rejected"
                END
            """,
            claim_id=claim_id,
            approved=approved
        )
def get_review(claim_id: str):
    with driver.session() as session:
        result = session.run(
            """
            MATCH (r:Review {claim_id: $claim_id})
            RETURN r.approved AS approved, r.status AS status
            LIMIT 1
            """,
            claim_id=claim_id
        )

        record = result.single()

        if record:
            return {
                "approved": record["approved"],
                "status": record["status"]
            }

        return None
def _event_hash(prev_hash: str, claim_id: str, action: str,
                details: str, ts_iso: str, seq: int) -> str:
    """
    SHA-256 over the canonical JSON form of a single audit event.

    Keys are sorted and separators fixed so the same event always produces the
    same digest, on any machine and any Python version.
    """
    payload = json.dumps(
        {
            "seq": seq,
            "claim_id": claim_id,
            "action": action,
            "details": details,
            "ts_iso": ts_iso,
            "prev_hash": prev_hash,
        },
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _append_chain_tip(claim_id: str, seq: int, digest: str, ts_iso: str):
    """
    Mirror the newest hash to an append-only file OUTSIDE the database.

    Chaining alone only forces an attacker to rewrite every later event. Keeping
    the tip somewhere the database cannot reach is what makes a full-tail
    rewrite detectable. Best effort only: a failure here must never break the
    pipeline, so every error is swallowed and reported.
    """
    try:
        with open(_CHAIN_TIP_LOG, "a", encoding="utf-8") as fh:
            fh.write(json.dumps({
                "ts_iso": ts_iso,
                "claim_id": claim_id,
                "seq": seq,
                "hash": digest,
            }, ensure_ascii=False) + "\n")
    except Exception as e:  # pragma: no cover - disk/permission issues
        print(f"[audit-chain] could not write tip log: {e}")


_audit_index_ready = False


def _ensure_audit_index(session):
    """
    Index (claim_id, seq) so reading a claim's chain tip stays cheap as the
    audit trail grows. Attempted once per process and never fatal.
    """
    global _audit_index_ready
    if _audit_index_ready:
        return
    _audit_index_ready = True
    try:
        session.run(
            "CREATE INDEX audit_claim_seq IF NOT EXISTS "
            "FOR (a:AuditEvent) ON (a.claim_id, a.seq)"
        )
    except Exception as e:  # pragma: no cover - older servers / permissions
        print(f"[audit-chain] index not created ({e}); continuing without it")


def create_audit_event(claim_id: str, action: str, details: str):
    """
    Append a tamper-evident audit event for `claim_id`.

    Every claim carries its own hash chain. Each event stores the SHA-256 of
    its own contents together with the hash of the previous event on that
    claim, so editing any stored event invalidates every event after it and
    `verify_claim_chain()` will report exactly where the break occurs.

    Per-claim chains are used rather than one global chain because a claim's
    events are written sequentially by the pipeline, so no locking is needed
    and concurrent bulk ingestion cannot interleave two claims into a race.

    The timestamp is generated here rather than by the server so that the
    exact string that was hashed can be stored alongside the datetime.
    Returns the new event's digest.
    """
    ts = datetime.now(timezone.utc)
    ts_iso = ts.isoformat()

    with driver.session() as session:
        _ensure_audit_index(session)

        tip = session.run(
            """
            MATCH (a:AuditEvent {claim_id: $claim_id})
            WHERE a.hash IS NOT NULL
            RETURN a.hash AS hash, a.seq AS seq
            ORDER BY a.seq DESC
            LIMIT 1
            """,
            claim_id=claim_id,
        ).single()

        prev_hash = tip["hash"] if tip else GENESIS_HASH
        seq = (tip["seq"] + 1) if tip else 0

        digest = _event_hash(prev_hash, claim_id, action, details, ts_iso, seq)

        session.run(
            """
            CREATE (a:AuditEvent {
                claim_id: $claim_id,
                action: $action,
                details: $details,
                timestamp: $timestamp,
                ts_iso: $ts_iso,
                seq: $seq,
                prev_hash: $prev_hash,
                hash: $hash
            })
            """,
            claim_id=claim_id,
            action=action,
            details=details,
            timestamp=ts,
            ts_iso=ts_iso,
            seq=seq,
            prev_hash=prev_hash,
            hash=digest,
        )

    _append_chain_tip(claim_id, seq, digest, ts_iso)
    return digest


def verify_claim_chain(claim_id: str) -> dict:
    """
    Recompute a claim's audit chain and report whether it is intact.

    Events written before hashing was introduced carry no digest; they are
    counted and reported as unchained rather than being treated as failures,
    so the result stays honest about what is and is not covered.
    """
    with driver.session() as session:
        rows = session.run(
            """
            MATCH (a:AuditEvent {claim_id: $claim_id})
            RETURN a.action AS action,
                   a.details AS details,
                   toString(a.timestamp) AS timestamp,
                   a.ts_iso AS ts_iso,
                   a.seq AS seq,
                   a.prev_hash AS prev_hash,
                   a.hash AS hash
            ORDER BY coalesce(a.seq, -1) ASC, a.timestamp ASC
            """,
            claim_id=claim_id,
        )
        events = [dict(r) for r in rows]

    chained = [e for e in events if e.get("hash")]
    legacy = len(events) - len(chained)

    broken_at = None
    reason = None
    expected_prev = GENESIS_HASH

    for e in chained:
        if e.get("prev_hash") != expected_prev:
            broken_at, reason = e.get("seq"), "previous-hash link does not match"
            break

        recomputed = _event_hash(
            e.get("prev_hash") or "",
            claim_id,
            e.get("action") or "",
            e.get("details") or "",
            e.get("ts_iso") or "",
            e.get("seq"),
        )
        if recomputed != e.get("hash"):
            broken_at, reason = e.get("seq"), "event contents do not match stored hash"
            break

        stored_ts = (e.get("timestamp") or "")[:19]
        hashed_ts = (e.get("ts_iso") or "")[:19]
        if stored_ts and hashed_ts and stored_ts != hashed_ts:
            broken_at, reason = e.get("seq"), "timestamp was altered after hashing"
            break

        expected_prev = e["hash"]

    if broken_at is not None:
        status = "broken"
    elif chained:
        status = "intact"
    else:
        # Nothing on this claim carries a digest yet, so there is nothing to
        # verify. Reported distinctly so an empty chain is never mistaken for
        # a verified one.
        status = "not_chained"

    return {
        "claim_id": claim_id,
        "status": status,
        "verified": status == "intact",
        "valid": broken_at is None,
        "events_total": len(events),
        "events_chained": len(chained),
        "events_unchained_legacy": legacy,
        "broken_at_seq": broken_at,
        "reason": reason,
        "tip_hash": chained[-1]["hash"] if chained and broken_at is None else None,
        "algorithm": "SHA-256 per-claim hash chain",
    }


def claim_usage_by_evidence(limit: int = 500) -> dict:
    """
    Map RAG document id -> [{id, claim, category}] for the claims whose
    counter-narrative was written from that document.
    """
    import json as _json

    usage: dict = {}
    with driver.session() as session:
        rows = session.run(
            """
            MATCH (c:Claim)
            WHERE c.rag_source_ids IS NOT NULL AND c.rag_source_ids <> '[]'
            RETURN c.id AS id, c.text AS claim, c.category AS category,
                   c.rag_source_ids AS ids
            LIMIT $limit
            """,
            limit=limit,
        )
        for r in rows:
            try:
                doc_ids = _json.loads(r["ids"] or "[]")
            except (ValueError, TypeError):
                continue
            for doc_id in doc_ids:
                usage.setdefault(doc_id, []).append({
                    "id": r["id"],
                    "claim": r["claim"],
                    "category": r["category"] or "other",
                })
    return usage
