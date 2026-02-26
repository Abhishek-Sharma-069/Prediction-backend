# Hybrid Flood and Cyclone Risk Prediction System
# Using HistGradientBoosting & Automatic Severity Scoring
#
# This notebook implements a hybrid machine learning framework to:
# - Classify **Flood** and **Cyclone** risk states
# - Automatically compute **severity scores**
# - Generate **hybrid risk indices** combining probability and severity

# Data handling
import pandas as pd
import numpy as np

# Encoding
from sklearn.preprocessing import LabelEncoder

# Machine Learning Models
from sklearn.ensemble import (
    HistGradientBoostingClassifier,
    HistGradientBoostingRegressor
)


### Basic Numeric Cleaning Functions
def basic_numeric_clean(df):
    """
    Replace infinite values with NaN
    to avoid model instability.
    """
    num_cols = df.select_dtypes(include=[np.number]).columns
    df[num_cols] = df[num_cols].replace([np.inf, -np.inf], np.nan)
    return df


### Supporting Utility Functions
def safe_pressure_anomaly(mslp, low_thresh):
    """
    Normalized pressure anomaly calculation
    for cyclone severity estimation.
    """
    return (low_thresh - mslp) / abs(low_thresh)


def iqr_threshold(series):
    """
    Compute upper and lower thresholds
    using Interquartile Range (IQR).
    """
    Q1, Q3 = series.quantile([0.25, 0.75])
    IQR = Q3 - Q1
    return Q3 + 1.5 * IQR, Q1 - 1.5 * IQR


### Automatic Feature Weight Computation
def compute_auto_weights(X, y):
    """
    Automatically assign feature weights
    using variance-based proxy importance.
    """
    model = HistGradientBoostingRegressor(
        max_depth=3,
        learning_rate=0.05,
        max_iter=200,
        random_state=42
    )
    model.fit(X, y)

    # Variance-based weighting
    var = X.var().values
    weights = var / var.sum()
    return weights


def load_and_preprocess(data_path):
    """
    Load Excel data from data_path and return preprocessed DataFrame
    with Flood_State, Cyclone_State, Flood_Severity, Cyclone_Severity.
    """
    df = pd.read_excel(data_path)

    ### Clean Column Names
    df.columns = (
        df.columns.astype(str)
        .str.strip()
        .str.replace('.', '', regex=False)
        .str.replace(' ', '_')
    )

    ### Encode Categorical Variables
    for col in df.select_dtypes(include="object").columns:
        df[col] = LabelEncoder().fit_transform(df[col].astype(str))

    ### Basic Data Cleaning
    df = basic_numeric_clean(df)

    ### Compute Statistical Thresholds
    thresh_TOTRF_high, _ = iqr_threshold(df["TOTRF"])
    thresh_RD_high, _ = iqr_threshold(df["RD"])
    thresh_RH_high, _ = iqr_threshold(df["RH"])
    thresh_DBT_high, _ = iqr_threshold(df["DBT"])
    thresh_MWS_high, _ = iqr_threshold(df["MWS"])
    _, thresh_MSLP_low = iqr_threshold(df["MSLP"])

    ### Flood & Cyclone State Classification
    mean_TOTRF = df["TOTRF"].mean()
    mean_MWS = df["MWS"].mean()

    df["Flood_State"] = np.select(
        [
            df["TOTRF"] <= mean_TOTRF,
            (df["TOTRF"] > mean_TOTRF) & (df["TOTRF"] <= thresh_TOTRF_high),
            df["TOTRF"] > thresh_TOTRF_high
        ],
        [0, 1, 2]
    )

    df["Cyclone_State"] = np.select(
        [
            df["MWS"] <= mean_MWS,
            (df["MWS"] > mean_MWS) & (df["MWS"] <= thresh_MWS_high),
            df["MWS"] > thresh_MWS_high
        ],
        [0, 1, 2]
    )

    ### Flood Severity Score Calculation
    flood_features = pd.DataFrame({
        "TOTRF": df["TOTRF"] / thresh_TOTRF_high,
        "RD": df["RD"] / thresh_RD_high,
        "RH": df["RH"] / thresh_RH_high,
        "DBT": df["DBT"] / thresh_DBT_high
    })
    flood_weights = compute_auto_weights(flood_features, df["Flood_State"])
    df["Flood_Severity"] = flood_features.values @ flood_weights

    ### Cyclone Severity Score Calculation
    cyclone_features = pd.DataFrame({
        "MWS": df["MWS"] / thresh_MWS_high,
        "MSLP": safe_pressure_anomaly(df["MSLP"], thresh_MSLP_low),
        "RH": df["RH"] / thresh_RH_high,
        "DBT": df["DBT"] / thresh_DBT_high
    })
    cyclone_weights = compute_auto_weights(cyclone_features, df["Cyclone_State"])
    df["Cyclone_Severity"] = cyclone_features.values @ cyclone_weights

    return df


if __name__ == "__main__":
    # Load Dataset
    df = load_and_preprocess("Balood_data.xlsx")
    df.head()

    ### State Distribution Analysis
    print("Flood State Distribution:")
    print(df["Flood_State"].value_counts())
    print("\nCyclone State Distribution:")
    print(df["Cyclone_State"].value_counts())

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

    ### Final Hybrid Risk Output
    sample = FEATURES.head(5)
    final_predictions = pd.DataFrame({
        "Flood_Probability": flood_clf.predict_proba(sample)[:, 1],
        "Flood_Severity": df.loc[sample.index, "Flood_Severity"],
        "Cyclone_Probability": cyclone_clf.predict_proba(sample)[:, 1],
        "Cyclone_Severity": df.loc[sample.index, "Cyclone_Severity"]
    })
    final_predictions["Flood_Hybrid_Risk"] = (
        final_predictions["Flood_Probability"] * final_predictions["Flood_Severity"]
    )
    final_predictions["Cyclone_Hybrid_Risk"] = (
        final_predictions["Cyclone_Probability"] * final_predictions["Cyclone_Severity"]
    )
    print(final_predictions)

    ### Display Feature Weights (recompute thresholds for display)
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
        "DBT": df["DBT"] / thresh_DBT_high
    })
    cyclone_features = pd.DataFrame({
        "MWS": df["MWS"] / thresh_MWS_high,
        "MSLP": safe_pressure_anomaly(df["MSLP"], thresh_MSLP_low),
        "RH": df["RH"] / thresh_RH_high,
        "DBT": df["DBT"] / thresh_DBT_high
    })
    flood_weights = compute_auto_weights(flood_features, df["Flood_State"])
    cyclone_weights = compute_auto_weights(cyclone_features, df["Cyclone_State"])
    print("Flood Severity Weights:")
    print(dict(zip(flood_features.columns, flood_weights)))
    print("\nCyclone Severity Weights:")
    print(dict(zip(cyclone_features.columns, cyclone_weights)))
