from pathlib import Path
import json

import numpy as np
import optuna
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from xgboost import XGBClassifier

from src.data.generate_data import generate_synthetic_data
from src.features.feature_engineering import build_features
from src.nlp.narrative_scoring import add_nlp_features


FEATURE_COLUMNS = [
    "payment_consistency_score",
    "income_stability_index",
    "financial_footprint_score",
    "cashflow_stress_indicator",
    "debt_service_capacity_ratio",
    "essential_spend_ratio",
    "rent_timeliness_ratio",
    "delinquency_intensity",
    "leverage_proxy",
    "requested_loan_burden",
    "employment_resilience",
    "net_wallet_buffer",
    "narrative_sentiment_score",
    "narrative_credibility_score",
]


def ks_statistic(y_true: pd.Series, y_prob: np.ndarray) -> float:
    fpr, tpr, _ = roc_curve(y_true, y_prob)
    return float(np.max(tpr - fpr))


def best_f1_threshold(y_true: pd.Series, y_prob: np.ndarray) -> float:
    thresholds = np.linspace(0.1, 0.9, 161)
    best = 0.5
    best_score = -1.0
    for threshold in thresholds:
        pred = (y_prob >= threshold).astype(int)
        score = f1_score(y_true, pred, zero_division=0)
        if score > best_score:
            best_score = score
            best = float(threshold)
    return best


def logistic_baseline(X_train, X_test, y_train, y_test):
    model = LogisticRegression(max_iter=2500, solver="liblinear", class_weight="balanced")
    model.fit(X_train, y_train)
    p = model.predict_proba(X_test)[:, 1]
    threshold = best_f1_threshold(y_test, p)
    pred = (p >= threshold).astype(int)
    auc = roc_auc_score(y_test, p)
    return {
        "model": model,
        "proba": p,
        "threshold": threshold,
        "metrics": {
            "auc": float(auc),
            "precision": float(precision_score(y_test, pred, zero_division=0)),
            "recall": float(recall_score(y_test, pred, zero_division=0)),
            "f1": float(f1_score(y_test, pred, zero_division=0)),
            "ks": ks_statistic(y_test, p),
            "gini": float(2 * auc - 1),
        },
    }


def train_xgb(X_train, y_train, trials: int = 15):
    pos = int((y_train == 1).sum())
    neg = int((y_train == 0).sum())
    scale_pos_weight = neg / max(pos, 1)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    def objective(trial):
        params = {
            "n_estimators": trial.suggest_int("n_estimators", 100, 400),
            "max_depth": trial.suggest_int("max_depth", 3, 7),
            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.2, log=True),
            "subsample": trial.suggest_float("subsample", 0.65, 1.0),
            "colsample_bytree": trial.suggest_float("colsample_bytree", 0.65, 1.0),
            "min_child_weight": trial.suggest_int("min_child_weight", 1, 10),
            "reg_alpha": trial.suggest_float("reg_alpha", 1e-4, 2.0, log=True),
            "reg_lambda": trial.suggest_float("reg_lambda", 1e-4, 5.0, log=True),
            "gamma": trial.suggest_float("gamma", 0.0, 2.0),
            "scale_pos_weight": scale_pos_weight,
            "objective": "binary:logistic",
            "eval_metric": "auc",
            "tree_method": "hist",
            "n_jobs": -1,
            "random_state": 42,
        }
        model = XGBClassifier(**params)
        scores = cross_val_score(model, X_train, y_train, cv=cv, scoring="roc_auc", n_jobs=-1)
        return float(np.mean(scores))

    study = optuna.create_study(direction="maximize")
    study.optimize(objective, n_trials=trials)

    params = study.best_trial.params
    params.update(
        {
            "scale_pos_weight": scale_pos_weight,
            "objective": "binary:logistic",
            "eval_metric": "auc",
            "tree_method": "hist",
            "n_jobs": -1,
            "random_state": 42,
        }
    )
    return XGBClassifier(**params), study


def run_training_pipeline(output_dir: str = "data/processed", optuna_trials: int = 15):
    root = Path(output_dir)
    root.mkdir(parents=True, exist_ok=True)
    reports = Path("reports")
    reports.mkdir(parents=True, exist_ok=True)

    df = generate_synthetic_data()
    feat_df = build_features(df)
    feat_df = add_nlp_features(feat_df)
    feat_df.to_csv("data/raw/synthetic_applicants.csv", index=False)

    X = feat_df[FEATURE_COLUMNS]
    y = feat_df["default_flag"]

    X_train, X_test, y_train, y_test, train_idx, test_idx = train_test_split(
        X, y, feat_df.index, test_size=0.25, stratify=y, random_state=42
    )

    baseline = logistic_baseline(X_train, X_test, y_train, y_test)

    xgb_model, study = train_xgb(X_train, y_train, trials=optuna_trials)
    xgb_model.fit(X_train, y_train)
    p_xgb = xgb_model.predict_proba(X_test)[:, 1]
    xgb_threshold = best_f1_threshold(y_test, p_xgb)
    xgb_pred = (p_xgb >= xgb_threshold).astype(int)
    xgb_auc = roc_auc_score(y_test, p_xgb)
    xgb_metrics = {
        "auc": float(xgb_auc),
        "precision": float(precision_score(y_test, xgb_pred, zero_division=0)),
        "recall": float(recall_score(y_test, xgb_pred, zero_division=0)),
        "f1": float(f1_score(y_test, xgb_pred, zero_division=0)),
        "ks": ks_statistic(y_test, p_xgb),
        "gini": float(2 * xgb_auc - 1),
        "threshold": float(xgb_threshold),
    }

    pred_frame = feat_df.loc[test_idx, ["applicant_id", "loan_amount_requested", "default_flag", "gender", "region"]].copy()
    pred_frame["pd_hat"] = p_xgb
    pred_frame["baseline_pd_hat"] = baseline["proba"]
    pred_frame.to_csv(root / "test_predictions.csv", index=False)

    importances = pd.DataFrame(
        {
            "feature": FEATURE_COLUMNS,
            "gain": [xgb_model.get_booster().get_score(importance_type="gain").get(f"f{i}", 0.0) for i in range(len(FEATURE_COLUMNS))],
        }
    ).sort_values("gain", ascending=False)
    importances.to_csv(reports / "feature_importance_gain.csv", index=False)

    metrics = {
        "default_rate": float(y.mean()),
        "logistic": baseline["metrics"],
        "xgboost": xgb_metrics,
        "optuna_best_value": float(study.best_value),
    }
    with open(reports / "metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    return metrics


if __name__ == "__main__":
    results = run_training_pipeline()
    print(json.dumps(results, indent=2))
