import numpy as np
import pandas as pd


RNG = np.random.default_rng(42)

NARRATIVE_ARCHETYPES = [
    "income_shock_but_recovering",
    "stable_low_income_disciplined",
    "gig_worker_variable_cashflow",
    "overextended_credit_seeker",
    "digitally_active_emerging_prime",
]


def _bounded_normal(mean: float, std: float, low: float, high: float, n: int) -> np.ndarray:
    values = RNG.normal(mean, std, n)
    return np.clip(values, low, high)


def generate_synthetic_data(n_samples: int = 10_000, target_default_rate: float = 0.18) -> pd.DataFrame:
    n = n_samples
    df = pd.DataFrame(
        {
            "applicant_id": np.arange(1, n + 1),
            "utilities_on_time_12m": RNG.integers(0, 13, n),
            "rent_on_time_12m": RNG.integers(0, 13, n),
            "mobile_on_time_12m": RNG.integers(0, 13, n),
            "gig_income_monthly_mean": _bounded_normal(850, 450, 0, 4000, n),
            "gig_income_monthly_std": _bounded_normal(250, 200, 0, 1500, n),
            "ecommerce_txn_count_6m": RNG.poisson(18, n),
            "ecommerce_return_rate": _bounded_normal(0.12, 0.08, 0.0, 0.7, n),
            "wallet_inflow_6m": _bounded_normal(4200, 2500, 100, 25000, n),
            "wallet_outflow_6m": _bounded_normal(4000, 2400, 50, 26000, n),
            "avg_monthly_expense": _bounded_normal(620, 330, 100, 3500, n),
            "existing_debt_obligation": _bounded_normal(260, 180, 0, 1400, n),
            "loan_amount_requested": _bounded_normal(1800, 900, 300, 7000, n),
            "employment_tenure_months": RNG.integers(0, 121, n),
            "late_payment_events_12m": RNG.poisson(1.8, n),
        }
    )

    df["narrative_archetype"] = RNG.choice(
        NARRATIVE_ARCHETYPES, size=n, p=[0.18, 0.28, 0.24, 0.16, 0.14]
    )

    narrative_text_map = {
        "income_shock_but_recovering": "I had a temporary income setback but now my earnings and bill payments are stabilizing.",
        "stable_low_income_disciplined": "My income is modest but I consistently pay rent, utilities, and phone bills on time.",
        "gig_worker_variable_cashflow": "I work multiple gig jobs; income fluctuates weekly but I prioritize essential payments.",
        "overextended_credit_seeker": "I have several short-term obligations and need additional credit to consolidate payments.",
        "digitally_active_emerging_prime": "I use digital payments heavily, keep spending controlled, and rarely miss due dates.",
    }
    df["financial_narrative"] = df["narrative_archetype"].map(narrative_text_map)

    # Audit-only demographics (not for training decisions)
    df["age_band"] = RNG.choice(["18-24", "25-34", "35-49", "50+"], size=n, p=[0.22, 0.39, 0.27, 0.12])
    df["gender"] = RNG.choice(["female", "male", "non_binary"], size=n, p=[0.49, 0.49, 0.02])
    df["region"] = RNG.choice(["urban", "peri_urban", "rural"], size=n, p=[0.52, 0.24, 0.24])

    payment_strength = (
        (df["utilities_on_time_12m"] + df["rent_on_time_12m"] + df["mobile_on_time_12m"]) / 36
    )
    cashflow_gap = (df["wallet_outflow_6m"] - df["wallet_inflow_6m"]) / 6000
    debt_pressure = df["existing_debt_obligation"] / (df["gig_income_monthly_mean"] + 1)
    instability = df["gig_income_monthly_std"] / (df["gig_income_monthly_mean"] + 1)
    digital_noise = df["ecommerce_return_rate"] + df["late_payment_events_12m"] / 12

    raw_logit = (
        -1.35
        - 2.2 * payment_strength
        + 1.3 * cashflow_gap
        + 1.8 * debt_pressure
        + 1.2 * instability
        + 0.9 * digital_noise
    )

    prior = {
        "income_shock_but_recovering": 0.20,
        "stable_low_income_disciplined": -0.18,
        "gig_worker_variable_cashflow": 0.14,
        "overextended_credit_seeker": 0.35,
        "digitally_active_emerging_prime": -0.22,
    }
    raw_logit += df["narrative_archetype"].map(prior).values

    shift_grid = np.linspace(-2, 2, 400)
    best_shift = 0.0
    best_gap = 1.0
    for shift in shift_grid:
        pd_shifted = 1 / (1 + np.exp(-(raw_logit + shift)))
        gap = abs(pd_shifted.mean() - target_default_rate)
        if gap < best_gap:
            best_shift = float(shift)
            best_gap = float(gap)

    df["pd_true"] = 1 / (1 + np.exp(-(raw_logit + best_shift)))
    df["default_flag"] = RNG.binomial(1, df["pd_true"])

    return df
