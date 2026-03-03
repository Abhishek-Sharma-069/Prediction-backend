# Model training: Flood and Cyclone classifiers
# Loads data/Balood_data.xlsx, trains models, saves to model/model_{dd_mm_yy}_{x}.pkl
import pickle
import re
from pathlib import Path

import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier

from primary_prediction_model import (
    load_and_preprocess,
    iqr_threshold,
    compute_auto_weights,
    safe_pressure_anomaly,
)

# Paths relative to project root (parent of src/)
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = PROJECT_ROOT / "data" / "Balood_data.xlsx"
MODEL_DIR = PROJECT_ROOT / "model"


def _next_model_index():
    """Return next run index for today's date (dd_mm_yy). Finds max existing x for model_dd_mm_yy_*.pkl."""
    from datetime import datetime
    today = datetime.now().strftime("%d_%m_%y")
    pattern = re.compile(rf"model_{re.escape(today)}_(\d+)\.pkl")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    max_x = 0
    for p in MODEL_DIR.glob("model_*.pkl"):
        m = pattern.match(p.name)
        if m:
            max_x = max(max_x, int(m.group(1)))
    return today, max_x + 1


def main():
    df = load_and_preprocess(str(DATA_PATH))

    ### Feature Selection
    FEATURES = df.drop(columns=[
        "Flood_State",
        "Cyclone_State",
        "Flood_Severity",
        "Cyclone_Severity"
    ])

    ### Model Training (HistGradientBoosting)
    flood_clf = HistGradientBoostingClassifier(
        max_depth=3,
        learning_rate=0.05,
        max_iter=200,
        random_state=42
    )
    cyclone_clf = HistGradientBoostingClassifier(
        max_depth=3,
        learning_rate=0.05,
        max_iter=200,
        random_state=42
    )
    flood_clf.fit(FEATURES, df["Flood_State"])
    cyclone_clf.fit(FEATURES, df["Cyclone_State"])

    ### Severity metadata for inference (predict-by-value)
    thresh_TOTRF_high, _ = iqr_threshold(df["TOTRF"])
    thresh_RD_high, _ = iqr_threshold(df["RD"])
    thresh_RH_high, _ = iqr_threshold(df["RH"])
    thresh_DBT_high, _ = iqr_threshold(df["DBT"])
    thresh_MWS_high, _ = iqr_threshold(df["MWS"])
    _, thresh_MSLP_low = iqr_threshold(df["MSLP"])
    flood_features = pd.DataFrame({
        "TOTRF": df["TOTRF"] / thresh_TOTRF_high,
        "RD": df["RD"] / thresh_RD_high,
        "RH": df["RH"] / thresh_RH_high,
        "DBT": df["DBT"] / thresh_DBT_high,
    })
    cyclone_features = pd.DataFrame({
        "MWS": df["MWS"] / thresh_MWS_high,
        "MSLP": safe_pressure_anomaly(df["MSLP"], thresh_MSLP_low),
        "RH": df["RH"] / thresh_RH_high,
        "DBT": df["DBT"] / thresh_DBT_high,
    })
    flood_weights = compute_auto_weights(flood_features, df["Flood_State"])
    cyclone_weights = compute_auto_weights(cyclone_features, df["Cyclone_State"])

    severity_metadata = {
        "thresh_TOTRF_high": float(thresh_TOTRF_high),
        "thresh_RD_high": float(thresh_RD_high),
        "thresh_RH_high": float(thresh_RH_high),
        "thresh_DBT_high": float(thresh_DBT_high),
        "thresh_MWS_high": float(thresh_MWS_high),
        "thresh_MSLP_low": float(thresh_MSLP_low),
        "flood_weights": flood_weights,
        "cyclone_weights": cyclone_weights,
    }

    ### Save to model/model_{dd_mm_yy}_{x}.pkl
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    dd_mm_yy, x = _next_model_index()
    out_path = MODEL_DIR / f"model_{dd_mm_yy}_{x}.pkl"
    with open(out_path, "wb") as f:
        pickle.dump({
            "flood_clf": flood_clf,
            "cyclone_clf": cyclone_clf,
            "feature_columns": FEATURES.columns.tolist(),
            "severity_metadata": severity_metadata,
        }, f)
    print(f"Saved models to {out_path}")


if __name__ == "__main__":
    main()
