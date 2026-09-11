"""
Seed the RAG evidence store from real fact-check publishers.

Nothing here is invented: it pulls live entries from the fact-checking feeds
already configured in ingestion/rss_ingestion.py (Snopes, PolitiFact,
FactCheck.org, WHO) and indexes each headline + summary as an evidence
document the Narrative Drafter can retrieve.

Run from backend/:

    python -m storage.seed_evidence              # feeds + topic-matched search
    python -m storage.seed_evidence --purge      # drop existing docs first
    python -m storage.seed_evidence --no-topics  # RSS feeds only
"""

import hashlib
import re
import sys

import feedparser

from storage.vector_store import add_document, collection, count_documents

# Only publishers whose output is itself a verified fact-check / authority.
FACTCHECK_FEEDS = {
    "Snopes": "https://www.snopes.com/feed/",
    "PolitiFact": "https://www.politifact.com/rss/factchecks/",
    "FactCheck.org": "https://www.factcheck.org/feed/",
    "Full Fact": "https://fullfact.org/feed/all/",
    "WHO": "https://www.who.int/rss-feeds/news-english.xml",
}

MAX_PER_FEED = 25


def _clean(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text or "")      # strip HTML
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _doc_id(source: str, text: str) -> str:
    return f"{source.lower().replace('.', '').replace(' ', '-')}-" + \
        hashlib.md5(text.lower().encode()).hexdigest()[:10]


def purge():
    got = collection.get()
    ids = got.get("ids") or []
    if ids:
        collection.delete(ids=ids)
    print(f"Purged {len(ids)} existing evidence documents.")


def seed() -> int:
    existing = set(collection.get().get("ids") or [])
    added = 0

    for source, url in FACTCHECK_FEEDS.items():
        try:
            feed = feedparser.parse(url)
        except Exception as e:
            print(f"  [x] {source}: {e}")
            continue

        entries = feed.entries[:MAX_PER_FEED]
        got = 0
        for entry in entries:
            title = _clean(entry.get("title", ""))
            summary = _clean(entry.get("summary", ""))
            if not title:
                continue

            # Evidence text = the fact-check verdict headline plus its gist.
            text = f"{source}: {title}"
            if summary:
                text += f" {summary[:400]}"

            doc_id = _doc_id(source, title)
            if doc_id in existing:
                continue
            try:
                add_document(doc_id, text, publisher=source)
                existing.add(doc_id)
                added += 1
                got += 1
            except Exception as e:
                print(f"  [x] {source} '{title[:40]}': {e}")

        print(f"  [ok] {source}: {got} new from {len(entries)} entries")

    return added


# The standing misinformation topics the ingestion layer monitors. Seeding
# evidence from the SAME topic space is what makes retrieval actually hit:
# pulling only today's fact-check headlines gives a corpus about whatever is
# topical, which rarely overlaps with the claims we ingest.
TOPIC_QUERIES = [
    "vaccine fact check",
    "election fraud fact check",
    "cancer cure misinformation",
    "5G health claims debunked",
    "climate change misinformation",
    "conspiracy theory debunked",
]


def seed_topics(max_per_topic: int = 8) -> int:
    """Index fact-check / debunk articles about the topics we monitor."""
    try:
        from ingestion.news_ingestion import news_client
    except Exception as e:
        print(f"  [x] NewsAPI unavailable ({e})")
        return 0

    existing = set(collection.get().get("ids") or [])
    added = 0

    for query in TOPIC_QUERIES:
        try:
            resp = news_client.get_everything(
                q=query, language="en", sort_by="relevancy", page_size=max_per_topic
            )
        except Exception as e:
            print(f"  [x] '{query}': {e}")
            continue

        got = 0
        for art in resp.get("articles", []):
            title = _clean(art.get("title") or "")
            desc = _clean(art.get("description") or "")
            if not title or title == "[Removed]":
                continue
            outlet = ((art.get("source") or {}).get("name")) or "news"
            text = f"{outlet}: {title}"
            if desc:
                text += f" {desc[:400]}"

            doc_id = _doc_id(outlet, title)
            if doc_id in existing:
                continue
            try:
                add_document(doc_id, text, publisher=outlet)
                existing.add(doc_id)
                added += 1
                got += 1
            except Exception as e:
                print(f"  [x] {outlet}: {e}")

        print(f"  [ok] '{query}': {got} new")

    return added


def main() -> int:
    if "--purge" in sys.argv:
        purge()
    print("Seeding evidence from fact-check feeds...")
    added = seed()

    if "--no-topics" not in sys.argv:
        print("\nSeeding topic-matched evidence from NewsAPI...")
        added += seed_topics()

    print(f"\nIndexed {added} new documents. RAG store now holds {count_documents()}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
