# 🌿 AgriAI-SG

**A Web-Based Decision Support System for Optimising Yield in Singapore's Urban Farms Using Deep Learning**

> Geethanjali Thota · S1040006 · CN7000 MWPL · Masters in Computer Science · UEL / LSBF · 2026  
> Supervisor: Dr. Preethi Kesavan

---

## 📁 Project Structure

```
agriai-sg/
├── 📁 backend/                 ← Java Spring Boot 3.2 (Port 8080)
├── 📁 frontend/                ← ReactJS 18 + Vite (Port 3000)
├── 📁 python-ai-service/       ← Python Flask + scikit-learn (Port 5000)
└── 📁 database/
    └── schema.sql              ← MySQL 8.0 (6 tables)
```

---

## 🚀 Startup Instructions (Run in this order)

### Prerequisites
- Java 17+ (JDK)
- Node.js 18+
- Python 3.10+
- MySQL 8.0 running on port 3306

---

### Step 1 — Database

```bash
mysql -u root -p < database/schema.sql
```

---

### Step 2 — Backend (Port 8080)

```bash
cd backend
```

Open `src/main/resources/application.properties` and change:
```
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

Then run:
```bash
mvn spring-boot:run
```

Wait for: `Started AgriAiSgApplication`

---

### Step 3 — Python AI Service (Port 5000)

```bash
cd python-ai-service
pip install -r requirements.txt
python train_model.py
python app.py
```

Wait for: `Running on http://0.0.0.0:5000`

> **Note:** Run `train_model.py` only once. It creates `model.pkl`.

---

### Step 4 — Frontend (Port 3000)

```bash
cd frontend
npm install
npm run dev
```

Open browser: **http://localhost:3000**

---

## 🔑 Login Credentials

**Register your own account** at http://localhost:3000/register

Or use the seed accounts (both password: `Agri@2026`):
- Admin: `admin@agriai-sg.com`
- Farmer: `farmer@agriai-sg.com`

---

## 🎯 Demo Flow for Presentation

1. **Register** → new account at /register
2. **Login** → dashboard shows farms/units/crops/activities
3. **Add Farm** → Farms page → "+ New Farm"
4. **Add Growing Unit** → click "🌿 Growing Units" on farm card
5. **Plant Crop** → click "🌱 Manage Crops →" on unit card
6. **Log Activity** → Farms → "📋 Activities" button on farm card
7. **AI Prediction** → AI Insights page → select crop/method → "Get AI Yield Prediction"
8. **Harvest** → Crops page → "✂️ Harvest" button → enter actual yield

---

## 🤖 AI Model

- **Algorithm:** Ensemble (Random Forest + Gradient Boosting VotingRegressor)
- **Dataset:** Bouzid et al. (2024) — Real hydroponic IoT sensor data
- **Features:** 11 (including 6 engineered interaction features)
- **Test R² = 0.97** | MAE = 0.10 kg/m² | RMSE = 0.13

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | ReactJS 18, Vite, Recharts, Axios, React Router v6, Inter font |
| Backend | Spring Boot 3.2, Java 17, Spring Security 6, jjwt 0.12.5, BCrypt-12 |
| Database | MySQL 8.0 — 6 normalised tables |
| AI Service | Python Flask 3.0, scikit-learn, Random Forest + Gradient Boosting |

---

## ✅ Implemented Functional Requirements

| FR | Feature | Endpoint |
|---|---|---|
| FR1 | User Registration | POST /api/auth/register |
| FR2 | JWT Login | POST /api/auth/login |
| FR6 | Farm CRUD | /api/farms |
| FR9 | Growing Unit CRUD | /api/farms/{id}/growing-units |
| FR12 | Crop CRUD + Harvest | /api/farms/{fId}/growing-units/{uId}/crops |
| FR15 | Activity Logging | /api/farms/{id}/activities |
| FR18 | Dashboard Summary | GET /api/dashboard/summary |
| FR19 | Activity Chart | GET /api/dashboard/activity-chart |
| FR21 | AI Yield Prediction | POST /api/ai/predict |
| FR22 | Feature Importance | (included in FR21 response) |
