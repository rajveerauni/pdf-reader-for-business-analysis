import numpy as np
import pandas as pd


POSITIVE_WORDS = {"stabilizing", "consistently", "prioritize", "controlled", "rarely", "disciplined"}
NEGATIVE_WORDS = {"setback", "fluctuates", "overextended", "obligations", "additional", "miss"}


def simple_sentiment_score(text: str) -> float:
    tokens = set(str(text).lower().replace(",", "").replace(".", "").split())
    pos = len(tokens.intersection(POSITIVE_WORDS))
    neg = len(tokens.intersection(NEGATIVE_WORDS))
    raw = 0.5 + 0.1 * (pos - neg)
    return float(np.clip(raw, 0.0, 1.0))


def add_nlp_features(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["narrative_sentiment_score"] = out["financial_narrative"].apply(simple_sentiment_score)

    behavior_reliability = (
        0.45 * (out["payment_consistency_score"] / 100.0)
        + 0.30 * np.clip(out["income_stability_index"] / 100.0, 0, 1)
        + 0.25 * np.clip(1 - out["cashflow_stress_indicator"], 0, 1)
    )
    out["narrative_credibility_score"] = np.clip(
        1 - np.abs(out["narrative_sentiment_score"] - behavior_reliability), 0, 1
    )
    return out
