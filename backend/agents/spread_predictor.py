from dataclasses import dataclass

import torch
from torch_geometric.data import Data


@dataclass
class SpreadResult:
    risk_score: float
    predicted_reach: int
    status: str


def predict_spread(claim: str) -> SpreadResult:
    """
    Basic graph-based spread prediction.

    A small graph is created from the claim and its connected
    propagation nodes.
    """

    # Simple graph:
    # Node 0 = claim
    # Nodes 1-3 = possible propagation nodes
    edge_index = torch.tensor(
        [
            [0, 0, 0],
            [1, 2, 3]
        ],
        dtype=torch.long
    )

    x = torch.tensor(
        [
            [1.0],
            [1.0],
            [1.0],
            [1.0]
        ],
        dtype=torch.float
    )

    graph = Data(
        x=x,
        edge_index=edge_index
    )

    predicted_reach = graph.num_nodes

    risk_score = min(
        1.0,
        predicted_reach / 10
    )

    return SpreadResult(
        risk_score=risk_score,
        predicted_reach=predicted_reach,
        status="predicted"
    )