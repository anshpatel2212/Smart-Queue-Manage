import os
import joblib
import logging
from datetime import datetime
import pandas as pd
import numpy as np
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("model_service")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# Known categories seen during model training
KNOWN_SERVICE_CATEGORIES = [
    "Accounts",
    "Administration",
    "Examination Cell",
    "IT Help Desk",
    "Library",
    "Student Section"
]

# Service / Department mapping to model's trained service_type categories
SERVICE_CATEGORY_MAP = {
    # Examination
    "examination": "Examination Cell",
    "exam": "Examination Cell",
    "exam hall ticket": "Examination Cell",
    "result revaluation": "Examination Cell",
    "transcript requests": "Examination Cell",
    "hall ticket": "Examination Cell",

    # Finance / Accounts
    "finance": "Accounts",
    "fee": "Accounts",
    "fee payment": "Accounts",
    "scholarship": "Accounts",
    "scholarship application": "Accounts",
    "refunds": "Accounts",
    "accounts": "Accounts",

    # Library
    "library": "Library",
    "book issue": "Library",
    "book issue / return": "Library",
    "library clearance": "Library",

    # IT Support
    "it support": "IT Help Desk",
    "it help desk": "IT Help Desk",
    "wifi": "IT Help Desk",
    "wifi / email access": "IT Help Desk",
    "email access": "IT Help Desk",
    "erp": "IT Help Desk",

    # Student Administration
    "student administration": "Student Section",
    "student section": "Student Section",
    "bonafide certificate": "Student Section",
    "transfer certificate": "Student Section",
    "certificates": "Student Section",

    # ID Card / General Admin
    "id card": "Administration",
    "id card section": "Administration",
    "new id card": "Administration",
    "administration": "Administration",
    "general": "Administration"
}

class ModelService:
    def __init__(self, model_path: str = None):
        if not model_path:
            model_path = os.getenv("ML_MODEL_PATH", "queue_wait_model.pkl")
            
        # If relative path, resolve relative to current file's directory
        if not os.path.isabs(model_path):
            base_dir = os.path.dirname(os.path.abspath(__file__))
            candidate = os.path.join(base_dir, model_path)
            if os.path.exists(candidate):
                model_path = candidate

        self.model_path = model_path
        self.model = None
        self.expected_features = []
        self._load_model()

    def _load_model(self):
        """Loads the pre-trained model into memory once."""
        if not os.path.exists(self.model_path):
            error_msg = f"Model file not found at path: {self.model_path}"
            logger.error(error_msg)
            raise FileNotFoundError(error_msg)

        try:
            logger.info(f"Loading trained ML model from: {self.model_path}")
            self.model = joblib.load(self.model_path)
            
            if hasattr(self.model, "feature_names_in_"):
                self.expected_features = list(self.model.feature_names_in_)
            else:
                self.expected_features = [
                    "queue_length",
                    "people_ahead",
                    "active_counters",
                    "avg_service_time",
                    "hour",
                    "day_of_week",
                    "service_type",
                    "is_peak_hour",
                    "peak_factor"
                ]
            
            logger.info("ML Model loaded successfully!")
            logger.info(f"Model Type: {type(self.model)}")
            logger.info(f"Expected Features ({len(self.expected_features)}): {self.expected_features}")
        except Exception as e:
            logger.error(f"Failed to load ML model: {e}")
            raise RuntimeError(f"Could not load ML model: {e}")

    def map_service_type(self, raw_service: str) -> str:
        """Maps incoming service / department names to known model categories."""
        if not raw_service:
            return "Administration"
        
        cleaned = raw_service.strip().lower()
        if cleaned in SERVICE_CATEGORY_MAP:
            return SERVICE_CATEGORY_MAP[cleaned]
        
        # Check partial matching
        for key, val in SERVICE_CATEGORY_MAP.items():
            if key in cleaned:
                return val
                
        # If exact match in known categories
        for cat in KNOWN_SERVICE_CATEGORIES:
            if cat.lower() == cleaned:
                return cat

        return "Administration"

    def predict(self, input_data: dict) -> dict:
        """
        Executes a prediction using the pre-loaded ML pipeline.
        Input data dictionary contains queue parameters.
        """
        if self.model is None:
            return {
                "success": False,
                "error": "ML model is not loaded"
            }

        try:
            now = datetime.now()
            
            # Extract and sanitize inputs safely handling None values
            raw_people = input_data.get("people_ahead")
            people_ahead = max(0, int(raw_people)) if raw_people is not None else 0

            raw_queue = input_data.get("queue_length")
            queue_length = int(raw_queue) if raw_queue is not None else people_ahead + 1
            if queue_length < people_ahead:
                queue_length = people_ahead + 1

            raw_counters = input_data.get("active_counters")
            active_counters = max(1, int(raw_counters)) if raw_counters is not None else 1

            raw_service_time = input_data.get("avg_service_time")
            avg_service_time = max(1.0, float(raw_service_time)) if raw_service_time is not None else 5.0

            raw_hour = input_data.get("hour")
            hour = int(raw_hour) if raw_hour is not None else now.hour

            raw_day = input_data.get("day_of_week")
            day_of_week = int(raw_day) if raw_day is not None else now.weekday()

            raw_peak = input_data.get("is_peak_hour")
            is_peak = int(raw_peak) if raw_peak is not None else (1 if (10 <= hour <= 14) else 0)

            raw_factor = input_data.get("peak_factor")
            peak_factor = float(raw_factor) if raw_factor is not None else (1.2 if is_peak else 1.0)

            raw_service = input_data.get("service_type") or input_data.get("service_name") or input_data.get("serviceId", "Administration")
            service_type = self.map_service_type(raw_service)

            # Build feature dictionary aligned to expected columns
            feature_row = {
                "queue_length": queue_length,
                "people_ahead": people_ahead,
                "active_counters": active_counters,
                "avg_service_time": avg_service_time,
                "hour": hour,
                "day_of_week": day_of_week,
                "service_type": service_type,
                "is_peak_hour": is_peak,
                "peak_factor": peak_factor
            }

            # If there's 0 people ahead and counters available, estimated wait is 0-1 min
            if people_ahead == 0:
                return {
                    "success": True,
                    "estimated_wait_minutes": 1.0,
                    "prediction_source": "ml",
                    "features_used": feature_row
                }

            # Create DataFrame with exact column order
            df = pd.DataFrame([feature_row], columns=self.expected_features)
            
            # Predict using pipeline
            raw_prediction = self.model.predict(df)
            pred_value = float(raw_prediction[0])
            
            # Sanity clamp: cannot be negative
            estimated_wait = max(1.0, round(pred_value, 1))

            return {
                "success": True,
                "estimated_wait_minutes": estimated_wait,
                "prediction_source": "ml",
                "features_used": feature_row
            }

        except Exception as e:
            logger.error(f"Prediction execution error: {e}")
            return {
                "success": False,
                "error": "Prediction failed",
                "prediction_source": "fallback"
            }

# Global singleton instance
try:
    model_service = ModelService()
except Exception as err:
    logger.error(f"ModelService startup failure: {err}")
    model_service = None
