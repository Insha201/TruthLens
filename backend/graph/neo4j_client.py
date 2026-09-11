import os

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
def create_audit_event(claim_id: str, action: str, details: str):
    with driver.session() as session:
        session.run(
            """
            CREATE (a:AuditEvent {
                claim_id: $claim_id,
                action: $action,
                details: $details,
                timestamp: datetime()
            })
            """,
            claim_id=claim_id,
            action=action,
            details=details
        )

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
