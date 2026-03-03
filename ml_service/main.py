import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Any, Union

from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from src.predict import (
    predict as run_predict_from_excel,
    predict_from_features as run_predict_from_values,
    get_expected_feature_columns,
)


# --- Excel-based (testing on dataset) ---
class PredictByExcelRequest(BaseModel):
    data_path: str
    model_path: Optional[str] = None
    probabilities: bool = True


# --- Value-based (real environment prediction) ---
class PredictByValueRequest(BaseModel):
    rows: Union[List[dict[str, Any]], dict[str, Any]]  # list of feature objects, or single object
    model_path: Optional[str] = None
    probabilities: bool = True


app = FastAPI(title="ML Prediction Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/expected-features")
def expected_features(model_path: Optional[str] = None) -> dict:
    """Return the feature column names the model expects (for debugging / clients)."""
    cols = get_expected_feature_columns(model_path)
    if cols is None:
        raise HTTPException(status_code=503, detail="Could not load model or feature list")
    return {"feature_columns": cols}


@app.post("/predict-by-excel")
def predictByExcel(req: PredictByExcelRequest):
    """Run prediction from an Excel file (for testing on dataset)."""
    data_path = Path(req.data_path)
    if not data_path.exists():
        raise HTTPException(status_code=400, detail=f"data_path not found: {data_path}")

    try:
        df = run_predict_from_excel(
            str(data_path), model_path=req.model_path, probabilities=req.probabilities
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    return {"rows": df.to_dict(orient="records")}


def _normalize_rows(rows: Union[List[dict[str, Any]], dict[str, Any]]) -> List[dict[str, Any]]:
    """Accept either a list of row dicts or a single row dict."""
    if isinstance(rows, dict):
        return [rows]
    if isinstance(rows, list):
        return rows
    return []


@app.post("/predict-by-value")
def predictByValue(req: PredictByValueRequest):
    """Run prediction from feature values (for real environment)."""
    rows_list = _normalize_rows(req.rows)
    if not rows_list:
        raise HTTPException(status_code=400, detail="rows must be a non-empty array or a single object")

    try:
        df = run_predict_from_values(
            rows_list, model_path=req.model_path, probabilities=req.probabilities
        )
    except ValueError as e:
        import logging
        logging.warning("predict-by-value ValueError: %s", e)
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        import logging
        logging.exception("predict-by-value failed")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    return {"rows": df.to_dict(orient="records")}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", "8000"))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port)
