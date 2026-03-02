# Prediction: load trained models and predict Flood / Cyclone state
import pickle
from pathlib import Path

import pandas as pd

from primary_prediction_model import load_and_preprocess, preprocess_dataframe

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_DIR = PROJECT_ROOT / "model"

TARGET_COLUMNS = [
    "Flood_State",
    "Cyclone_State",
    "Flood_Severity",
    "Cyclone_Severity",
]


def get_latest_model_path():
    """Return path to the latest model file (by modification time)."""
    if not MODEL_DIR.exists():
        raise FileNotFoundError(f"Model directory not found: {MODEL_DIR}")
    candidates = list(MODEL_DIR.glob("model_*.pkl"))
    if not candidates:
        raise FileNotFoundError(f"No model_*.pkl found in {MODEL_DIR}")
    return max(candidates, key=lambda p: p.stat().st_mtime)


def load_models(model_path=None):
    """Load flood_clf and cyclone_clf from a pickle file. Uses latest if model_path is None."""
    path = model_path or get_latest_model_path()
    path = Path(path)
    if not path.is_absolute():
        path = MODEL_DIR / path
    with open(path, "rb") as f:
        data = pickle.load(f)
    return data["flood_clf"], data["cyclone_clf"], path


def predict(data_path, model_path=None, probabilities=False):
    """
    Load data from data_path, preprocess, run models, return predictions.

    data_path: path to Excel file with same schema as training data.
    model_path: optional path to .pkl (default: latest in model/).
    probabilities: if True, include Flood_Probability and Cyclone_Probability (class 1).

    Returns: DataFrame with Flood_State, Cyclone_State, and optionally probability columns.
    """
    flood_clf, cyclone_clf, _ = load_models(model_path)
    df = load_and_preprocess(str(Path(data_path).resolve()))
    features = df.drop(columns=TARGET_COLUMNS, errors="ignore")

    out = pd.DataFrame({
        "Flood_State": flood_clf.predict(features),
        "Cyclone_State": cyclone_clf.predict(features),
    }, index=df.index)
    if probabilities:
        out["Flood_Probability"] = flood_clf.predict_proba(features)[:, 1]
        out["Cyclone_Probability"] = cyclone_clf.predict_proba(features)[:, 1]
    return out


def predict_from_dict(data_dict, model_path=None, probabilities=False):
    """
    Predict from a dictionary/JSON input.

    data_dict: dictionary with feature values (can be single record or list of records).
    model_path: optional path to .pkl (default: latest in model/).
    probabilities: if True, include Flood_Probability and Cyclone_Probability (class 1).

    Returns: Dictionary or list of dictionaries with predictions.
    """
    flood_clf, cyclone_clf, _ = load_models(model_path)
    
    # Convert to DataFrame
    if isinstance(data_dict, dict):
        # Single record
        df = pd.DataFrame([data_dict])
    else:
        # List of records
        df = pd.DataFrame(data_dict)
    
    # Preprocess
    df = preprocess_dataframe(df)
    features = df.drop(columns=TARGET_COLUMNS, errors="ignore")
    
    # Predict
    flood_states = flood_clf.predict(features)
    cyclone_states = cyclone_clf.predict(features)
    
    # Build output
    results = []
    for i in range(len(df)):
        result = {
            "Flood_State": int(flood_states[i]),
            "Cyclone_State": int(cyclone_states[i])
        }
        if probabilities:
            flood_proba = flood_clf.predict_proba(features.iloc[[i]])[0, 1]
            cyclone_proba = cyclone_clf.predict_proba(features.iloc[[i]])[0, 1]
            result["Flood_Probability"] = float(flood_proba)
            result["Cyclone_Probability"] = float(cyclone_proba)
        
        # Add severity scores
        result["Flood_Severity"] = float(df.iloc[i]["Flood_Severity"])
        result["Cyclone_Severity"] = float(df.iloc[i]["Cyclone_Severity"])
        
        results.append(result)
    
    # Return single dict if single input, else list
    return results[0] if isinstance(data_dict, dict) else results


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
