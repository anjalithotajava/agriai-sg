"""
AgriAI-SG — System Performance Testing
Tests response time, API latency and prediction processing time
as required by Dr. Preethi Kesavan's feedback.

Run while Flask and Spring Boot are running:
    python performance_test.py

Produces results like:
    Login response          250ms
    Prediction request      1.2s
    Dashboard loading       500ms
"""
import time
import statistics
import requests
import json

# ── Config ────────────────────────────────────────────────────
FLASK_URL   = "http://localhost:5000"
BACKEND_URL = "http://localhost:8080/api"
RUNS        = 10   # number of times each test runs for averaging

# ── Test credentials (register first via the app) ─────────────
TEST_EMAIL    = "perf@agriai-sg.com"
TEST_PASSWORD = "Perf@2026"
TEST_NAME     = "Performance Tester"

def register_test_user():
    """Register a test user (ignore if already exists)."""
    try:
        requests.post(f"{BACKEND_URL}/auth/register", json={
            "name": TEST_NAME, "email": TEST_EMAIL,
            "password": TEST_PASSWORD, "role": "FARMER"
        }, timeout=10)
    except:
        pass

def get_token():
    """Login and return JWT token."""
    r = requests.post(f"{BACKEND_URL}/auth/login",
                      json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
                      timeout=10)
    if r.status_code != 200:
        raise Exception(f"Login failed: {r.status_code} {r.text}")
    return r.json().get("token")

def measure(fn, runs=RUNS):
    """Run fn multiple times, return list of ms durations."""
    times = []
    for _ in range(runs):
        start = time.perf_counter()
        result = fn()
        end   = time.perf_counter()
        times.append((end - start) * 1000)
    return times, result

def fmt(times):
    avg = statistics.mean(times)
    mn  = min(times)
    mx  = max(times)
    if avg < 1000:
        return f"{avg:.0f}ms  (min {mn:.0f}ms / max {mx:.0f}ms)"
    else:
        return f"{avg/1000:.2f}s  (min {mn/1000:.2f}s / max {mx/1000:.2f}s)"

def run_tests():
    print("=" * 65)
    print("  AgriAI-SG — System Performance Testing")
    print("  Dr. Preethi Kesavan feedback — response & latency metrics")
    print("=" * 65)
    print(f"  Runs per test: {RUNS}")
    print()

    results = {}

    # ── Test 1: Flask health check ────────────────────────────
    print("[1/7] Flask health endpoint latency...")
    try:
        times, _ = measure(lambda: requests.get(f"{FLASK_URL}/health", timeout=10))
        results["Flask /health"] = times
        print(f"      ✅ {fmt(times)}")
    except Exception as e:
        print(f"      ❌ Flask not running: {e}")
        print("      → Start Flask with: python app.py")
        return

    # ── Test 2: Flask AI prediction time ─────────────────────
    print("[2/7] Flask AI prediction processing time...")
    payload = {"cropType":"Kale","temperature":24,"humidity":70,
               "nutrientEc":1.8,"growingMethod":"HYDROPONIC"}
    try:
        times, _ = measure(lambda: requests.post(
            f"{FLASK_URL}/predict", json=payload, timeout=30))
        results["Flask /predict (DNN inference)"] = times
        print(f"      ✅ {fmt(times)}")
    except Exception as e:
        print(f"      ❌ {e}")

    # Register test user
    register_test_user()

    # ── Test 3: Login response time ───────────────────────────
    print("[3/7] Login API response time (Spring Boot)...")
    try:
        times, resp = measure(lambda: requests.post(
            f"{BACKEND_URL}/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=15))
        results["Login /api/auth/login"] = times
        token = resp.json().get("token")
        print(f"      ✅ {fmt(times)}")
    except Exception as e:
        print(f"      ❌ Spring Boot not running: {e}")
        print("      → Start backend with: mvn spring-boot:run")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # ── Test 4: Dashboard summary ─────────────────────────────
    print("[4/7] Dashboard summary loading time...")
    try:
        times, _ = measure(lambda: requests.get(
            f"{BACKEND_URL}/dashboard/summary", headers=headers, timeout=15))
        results["Dashboard /api/dashboard/summary"] = times
        print(f"      ✅ {fmt(times)}")
    except Exception as e:
        print(f"      ❌ {e}")

    # ── Test 5: Activity chart ────────────────────────────────
    print("[5/7] Activity chart data loading time...")
    try:
        times, _ = measure(lambda: requests.get(
            f"{BACKEND_URL}/dashboard/activity-chart?days=30",
            headers=headers, timeout=15))
        results["Activity chart /api/dashboard/activity-chart"] = times
        print(f"      ✅ {fmt(times)}")
    except Exception as e:
        print(f"      ❌ {e}")

    # ── Test 6: Full AI prediction (React → Spring → Flask) ──
    print("[6/7] Full AI prediction round-trip (Spring Boot → Flask)...")
    try:
        times, _ = measure(lambda: requests.post(
            f"{BACKEND_URL}/ai/predict",
            json={"cropType":"Kale","temperature":24.0,"humidity":70.0,
                  "nutrientEc":1.8,"growingMethod":"HYDROPONIC"},
            headers=headers, timeout=30))
        results["Full AI predict /api/ai/predict"] = times
        print(f"      ✅ {fmt(times)}")
    except Exception as e:
        print(f"      ❌ {e}")

    # ── Test 7: Farms list ────────────────────────────────────
    print("[7/7] Farms list loading time...")
    try:
        times, _ = measure(lambda: requests.get(
            f"{BACKEND_URL}/farms", headers=headers, timeout=15))
        results["Farms list /api/farms"] = times
        print(f"      ✅ {fmt(times)}")
    except Exception as e:
        print(f"      ❌ {e}")

    # ── Summary table (Dr. Kesavan format) ────────────────────
    print()
    print("=" * 65)
    print("  PERFORMANCE TEST RESULTS")
    print("  (As required by Dr. Preethi Kesavan feedback)")
    print("=" * 65)
    print(f"  {'Test':<42} {'Avg Time':>10} {'Status':>8}")
    print("  " + "-" * 62)

    targets = {
        "Flask /health":                           500,
        "Flask /predict (DNN inference)":         3000,
        "Login /api/auth/login":                  1000,
        "Dashboard /api/dashboard/summary":        800,
        "Activity chart /api/dashboard/activity-chart": 800,
        "Full AI predict /api/ai/predict":        4000,
        "Farms list /api/farms":                   600,
    }

    for name, times in results.items():
        avg_ms = statistics.mean(times)
        target = targets.get(name, 2000)
        status = "✅ PASS" if avg_ms <= target else "⚠️ SLOW"
        if avg_ms < 1000:
            time_str = f"{avg_ms:.0f}ms"
        else:
            time_str = f"{avg_ms/1000:.2f}s"
        print(f"  {name:<42} {time_str:>10} {status:>8}")

    print("=" * 65)
    print()
    print("  SUMMARY FOR DISSERTATION")
    print("  " + "-" * 62)

    report_names = {
        "Login /api/auth/login":                  "Login response time",
        "Full AI predict /api/ai/predict":        "AI prediction request (end-to-end)",
        "Flask /predict (DNN inference)":         "DNN inference time (Flask only)",
        "Dashboard /api/dashboard/summary":       "Dashboard loading time",
        "Activity chart /api/dashboard/activity-chart": "Activity chart loading time",
        "Farms list /api/farms":                  "Farms list loading time",
    }
    for key, label in report_names.items():
        if key in results:
            avg_ms = statistics.mean(results[key])
            val = f"{avg_ms:.0f}ms" if avg_ms < 1000 else f"{avg_ms/1000:.2f}s"
            print(f"  {label:<40} {val}")

    print()
    print("  Note: Tests run on localhost. Production response times")
    print("  may vary based on network latency and server hardware.")
    print("=" * 65)

if __name__ == "__main__":
    run_tests()
