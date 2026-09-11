"""
Shared Groq client with rate-limit handling.

The free tier allows 8,000 tokens per minute. A bulk ingest runs four agents
per claim, so a 20-claim batch reliably trips it and the whole request used to
die with a 429. Groq's error tells us exactly how long to wait, so honour that
instead of failing the batch.
"""

import os
import re
import time

from dotenv import load_dotenv
from groq import Groq, RateLimitError

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
MAX_ATTEMPTS = int(os.getenv("GROQ_MAX_ATTEMPTS", "4"))


def _retry_after(err: Exception, attempt: int) -> float:
    """Seconds to wait, taken from Groq's message when it gives one."""
    m = re.search(r"try again in ([0-9.]+)s", str(err))
    if m:
        try:
            return min(float(m.group(1)) + 0.5, 30.0)
        except ValueError:
            pass
    return min(2.0 ** attempt, 30.0)   # 2, 4, 8, 16s


def complete(prompt: str, *, temperature: float = 0, model: str | None = None) -> str:
    """
    Run a single-turn completion, retrying through rate limits.

    Returns "" if every attempt fails, so a caller can fall back rather than
    crash the whole pipeline run.
    """
    for attempt in range(MAX_ATTEMPTS):
        try:
            response = client.chat.completions.create(
                model=model or MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
            )
            return response.choices[0].message.content or ""
        except RateLimitError as e:
            if attempt == MAX_ATTEMPTS - 1:
                print(f"Groq rate limit, giving up after {MAX_ATTEMPTS} attempts")
                return ""
            wait = _retry_after(e, attempt)
            print(f"Groq rate limit; waiting {wait:.1f}s (attempt {attempt + 1}/{MAX_ATTEMPTS})")
            time.sleep(wait)
        except Exception as e:  # pragma: no cover - network/API errors
            if attempt == MAX_ATTEMPTS - 1:
                print(f"Groq call failed: {e}")
                return ""
            time.sleep(min(2.0 ** attempt, 10.0))

    return ""
