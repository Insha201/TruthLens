"""
TikTok ingestion connector (TikTok Research API).

IMPORTANT — access is gated. TikTok has no open search API:

  * Research API  - keyword search over public videos. Requires an approved
                    application; eligibility is limited to researchers at
                    accredited institutions in the US/EU.
                    https://developers.tiktok.com/products/research-api/
  * Display API   - only reads YOUR OWN account's content. Not useful here.

This connector targets the Research API. Set TIKTOK_CLIENT_KEY and
TIKTOK_CLIENT_SECRET in backend/.env once approved; until then it returns [].

Do not substitute an unofficial scraper: it breaks TikTok's terms and stops
working whenever they change their web app.
"""

import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv

load_dotenv()

CLIENT_KEY = os.getenv("TIKTOK_CLIENT_KEY", "").strip()
CLIENT_SECRET = os.getenv("TIKTOK_CLIENT_SECRET", "").strip()

TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/"
QUERY_URL = "https://open.tiktokapis.com/v2/research/video/query/"

KEYWORDS = ["vaccine truth", "election fraud", "miracle cure", "chemtrails"]


def is_configured() -> bool:
    return bool(CLIENT_KEY and CLIENT_SECRET)


def _access_token() -> str:
    import requests

    resp = requests.post(
        TOKEN_URL,
        data={
            "client_key": CLIENT_KEY,
            "client_secret": CLIENT_SECRET,
            "grant_type": "client_credentials",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=20,
    )
    resp.raise_for_status()
    return resp.json().get("access_token", "")


def _fetch_from_api(max_posts: int) -> list[dict]:
    import requests

    token = _access_token()
    if not token:
        raise RuntimeError("TikTok did not return an access token")

    today = datetime.now(timezone.utc).date()
    start = (today - timedelta(days=7)).strftime("%Y%m%d")
    end = today.strftime("%Y%m%d")

    resp = requests.post(
        QUERY_URL,
        params={"fields": "id,video_description,create_time,username,region_code"},
        json={
            "query": {
                "and": [
                    {"operation": "IN", "field_name": "keyword", "field_values": KEYWORDS}
                ]
            },
            "start_date": start,
            "end_date": end,
            "max_count": min(max_posts, 100),
        },
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        timeout=30,
    )
    resp.raise_for_status()

    videos = (resp.json().get("data") or {}).get("videos") or []
    posts: list[dict] = []

    for v in videos[:max_posts]:
        text = (v.get("video_description") or "").strip()
        if not text:
            continue
        username = v.get("username") or "unknown"
        created = v.get("create_time")
        posts.append({
            "text": text[:500],
            "source": "tiktok",
            "platform": "tiktok",
            "url": f"https://www.tiktok.com/@{username}/video/{v.get('id', '')}",
            "author": f"@{username}",
            "published_at": (
                datetime.fromtimestamp(created, tz=timezone.utc).isoformat()
                if isinstance(created, (int, float))
                else ""
            ),
        })

    return posts


def fetch_tiktok_posts(max_posts: int = 20) -> list[dict]:
    if not is_configured():
        print("- TikTok: skipped (TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET not set)")
        return []

    try:
        posts = _fetch_from_api(max_posts)
        print(f"TikTok: fetched {len(posts)} posts")
        return posts
    except ImportError:
        print("- TikTok: requests is not installed (pip install requests)")
        return []
    except Exception as e:  # pragma: no cover - defensive
        print(f"TikTok error: {e}")
        return []
