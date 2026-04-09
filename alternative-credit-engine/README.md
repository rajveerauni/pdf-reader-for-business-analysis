# Alternative Credit Scoring Engine

Alternative credit scoring demo for underbanked lending: synthetic data, interpretable ML risk models, policy simulation, and fairness signals.

## What this app does
- Generates 10,000 synthetic applicants with behavior-based default labels (~18%).
- Engineers underwriting-style features from utilities/rent/mobile/gig/e-commerce signals.
- Trains Logistic Regression and XGBoost (Optuna tuning).
- Scores test applicants and runs an approval-threshold simulation.
- Shows core business and fairness metrics in a Streamlit dashboard.

## Quickstart
1. Create and activate a Python environment (3.10+ recommended).
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Launch the dashboard:
   - `streamlit run dashboard/streamlit_app.py`
4. In the app, click **Run / Re-run Training Pipeline**.

## Business outputs in dashboard
- Approval rate and approved-book default rate
- Revenue estimate (interest - expected loss - funding cost)
- AIR fairness proxies by gender and region (80% rule check helper)
- Risk tier summary for accepted applicants

## Notes
- Demographic attributes are kept for bias auditing only.
- This repository uses synthetic data for portfolio demonstration.
