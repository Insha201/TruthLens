"""
Twitter / X ingestion connector — SCAFFOLD.

Enable by setting TWITTER_BEARER_TOKEN in backend/.env, then implement the
`_fetch_from_api` body (e.g. with tweepy or a raw call to
https://api.x.com/2/tweets/search/recent).

Until a token is present, fetch_twitter_posts() returns [] so the unified
ingestion manager can call it unconditionally without failing.
"""

import os

from dotenv import load_dotenv

load_dotenv()

BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN", "").strip()

# Topical queries mirrored from news_ingestion.MISINFORMATION_KEYWORDS
SEARCH_QUERIES = [
    "vaccine misinformation",
    "election fraud claim",
    "miracle cure",
    "deep state",
    "chemtrails",
]


def is_configured() -> bool:
    """True when a bearer token is available."""
    return bool(BEARER_TOKEN)


def _fetch_from_api(max_posts: int) -> list[dict]:
    """
    TODO: real implementation. Should return dicts shaped like:
        {
            "text": "<tweet text>",
            "source": "twitter",
            "platform": "x",
            "url": "https://x.com/<user>/status/<id>",
            "author": "<@handle>",
            "published_at": "<iso timestamp>",
        }
    """
    raise NotImplementedError("Twitter connector not implemented yet")


def fetch_twitter_posts(max_posts: int = 20) -> list[dict]:
    """
    Fetch recent posts matching the misinformation queries.
    Returns [] (with a log line) when no token is configured.
    """
    if not is_configured():
        print("- Twitter/X: skipped (TWITTER_BEARER_TOKEN not set)")
        return []

    try:
        posts = _fetch_from_api(max_posts)
        print(f"Twitter/X: fetched {len(posts)} posts")
        return posts
    except NotImplementedError:
        print("- Twitter/X: token present but connector not implemented yet")
        return []
    except Exception as e:  # pragma: no cover - defensive
        print(f"Twitter/X error: {e}")
        return []
