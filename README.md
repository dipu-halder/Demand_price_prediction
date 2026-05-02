# DemandAI — Setup Guide

## Folder Structure (copy karo exactly aisa)

```
YourProject/
│
├── app.py                              ← Flask backend (ye file)
├── demand_prediction_dataset_1000.csv  ← Main training data
├── demand_data.csv                     ← Product & Store names
├── product_store_data.csv              ← Price model data
│
└── demand-app/                         ← React frontend
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── LandingPage.module.css
        │   ├── PredictPage.jsx
        │   └── PredictPage.module.css
        └── components/
            ├── InputForm.jsx
            ├── InputForm.module.css
            ├── Dashboard.jsx
            ├── Dashboard.module.css
            ├── FuturePrediction.jsx
            └── FuturePrediction.module.css
```

---

## Step 1 — Python (Flask Backend)

### Install karo:
```bash
pip install flask flask-cors pandas scikit-learn
```

### CSV files check karo:
`app.py` ke andar ye line hai:
```python
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH     = os.path.join(BASE_DIR, "demand_prediction_dataset_1000.csv")
DEMAND_DATA_PATH = os.path.join(BASE_DIR, "demand_data.csv")
PRICE_DATA_PATH  = os.path.join(BASE_DIR, "product_store_data.csv")
```
Matlab teeno CSV files `app.py` ke SAME folder mein honi chahiye.

### Run karo:
```bash
python app.py
```
Output aayega:
```
Best model: RandomForest
LR MAE: XX.XX | RF MAE: XX.XX
Models loaded successfully!
 * Running on http://127.0.0.1:5000
```

---

## Step 2 — React Frontend

```bash
cd demand-app
npm install
npm run dev
```
Browser mein open karo: http://localhost:5173

---

## Step 3 — Use karo

1. Landing page par "Start Predicting" click karo
2. Product Name, Store Name, Price, Month sab bharo
3. "Predict Demand" dabao
4. Dashboard mein results aayenge — demand, charts, feature influence
5. "Years in Future" bharo → future price forecast

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Backend Offline" dikhta hai | `python app.py` run karo pehle |
| CSV not found error | CSV files `app.py` ke same folder mein rako |
| npm install fail | Node.js install karo: nodejs.org |
| Port 5000 busy | `app.py` mein `port=5001` karo, aur `vite.config.js` mein bhi `5001` |
