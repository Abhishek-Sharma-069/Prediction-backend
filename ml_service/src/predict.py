# Prediction: load trained models and predict Flood / Cyclone state
import pickle
from pathlib import Path

import pandas as pd

from .primary_prediction_model import load_and_preprocess

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_DIR = PROJECT_ROOT / "model"

TARGET_COLUMNS = [
    "Flood_State",
    "Cyclone_State",
    "Flood_Severity",
    "Cyclone_Severity",
]


def get_expected_feature_columns(model_path=None):
    """Return the list of feature column names the model expects (for API/docs)."""
    try:
        _, _, _, feature_columns, _ = load_models(model_path)
        if feature_columns:
            return feature_columns
        return None
    except Exception:
        return None


def get_latest_model_path():
    """Return path to the latest model file (by modification time)."""
    if not MODEL_DIR.exists():
        raise FileNotFoundError(f"Model directory not found: {MODEL_DIR}")
    candidates = list(MODEL_DIR.glob("model_*.pkl"))
    if not candidates:
        raise FileNotFoundError(f"No model_*.pkl found in {MODEL_DIR}")
    return max(candidates, key=lambda p: p.stat().st_mtime)


def load_models(model_path=None):
    """Load classifiers, feature_columns, and optional severity metadata from pickle."""
    path = model_path or get_latest_model_path()
    path = Path(path)
    if not path.is_absolute():
        path = MODEL_DIR / path
    with open(path, "rb") as f:
        data = pickle.load(f)
    feature_columns = data.get("feature_columns")
    severity_meta = data.get("severity_metadata")  # thresholds and weights for severity at inference
    return data["flood_clf"], data["cyclone_clf"], path, feature_columns, severity_meta


def predict_from_features(feature_rows, model_path=None, probabilities=False):
    """
    Run models on in-memory feature rows (no Excel).

    feature_rows: list of dicts, each with keys matching training feature columns.
    model_path: optional path to .pkl (default: latest in model/).
    probabilities: if True, include Flood_Probability and Cyclone_Probability (class 1).

    Returns: DataFrame with Flood_State, Cyclone_State, severity, and optionally probability columns.
    """
    flood_clf, cyclone_clf, _, feature_columns, severity_meta = load_models(model_path)
    # Fallback for pickles saved before feature_columns was added (e.g. older train.py)
    if not feature_columns and hasattr(flood_clf, "feature_names_in_"):
        feature_columns = list(flood_clf.feature_names_in_)
    if not feature_columns:
        raise ValueError(
            "Model pickle has no feature_columns and classifier has no feature_names_in_. "
            "Retrain with current train.py to save feature_columns."
        )
    df = pd.DataFrame(feature_rows)
    # Normalize column names: match feature_columns case-insensitively so client can send TOTRF or totrf
    df_cols_lower = {c.lower(): c for c in df.columns}
    rename = {}
    for fc in feature_columns:
        if fc in df.columns:
            continue
        key = fc.lower()
        if key in df_cols_lower:
            rename[df_cols_lower[key]] = fc
    if rename:
        df = df.rename(columns=rename)
    missing = [c for c in feature_columns if c not in df.columns]
    if missing:
        # Fill missing columns with 0 so minimal payloads (e.g. only TOTRF,RD,RH,DBT,MWS,MSLP) still work
        import logging
        logging.warning("Filling missing feature columns with 0: %s", missing)
        for m in missing:
            df[m] = 0
    features = df[feature_columns]

    out = pd.DataFrame({
        "Flood_State": flood_clf.predict(features),
        "Cyclone_State": cyclone_clf.predict(features),
    }, index=df.index)
    if probabilities:
        out["Flood_Probability"] = flood_clf.predict_proba(features)[:, 1]
        out["Cyclone_Probability"] = cyclone_clf.predict_proba(features)[:, 1]

    # Severity (when metadata was saved at train time)
    if severity_meta:
        th = severity_meta
        flood_f = pd.DataFrame({
            "TOTRF": features["TOTRF"] / th["thresh_TOTRF_high"],
            "RD": features["RD"] / th["thresh_RD_high"],
            "RH": features["RH"] / th["thresh_RH_high"],
            "DBT": features["DBT"] / th["thresh_DBT_high"],
        })
        out["Flood_Severity"] = flood_f.values @ th["flood_weights"]
        cyclone_f = pd.DataFrame({
            "MWS": features["MWS"] / th["thresh_MWS_high"],
            "MSLP": (th["thresh_MSLP_low"] - features["MSLP"]) / abs(th["thresh_MSLP_low"]),
            "RH": features["RH"] / th["thresh_RH_high"],
            "DBT": features["DBT"] / th["thresh_DBT_high"],
        })
        out["Cyclone_Severity"] = cyclone_f.values @ th["cyclone_weights"]

    return out


def predict(data_path, model_path=None, probabilities=False):
    """
    Load data from data_path, preprocess, run models, return predictions.

    data_path: path to Excel file with same schema as training data.
    model_path: optional path to .pkl (default: latest in model/).
    probabilities: if True, include Flood_Probability and Cyclone_Probability (class 1).

    Returns: DataFrame with Flood_State, Cyclone_State, and optionally probability columns.
    """
    flood_clf, cyclone_clf, _, _, _ = load_models(model_path)
    df = load_and_preprocess(str(Path(data_path).resolve()))
    features = df.drop(columns=TARGET_COLUMNS, errors="ignore")

    out = pd.DataFrame({
        "Flood_State": flood_clf.predict(features),
        "Cyclone_State": cyclone_clf.predict(features),
        "Flood_Severity": df["Flood_Severity"].values,
        "Cyclone_Severity": df["Cyclone_Severity"].values,
    }, index=df.index)
    if probabilities:
        out["Flood_Probability"] = flood_clf.predict_proba(features)[:, 1]
        out["Cyclone_Probability"] = cyclone_clf.predict_proba(features)[:, 1]
    return out


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Predict Flood and Cyclone state from data file.")
    parser.add_argument("data", nargs="?", default=str(PROJECT_ROOT / "data" / "Balood_data.xlsx"),
                        help="Path to input Excel (default: data/Balood_data.xlsx)")
    parser.add_argument("-m", "--model", default=None, help="Path to model .pkl (default: latest)")
    parser.add_argument("-p", "--probabilities", action="store_true", help="Include probability columns")
    parser.add_argument("-o", "--output", default=None, help="Write predictions to CSV")
    args = parser.parse_args()

    result = predict(args.data, model_path=args.model, probabilities=args.probabilities)
    print(result)

    if args.output:
        result.to_csv(args.output, index=False)
        print(f"Wrote {args.output}")


if __name__ == "__main__":
    main()
