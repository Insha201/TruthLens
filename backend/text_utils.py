"""
Shared text normalisation.

Two sources of broken characters kept leaking through the pipeline:

  * RSS/news feeds decoded badly upstream, leaving U+FFFD replacement
    characters ("Bangladesh<?>s vaccination campaigns")
  * LLMs emit typographic punctuation - curly quotes, en/em dashes, narrow
    no-break spaces (U+202F) - which crash plain print() on a Windows cp1252
    console and render inconsistently in the UI.

`normalize_text` folds both down to plain ASCII-safe text while keeping the
wording intact.
"""

import re
import unicodedata

_PUNCT_FIXES = {
    "‑": "-", "‒": "-", "–": "-", "—": "-", "―": "-",
    "‘": "'", "’": "'", "‚": "'", "‛": "'",
    "“": '"', "”": '"', "„": '"', "‟": '"',
    "…": "...", "′": "'", "″": '"',
    " ": " ", " ": " ", " ": " ", " ": " ",
    "​": "", "‌": "", "‍": "", "﻿": "",
    "�": "",          # replacement char from a bad upstream decode
}


def normalize_text(text: str) -> str:
    """Fold typographic punctuation and broken bytes down to plain text."""
    if not text:
        return ""

    for bad, good in _PUNCT_FIXES.items():
        text = text.replace(bad, good)

    # Decompose accents etc., then drop anything still outside ASCII.
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")

    return re.sub(r"\s+", " ", text).strip()
