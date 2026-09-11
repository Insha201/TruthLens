"""
Reddit ingestion connector.

Uses PRAW in read-only ("script" app) mode. Enable by setting
REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET in backend/.env — no user login or
OAuth callback is needed for read-only search.

Returns [] (with a log line) until credentials are present.
"""

import os
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("REDDIT_CLIENT_ID", "").strip()
CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET", "").strip()
USER_AGENT = os.getenv("REDDIT_USER_AGENT", "truthlens-ingestion/0.1").strip()

# Subreddits scanned for misinformation-prone discussion.
SUBREDDITS = ["conspiracy", "news", "worldnews", "politics", "health"]

# Reuses the topical vocabulary of the other connectors.
SEARCH_TERMS = [
    "vaccine",
    "election fraud",
    "miracle cure",
    "chemtrails",
    "deep state",
]

_reddit = None


def is_configured() -> bool:
    return bool(CLIENT_ID and CLIENT_SECRET)


def _client():
    """Lazily build a read-only PRAW client."""
    global _reddit
    if _reddit is None:
        import praw  # imported lazily so the module loads without praw

        _reddit = praw.Reddit(
            client_id=CLIENT_ID,
            client_secret=CLIENT_SECRET,
            user_agent=USER_AGENT,
        )
        _reddit.read_only = True
    return _reddit


def _iso(epoch: float) -> str:
    try:
        return datetime.fromtimestamp(epoch, tz=timezone.utc).isoformat()
    except Exception:
        return ""


def _fetch_from_api(max_posts: int) -> list[dict]:
    reddit = _client()
    posts: list[dict] = []
    per_term = max(1, max_posts // max(1, len(SEARCH_TERMS)))
    subreddit = reddit.subreddit("+".join(SUBREDDITS))

    for term in SEARCH_TERMS:
        if len(posts) >= max_posts:
            break
        try:
            for submission in subreddit.search(term, sort="new", time_filter="week", limit=per_term):
                title = (submission.title or "").strip()
                if not title:
                    continue
                body = (getattr(submission, "selftext", "") or "").strip()
                text = f"{title}. {body[:300]}" if body else title

                posts.append({
                    "text": text,
                    "source": f"r/{submission.subreddit.display_name}",
                    "platform": "reddit",
                    "url": f"https://reddit.com{submission.permalink}",
                    "author": f"u/{submission.author}" if submission.author else "u/[deleted]",
                    "published_at": _iso(submission.created_utc),
                })
                if len(posts) >= max_posts:
                    break
        except Exception as e:
            print(f"Reddit search error for '{term}': {e}")
            continue

    return posts


def fetch_reddit_posts(max_posts: int = 20) -> list[dict]:
    if not is_configured():
        print("- Reddit: skipped (REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET not set)")
        return []

    try:
        posts = _fetch_from_api(max_posts)
        print(f"Reddit: fetched {len(posts)} posts")
        return posts
    except ImportError:
        print("- Reddit: praw is not installed (pip install praw)")
        return []
    except Exception as e:  # pragma: no cover - defensive
        print(f"Reddit error: {e}")
        return []
