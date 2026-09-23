"""
On-demand translation of agent output into Hindi and Marathi.

Why this is done at display time rather than at generation time:

The pipeline's guarantee is that every counter-narrative is grounded in
retrieved evidence, and that evidence corpus is English. Generating the
rebuttal directly in Hindi or Marathi would put the grounding check and the
generated text in different languages, so a reviewer could no longer compare
the two. Instead the analysis is produced and verified in English, then
translated for the reader — and the interface labels the result as a machine
translation so it is never mistaken for the verified original.

Translations are cached in memory: the same claim is usually viewed several
times, and the free Groq tier is rate limited.
"""

import hashlib

from llm import complete
from text_utils import normalize_text

LANGUAGE_NAMES = {
    "hi": "Hindi (Devanagari script)",
    "mr": "Marathi (Devanagari script)",
    "en": "English",
}

# key -> translated text. Bounded so a long session cannot grow without limit.
_cache: dict[str, str] = {}
_MAX_CACHE = 500


def _key(text: str, target: str) -> str:
    return target + ":" + hashlib.md5(text.encode("utf-8")).hexdigest()


def translate_text(text: str, target: str) -> str:
    """
    Translate one passage. Returns the original unchanged when the target is
    English, when the text is empty, or when the model call fails — a failed
    translation must never blank out an analysis the reviewer needs to read.
    """
    text = (text or "").strip()
    if not text or target not in LANGUAGE_NAMES or target == "en":
        return text

    cached = _cache.get(_key(text, target))
    if cached is not None:
        return cached

    prompt = f"""Translate the text below into {LANGUAGE_NAMES[target]}.

Rules:
- Translate meaning, not word for word.
- Keep proper nouns, organisation names, URLs and numbers unchanged.
- Keep any percentages, scores and dates exactly as they appear.
- Do not add, remove, soften or explain anything.
- Return ONLY the translation, with no preamble or quotation marks.

TEXT:
{text}"""

    out = normalize_text(complete(prompt).strip())
    if not out:
        return text  # model failed or was rate limited; show the original

    if len(_cache) >= _MAX_CACHE:
        _cache.clear()
    _cache[_key(text, target)] = out
    return out


def translate_fields(fields: dict, target: str) -> dict:
    """Translate every non-empty string value in a flat dict."""
    if target == "en":
        return dict(fields)
    return {
        k: translate_text(v, target) if isinstance(v, str) and v.strip() else v
        for k, v in fields.items()
    }
