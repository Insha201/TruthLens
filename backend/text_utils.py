"""
Shared text normalisation.

Two sources of broken characters kept leaking through the pipeline:

  * RSS/news feeds decoded badly upstream, leaving U+FFFD replacement
    characters ("Bangladesh<?>s vaccination campaigns")
  * LLMs emit typographic punctuation - curly quotes, en/em dashes, narrow
    no-break spaces (U+202F) - which render inconsistently in the UI.

`normalize_text` folds both down to clean text while keeping the wording intact.

MULTILINGUAL NOTE
-----------------
This function previously ended with `text.encode("ascii", "ignore")`, which
deleted every character outside ASCII. That was added when the Windows console
was still cp1252 and a stray typographic dash could crash `print()`. It is no
longer needed - main.py reconfigures stdout and stderr to UTF-8 at import - and
it is actively harmful now that the system handles Hindi and Marathi, because
it silently erased every Devanagari character it was given.

The function now preserves all scripts and removes only control and format
characters, which are the ones that actually break terminals and JSON.
"""

import re
import unicodedata

_PUNCT_FIXES = {
    "‑": "-", "‒": "-", "–": "-", "—": "-", "―": "-",
    "‘": "'", "’": "'", "‚": "'", "‛": "'",
    "“": '"', "”": '"', "„": '"', "‟": '"',
    "…": "...", "′": "'", "″": '"',
    " ": " ", " ": " ", " ": " ", " ": " ",
    "​": "", "‌": "", "‍": "", "﻿": "",
    "�": "",     # replacement char from a bad upstream decode
}

# Zero-width joiner/non-joiner are stripped above as invisible noise in Latin
# text, but they are meaningful in Devanagari conjuncts, so they are restored
# for text that actually contains Devanagari.
_DEVANAGARI = re.compile(r"[ऀ-ॿ]")


def normalize_text(text: str) -> str:
    """Fold typographic punctuation and broken bytes down to clean text."""
    if not text:
        return ""

    has_devanagari = bool(_DEVANAGARI.search(text))

    for bad, good in _PUNCT_FIXES.items():
        # Keep ZWJ/ZWNJ when the passage is Indic - they join conjuncts there.
        if has_devanagari and bad in ("‌", "‍"):
            continue
        text = text.replace(bad, good)

    # NFKC composes Devanagari correctly and still folds compatibility forms
    # such as ligatures. NFKD was previously used only so accents could be
    # discarded by the ASCII step that no longer exists.
    text = unicodedata.normalize("NFKC", text)

    # Drop control and format characters, which break terminals and JSON,
    # while leaving every writing system intact.
    keep = []
    for ch in text:
        if ch in "\n\t":
            keep.append(ch)
            continue
        category = unicodedata.category(ch)
        if category.startswith("C"):
            if has_devanagari and ch in ("‌", "‍"):
                keep.append(ch)
            continue
        keep.append(ch)
    text = "".join(keep)

    return re.sub(r"\s+", " ", text).strip()
