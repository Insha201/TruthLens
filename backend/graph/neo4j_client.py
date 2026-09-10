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
            """,
            claim=claim
        )

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