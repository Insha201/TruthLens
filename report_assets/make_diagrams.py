# -*- coding: utf-8 -*-
"""
Generate the figures for the TruthLens project report.

Every diagram here is derived from the actual implementation:
  backend/workflow/graph.py, backend/agents/*.py, backend/storage/*.py,
  backend/graph/neo4j_client.py, backend/ingestion/ingestion_manager.py
Nothing is invented.

Figure 3.1 (System Architecture) is NOT generated here - it is supplied by the
team and inserted manually.
"""

import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Ellipse, Circle, Rectangle

OUT = os.path.dirname(os.path.abspath(__file__))
DPI = 220

# ------------------------------------------------------------------ palette
TEAL      = "#0E8F74"
TEAL_DK   = "#0B2B24"
TEAL_PALE = "#E8F5F1"
BLUE      = "#1F5F8B"
BLUE_PALE = "#E6EFF6"
AMBER     = "#A8410E"
AMBER_PALE= "#FBEDE5"
GREY      = "#5A6B75"
GREY_PALE = "#EEF1F3"
STORE     = "#F5EFD8"
STORE_EC  = "#9A7B2E"
INK       = "#14181F"

FS = 8.0          # default body font size in figures
FS_S = 7.0
FS_T = 9.5


def canvas(w, h, title=None):
    fig, ax = plt.subplots(figsize=(w, h))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")
    fig.patch.set_facecolor("white")
    if title:
        ax.text(50, 98, title, ha="center", va="top",
                fontsize=FS_T, fontweight="bold", color=TEAL_DK)
    return fig, ax


def box(ax, x, y, w, h, text, fc=TEAL_PALE, ec=TEAL, fs=FS, bold=False,
        rounding=1.6, lw=1.2, tc=INK, ls="solid"):
    """x,y = centre."""
    p = FancyBboxPatch((x - w / 2, y - h / 2), w, h,
                       boxstyle=f"round,pad=0,rounding_size={rounding}",
                       facecolor=fc, edgecolor=ec, linewidth=lw, linestyle=ls,
                       zorder=2)
    ax.add_patch(p)
    ax.text(x, y, text, ha="center", va="center", fontsize=fs, color=tc,
            fontweight="bold" if bold else "normal", zorder=3, linespacing=1.35)
    return (x, y, w, h)


def sharp(ax, x, y, w, h, text, fc=GREY_PALE, ec=GREY, fs=FS, bold=False, lw=1.2):
    """Square-cornered box - used for external entities."""
    ax.add_patch(Rectangle((x - w / 2, y - h / 2), w, h, facecolor=fc,
                           edgecolor=ec, linewidth=lw, zorder=2))
    ax.text(x, y, text, ha="center", va="center", fontsize=fs, color=INK,
            fontweight="bold" if bold else "normal", zorder=3, linespacing=1.35)
    return (x, y, w, h)


def proc(ax, x, y, r, num, text, fc=TEAL_PALE, ec=TEAL, fs=FS_S):
    """Circular DFD process bubble."""
    ax.add_patch(Circle((x, y), r, facecolor=fc, edgecolor=ec, linewidth=1.3, zorder=2))
    ax.text(x, y + r * 0.42, num, ha="center", va="center", fontsize=fs,
            fontweight="bold", color=TEAL_DK, zorder=3)
    ax.text(x, y - r * 0.18, text, ha="center", va="center", fontsize=fs,
            color=INK, zorder=3, linespacing=1.3)
    return (x, y, r * 2, r * 2)


def store(ax, x, y, w, h, tag, text, fs=FS_S):
    """Open-ended data store (Gane-Sarson style)."""
    ax.add_patch(Rectangle((x - w / 2, y - h / 2), w, h, facecolor=STORE,
                           edgecolor=STORE_EC, linewidth=1.2, zorder=2))
    ax.plot([x - w / 2 + w * 0.16, x - w / 2 + w * 0.16],
            [y - h / 2, y + h / 2], color=STORE_EC, linewidth=1.2, zorder=3)
    ax.text(x - w / 2 + w * 0.08, y, tag, ha="center", va="center",
            fontsize=fs, fontweight="bold", color=STORE_EC, zorder=3)
    ax.text(x + w * 0.08, y, text, ha="center", va="center", fontsize=fs,
            color=INK, zorder=3, linespacing=1.3)
    return (x, y, w, h)


def _edge(b, side):
    x, y, w, h = b
    return {"l": (x - w / 2, y), "r": (x + w / 2, y),
            "t": (x, y + h / 2), "b": (x, y - h / 2), "c": (x, y)}[side]


def arrow(ax, a, sa, b, sb, label="", fs=FS_S, color=TEAL_DK, rad=0.0,
          ls="-", lw=1.15, loff=(0, 2.2), ha="center", dashed=False):
    p1 = _edge(a, sa) if isinstance(a, tuple) and len(a) == 4 else a
    p2 = _edge(b, sb) if isinstance(b, tuple) and len(b) == 4 else b
    ar = FancyArrowPatch(p1, p2, arrowstyle="-|>", mutation_scale=11,
                         color=color, linewidth=lw, zorder=1,
                         linestyle="--" if dashed else ls,
                         connectionstyle=f"arc3,rad={rad}",
                         shrinkA=1, shrinkB=1)
    ax.add_patch(ar)
    if label:
        mx, my = (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2
        if rad:
            dx, dy = p2[0] - p1[0], p2[1] - p1[1]
            mx -= dy * rad * 0.5
            my += dx * rad * 0.5
        ax.text(mx + loff[0], my + loff[1], label, ha=ha, va="center",
                fontsize=fs, color=color, zorder=4, linespacing=1.2,
                bbox=dict(boxstyle="round,pad=0.18", fc="white",
                          ec="none", alpha=0.88))


def save(fig, name):
    path = os.path.join(OUT, name)
    fig.savefig(path, dpi=DPI, bbox_inches="tight", facecolor="white",
                pad_inches=0.12)
    plt.close(fig)
    print("wrote", name)


# =====================================================================
# Figure 3.2 - DFD Level 0 (Context Diagram)
# =====================================================================
def fig_dfd0():
    fig, ax = canvas(9.2, 5.6)

    n = sharp(ax, 13, 82, 20, 8.5, "NewsAPI", bold=True)
    y = sharp(ax, 13, 69, 20, 8.5, "YouTube Data API", bold=True)
    r = sharp(ax, 13, 56, 20, 8.5, "RSS Feeds", bold=True)
    hr = sharp(ax, 87, 69, 20, 9.5, "Human\nReviewer", bold=True, fc=AMBER_PALE, ec=AMBER)

    sys = proc(ax, 50, 69, 13.5, "0",
               "TruthLens\nMisinformation\nDetection System", fs=FS)

    d1 = store(ax, 22, 26, 30, 8.5, "D1", "Neo4j Provenance Graph")
    d2 = store(ax, 57, 26, 30, 8.5, "D2", "ChromaDB Evidence Corpus")
    d3 = store(ax, 57, 12, 30, 8.5, "D3", "ChromaDB Claim Index")

    arrow(ax, n, "r", (37.5, 78), None, "articles", loff=(1, 2.4))
    arrow(ax, y, "r", (36.5, 69), None, "video metadata", loff=(0, 2.4))
    arrow(ax, r, "r", (37.5, 60), None, "feed items", loff=(2, -2.6))

    arrow(ax, (62.5, 73), None, hr, "l", "claims flagged\nfor review", loff=(0, 4.2))
    arrow(ax, hr, "l", (63.5, 64), None, "approve /\nreject", loff=(0, -4.4), color=AMBER)

    arrow(ax, (44, 57), None, d1, "t", "claims, sources,\nreviews, audit events",
          rad=0.12, loff=(-9, 1))
    arrow(ax, d1, "t", (46, 56.5), None, "provenance\ntimeline", rad=0.12,
          loff=(9.5, -2))
    arrow(ax, (56, 56.5), None, d2, "t", "evidence query", rad=-0.1, loff=(9, 2))
    arrow(ax, d3, "l", (47, 58), None, "canonical\nclaim", rad=-0.28, loff=(-6, -1))

    save(fig, "fig_3_5_dfd_level0.png")


# =====================================================================
# Figure 3.3 - DFD Level 1: Ingestion and Claim Detection
# =====================================================================
def fig_dfd1_detect():
    fig, ax = canvas(9.6, 5.8)

    src = sharp(ax, 10, 78, 16, 13,
                "NewsAPI\nYouTube\nRSS Feeds", bold=True, fs=FS_S)

    p11 = proc(ax, 30, 78, 9.5, "1.1", "Fetch &\nNormalise")
    p12 = proc(ax, 53, 78, 9.5, "1.2", "Dedup &\nScore\nSuspicion")
    p13 = proc(ax, 76, 78, 9.5, "1.3", "Detect Claim\n(Groq LLM)")
    p14 = proc(ax, 76, 46, 9.5, "1.4", "Route by\nStatus")
    p15 = proc(ax, 40, 46, 9.5, "1.5", "Resolve\nCanonical\nClaim")

    d3 = store(ax, 40, 20, 30, 8, "D3", "ChromaDB Claim Index")
    d1 = store(ax, 78, 20, 30, 8, "D1", "Neo4j :Claim nodes")

    endp = box(ax, 96, 46, 9, 7, "END", fc=GREY_PALE, ec=GREY, fs=FS_S, bold=True)

    arrow(ax, src, "r", p11, "l", "raw\nposts", loff=(0, 6.0))
    arrow(ax, p11, "r", p12, "l", "normalised\ntext", loff=(0, 3.4))
    arrow(ax, p12, "r", p13, "l", "top-N\nranked", loff=(0, 3.4))
    arrow(ax, p13, "b", p14, "t", "severity,\nconfidence,\ncategory", loff=(11, 0))
    arrow(ax, p14, "r", endp, "l", "dropped", loff=(0, 2.2), color=AMBER)
    arrow(ax, p14, "l", p15, "r", "pending /\nreview_required", loff=(0, 3))
    arrow(ax, p15, "b", d3, "t", "nearest-neighbour\nlookup (<= 0.70)", loff=(-14, 2))
    arrow(ax, p15, "r", d1, "l", "upsert claim\n+ audit event", rad=-0.25,
          loff=(6, -3))
    arrow(ax, p15, "l", (17, 46), None, "to Origin Tracer\n(Figure 3.7)",
          loff=(0, -4.6), color=TEAL)

    save(fig, "fig_3_6_dfd_ingestion_detection.png")


# =====================================================================
# Figure 3.4 - DFD Level 1: Origin Tracing and Spread Prediction
# =====================================================================
def fig_dfd1_trace():
    fig, ax = canvas(9.6, 5.8)

    inp = box(ax, 10, 80, 16, 10, "Canonical\nclaim +\nmetadata",
              fc=GREY_PALE, ec=GREY, fs=FS_S, bold=True)

    p21 = proc(ax, 32, 80, 9.5, "2.1", "Record\nSighting")
    p22 = proc(ax, 56, 80, 9.5, "2.2", "Query\nProvenance")
    p23 = proc(ax, 80, 80, 9.5, "2.3", "Summarise\nOrigin\n(Groq LLM)")

    d1 = store(ax, 44, 55, 34, 8, "D1", "Neo4j (:Claim)-[:REPORTED_BY]->(:Source)")

    p31 = proc(ax, 20, 30, 9.5, "3.1", "Normalise\n5 Features")
    p32 = proc(ax, 44, 30, 9.5, "3.2", "Weighted\nRisk Score")
    p33 = proc(ax, 68, 30, 9.5, "3.3", "Assemble\nPyG Graph")
    p34 = proc(ax, 89, 30, 8.5, "3.4", "Project\n6h Reach")

    arrow(ax, inp, "r", p21, "l", "url, platform,\npublished_at", loff=(0, 3.6))
    arrow(ax, p21, "r", p22, "l", "", loff=(0, 0))
    arrow(ax, p22, "r", p23, "l", "ordered\noutlet chain", loff=(0, 3.4))
    arrow(ax, p21, "b", d1, "t", "MERGE\nsighting", rad=0.12, loff=(-7, 1))
    arrow(ax, d1, "t", p22, "b", "timeline,\noutlet count", rad=0.12, loff=(7, -1))

    arrow(ax, p23, "b", (23, 39), None, "", rad=0.30)
    ax.text(76, 58, "origin summary,\nfirst_seen, timeline", ha="center",
            va="center", fontsize=FS_S, color=TEAL_DK, linespacing=1.3,
            bbox=dict(boxstyle="round,pad=0.22", fc="white", ec="none", alpha=0.92))
    arrow(ax, p31, "r", p32, "l", "", loff=(0, 0))
    arrow(ax, p32, "r", p33, "l", "risk 0-1", loff=(0, 2.6))
    arrow(ax, p33, "r", p34, "l", "node count", loff=(0, 3.4))
    arrow(ax, p32, "b", (44, 13), None, "per-driver contributions\n(+0.210 of 0.396 = 53%)",
          loff=(0, -3.4), color=TEAL)
    arrow(ax, p34, "t", (89, 47), None, "to Narrative Drafter\n(Figure 3.8)",
          loff=(0, 4.4), color=TEAL)

    ax.text(50, 45.5,
            "feature weights:  severity 0.30 | suspicion 0.20 | velocity 0.20 | "
            "outlets 0.15 | confidence 0.15",
            ha="center", va="center", fontsize=FS_S - 0.4, color=GREY, style="italic",
            bbox=dict(boxstyle="round,pad=0.25", fc="white", ec=GREY, lw=0.5))

    save(fig, "fig_3_7_dfd_origin_spread.png")


# =====================================================================
# Figure 3.5 - DFD Level 1: Evidence Retrieval and Counter-Narrative
# =====================================================================
def fig_dfd1_narrative():
    fig, ax = canvas(9.6, 5.8)

    inp = box(ax, 9, 80, 15, 9, "Canonical\nclaim", fc=GREY_PALE, ec=GREY,
              fs=FS_S, bold=True)

    p41 = proc(ax, 29, 80, 9.5, "4.1", "Embed Claim\n(MiniLM-L6)")
    p42 = proc(ax, 53, 80, 9.5, "4.2", "Vector\nSearch\ntop-3")
    p43 = proc(ax, 77, 80, 9.5, "4.3", "Filter\ndistance\n<= 1.2")

    d2 = store(ax, 41, 56, 32, 8, "D2", "ChromaDB misinformation_knowledge")

    noev = box(ax, 90, 55, 15, 10, "status =\nno_evidence",
               fc=AMBER_PALE, ec=AMBER, fs=FS_S, bold=True)

    p44 = proc(ax, 62, 32, 9.5, "4.4", "Ground &\nGenerate\n(Groq LLM)")
    p45 = proc(ax, 36, 32, 9.5, "4.5", "HITL\nReview\nGate")
    p46 = proc(ax, 13, 32, 9.5, "4.6", "Export /\nPublish\n(simulated)")

    hr = sharp(ax, 36, 10, 20, 8, "Human Reviewer", bold=True,
               fc=AMBER_PALE, ec=AMBER, fs=FS_S)
    d1 = store(ax, 78, 10, 30, 8, "D1", "Neo4j :Review, :AuditEvent")

    arrow(ax, inp, "r", p41, "l", "", loff=(0, 0))
    arrow(ax, p41, "r", p42, "l", "384-dim\nvector", loff=(0, 3.4))
    arrow(ax, p42, "r", p43, "l", "candidates\n+ distances", loff=(0, 3.4))
    arrow(ax, p42, "b", d2, "t", "squared-L2\nquery", rad=0.14, loff=(-8, 0))
    arrow(ax, p43, "r", noev, "t", "0 docs\nkept", loff=(6.5, 3.5), color=AMBER)
    arrow(ax, p43, "b", p44, "r", ">= 1 doc\nkept", rad=0.2, loff=(-4, -8))
    arrow(ax, p44, "l", p45, "r", "drafted\nnarrative", loff=(0, 3.2))
    arrow(ax, p45, "l", p46, "r", "approved", loff=(0, 2.4))
    arrow(ax, p45, "b", hr, "t", "severity >= 9\n& conf >= 0.6", loff=(10, 0),
          color=AMBER)
    arrow(ax, hr, "t", p45, "b", "", rad=0.4, color=AMBER)
    arrow(ax, p44, "b", d1, "t", "persist narrative,\nsource ids", rad=-0.15,
          loff=(11, 3))

    save(fig, "fig_3_8_dfd_evidence_narrative.png")


# =====================================================================
# Figure 3.6 - LangGraph agent workflow
# =====================================================================
def fig_workflow():
    fig, ax = canvas(9.0, 5.2)

    start = box(ax, 9, 72, 12, 8, "START", fc=GREY_PALE, ec=GREY, bold=True, fs=FS_S)
    det = box(ax, 30, 72, 19, 12, "detect\nClaim Detector\n(Agent 1)",
              fc=TEAL_PALE, ec=TEAL, bold=False, fs=FS_S)
    tr = box(ax, 57, 72, 19, 12, "trace\nOrigin Tracer\n(Agent 2)",
             fc=TEAL_PALE, ec=TEAL, fs=FS_S)
    sp = box(ax, 84, 72, 19, 12, "spread\nSpread Predictor\n(Agent 3)",
             fc=TEAL_PALE, ec=TEAL, fs=FS_S)
    nar = box(ax, 66, 40, 21, 12, "narrative\nNarrative Drafter\n(Agent 4)",
              fc=TEAL_PALE, ec=TEAL, fs=FS_S)
    rev = box(ax, 33, 40, 19, 12, "review\nHITL Gate",
              fc=AMBER_PALE, ec=AMBER, fs=FS_S)
    end = box(ax, 9, 40, 12, 8, "END", fc=GREY_PALE, ec=GREY, bold=True, fs=FS_S)

    arrow(ax, start, "r", det, "l")
    arrow(ax, det, "r", tr, "l", "status !=\ndropped", loff=(0, 3.6))
    arrow(ax, tr, "r", sp, "l")
    arrow(ax, sp, "b", nar, "r", "", rad=-0.25)
    arrow(ax, nar, "l", rev, "r", "status ==\nreview_required", loff=(0, 3.4),
          color=AMBER)
    arrow(ax, rev, "l", end, "r")
    arrow(ax, nar, "b", (12, 35.5), None, "otherwise", rad=0.14, loff=(2, -3.4))
    arrow(ax, det, "b", (9, 45), None, "dropped", rad=0.25, loff=(-5, -3),
          color=AMBER)

    ax.text(50, 18,
            "Conditional edges: route_after_detection() and route_after_narrative()\n"
            "Shared state: MisinformationState (TypedDict, total=False)",
            ha="center", va="center", fontsize=FS_S, color=GREY, style="italic",
            linespacing=1.5)

    save(fig, "fig_3_3_agent_workflow.png")


# =====================================================================
# Figure 3.7 - Neo4j graph schema
# =====================================================================
def fig_schema():
    fig, ax = canvas(9.0, 5.6)

    claim = box(ax, 30, 62, 40, 52, "", fc=TEAL_PALE, ec=TEAL)
    ax.text(30, 84, ":Claim", ha="center", va="center", fontsize=FS + 1.6,
            fontweight="bold", color=TEAL_DK, zorder=4)
    ax.plot([13, 47], [81, 81], color=TEAL, lw=0.8, zorder=4)
    ax.text(30, 62,
            "text (key)  |  id\n"
            "original_text  |  aliases\n"
            "severity  |  detection_confidence\n"
            "is_misinformation  |  category\n"
            "detection_status  |  rationale\n"
            "harm  |  techniques  |  keywords\n"
            "platform  |  post_source  |  url\n"
            "origin_first_seen  |  origin_summary\n"
            "origin_outlet_count  |  origin_timeline\n"
            "risk_score  |  spread_r0\n"
            "spread_drivers  |  narrative\n"
            "narrative_status  |  rag_source_ids\n"
            "stage",
            ha="center", va="center", fontsize=FS_S - 0.9, color=INK,
            zorder=4, linespacing=1.55)

    source = box(ax, 80, 74, 30, 20,
                 "\n\nkey (unique)\nname\nplatform\nurl\nfirst_ingested_at",
                 fc=BLUE_PALE, ec=BLUE, fs=FS_S)
    ax.text(80, 81, ":Source", ha="center", va="center", fontsize=FS + 1.2,
            fontweight="bold", color=BLUE, zorder=4)

    review = box(ax, 80, 42, 30, 14, "\n\nclaim_id\napproved\nstatus",
                 fc=AMBER_PALE, ec=AMBER, fs=FS_S)
    ax.text(80, 46.5, ":Review", ha="center", va="center", fontsize=FS + 1.2,
            fontweight="bold", color=AMBER, zorder=4)

    audit = box(ax, 80, 18, 30, 16, "\n\nclaim_id\naction\ndetails\ntimestamp",
                fc=GREY_PALE, ec=GREY, fs=FS_S)
    ax.text(80, 23.5, ":AuditEvent", ha="center", va="center", fontsize=FS + 1.2,
            fontweight="bold", color=GREY, zorder=4)

    arrow(ax, (50, 76), None, (65, 74), None,
          "[:REPORTED_BY]\npublished_at, ingested_at, first_seen", loff=(0, 5.2))

    arrow(ax, (50, 55), None, (65, 45), None, "", dashed=True, color=AMBER, lw=1.0)
    ax.text(57.5, 53.5, "Review.claim_id\n= Claim.text", ha="center", va="center",
            fontsize=FS_S - 0.5, color=AMBER, style="italic",
            bbox=dict(boxstyle="round,pad=0.2", fc="white", ec="none"))

    arrow(ax, (50, 42), None, (65, 22), None, "", dashed=True, color=GREY, lw=1.0)
    ax.text(52, 27, "AuditEvent.claim_id\n= Claim.text", ha="center", va="center",
            fontsize=FS_S - 0.5, color=GREY, style="italic",
            bbox=dict(boxstyle="round,pad=0.2", fc="white", ec="none"))

    save(fig, "fig_3_4_neo4j_schema.png")


# =====================================================================
# Figure 3.8 - Use case diagram
# =====================================================================
def fig_usecase():
    fig, ax = canvas(9.0, 6.0)

    ax.add_patch(Rectangle((26, 8), 48, 84, facecolor="#FBFDFC",
                           edgecolor=TEAL, linewidth=1.3, zorder=1))
    ax.text(50, 88.5, "TruthLens System", ha="center", va="center",
            fontsize=FS + 0.6, fontweight="bold", color=TEAL_DK, zorder=3)

    def actor(x, y, label):
        ax.add_patch(Circle((x, y + 7), 2.4, facecolor="white", edgecolor=INK,
                            linewidth=1.2, zorder=3))
        ax.plot([x, x], [y + 4.6, y - 1], color=INK, lw=1.2, zorder=3)
        ax.plot([x - 3.4, x + 3.4], [y + 2.6, y + 2.6], color=INK, lw=1.2, zorder=3)
        ax.plot([x, x - 2.8], [y - 1, y - 5.4], color=INK, lw=1.2, zorder=3)
        ax.plot([x, x + 2.8], [y - 1, y - 5.4], color=INK, lw=1.2, zorder=3)
        ax.text(x, y - 8.6, label, ha="center", va="center", fontsize=FS_S,
                fontweight="bold", color=INK, linespacing=1.3, zorder=3)
        return (x, y + 1, 7, 14)

    def uc(x, y, label, fc=TEAL_PALE, ec=TEAL):
        ax.add_patch(Ellipse((x, y), 40, 8.4, facecolor=fc, edgecolor=ec,
                             linewidth=1.1, zorder=2))
        ax.text(x, y, label, ha="center", va="center", fontsize=FS_S,
                color=INK, zorder=3)
        return (x, y, 40, 8.4)

    sched = actor(9, 62, "Scheduler /\nSystem")
    reviewer = actor(91, 48, "Human\nReviewer")
    apis = actor(9, 24, "External\nContent APIs")

    u1 = uc(50, 79, "Ingest live content from public sources")
    u2 = uc(50, 68, "Detect and score candidate false claims")
    u3 = uc(50, 57, "Resolve claim to canonical identity")
    u4 = uc(50, 46, "Trace claim provenance")
    u5 = uc(50, 35, "Predict spread risk")
    u6 = uc(50, 24, "Draft evidence-grounded counter-narrative")
    u7 = uc(50, 13.5, "Approve / reject and publish (simulated)",
            fc=AMBER_PALE, ec=AMBER)

    for u in (u1, u2):
        ax.plot([12.5, u[0] - 20], [62, u[1]], color=GREY, lw=1.0, zorder=1)
    ax.plot([12.5, 30], [24, 24], color=GREY, lw=1.0, zorder=1)
    for u in (u4, u6, u7):
        ax.plot([87.5, u[0] + 20], [48, u[1]], color=AMBER, lw=1.0, zorder=1)
    ax.plot([87.5, 70], [48, 35], color=AMBER, lw=1.0, zorder=1)

    for a, b in ((u1, u2), (u2, u3), (u3, u4), (u4, u5), (u5, u6), (u6, u7)):
        ax.annotate("", xy=(b[0] + 17, b[1] + 3.2), xytext=(a[0] + 17, a[1] - 3.2),
                    arrowprops=dict(arrowstyle="-|>", color=TEAL, lw=0.9,
                                    linestyle="--", shrinkA=0, shrinkB=0), zorder=1)

    save(fig, "fig_3_2_use_case.png")


# =====================================================================
# Figure 4.1 - Sequence diagram
# =====================================================================
def fig_sequence():
    fig, ax = canvas(10.0, 7.0)

    lanes = [
        ("Ingestion\nManager", 8),
        ("Claim\nDetector", 23),
        ("Claim\nIndex", 37),
        ("Origin\nTracer", 51),
        ("Spread\nPredictor", 65),
        ("Narrative\nDrafter", 79),
        ("Neo4j /\nChromaDB", 93),
    ]
    top = 93
    bottom = 11
    for label, x in lanes:
        box(ax, x, top, 12.5, 8, label, fc=TEAL_PALE, ec=TEAL, fs=FS_S - 0.4,
            bold=True, rounding=1.0)
        ax.plot([x, x], [top - 4, bottom], color=GREY, lw=0.9, ls=(0, (4, 3)),
                zorder=0)

    X = {name: x for name, x in lanes}
    L = dict(zip(["ing", "det", "idx", "org", "spr", "nar", "db"],
                 [x for _, x in lanes]))

    def msg(y, a, b, text, color=TEAL_DK, dashed=False, fs=FS_S - 0.4):
        x1, x2 = L[a], L[b]
        ax.annotate("", xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle="-|>", color=color, lw=1.05,
                                    linestyle="--" if dashed else "-",
                                    shrinkA=0, shrinkB=0), zorder=2)
        ax.text((x1 + x2) / 2, y + 1.9, text, ha="center", va="bottom",
                fontsize=fs, color=color, zorder=3, linespacing=1.25,
                bbox=dict(boxstyle="round,pad=0.16", fc="white", ec="none",
                          alpha=0.9))

    y = 84
    step = 6.8
    msg(y, "ing", "det", "1. normalised post + suspicion score"); y -= step
    msg(y, "det", "det", "")
    ax.annotate("", xy=(L["det"] + 5, y - 2.4), xytext=(L["det"], y + 1),
                arrowprops=dict(arrowstyle="-", color=TEAL_DK, lw=1.0))
    ax.annotate("", xy=(L["det"], y - 5), xytext=(L["det"] + 5, y - 2.4),
                arrowprops=dict(arrowstyle="-|>", color=TEAL_DK, lw=1.0))
    ax.text(L["det"] + 6.5, y - 2, "2. Groq LLM: severity,\nconfidence, category",
            ha="left", va="center", fontsize=FS_S - 0.4, color=TEAL_DK,
            linespacing=1.25)
    y -= step + 2
    msg(y, "det", "idx", "3. resolve_claim()"); y -= step
    msg(y, "idx", "det", "4. canonical text, distance", dashed=True); y -= step
    msg(y, "det", "org", "5. canonical claim + source metadata"); y -= step
    msg(y, "org", "db", "6. MERGE sighting, read timeline"); y -= step
    msg(y, "org", "spr", "7. outlet count, timeline"); y -= step
    msg(y, "spr", "nar", "8. risk score, R0, drivers"); y -= step
    msg(y, "nar", "db", "9. vector search (distance <= 1.2)"); y -= step
    msg(y, "db", "nar", "10. top-3 evidence documents", dashed=True); y -= step
    msg(y, "nar", "db", "11. persist narrative + audit event")

    save(fig, "fig_4_1_sequence.png")


if __name__ == "__main__":
    fig_dfd0()
    fig_dfd1_detect()
    fig_dfd1_trace()
    fig_dfd1_narrative()
    fig_workflow()
    fig_schema()
    fig_usecase()
    fig_sequence()
    print("\nAll diagrams written to", OUT)
