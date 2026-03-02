from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from pathlib import Path

from src.predict import predict as run_predict


class PredictRequest(BaseModel):
    data_path: str
    model_path: Optional[str] = None
    probabilities: bool = True


app = FastAPI(title="ML Prediction Service", version="1.0.0")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/predict")
def predict(req: PredictRequest):
    data_path = Path(req.data_path)
    if not data_path.exists():
        raise HTTPException(status_code=400, detail=f"data_path not found: {data_path}")

    try:
        df = run_predict(str(data_path), model_path=req.model_path, probabilities=req.probabilities)
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:  # pragma: no cover - generic fallback
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    # Return predictions as a list of records (one per row)
    return {
        "rows": df.to_dict(orient="records"),
    }

