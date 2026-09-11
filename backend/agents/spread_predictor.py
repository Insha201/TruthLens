"""
Spread Predictor agent.

Transparent, feature-based risk + reach projection for a claim. There is no
trained model here (we have no labelled spread data); instead every number is
derived from signals we actually observe:

  - detector severity (1-10) and confidence
  - the ingestion suspicion score (0-1)
  - how many distinct outlets have carried the claim (from the Origin Tracer)
  - how fast those sightings arrived (outlets per day, from the timeline)

The claim's real propagation graph (Claim -> Sources it appeared on, plus
projected susceptible clusters) is assembled with PyTorch Geometric so the
`predicted_reach` node count reflects real structure rather than a constant.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone

import torch
from torch_geometric.data import Data

try:  # dateutil handles both ISO and RFC-822 (RSS) timestamps
    from dateutil import parser as _dtparser
except Exception:  # pragma: no cover
    _dtparser = None


# Order-of-magnitude audience proxies per outlet. These are ROUGH constants,
# not measured reach — used only to turn an outlet count into a ballpark.
_PLATFORM_AUDIENCE = {
    "news": 60000, "newsapi": 60000, "rss": 8000, "youtube": 25000,
    "x": 40000, "twitter": 40000, "telegram": 15000, "reddit": 20000,
    "tiktok": 50000, "whatsapp": 5000, "manual": 800,
}


@dataclass
class SpreadResult:
    risk_score: float           # 0..1 composite risk
    predicted_reach: int        # node count of the assembled propagation graph
    status: str
    r0: float = 0.0             # reproduction factor (~0.8 .. 5.0)
    current_reach_est: int = 0  # ballpark people reached so far
    projected_6h_uncontained: int = 0
    projected_6h_contained: int = 0
    reduction_pct: float = 0.0
    velocity_outlets_per_day: float = 0.0
    drivers: list = field(default_factory=list)  # human-readable feature notes


def _parse_ts(value: str):
    if not value:
        return None
    try:
        if _dtparser is not None:
            dt = _dtparser.parse(value)
        else:
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return None


def _velocity(timeline: list) -> float:
    """Outlets per day, from the spread of real sighting timestamps."""
    stamps = sorted(t for t in (_parse_ts(x.get("timestamp", "")) for x in timeline) if t)
    if len(stamps) < 2:
        return float(len(stamps))
    span_days = (stamps[-1] - stamps[0]).total_seconds() / 86400.0
    if span_days < 0.25:  # everything landed within ~6h → treat as burst
        return float(len(stamps)) * 4.0
    return round(len(stamps) / span_days, 3)


def predict_spread(
    claim: str,
    *,
    severity: int = 5,
    suspicion_score: float = 0.0,
    is_misinformation: bool = True,
    detection_confidence: float = 0.6,
    outlet_count: int = 1,
    timeline: list | None = None,
) -> SpreadResult:
    timeline = timeline or []

    velocity = _velocity(timeline)

    # --- normalised features (each 0..1) ---
    f_sev = min(max(severity, 1), 10) / 10.0
    f_susp = min(max(suspicion_score, 0.0), 1.0)
    f_vel = min(velocity / 5.0, 1.0)          # 5+ outlets/day == maxed
    f_spread = min(max(outlet_count, 0) / 8.0, 1.0)
    f_conf = min(max(detection_confidence, 0.0), 1.0)

    weights = {
        "Detector severity": (0.30, f_sev, f"{int(severity)}/10"),
        "Ingest suspicion": (0.20, f_susp, f"{suspicion_score:.2f}"),
        "Spread velocity": (0.20, f_vel, f"{velocity:.1f} outlets/day"),
        "Outlet count": (0.15, f_spread, f"{outlet_count} outlet(s)"),
        "Detector confidence": (0.15, f_conf, f"{detection_confidence:.2f}"),
    }

    raw = sum(w * v for w, v, _ in weights.values())
    penalty = 1.0 if is_misinformation else 0.4
    risk = round(min(raw * penalty, 1.0), 3)

    # --- reproduction factor ---
    r0 = round(0.8 + risk * 3.6 + f_vel * 0.6, 2)   # ~0.8 .. 5.0

    # --- current reach (ballpark, from outlets that carried it) ---
    if timeline:
        base = sum(
            _PLATFORM_AUDIENCE.get((t.get("platform") or "").lower(), 5000)
            for t in timeline
        )
    else:
        base = _PLATFORM_AUDIENCE["manual"]
    current = int(base * (0.5 + risk))

    # --- 6h projection: one ~6h "generation" of geometric growth ---
    proj_unc = int(min(current * max(r0, 1.0), current * 20 + 5_000_000))
    proj_con = int(current * max(min(r0, 1.15), 1.0))   # containment pushes R0 -> ~1
    reduction = round((proj_unc - proj_con) / proj_unc * 100, 1) if proj_unc > 0 else 0.0

    # --- assemble the real propagation graph in PyG ---
    n_real = max(1, len(timeline))
    n_proj = 1 + int(round(risk * 4))                   # projected susceptible clusters
    n = n_real + n_proj
    src, dst = [], []
    for i in range(1, n_real):        # outlet -> next outlet (observed chain)
        src.append(i - 1); dst.append(i)
    for j in range(n_real, n):        # last observed outlet -> susceptible cluster
        src.append(n_real - 1); dst.append(j)
    edge_index = torch.tensor([src or [0], dst or [0]], dtype=torch.long)
    x = torch.tensor([[1.0]] * n, dtype=torch.float)
    graph = Data(x=x, edge_index=edge_index)
    predicted_reach = graph.num_nodes

    # Show what each factor actually CONTRIBUTED to the risk score, ranked,
    # rather than just echoing the raw inputs back.
    drivers = []
    for name, (weight, value, shown) in sorted(
        weights.items(), key=lambda kv: kv[1][0] * kv[1][1], reverse=True
    ):
        points = weight * value * penalty
        share = (points / risk * 100) if risk > 0 else 0.0
        if value == 0:
            drivers.append(f"{name}: {shown} - contributed nothing")
        else:
            drivers.append(
                f"{name}: {shown} -> +{points:.3f} of {risk:.3f} risk ({share:.0f}%)"
            )

    if not is_misinformation:
        drivers.append("Not flagged as misinformation - risk scaled down by 60%")

    return SpreadResult(
        risk_score=risk,
        predicted_reach=predicted_reach,
        status="predicted",
        r0=r0,
        current_reach_est=current,
        projected_6h_uncontained=proj_unc,
        projected_6h_contained=proj_con,
        reduction_pct=reduction,
        velocity_outlets_per_day=round(velocity, 2),
        drivers=drivers,
    )
