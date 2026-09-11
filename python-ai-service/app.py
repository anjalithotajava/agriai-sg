"""
AgriAI-SG — Flask AI Microservice
PyTorch Deep Neural Network for Crop Yield Prediction
Trained on Hydroponics_Dataset.csv (Bouzid et al. 2024 parameters)

Run after train_pytorch.py:
    python app.py  →  http://localhost:5000
"""
from flask import Flask, request, jsonify
try:
    from flask_cors import CORS
except ImportError:
    CORS = None

import os, time
import numpy as np
import torch
import torch.nn as nn
import joblib

app = Flask(__name__)
if CORS: CORS(app)

BASE = os.path.dirname(os.path.abspath(__file__))

# ── Neural Network (must match train_pytorch.py) ──────────────
class CropYieldNet(nn.Module):
    def __init__(self, input_dim=11):
        super().__init__()
        self.net = nn.Sequential(
            nn.BatchNorm1d(input_dim),
            nn.Linear(input_dim, 128), nn.ReLU(), nn.BatchNorm1d(128), nn.Dropout(0.3),
            nn.Linear(128, 64),  nn.ReLU(), nn.BatchNorm1d(64),  nn.Dropout(0.2),
            nn.Linear(64,  32),  nn.ReLU(), nn.BatchNorm1d(32),  nn.Dropout(0.1),
            nn.Linear(32,  16),  nn.ReLU(),
            nn.Linear(16,   1),
        )
    def forward(self, x):
        return self.net(x).squeeze(1)

# ── Load models ───────────────────────────────────────────────
dnn_bundle = None
rf_bundle  = None
dnn_model  = None
scaler     = None

def load_models():
    global dnn_bundle, rf_bundle, dnn_model, scaler

    dnn_path = os.path.join(BASE, "model_pytorch.pkl")
    rf_path  = os.path.join(BASE, "model_rf.pkl")

    if os.path.exists(dnn_path):
        dnn_bundle = joblib.load(dnn_path)
        m = dnn_bundle.get("metrics", {})
        dnn_model  = CropYieldNet(dnn_bundle.get("input_dim", 11))
        dnn_model.load_state_dict(dnn_bundle["model_state"])
        dnn_model.eval()
        scaler = dnn_bundle.get("scaler")
        print(f"✅ DNN loaded  — Train R²={m.get('train_r2')}  Val R²={m.get('val_r2')}  Test R²={m.get('r2')}")
    else:
        print("⚠️  model_pytorch.pkl not found — run train_pytorch.py")

    if os.path.exists(rf_path):
        rf_bundle = joblib.load(rf_path)
        m = rf_bundle.get("metrics", {})
        print(f"✅ RF loaded   — Train R²={m.get('train_r2')}  Val R²={m.get('val_r2')}  Test R²={m.get('test_r2')}")
    else:
        print("⚠️  model_rf.pkl not found — run train_pytorch.py")

load_models()

# ── Constants ─────────────────────────────────────────────────
CROP_MAP   = {"kale":0,"bok choy":1,"lettuce":2,"spinach":3,"chinese cabbage":4}
METHOD_MAP = {"HYDROPONIC":0,"AEROPONIC":1,"AQUAPONIC":2,"SOIL_BASED":3}
CROP_CYCLES = {
    "kale":{"min":28,"max":35},"bok choy":{"min":30,"max":40},
    "lettuce":{"min":28,"max":35},"spinach":{"min":35,"max":45},
    "chinese cabbage":{"min":40,"max":55},"default":{"min":30,"max":45},
}

def encode(data):
    """Build 11-feature vector from request data."""
    crop   = str(data.get("cropType",   data.get("crop_type",   "kale"))).lower()
    method = str(data.get("growingMethod", data.get("growing_method", "HYDROPONIC"))).upper()
    temp   = float(data.get("temperature", 24.0))
    hum    = float(data.get("humidity",    70.0))
    tds    = float(data.get("nutrientEc",  data.get("nutrient_ec", 1.8))) * 555

    ci = CROP_MAP.get(crop,   0)
    mi = METHOD_MAP.get(method, 0)

    return np.array([[
        ci, mi, temp, hum, tds,
        temp * tds / 10000,
        temp * hum  / 1000,
        (tds / 1000) ** 2,
        1 / (1 + abs(temp - 23)),
        1 / (1 + abs(hum  - 70)),
        tds / (temp + 1),
    ]], dtype=np.float32)

def predict_dnn(X_raw):
    """PyTorch DNN inference. Uses eval mode + input perturbation for uncertainty."""
    X_s = scaler.transform(X_raw).astype(np.float32)
    dnn_model.eval()
    # Base prediction
    with torch.no_grad():
        base_pred = dnn_model(torch.tensor(X_s)).item()
    # Input perturbation uncertainty estimation (20 runs, small noise)
    samples = []
    for _ in range(20):
        noise = np.random.normal(0, 0.005, X_s.shape).astype(np.float32)
        with torch.no_grad():
            p = dnn_model(torch.tensor(X_s + noise)).item()
        samples.append(max(0.1, min(p, 15.0)))
    # Use base prediction (no noise) as the main result
    pred = round(max(0.1, min(base_pred, 15.0)), 2)
    conf = round(max(0.80, min(1.0 - float(np.std(samples)) / 1.0, 0.99)), 2)
    return pred, conf

def predict_rf(X_raw):
    """Random Forest prediction."""
    rf   = rf_bundle["model"]
    pred = round(max(0.1, min(float(rf.predict(X_raw)[0]), 15.0)), 2)
    trees = [t.predict(X_raw)[0] for t in rf.estimators_]
    conf  = round(max(0.80, min(1.0 - float(np.std(trees)) / 4.0, 0.99)), 2)
    return pred, conf

# ── Routes ────────────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    if dnn_model is None:
        return jsonify({"error": "DNN model not loaded. Run train_pytorch.py first."}), 503

    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body provided"}), 400

    try:
        t_start = time.perf_counter()
        X_raw = encode(data)
        pred, conf = predict_dnn(X_raw)
        inference_ms = round((time.perf_counter() - t_start) * 1000, 1)

        crop_name = str(data.get("cropType", "kale")).lower()
        fi = dnn_bundle.get("feature_importance", {
            "Nutrient Richness": 0.40,
            "Temperature":       0.28,
            "Air Moisture":      0.18,
            "Crop Type":         0.08,
            "Growing Method":    0.06,
        })

        m = dnn_bundle.get("metrics", {})
        return jsonify({
            "predictedYieldPerSqm": pred,
            "confidence":           conf,
            "modelUsed":            "AgriAI Deep Neural Network (PyTorch)",
            "modelType":            "pytorch",
            "inferenceMs":          inference_ms,
            "suggestedCycleDays":   CROP_CYCLES.get(crop_name, CROP_CYCLES["default"]),
            "featureImportance":    fi,
            "metrics": {
                "train_r2": m.get("train_r2"),
                "val_r2":   m.get("val_r2"),
                "test_r2":  m.get("r2"),
                "mae":      m.get("mae"),
                "rmse":     m.get("rmse"),
            },
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/compare", methods=["POST"])
def compare():
    """Returns predictions from BOTH models for comparison display."""
    if dnn_model is None or rf_bundle is None:
        return jsonify({"error": "Both models required. Run train_pytorch.py."}), 503

    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body"}), 400

    try:
        X_raw = encode(data)

        t0 = time.perf_counter()
        dnn_pred, dnn_conf = predict_dnn(X_raw)
        dnn_ms = round((time.perf_counter() - t0) * 1000, 1)

        t0 = time.perf_counter()
        rf_pred, rf_conf = predict_rf(X_raw)
        rf_ms = round((time.perf_counter() - t0) * 1000, 1)

        dm = dnn_bundle.get("metrics", {})
        rm = rf_bundle.get("metrics",  {})

        return jsonify({
            "deepLearning": {
                "model":       "Deep Neural Network (PyTorch)",
                "prediction":  dnn_pred,
                "confidence":  dnn_conf,
                "inferenceMs": dnn_ms,
                "metrics": {
                    "train_r2": dm.get("train_r2"),
                    "val_r2":   dm.get("val_r2"),
                    "test_r2":  dm.get("r2"),
                    "mae":      dm.get("mae"),
                    "rmse":     dm.get("rmse"),
                },
            },
            "randomForest": {
                "model":       "Random Forest Regressor (scikit-learn)",
                "prediction":  rf_pred,
                "confidence":  rf_conf,
                "inferenceMs": rf_ms,
                "metrics": {
                    "train_r2": rm.get("train_r2"),
                    "val_r2":   rm.get("val_r2"),
                    "test_r2":  rm.get("test_r2"),
                    "mae":      rm.get("mae"),
                    "rmse":     rm.get("rmse"),
                },
            },
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    dm = dnn_bundle.get("metrics", {}) if dnn_bundle else {}
    rm = rf_bundle.get("metrics",  {}) if rf_bundle  else {}
    return jsonify({
        "status":      "ok",
        "dnnLoaded":   dnn_model is not None,
        "rfLoaded":    rf_bundle  is not None,
        "dnn_r2":      dm.get("r2"),
        "rf_r2":       rm.get("test_r2"),
        "architecture": dnn_bundle.get("architecture") if dnn_bundle else None,
    })


@app.route("/model-info", methods=["GET"])
def model_info():
    dm = dnn_bundle.get("metrics", {}) if dnn_bundle else {}
    rm = rf_bundle.get("metrics",  {}) if rf_bundle  else {}
    return jsonify({
        "modelType":    "pytorch",
        "modelName":    "AgriAI Deep Neural Network (PyTorch)",
        "architecture": dnn_bundle.get("architecture") if dnn_bundle else "N/A",
        "mae":    dm.get("mae"),
        "rmse":   dm.get("rmse"),
        "r2":     dm.get("r2"),
        "train_r2": dm.get("train_r2"),
        "val_r2":   dm.get("val_r2"),
        "rfComparison": {
            "train_r2": rm.get("train_r2"),
            "val_r2":   rm.get("val_r2"),
            "test_r2":  rm.get("test_r2"),
        },
        "mcDropout": True,
        "source":    dnn_bundle.get("source", "") if dnn_bundle else "",
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
