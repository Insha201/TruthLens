import os

import chromadb


client = chromadb.PersistentClient(
    path="./chroma_db"
)


collection = client.get_or_create_collection(
    name="misinformation_knowledge"
)


# Keyword -> domain map, shared with the claim taxonomy in
# agents/claim_detector.VALID_CATEGORIES so evidence and claims can be
# grouped under the same headings in the UI.
_DOMAIN_KEYWORDS = {
    "public_health": ["vaccine", "vaccination", "covid", "virus", "disease",
                      "cancer", "measles", "health", "who ", "cdc", "drug",
                      "medicine", "outbreak", "patient", "doctor", "autism"],
    "elections_civic": ["election", "ballot", "vote", "voter", "poll",
                        "candidate", "congress", "senate", "campaign"],
    "emergency_disaster": ["earthquake", "flood", "hurricane", "wildfire",
                           "evacuat", "disaster", "shooting", "attack",
                           "explosion", "storm"],
    "financial_panic": ["bank", "currency", "market", "stock", "tariff",
                        "inflation", "scam", "crypto", "dividend", "economy"],
    "geopolitics": ["war", "russia", "ukraine", "israel", "gaza", "china",
                    "nato", "troops", "military", "sanction", "border"],
    "science_tech": ["climate", "5g", "nasa", "space", "asteroid", "ai ",
                     "artificial intelligence", "chemtrail", "solar", "energy"],
}


def classify_domain(text: str) -> str:
    """Cheap keyword vote for which subject domain a snippet belongs to."""
    lowered = (text or "").lower()
    best, best_hits = "other", 0
    for domain, words in _DOMAIN_KEYWORDS.items():
        hits = sum(1 for w in words if w in lowered)
        if hits > best_hits:
            best, best_hits = domain, hits
    return best


def add_document(document_id: str, text: str, publisher: str = "", domain: str = ""):
    collection.add(
        ids=[document_id],
        documents=[text],
        metadatas=[{
            "publisher": publisher or document_id.split("-")[0],
            "domain": domain or classify_domain(text),
        }],
    )


def count_documents() -> int:
    try:
        return collection.count()
    except Exception:
        return 0


def list_documents(limit: int = 200) -> list[dict]:
    """Return the documents currently indexed in the RAG store."""
    try:
        got = collection.get(limit=limit)
    except Exception:
        return []
    ids = got.get("ids", []) or []
    docs = got.get("documents", []) or []
    metas = got.get("metadatas", []) or [{}] * len(ids)
    out = []
    for i, d, m in zip(ids, docs, metas):
        m = m or {}
        out.append({
            "id": i,
            "text": d,
            "publisher": m.get("publisher") or i.split("-")[0],
            "domain": m.get("domain") or classify_domain(d),
        })
    return out


# Chroma's default embedding (all-MiniLM-L6-v2) reports squared-L2 distance.
# Empirically on this collection: ~0.3 = near-verbatim restatement,
# ~0.8-1.2 = same topic and genuinely relevant, >1.5 = unrelated.
# The old 0.6 cutoff only accepted near-duplicates, so relevant evidence was
# thrown away and the Narrative Drafter almost always returned "no_evidence".
RELEVANCE_MAX_DISTANCE = float(os.getenv("RAG_MAX_DISTANCE", "1.2"))


def search_documents(query: str, limit: int = 3):
    results = collection.query(
        query_texts=[query],
        n_results=limit
    )

    documents = results.get("documents", [[]])[0]
    distances = results.get("distances", [[]])[0]
    ids = results.get("ids", [[]])[0]

    keep = [
        (doc_id, document)
        for doc_id, document, distance in zip(ids, documents, distances)
        if distance <= RELEVANCE_MAX_DISTANCE
    ]

    results["documents"] = [[d for _, d in keep]]
    results["ids"] = [[i for i, _ in keep]]

    return results