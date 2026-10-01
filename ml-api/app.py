import os
import logging
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from model_service import model_service

load_dotenv()

logger = logging.getLogger("ml_api")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

app = FastAPI(
    title="Smart Queue Manager ML API",
    description="Machine Learning Wait Time Prediction API for Campus Queues",
    version="1.0.0"
)

# CORS configuration
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
origins = [
    frontend_url,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    people_ahead: int = Field(0, description="Number of students waiting ahead in line")
    queue_length: Optional[int] = Field(None, description="Total active queue length for service")
    active_counters: int = Field(1, description="Number of currently serving counters")
    avg_service_time: float = Field(5.0, description="Average service duration in minutes")
    hour: Optional[int] = Field(None, description="Current hour of day (0-23)")
    day_of_week: Optional[int] = Field(None, description="Day of week (0=Mon, 6=Sun)")
    service_type: Optional[str] = Field(None, description="Service category or department")
    service_name: Optional[str] = Field(None, description="Service name")
    is_peak_hour: Optional[int] = Field(None, description="1 if peak hour, 0 otherwise")
    peak_factor: Optional[float] = Field(None, description="Peak multiplier factor")

class PredictResponse(BaseModel):
    success: bool
    estimated_wait_minutes: Optional[float] = None
    prediction_source: Optional[str] = "ml"
    features_used: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@app.get("/")
def root():
    return {
        "service": "Smart Queue Manager ML API",
        "status": "online",
        "model_loaded": model_service is not None and model_service.model is not None
    }

@app.get("/health")
def health_check():
    model_loaded = model_service is not None and model_service.model is not None
    return {
        "status": "ok" if model_loaded else "degraded",
        "model_loaded": model_loaded,
        "model_type": str(type(model_service.model)) if model_loaded else None,
        "expected_features": model_service.expected_features if model_loaded else []
    }

@app.post("/predict", response_model=PredictResponse)
def predict_wait_time(request: PredictRequest):
    if model_service is None or model_service.model is None:
        return PredictResponse(
            success=False,
            error="ML model is not available",
            prediction_source="fallback"
        )

    input_dict = request.model_dump()
    result = model_service.predict(input_dict)

    if not result.get("success"):
        return PredictResponse(
            success=False,
            error=result.get("error", "Prediction failed"),
            prediction_source="fallback"
        )

    return PredictResponse(
        success=True,
        estimated_wait_minutes=result.get("estimated_wait_minutes"),
        prediction_source=result.get("prediction_source", "ml"),
        features_used=result.get("features_used")
    )

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app:app", host=host, port=port, reload=True)
