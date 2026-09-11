"""
Origin Tracer agent.

Builds a provenance sub-graph in Neo4j for each claim:

    (:Claim)-[:REPORTED_BY {published_at, ingested_at}]->(:Source)

then reads it back to answer "where did this claim first appear, and who
amplified it?". The ordered outlet list is handed to Groq for a short,
plain-language origin summary.

Falls back to a simple "have we seen this claim text before?" check when a
claim arrives with no source metadata (e.g. a manual /api/ingest submission).
"""

import os
from dataclasses import dataclass, field
from urllib.parse import urlparse

from dotenv import load_dotenv

from llm import complete

from graph.neo4j_client import driver
from text_utils import normalize_text

load_dotenv()


@dataclass
class OriginResult:
    source: str
    confidence: float
    status: str
    first_seen: str = ""
    outlet_count: int = 0
    timeline: list = field(default_factory=list)
    summary: str = ""


def _outlet_identity(platform: str, url: str, author: str, source_name: str):
    """Return (stable_key, display_name) for the outlet that carried the claim."""
    url = (url or "").strip()
    author = (author or "").strip()
    platform = (platform or "").strip()
    source_name = (source_name or "").strip()

    domain = ""
    if url.startswith("http"):
        domain = urlparse(url).netloc.replace("www.", "")

    key = url or (f"{platform}:{author}" if (platform or author) else "")
    name = source_name or author or domain or platform or "unknown source"
    return key, name


def _record_sighting(claim: str, key: str, name: str, platform: str, url: str, published_at: str):
    with driver.session() as session:
        session.run(
            """
            MATCH (c:Claim {text: $claim})
            MERGE (s:Source {key: $key})
              ON CREATE SET s.name = $name,
                            s.platform = $platform,
                            s.url = $url,
                            s.first_ingested_at = datetime()
            SET s.name = coalesce(s.name, $name)
            MERGE (c)-[r:REPORTED_BY]->(s)
              ON CREATE SET r.ingested_at = datetime(),
                            r.first_seen = $published_at
            SET r.published_at = CASE WHEN $published_at <> ''
                                     THEN $published_at ELSE r.published_at END
            """,
            claim=claim,
            key=key,
            name=name,
            platform=platform or "unknown",
            url=url,
            published_at=published_at or "",
        )


def _load_outlets(claim: str) -> list[dict]:
    with driver.session() as session:
        result = session.run(
            """
            MATCH (c:Claim {text: $claim})-[r:REPORTED_BY]->(s:Source)
            RETURN s.name AS outlet,
                   s.platform AS platform,
                   s.url AS url,
                   coalesce(r.published_at, r.first_seen, '') AS timestamp
            """,
            claim=claim,
        )
        outlets = [dict(record) for record in result]

    # Earliest first; blank timestamps sort to the end.
    outlets.sort(key=lambda o: (o["timestamp"] == "", o["timestamp"]))
    return outlets


def _claim_exists(claim: str) -> bool:
    with driver.session() as session:
        record = session.run(
            "MATCH (c:Claim {text: $claim}) RETURN c LIMIT 1", claim=claim
        ).single()
    return record is not None


def _summarize(claim: str, origin: str, first_seen: str, timeline: list[dict]) -> str:
    """Short LLM narrative of the origin. Templated fallback if Groq fails."""
    when = f" ({first_seen})" if first_seen and first_seen != "unknown" else ""
    fallback = (
        f'This claim was first ingested from "{origin}"{when}'
        + f", and has since been seen across {len(timeline)} source(s)."
    )

    # Only one outlet on record — nothing to narrate, skip the LLM call.
    if len(timeline) < 2:
        return normalize_text(
            f'Only one source on record: "{origin}"{when}. '
            "No amplification path is visible yet — re-run ingestion to pick up "
            "other outlets carrying the same claim."
        )

    chain = "\n".join(
        f"- {o['outlet']} [{o['platform']}] {o['timestamp'] or 'no timestamp'}"
        for o in timeline
    ) or "- (no source metadata)"

    prompt = f"""
You are an origin-tracing analyst for a misinformation system.

CLAIM:
{claim}

SOURCES THAT CARRIED THIS CLAIM (earliest first):
{chain}

In 2-3 sentences, state where this claim appears to have originated, when it
was first seen, and how it spread across the listed outlets. Use ONLY the data
above. Do not speculate about motives or invent outlets. Plain text only.
"""

    text = complete(prompt).strip()
    return normalize_text(text) or fallback


def trace_origin(
    claim: str,
    *,
    platform: str = "",
    url: str = "",
    author: str = "",
    published_at: str = "",
    source_name: str = "",
) -> OriginResult:
    """
    Record where this claim was just seen, then trace its earliest known source.
    """

    key, name = _outlet_identity(platform, url, author, source_name)

    # Only build provenance from posts that have a real source URL — i.e.
    # bulk-ingested News / YouTube / RSS items. Hand-typed submissions have
    # no verifiable outlet and fall through to the "seen before?" check.
    if url.strip() and platform not in ("", "manual"):
        try:
            _record_sighting(claim, key, name, platform, url, published_at)
        except Exception as e:  # pragma: no cover - defensive
            print(f"Origin sighting write error: {e}")

    outlets = _load_outlets(claim)

    if outlets:
        earliest = outlets[0]
        outlet_count = len(outlets)
        first_seen = earliest["timestamp"] or "unknown"
        has_timestamp = bool(earliest["timestamp"])

        confidence = round(
            0.4
            + (0.3 if has_timestamp else 0.0)
            + min(0.3, 0.1 * (outlet_count - 1)),
            2,
        )
        summary = _summarize(claim, earliest["outlet"], first_seen, outlets)

        return OriginResult(
            source=earliest["outlet"],
            confidence=confidence,
            status="traced",
            first_seen=first_seen,
            outlet_count=outlet_count,
            timeline=outlets,
            summary=summary,
        )

    # No provenance edges — fall back to a simple existence check.
    if _claim_exists(claim):
        return OriginResult(
            source="previously ingested (no source metadata)",
            confidence=0.3,
            status="seen_before",
            summary="This claim was already in the graph but carried no source "
            "metadata, so its original outlet is unknown.",
        )

    return OriginResult(
        source="unknown",
        confidence=0.0,
        status="not_found",
        summary="No prior record of this claim and no source metadata was supplied.",
    )
