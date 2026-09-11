import hashlib
import os
from datetime import datetime
from dotenv import load_dotenv

from text_utils import normalize_text

from ingestion.news_ingestion import fetch_news_articles
from ingestion.youtube_ingestion import fetch_youtube_videos
from ingestion.rss_ingestion import fetch_rss_articles

# Staged social connectors — scaffolds that return [] until their
# API key is set in backend/.env (see each module + .env.example).
from ingestion import (
    twitter_ingestion,
    telegram_ingestion,
    reddit_ingestion,
    tiktok_ingestion,
)

load_dotenv()


# Registry describing every ingestion source the manager knows about.
# `live` connectors run today; the rest are scaffolds gated on `is_configured()`.
SOURCE_REGISTRY = [
    {"id": "newsapi", "label": "NewsAPI", "kind": "content", "live": True,
     "is_configured": lambda: bool(os.getenv("NEWS_API_KEY"))},
    {"id": "youtube", "label": "YouTube Data API", "kind": "content", "live": True,
     "is_configured": lambda: bool(os.getenv("YOUTUBE_API_KEY"))},
    {"id": "rss", "label": "RSS Feeds", "kind": "content", "live": True,
     "is_configured": lambda: True},
    {"id": "x", "label": "X (Twitter)", "kind": "social", "live": False,
     "is_configured": twitter_ingestion.is_configured},
    {"id": "reddit", "label": "Reddit", "kind": "social", "live": True,
     "is_configured": reddit_ingestion.is_configured},
    {"id": "telegram", "label": "Telegram", "kind": "social", "live": True,
     "is_configured": lambda: telegram_ingestion.is_configured()
                              and telegram_ingestion.session_exists()},
    {"id": "tiktok", "label": "TikTok (Research API)", "kind": "social", "live": True,
     "is_configured": tiktok_ingestion.is_configured},
]


def get_source_status() -> list[dict]:
    """
    Report which sources are wired up and which have their API key set.
    Used by GET /api/sources.
    """
    return [
        {
            "id": s["id"],
            "label": s["label"],
            "kind": s["kind"],
            "live": s["live"],
            "configured": bool(s["is_configured"]()),
        }
        for s in SOURCE_REGISTRY
    ]

# In-memory dedup store (will be replaced by Redis later)
_seen_hashes = set()


def _generate_hash(text: str) -> str:
    """
    Generate a unique hash for a piece of text.
    Used to detect duplicate posts.
    """
    return hashlib.md5(text.strip().lower().encode()).hexdigest()


def _is_duplicate(text: str) -> bool:
    """
    Check if we have already seen this post.
    """
    post_hash = _generate_hash(text)
    if post_hash in _seen_hashes:
        return True
    _seen_hashes.add(post_hash)
    return False


def _clean_text(text: str) -> str:
    """
    Clean a post before it enters the pipeline: collapse whitespace and fold
    typographic punctuation / bad upstream decodes down to plain text, so
    claims don't carry artefacts like "Bangladesh<?>s" into Neo4j.
    """
    if not text:
        return ""
    return normalize_text(text)


# Cheap, no-LLM signals that a post is likely to contain misinformation.
# Used only to RANK posts so the expensive Groq pipeline runs on the most
# suspicious ones first — it is not a verdict.
_SUSPICION_PHRASES = [
    "miracle cure", "they don't want you to know", "they dont want you to know",
    "wake up", "do your own research", "big pharma", "cover-up", "coverup",
    "cover up", "hoax", "exposed", "banned", "censored", "silenced",
    "what they're hiding", "what they are hiding", "mainstream media won't",
    "shocking truth", "the truth about", "you won't believe", "gone wrong",
    "conspiracy", "deep state", "false flag", "plandemic", "microchip",
    "5g", "chemtrail", "flat earth", "vaccine injury", "depopulation",
    "new world order", "globalist", "rigged", "stolen election",
    "crisis actor", "secret", "leaked", "insider says", "bombshell",
]
_SUSPICION_WORDS = [
    "breaking", "urgent", "alert", "warning", "must", "now", "immediately",
    "share", "before", "deleted", "proof", "100%", "guaranteed",
]


def _suspicion_score(text: str) -> float:
    """Heuristic 0..~1 score: higher = more likely to be misinformation."""
    if not text:
        return 0.0

    lowered = text.lower()
    score = 0.0

    for phrase in _SUSPICION_PHRASES:
        if phrase in lowered:
            score += 2.0
    for word in _SUSPICION_WORDS:
        if word in lowered.split():
            score += 0.6

    # Sensational styling.
    exclamations = text.count("!")
    score += min(exclamations, 4) * 0.4
    if "?!" in text or "!?" in text:
        score += 0.6

    words = [w for w in text.split() if len(w) >= 3]
    if words:
        caps = sum(1 for w in words if w.isupper())
        caps_ratio = caps / len(words)
        if caps_ratio > 0.15:
            score += 1.0 + caps_ratio

    # Normalise to roughly 0..1 (scores above ~8 are already extreme).
    return round(min(score / 8.0, 1.0), 3)


def fetch_all_posts(
    include_news: bool = True,
    include_youtube: bool = True,
    include_rss: bool = True,
    include_twitter: bool = False,
    include_telegram: bool = False,
    include_reddit: bool = False,
    include_tiktok: bool = False,
    max_per_source: int = 20,
    max_total: int = 10,
) -> list[dict]:
    """
    Fetch posts from all enabled sources, deduplicate them, then keep only
    the `max_total` posts with the highest heuristic suspicion score so the
    expensive Groq pipeline runs on the most likely-misinformation items.

    Pass max_total=0 to disable the cap and return every unique post.

    The social sources (twitter/telegram/reddit) are off by default and
    only produce posts once their API key is set in backend/.env.
    """

    all_posts = []

    print("\n=== Starting ingestion from all sources ===\n")

    # Fetch from NewsAPI
    if include_news:
        try:
            news_posts = fetch_news_articles(max_articles=max_per_source)
            all_posts.extend(news_posts)
            print(f"[ok] NewsAPI: {len(news_posts)} posts fetched")
        except Exception as e:
            print(f"[x] NewsAPI failed: {e}")

    # Fetch from YouTube
    if include_youtube:
        try:
            youtube_posts = fetch_youtube_videos(max_videos=max_per_source)
            all_posts.extend(youtube_posts)
            print(f"[ok] YouTube: {len(youtube_posts)} posts fetched")
        except Exception as e:
            print(f"[x] YouTube failed: {e}")

    # Fetch from RSS feeds
    if include_rss:
        try:
            rss_posts = fetch_rss_articles(max_per_feed=5)
            all_posts.extend(rss_posts)
            print(f"[ok] RSS Feeds: {len(rss_posts)} posts fetched")
        except Exception as e:
            print(f"[x] RSS Feeds failed: {e}")

    # Staged social connectors (return [] unless their API key is set)
    if include_twitter:
        try:
            tw_posts = twitter_ingestion.fetch_twitter_posts(max_posts=max_per_source)
            all_posts.extend(tw_posts)
            print(f"[ok] Twitter/X: {len(tw_posts)} posts fetched")
        except Exception as e:
            print(f"[x] Twitter/X failed: {e}")

    if include_telegram:
        try:
            tg_posts = telegram_ingestion.fetch_telegram_posts(max_posts=max_per_source)
            all_posts.extend(tg_posts)
            print(f"[ok] Telegram: {len(tg_posts)} posts fetched")
        except Exception as e:
            print(f"[x] Telegram failed: {e}")

    if include_reddit:
        try:
            rd_posts = reddit_ingestion.fetch_reddit_posts(max_posts=max_per_source)
            all_posts.extend(rd_posts)
            print(f"[ok] Reddit: {len(rd_posts)} posts fetched")
        except Exception as e:
            print(f"[x] Reddit failed: {e}")

    if include_tiktok:
        try:
            tt_posts = tiktok_ingestion.fetch_tiktok_posts(max_posts=max_per_source)
            all_posts.extend(tt_posts)
            print(f"[ok] TikTok: {len(tt_posts)} posts fetched")
        except Exception as e:
            print(f"[x] TikTok failed: {e}")

    print(f"\nTotal before dedup: {len(all_posts)} posts")

    # Deduplicate + score
    unique_posts = []
    for post in all_posts:
        text = _clean_text(post.get("text", ""))
        if not text:
            continue
        if _is_duplicate(text):
            continue
        post["text"] = text
        post["ingested_at"] = datetime.utcnow().isoformat()
        post["suspicion_score"] = _suspicion_score(text)
        unique_posts.append(post)

    print(f"Total after dedup: {len(unique_posts)} unique posts")

    # Rank by suspicion and keep only the top `max_total`.
    unique_posts.sort(key=lambda p: p["suspicion_score"], reverse=True)
    if max_total and len(unique_posts) > max_total:
        kept = unique_posts[:max_total]
        cutoff = kept[-1]["suspicion_score"]
        print(
            f"Ranked by suspicion; keeping top {max_total} "
            f"(score >= {cutoff}), dropping {len(unique_posts) - max_total}"
        )
        unique_posts = kept

    for p in unique_posts:
        print(f"  score={p['suspicion_score']:.2f} [{p.get('platform','?')}] {p['text'][:80]}")

    print("\n=== Ingestion complete ===\n")

    return unique_posts


_KNOWN_PLATFORMS = {"newsapi", "news", "youtube", "rss", "x", "twitter",
                    "telegram", "reddit", "tiktok", "whatsapp"}


def fetch_single_post(text: str, source: str = "manual") -> dict:
    """
    Package a single manually submitted post for the pipeline.
    Used by the /api/ingest endpoint.

    If `source` names a real platform we label it as such; otherwise the
    post is treated as a manual submission with no verifiable origin.
    """
    cleaned = _clean_text(text)
    platform = source.lower() if source.lower() in _KNOWN_PLATFORMS else "manual"

    return {
        "text": cleaned,
        "source": source,
        "platform": platform,
        "url": "",
        "author": "manual_submission",
        "ingested_at": datetime.utcnow().isoformat()
    }