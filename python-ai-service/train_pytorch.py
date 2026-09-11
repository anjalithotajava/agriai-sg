"""
AgriAI-SG — PyTorch Deep Learning Model Training
Reads directly from Hydroponics_Dataset.csv
No MySQL required for training.

Run: python train_pytorch.py
"""
import os, math, warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

# ── Paths ─────────────────────────────────────────────────────
BASE     = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE, "data", "Hydroponics_Dataset.csv")
DNN_OUT  = os.path.join(BASE, "model_pytorch.pkl")
RF_OUT   = os.path.join(BASE, "model_rf.pkl")

# ── Config ────────────────────────────────────────────────────
DEVICE     = torch.device("cpu")
EPOCHS     = 300
BATCH_SIZE = 256
LR         = 1e-3
PATIENCE   = 25
SEED       = 42
torch.manual_seed(SEED)
np.random.seed(SEED)

CROP_MAP   = {"Kale":0,"Bok Choy":1,"Lettuce":2,
              "Spinach":3,"Chinese Cabbage":4}
METHOD_MAP = {"HYDROPONIC":0,"AEROPONIC":1,
              "AQUAPONIC":2,"SOIL_BASED":3}
FEATURES   = ["CropType","Method","TEMP","HUM","TDS",
              "temp_tds","temp_hum","tds_sq",
              "temp_opt","hum_opt","nutr_score"]

# ── Load CSV directly ─────────────────────────────────────────
def load_data():
    print(f"📂 Loading: {CSV_PATH}")
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(
            f"Dataset not found at {CSV_PATH}\n"
            f"Please ensure Hydroponics_Dataset.csv is in the data/ folder."
        )

    # Try different separators
    df = None
    for sep, dec in [(";",","),(","," . ".strip()),("\t",".")]:
        try:
            tmp = pd.read_csv(CSV_PATH, sep=sep, decimal=dec,
                              on_bad_lines="skip")
            if len(tmp) > 100 and len(tmp.columns) >= 5:
                df = tmp
                print(f"   Format: sep='{sep}' decimal='{dec}'")
                break
        except Exception:
            continue

    if df is None:
        raise ValueError("Could not parse CSV file.")

    print(f"   Rows: {len(df)}  Columns: {list(df.columns)}")

    # Map column names flexibly
    col = {c.upper().strip(): c for c in df.columns}

    def get(keys):
        for k in keys:
            if k in col:
                return pd.to_numeric(df[col[k]], errors="coerce")
        return None

    temp = get(["TEMP","TEMPERATURE"])
    hum  = get(["HUM","HUMIDITY"])
    tds  = get(["TDS","EC","NUTRIENT"])
    yld  = get(["YIELD_PER_SQM","YIELD","YIELDPERSQM",
                "YIELD_KG","PRODUCTION"])

    # Crop type
    ct_key = next((col[k] for k in ["CROPTYPE","CROP_TYPE","CROP"]
                   if k in col), None)
    crop = df[ct_key].map(CROP_MAP).fillna(0) if ct_key else pd.Series([0]*len(df))

    # Growing method
    mt_key = next((col[k] for k in ["METHOD","GROWING_METHOD","GROWINGMETHOD"]
                   if k in col), None)
    method = df[mt_key].map(METHOD_MAP).fillna(0) if mt_key else pd.Series([0]*len(df))

    # Yield fallback — derive from plant height columns
    if yld is None or yld.notna().sum() < 100:
        plant_cols = [c for c in df.columns
                      if c.upper().startswith("P") and
                      pd.to_numeric(df[c], errors="coerce").notna().sum() > len(df)*0.5]
        if plant_cols:
            yld = df[plant_cols].apply(
                pd.to_numeric, errors="coerce").mean(axis=1) * 0.12
            print(f"   Yield derived from plant columns: {plant_cols[:3]}")
        else:
            # Final fallback — agronomic formula
            yld = (tds / 1000) * 2.5 * (1 - 0.02 * (temp - 23).abs())
            print("   Yield derived from TDS/temperature formula")

    # Feature engineering
    X = pd.DataFrame({
        "CropType":   crop,
        "Method":     method,
        "TEMP":       temp,
        "HUM":        hum,
        "TDS":        tds,
        "temp_tds":   temp * tds / 10000,
        "temp_hum":   temp * hum  / 1000,
        "tds_sq":     (tds / 1000) ** 2,
        "temp_opt":   1 / (1 + (temp - 23).abs()),
        "hum_opt":    1 / (1 + (hum  - 70).abs()),
        "nutr_score": tds / (temp + 1),
    })
    y = pd.to_numeric(yld, errors="coerce")

    # Remove NaN rows
    mask = X.notna().all(axis=1) & y.notna()
    X = X[mask].values.astype(np.float32)
    y = y[mask].values.astype(np.float32)

    # Clip yield to realistic range
    y = np.clip(y, 0.3, 12.0)

    print(f"   Clean rows: {len(X)}")
    print(f"   Yield range: {y.min():.2f} – {y.max():.2f} kg/m²"
          f"  Mean: {y.mean():.2f}")
    return X, y

# ── Neural Network ────────────────────────────────────────────
class CropYieldNet(nn.Module):
    """
    Deep Feedforward Neural Network for crop yield regression.
    4 hidden layers with BatchNorm + Dropout regularisation.
    """
    def __init__(self, input_dim=11):
        super().__init__()
        self.net = nn.Sequential(
            nn.BatchNorm1d(input_dim),
            nn.Linear(input_dim, 128), nn.ReLU(),
            nn.BatchNorm1d(128), nn.Dropout(0.3),
            nn.Linear(128, 64), nn.ReLU(),
            nn.BatchNorm1d(64), nn.Dropout(0.2),
            nn.Linear(64, 32), nn.ReLU(),
            nn.BatchNorm1d(32), nn.Dropout(0.1),
            nn.Linear(32, 16), nn.ReLU(),
            nn.Linear(16, 1),
        )
        # He initialisation for ReLU
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, nonlinearity="relu")
                nn.init.zeros_(m.bias)

    def forward(self, x):
        return self.net(x).squeeze(1)

# ── Metrics ───────────────────────────────────────────────────
def metrics(true, pred):
    mae  = mean_absolute_error(true, pred)
    rmse = math.sqrt(mean_squared_error(true, pred))
    r2   = r2_score(true, pred)
    return mae, rmse, r2

def print_row(name, mae, rmse, r2, best=False):
    tag = " ← best" if best else ""
    print(f"   {name:<12}: MAE={mae:.4f}  "
          f"RMSE={rmse:.4f}  R²={r2:.4f}{tag}")

# ── Train DNN ─────────────────────────────────────────────────
def train_dnn(X_tr, y_tr, X_vl, y_vl):
    scaler   = StandardScaler()
    X_tr_s   = scaler.fit_transform(X_tr).astype(np.float32)
    X_vl_s   = scaler.transform(X_vl).astype(np.float32)

    def t(a): return torch.tensor(a, dtype=torch.float32)

    tr_dl = DataLoader(
        TensorDataset(t(X_tr_s), t(y_tr)),
        batch_size=BATCH_SIZE, shuffle=True
    )

    model  = CropYieldNet(X_tr.shape[1]).to(DEVICE)
    opt    = torch.optim.AdamW(model.parameters(),
                               lr=LR, weight_decay=1e-4)
    sched  = torch.optim.lr_scheduler.ReduceLROnPlateau(
        opt, patience=8, factor=0.5)
    crit   = nn.HuberLoss(delta=1.0)

    best_val  = float("inf")
    best_state = None
    patience_cnt = 0

    print(f"\n   {'Epoch':>5} | {'Train Loss':>11} | {'Val R²':>8}")
    print("   " + "-"*35)

    for ep in range(1, EPOCHS + 1):
        # Train
        model.train()
        tr_loss = 0.0
        for xb, yb in tr_dl:
            opt.zero_grad()
            loss = crit(model(xb), yb)
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            opt.step()
            tr_loss += loss.item() * len(xb)
        tr_loss /= len(X_tr)

        # Validate
        model.eval()
        with torch.no_grad():
            vl_pred = model(t(X_vl_s)).numpy()
        vl_r2  = r2_score(y_vl, vl_pred)
        vl_mse = mean_squared_error(y_vl, vl_pred)
        sched.step(vl_mse)

        if ep % 50 == 0 or ep == 1:
            print(f"   {ep:>5} | {tr_loss:>11.6f} | {vl_r2:>8.4f}")

        # Early stopping
        if vl_mse < best_val - 1e-6:
            best_val   = vl_mse
            best_state = {k: v.cpu().clone()
                          for k, v in model.state_dict().items()}
            patience_cnt = 0
        else:
            patience_cnt += 1
            if patience_cnt >= PATIENCE:
                print(f"   Early stop at epoch {ep}")
                break

    model.load_state_dict(best_state)
    model.eval()
    return model, scaler

# ── Main ──────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  AgriAI-SG — Model Training")
    print("  PyTorch Deep Neural Network vs Random Forest")
    print("  Data source: Hydroponics_Dataset.csv (Bouzid et al. 2024)")
    print("=" * 60)

    X, y = load_data()

    # 70 / 15 / 15 split
    X_tr, X_tmp, y_tr, y_tmp = train_test_split(
        X, y, test_size=0.30, random_state=SEED)
    X_vl, X_te, y_vl, y_te   = train_test_split(
        X_tmp, y_tmp, test_size=0.50, random_state=SEED)

    print(f"\n   Split → Train:{len(X_tr)} | "
          f"Val:{len(X_vl)} | Test:{len(X_te)}")

    # ── 1. Random Forest ──────────────────────────────────────
    print("\n" + "─"*60)
    print("  [1/2] Random Forest Regressor (baseline)")
    print("─"*60)
    rf = RandomForestRegressor(
        n_estimators=300, max_depth=15,
        min_samples_split=3, min_samples_leaf=2,
        max_features="sqrt", random_state=SEED, n_jobs=-1
    )
    rf.fit(X_tr, y_tr)

    rf_tr = metrics(y_tr, rf.predict(X_tr))
    rf_vl = metrics(y_vl, rf.predict(X_vl))
    rf_te = metrics(y_te, rf.predict(X_te))

    print("\n   Random Forest Results:")
    print_row("Train",      *rf_tr)
    print_row("Validation", *rf_vl)
    print_row("Test",       *rf_te)
    print(f"   Overfitting gap: {rf_tr[2]-rf_te[2]:.4f}")

    joblib.dump({
        "model":    rf,
        "features": FEATURES,
        "metrics":  {
            "train_r2": round(rf_tr[2],4),
            "val_r2":   round(rf_vl[2],4),
            "test_r2":  round(rf_te[2],4),
            "mae":      round(rf_te[0],4),
            "rmse":     round(rf_te[1],4),
        },
        "source": "Hydroponics_Dataset.csv — Bouzid et al. (2024)",
    }, RF_OUT)
    print(f"   ✅ Saved → model_rf.pkl")

    # ── 2. Deep Neural Network ────────────────────────────────
    print("\n" + "─"*60)
    print("  [2/2] PyTorch Deep Neural Network")
    print("─"*60)
    print(f"   Architecture: Input({X.shape[1]})"
          f"→BN→Dense(128)→ReLU→BN→Drop(0.3)"
          f"→Dense(64)→ReLU→BN→Drop(0.2)"
          f"→Dense(32)→ReLU→BN→Drop(0.1)"
          f"→Dense(16)→ReLU→Dense(1)")
    print(f"   Optimiser: AdamW  LR={LR}  WeightDecay=1e-4")
    print(f"   Loss: HuberLoss(δ=1.0)  "
          f"Max Epochs={EPOCHS}  Early Stop patience={PATIENCE}")

    dnn, scaler = train_dnn(X_tr, y_tr, X_vl, y_vl)

    def dnn_pred(Xq):
        Xs = scaler.transform(Xq).astype(np.float32)
        with torch.no_grad():
            return dnn(torch.tensor(Xs)).numpy()

    dnn_tr = metrics(y_tr, dnn_pred(X_tr))
    dnn_vl = metrics(y_vl, dnn_pred(X_vl))
    dnn_te = metrics(y_te, dnn_pred(X_te))

    print("\n   Deep Neural Network Results:")
    print_row("Train",      *dnn_tr)
    print_row("Validation", *dnn_vl)
    print_row("Test",       *dnn_te)
    print(f"   Overfitting gap: {dnn_tr[2]-dnn_te[2]:.4f}")

    # Feature importance via gradient sensitivity
    dnn.train()
    Xt = torch.tensor(
        scaler.transform(X_te).astype(np.float32),
        requires_grad=True
    )
    dnn(Xt).mean().backward()
    grads = Xt.grad.abs().mean(0).numpy()
    dnn.eval()

    raw_fi = {f: float(grads[i]/grads.sum())
              for i, f in enumerate(FEATURES)}
    fi = {
        "Nutrient Richness": (raw_fi["TDS"] + raw_fi["temp_tds"]
                              + raw_fi["tds_sq"] + raw_fi["nutr_score"]),
        "Temperature":       (raw_fi["TEMP"] + raw_fi["temp_hum"]
                              + raw_fi["temp_opt"]),
        "Air Moisture":      (raw_fi["HUM"] + raw_fi["hum_opt"]),
        "Crop Type":          raw_fi["CropType"],
        "Growing Method":     raw_fi["Method"],
    }
    total = sum(fi.values()) or 1
    fi = {k: round(v/total, 4)
          for k, v in sorted(fi.items(), key=lambda x: -x[1])}

    print("\n   Feature Importance (gradient sensitivity):")
    for k, v in fi.items():
        bar = "█" * int(v * 40)
        print(f"   {k:<20}: {bar} {v:.1%}")

    joblib.dump({
        "model_state":  {k: v.cpu()
                         for k, v in dnn.state_dict().items()},
        "input_dim":    X.shape[1],
        "scaler":       scaler,
        "features":     FEATURES,
        "feature_importance": fi,
        "architecture": ("Input→BN→Dense(128)→ReLU→BN→Drop(0.3)"
                         "→Dense(64)→ReLU→BN→Drop(0.2)"
                         "→Dense(32)→ReLU→BN→Drop(0.1)"
                         "→Dense(16)→ReLU→Dense(1)"),
        "metrics": {
            "train_r2": round(dnn_tr[2],4),
            "val_r2":   round(dnn_vl[2],4),
            "r2":       round(dnn_te[2],4),
            "mae":      round(dnn_te[0],4),
            "rmse":     round(dnn_te[1],4),
        },
        "source": "Hydroponics_Dataset.csv — Bouzid et al. (2024)",
    }, DNN_OUT)
    print(f"\n   ✅ Saved → model_pytorch.pkl")

    # ── Comparison table ──────────────────────────────────────
    print("\n" + "="*60)
    print("  COMPARISON — Deep Neural Network vs Random Forest")
    print("="*60)
    print(f"  {'Metric':<22} {'Random Forest':>16} {'Deep Neural Net':>16}")
    print("  " + "-"*56)

    rows = [
        ("Training R²",   rf_tr[2], dnn_tr[2]),
        ("Validation R²", rf_vl[2], dnn_vl[2]),
        ("Test R²",       rf_te[2], dnn_te[2]),
        ("Test MAE",      rf_te[0], dnn_te[0]),
        ("Test RMSE",     rf_te[1], dnn_te[1]),
        ("Overfit gap",   rf_tr[2]-rf_te[2], dnn_tr[2]-dnn_te[2]),
    ]
    for label, rf_v, dnn_v in rows:
        if "MAE" in label or "RMSE" in label or "gap" in label:
            winner = "← DNN better" if dnn_v < rf_v else ""
        else:
            winner = "← DNN better" if dnn_v > rf_v else ""
        print(f"  {label:<22} {rf_v:>16.4f} "
              f"{dnn_v:>16.4f}  {winner}")

    print("=" * 60)
    print(f"\n✅ Both models saved successfully.")
    print(f"   app.py will auto-load model_pytorch.pkl")
    print(f"   Run: python app.py")


if __name__ == "__main__":
    main()
