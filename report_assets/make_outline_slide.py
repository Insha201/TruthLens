# -*- coding: utf-8 -*-
"""Recreate the 'Presentation Outline' slide at full resolution."""

import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

OUT = os.path.dirname(os.path.abspath(__file__))

plt.rcParams["font.family"] = ["Segoe UI", "Calibri", "Arial", "DejaVu Sans"]

CHIP = "#A3C6D9"      # darker blue number chip
BODY = "#DCE9F1"      # light blue body
INK = "#3F3F3F"       # text
TITLE = "#3F3F3F"

ITEMS = [
    "Abstract",
    "Problem Statement",
    "Proposed Solution",
    "Key Differentiators",
    "System Architecture",
    "Embedded Video of Project",
    "Conclusion",
    "Future Scope",
]

W, H = 16.0, 9.0
fig, ax = plt.subplots(figsize=(W, H))
ax.set_xlim(0, 100)
ax.set_ylim(0, 56.25)
ax.axis("off")
fig.patch.set_facecolor("white")

# ---- title -----------------------------------------------------------
ax.text(48, 48.5, "PRESENTATION OUTLINE", ha="center", va="center",
        fontsize=40, color=TITLE, fontweight="light")

# space reserved for the Edunet logo (top right)
ax.text(89, 48.5, "[ logo ]", ha="center", va="center", fontsize=11,
        color="#C8D3DA", style="italic")

# ---- item boxes ------------------------------------------------------
BOX_H = 7.2
GAP = 2.6
CHIP_W = 6.4
COL_W = 40.0
TOP = 38.0

cols = [5.0, 54.0]

for idx, label in enumerate(ITEMS):
    col = idx // 4
    row = idx % 4
    x = cols[col]
    y = TOP - row * (BOX_H + GAP)

    # body
    ax.add_patch(FancyBboxPatch(
        (x, y - BOX_H / 2), COL_W, BOX_H,
        boxstyle="round,pad=0,rounding_size=0.35",
        facecolor=BODY, edgecolor="none", zorder=2))
    # number chip
    ax.add_patch(FancyBboxPatch(
        (x, y - BOX_H / 2), CHIP_W, BOX_H,
        boxstyle="round,pad=0,rounding_size=0.35",
        facecolor=CHIP, edgecolor="none", zorder=3))

    ax.text(x + CHIP_W / 2, y, f"{idx + 1}.", ha="center", va="center",
            fontsize=19, color=INK, zorder=4)

    # wrap the one long label onto two lines, as in the original
    text = label
    if len(label) > 22:
        words = label.split()
        mid = len(words) // 2 + 1
        text = " ".join(words[:mid]) + "\n" + " ".join(words[mid:])

    ax.text(x + CHIP_W + 2.2, y, text, ha="left", va="center",
            fontsize=19, color=INK, zorder=4, linespacing=1.25)

path = os.path.join(OUT, "presentation_outline.png")
fig.savefig(path, dpi=180, facecolor="white", bbox_inches="tight",
            pad_inches=0.25)
plt.close(fig)
print("wrote", path)
