from pathlib import Path
import json
import pandas as pd
import streamlit as st

from src.business.simulator import simulate
from src.models.train import run_training_pipeline


st.set_page_config(page_title="Alternative Credit Engine", layout="wide")
st.title("Alternative Credit Scoring Engine for the Underbanked")
st.caption("Portfolio demo: synthetic data, ML risk model, policy simulation, and fairness signals.")

metrics_path = Path("reports/metrics.json")
predictions_path = Path("data/processed/test_predictions.csv")

with st.sidebar:
    st.header("Controls")
    retrain = st.button("Run / Re-run Training Pipeline")
    threshold = st.slider("Approval Threshold (PD cutoff)", min_value=0.30, max_value=0.70, value=0.50, step=0.01)
    st.markdown("Lower threshold = stricter approvals.")

if retrain or not metrics_path.exists() or not predictions_path.exists():
    with st.spinner("Training models and generating artifacts..."):
        metrics = run_training_pipeline()
    st.success("Training complete.")
else:
    with open(metrics_path, "r", encoding="utf-8") as f:
        metrics = json.load(f)

predictions = pd.read_csv(predictions_path)
sim = simulate(predictions, threshold=threshold)

col1, col2, col3, col4 = st.columns(4)
col1.metric("Approval Rate", f"{sim['approval_rate']:.1%}")
col2.metric("Approved Default Rate", f"{sim['default_rate_approved']:.1%}")
col3.metric("Total Revenue", f"${sim['total_revenue']:,.0f}")
col4.metric("Avg Revenue / Loan", f"${sim['avg_revenue']:,.0f}")

st.subheader("Model Performance")
perf_df = pd.DataFrame(
    [
        {"model": "Logistic Baseline", **metrics["logistic"]},
        {"model": "XGBoost", **{k: v for k, v in metrics["xgboost"].items() if k != "threshold"}},
    ]
)
st.dataframe(perf_df, use_container_width=True)

st.subheader("Fairness Checks (80% Rule proxy)")
f1, f2 = st.columns(2)
f1.metric("AIR (Gender)", f"{sim['air_gender']:.3f}")
f2.metric("AIR (Region)", f"{sim['air_region']:.3f}")
st.caption("Interpretation: values below 0.80 may indicate potential disparate impact and require mitigation.")

st.subheader("Risk Tier Summary")
tier_df = pd.DataFrame(sim["tier_summary"])
if tier_df.empty:
    st.warning("No approved applicants at this threshold.")
else:
    st.dataframe(tier_df, use_container_width=True)

st.subheader("Executive Snapshot")
st.markdown(
    f"""
- This policy approves **{sim['approval_rate']:.1%}** of applicants at threshold **{threshold:.2f}**.
- Approved portfolio default rate is **{sim['default_rate_approved']:.1%}**.
- Estimated net revenue is **${sim['total_revenue']:,.0f}** for test portfolio.
- Fairness review proxy: AIR gender **{sim['air_gender']:.3f}**, AIR region **{sim['air_region']:.3f}**.
"""
)
