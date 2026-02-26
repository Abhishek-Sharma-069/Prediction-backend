# Model training: Flood and Cyclone classifiers
# Loads data/Balood_data.xlsx, trains models, saves to model/model_{dd_mm_yy}_{x}.pkl
import pickle
import re
from pathlib import Path

import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier

from primary_prediction_model import load_and_preprocess

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

    ### Save to model/model_{dd_mm_yy}_{x}.pkl
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    dd_mm_yy, x = _next_model_index()
    out_path = MODEL_DIR / f"model_{dd_mm_yy}_{x}.pkl"
    with open(out_path, "wb") as f:
        pickle.dump({
            "flood_clf": flood_clf,
            "cyclone_clf": cyclone_clf,
        }, f)
    print(f"Saved models to {out_path}")


if __name__ == "__main__":
    main()
