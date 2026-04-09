import numpy as np
import pandas as pd


def pd_to_score(pd_hat: pd.Series, min_score: int = 300, max_score: int = 850) -> pd.Series:
    score = max_score - (max_score - min_score) * pd_hat
    return np.clip(score, min_score, max_score)


def assign_risk_tier(score: float) -> str:
    if score >= 760:
        return "A"
    if score >= 700:
        return "B"
    if score >= 640:
        return "C"
    if score >= 580:
        return "D"
    return "E"


def tier_apr(tier: str) -> float:
    return {"A": 0.12, "B": 0.17, "C": 0.23, "D": 0.31, "E": 0.42}[tier]


def build_policy_frame(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["credit_score"] = pd_to_score(out["pd_hat"])
    out["risk_tier"] = out["credit_score"].apply(assign_risk_tier)
    out["recommended_apr"] = out["risk_tier"].apply(tier_apr)
    return out


def adverse_impact_ratio(y_pred_binary: pd.Series, sensitive_group: pd.Series) -> float:
    tmp = pd.DataFrame({"pred": y_pred_binary, "group": sensitive_group})
    rates = tmp.groupby("group")["pred"].mean()
    return float(rates.min() / max(rates.max(), 1e-9))


def simulate(df: pd.DataFrame, threshold: float = 0.5, lgd: float = 0.55, funding_cost: float = 0.07) -> dict:
    out = build_policy_frame(df)
    out["approved"] = (out["pd_hat"] < threshold).astype(int)
    approved = out[out["approved"] == 1].copy()

    if approved.empty:
        return {
            "approval_rate": 0.0,
            "default_rate_approved": np.nan,
            "total_revenue": 0.0,
            "avg_revenue": 0.0,
            "air_gender": np.nan,
            "air_region": np.nan,
            "tier_summary": {},
        }

    approved["interest_income"] = approved["loan_amount_requested"] * approved["recommended_apr"]
    approved["expected_credit_loss"] = approved["pd_hat"] * lgd * approved["loan_amount_requested"]
    approved["funding_cost"] = approved["loan_amount_requested"] * funding_cost
    approved["net_revenue"] = (
        approved["interest_income"] - approved["expected_credit_loss"] - approved["funding_cost"]
    )

    tier_summary = (
        approved.groupby("risk_tier")
        .agg(
            applicants=("applicant_id", "count"),
            avg_pd=("pd_hat", "mean"),
            observed_default_rate=("default_flag", "mean"),
            avg_apr=("recommended_apr", "mean"),
            avg_revenue=("net_revenue", "mean"),
        )
        .reset_index()
        .to_dict(orient="records")
    )

    return {
        "approval_rate": float(out["approved"].mean()),
        "default_rate_approved": float(approved["default_flag"].mean()),
        "total_revenue": float(approved["net_revenue"].sum()),
        "avg_revenue": float(approved["net_revenue"].mean()),
        "air_gender": adverse_impact_ratio(out["approved"], out["gender"]),
        "air_region": adverse_impact_ratio(out["approved"], out["region"]),
        "tier_summary": tier_summary,
    }
