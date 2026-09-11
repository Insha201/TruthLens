"""
Telegram ingestion connector.

Reads recent messages from public broadcast channels using Telethon (MTProto,
user-account auth). A Bot API token is NOT enough here: bots can only read
chats they have been added to, so they cannot monitor arbitrary public
channels.

Setup (one time):
  1. pip install telethon
  2. Get api_id + api_hash from https://my.telegram.org -> API development tools
  3. Put TELEGRAM_API_ID / TELEGRAM_API_HASH in backend/.env
  4. Run `python -m ingestion.telegram_login` from backend/ once, and enter the
     phone number + the code Telegram sends. This writes a .session file so the
     server can connect without prompting.

Returns [] (with a log line) until all of that is in place.
"""

import os

from dotenv import load_dotenv

load_dotenv()

API_ID = os.getenv("TELEGRAM_API_ID", "").strip()
API_HASH = os.getenv("TELEGRAM_API_HASH", "").strip()
SESSION = os.getenv("TELEGRAM_SESSION", "truthlens").strip()

# Public broadcast channels to monitor (usernames without the @).
CHANNELS = [
    "disclosetv",
    "IntelSlavaZ",
]


def is_configured() -> bool:
    return bool(API_ID and API_HASH)


def session_exists() -> bool:
    return os.path.exists(f"{SESSION}.session")


def _fetch_from_api(max_posts: int) -> list[dict]:
    from telethon.sync import TelegramClient  # lazy: keeps telethon optional

    posts: list[dict] = []
    per_channel = max(1, max_posts // max(1, len(CHANNELS)))

    with TelegramClient(SESSION, int(API_ID), API_HASH) as client:
        for channel in CHANNELS:
            if len(posts) >= max_posts:
                break
            try:
                for msg in client.iter_messages(channel, limit=per_channel):
                    text = (msg.message or "").strip()
                    if not text:
                        continue
                    posts.append({
                        "text": text[:500],
                        "source": f"t.me/{channel}",
                        "platform": "telegram",
                        "url": f"https://t.me/{channel}/{msg.id}",
                        "author": f"@{channel}",
                        "published_at": msg.date.isoformat() if msg.date else "",
                    })
                    if len(posts) >= max_posts:
                        break
            except Exception as e:
                print(f"Telegram error for channel '{channel}': {e}")
                continue

    return posts


def fetch_telegram_posts(max_posts: int = 20) -> list[dict]:
    if not is_configured():
        print("- Telegram: skipped (TELEGRAM_API_ID / TELEGRAM_API_HASH not set)")
        return []

    if not session_exists():
        print(
            f"- Telegram: skipped (no '{SESSION}.session' file — run "
            "`python -m ingestion.telegram_login` from backend/ once to sign in)"
        )
        return []

    try:
        posts = _fetch_from_api(max_posts)
        print(f"Telegram: fetched {len(posts)} posts")
        return posts
    except ImportError:
        print("- Telegram: telethon is not installed (pip install telethon)")
        return []
    except Exception as e:  # pragma: no cover - defensive
        print(f"Telegram error: {e}")
        return []
