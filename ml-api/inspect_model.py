import joblib
import pickle
import sys
import numpy as np
import pandas as pd

model_path = "ml-api/queue_wait_model.pkl"

print("=" * 60)
print("INSPECTING MODEL:", model_path)
print("=" * 60)

try:
    model = joblib.load(model_path)
    print("SUCCESSFULLY loaded with joblib!")
except Exception as e:
    print(f"joblib.load failed: {e}, trying pickle...")
    with open(model_path, "rb") as f:
        model = pickle.load(f)
    print("SUCCESSFULLY loaded with pickle!")

print("\n--- MODEL TYPE ---")
print(type(model))
print(model)

print("\n--- ATTRIBUTES ---")
attrs = [a for a in dir(model) if not a.startswith("__")]
print("Available attributes:", attrs)

# Check feature names / count
if hasattr(model, "feature_names_in_"):
    print("\n--- FEATURE NAMES IN (feature_names_in_) ---")
    print("Feature count:", len(model.feature_names_in_))
    for idx, name in enumerate(model.feature_names_in_):
        print(f"  [{idx}] {name}")

if hasattr(model, "n_features_in_"):
    print("\n--- NUMBER OF FEATURES (n_features_in_) ---")
    print(model.n_features_in_)

# Check if Pipeline
if hasattr(model, "steps"):
    print("\n--- PIPELINE STEPS ---")
    for step_name, step_obj in model.steps:
        print(f"Step: {step_name} -> {type(step_obj)}")
        if hasattr(step_obj, "feature_names_in_"):
            print(f"   feature_names_in_: {step_obj.feature_names_in_}")

# Check transformers if ColumnTransformer
if hasattr(model, "transformers_"):
    print("\n--- COLUMN TRANSFORMERS ---")
    for trans in model.transformers_:
        print(trans)

# If it's a composite or dict
if isinstance(model, dict):
    print("\n--- DICT KEYS ---")
    print(model.keys())

# Let's inspect estimator specifics
if hasattr(model, "named_steps"):
    print("\n--- NAMED STEPS ---")
    for k, v in model.named_steps.items():
        print(f"  {k}: {type(v)}")
        if hasattr(v, "feature_names_in_"):
            print(f"     feature_names_in_: {v.feature_names_in_}")

print("\n" + "=" * 60)
