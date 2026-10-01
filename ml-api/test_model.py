import joblib
import pandas as pd
import numpy as np
import sys
import os

model_path = os.path.join(os.path.dirname(__file__), "queue_wait_model.pkl")

print("=" * 60)
print("MODEL VALIDATION TEST: test_model.py")
print("=" * 60)

# 1. Load the model
try:
    model = joblib.load(model_path)
    print("1. Model loaded successfully from:", model_path)
except Exception as e:
    print("ERROR loading model:", e)
    sys.exit(1)

# 2. Print model type
print("\n2. Model type:", type(model))
print("   Pipeline steps:", [s[0] for s in model.steps])

# 3. Print expected features
expected_features = list(model.feature_names_in_)
print("\n3. Expected features (in order):", expected_features)

# 4. Create valid test input
test_data = {
    "queue_length": 5,
    "people_ahead": 4,
    "active_counters": 2,
    "avg_service_time": 5.0,
    "hour": 11,
    "day_of_week": 2,
    "service_type": "Examination Cell",
    "is_peak_hour": 1,
    "peak_factor": 1.2
}
test_df = pd.DataFrame([test_data], columns=expected_features)
print("\n4. Test Input DataFrame:")
print(test_df)

# 5. Run prediction
try:
    raw_pred = model.predict(test_df)
    print("\n5. Raw Prediction Output:", raw_pred)
except Exception as e:
    print("ERROR during prediction:", e)
    sys.exit(1)

# 6. Print the result
pred_val = float(raw_pred[0])
print(f"\n6. Predicted Wait Time: {pred_val:.2f} minutes")

# 7. Confirm prediction is numeric and valid
is_valid = isinstance(pred_val, (int, float)) and not np.isnan(pred_val) and pred_val >= 0
print(f"7. Numeric and valid check: {'PASSED' if is_valid else 'FAILED'} (value: {pred_val})")
print("=" * 60)
