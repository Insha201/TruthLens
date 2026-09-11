"""
One-time interactive Telegram sign-in.

Run from the backend/ directory:

    python -m ingestion.telegram_login

It asks for your phone number and the login code Telegram sends, then writes a
<TELEGRAM_SESSION>.session file next to it. After that the ingestion connector
can connect on its own — the server never prompts.

This must be run in a real terminal; it cannot run inside an API request.
"""

import os
import sys

from dotenv import load_dotenv

load_dotenv()

API_ID = os.getenv("TELEGRAM_API_ID", "").strip()
API_HASH = os.getenv("TELEGRAM_API_HASH", "").strip()
SESSION = os.getenv("TELEGRAM_SESSION", "truthlens").strip()


def main() -> int:
    if not API_ID or not API_HASH:
        print("TELEGRAM_API_ID / TELEGRAM_API_HASH are not set in backend/.env.")
        print("Get them from https://my.telegram.org -> API development tools.")
        return 1

    try:
        from telethon.sync import TelegramClient
    except ImportError:
        print("telethon is not installed. Run: pip install telethon")
        return 1

    print(f"Signing in and creating '{SESSION}.session' ...")
    with TelegramClient(SESSION, int(API_ID), API_HASH) as client:
        me = client.get_me()
        print(f"Signed in as {me.first_name} (@{me.username}). Session saved.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
