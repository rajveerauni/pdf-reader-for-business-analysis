import numpy as np
import pandas as pd


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()

    out["payment_consistency_score"] = (
        (out["utilities_on_time_12m"] + out["rent_on_time_12m"] + out["mobile_on_time_12m"]) / 36 * 100
    )
    income_cov = out["gig_income_monthly_std"] / (out["gig_income_monthly_mean"] + 1)
    out["income_stability_index"] = np.clip((1 - income_cov) * 100, 0, 100)
    out["financial_footprint_score"] = np.clip(
        40 + (1.8 * np.log1p(out["ecommerce_txn_count_6m"]) * 10) - (55 * out["ecommerce_return_rate"]), 0, 100
    )
    out["cashflow_stress_indicator"] = (
        (out["wallet_outflow_6m"] - out["wallet_inflow_6m"]) / (out["wallet_inflow_6m"] + 1)
    )
    out["debt_service_capacity_ratio"] = (
        (out["gig_income_monthly_mean"] - out["avg_monthly_expense"]) / (out["existing_debt_obligation"] + 1)
    )

    out["essential_spend_ratio"] = out["avg_monthly_expense"] / ((out["wallet_inflow_6m"] / 6) + 1)
    out["rent_timeliness_ratio"] = out["rent_on_time_12m"] / 12
    out["delinquency_intensity"] = out["late_payment_events_12m"] / 12
    out["leverage_proxy"] = out["existing_debt_obligation"] / (out["gig_income_monthly_mean"] + 1)
    out["requested_loan_burden"] = out["loan_amount_requested"] / ((out["gig_income_monthly_mean"] * 6) + 1)
    out["employment_resilience"] = np.clip(out["employment_tenure_months"] / 60, 0, 2)
    out["net_wallet_buffer"] = (out["wallet_inflow_6m"] - out["wallet_outflow_6m"]) / 6

    out.replace([np.inf, -np.inf], np.nan, inplace=True)
    out.fillna(0, inplace=True)
    return out
