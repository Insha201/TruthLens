from dataclasses import dataclass

from graph.neo4j_client import driver

@dataclass
class OriginResult:
    source: str
    confidence: float
    status: str


def trace_origin(claim: str) -> OriginResult:
    """
    Find whether a claim already exists in the Neo4j graph.
    """

    with driver.session() as session:
        result = session.run(
            """
            MATCH (c:Claim {text: $claim})
            RETURN c.text AS source
            LIMIT 1
            """,
            claim=claim
        )

        record = result.single()

    if record:
        return OriginResult(
            source=record["source"],
            confidence=1.0,
            status="found"
        )

    return OriginResult(
        source="unknown",
        confidence=0.0,
        status="not_found"
    )

