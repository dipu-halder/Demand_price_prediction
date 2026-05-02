from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ── Correct file paths (exact filenames) ──
DATASET_PATH      = os.path.join(BASE_DIR, "demand_prediction_dataset_1000.csv")
MAPPING_PATH      = os.path.join(BASE_DIR, "product_store_data.csv")   # Store_ID,Store_Name,Product_ID,Product_Name
PRICE_DATA_PATH   = os.path.join(BASE_DIR, "Demand_data.csv")          # year,current_price,product_id,store_id

best_model  = None
data_model  = None
product_map = {}   # product_name (lower) -> Product_ID
store_map   = {}   # store_name   (lower) -> Store_ID
LR_mae      = 999
RF_mae      = 999

def load_and_train():
    global best_model, data_model, product_map, store_map, LR_mae, RF_mae

    # ── Step 1: Demand prediction model ───────────────────────
    df = pd.read_csv(DATASET_PATH)
    print("Main dataset columns:", df.columns.tolist())

    # FIX: dataset mein Temperature aur Rainfall bhi hai
    # Sirf ye 9 features use karo (Demand.py ke same)
    features = [
        'Product_ID', 'Store_ID', 'Price', 'Promotion',
        'Holiday', 'Inventory_Level', 'Past_Sales',
        'Customer_Visits', 'Month'
    ]
    X = df[features]
    y = df['Sales']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.4, random_state=42)

    lr = LinearRegression()
    lr.fit(X_train, y_train)
    LR_mae = mean_absolute_error(y_test, lr.predict(X_test))

    rf = RandomForestRegressor(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    RF_mae = mean_absolute_error(y_test, rf.predict(X_test))

    best_model = rf if RF_mae < LR_mae else lr
    chosen = 'RandomForest' if RF_mae < LR_mae else 'LinearRegression'
    print(f"Best model: {chosen}")
    print(f"LR MAE: {LR_mae:.2f} | RF MAE: {RF_mae:.2f}")

    # ── Step 2: Product & Store name → ID mapping ──────────────
    # FIX: product_store_data.csv se lena hai, Demand_data.csv se nahi
    try:
        ps = pd.read_csv(MAPPING_PATH)
        print("product_store_data columns:", ps.columns.tolist())

        # Columns: Store_ID, Store_Name, Product_ID, Product_Name
        product_map.update(dict(zip(
            ps['Product_Name'].astype(str).str.lower().str.strip(),
            ps['Product_ID']
        )))
        store_map.update(dict(zip(
            ps['Store_Name'].astype(str).str.lower().str.strip(),
            ps['Store_ID']
        )))
        print(f"Products mapped: {len(product_map)} | Stores mapped: {len(store_map)}")

    except Exception as e:
        print(f"WARN: product_store_data.csv error: {e}")

    # ── Step 3: Price prediction model ────────────────────────
    # FIX: Demand_data.csv has: year, current_price, product_id, store_id
    try:
        dd = pd.read_csv(PRICE_DATA_PATH)
        print("Demand_data columns:", dd.columns.tolist())

        X_p = pd.DataFrame({'Year': dd['year']})
        y_p = dd['current_price']

        data_model = LinearRegression()
        data_model.fit(X_p, y_p)
        print("Price model trained.")

    except Exception as e:
        print(f"WARN: Demand_data.csv error: {e} — using inflation formula instead")
        data_model = None

    print("✓ Setup complete!")


try:
    load_and_train()
except Exception as e:
    import traceback
    print(f"[CRITICAL] Setup failed:")
    traceback.print_exc()


# ── Routes ────────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "model_ready": best_model is not None,
        "products": len(product_map),
        "stores": len(store_map),
        "price_model": data_model is not None
    })


@app.route('/api/predict', methods=['POST'])
def predict_demand():
    if best_model is None:
        return jsonify({"error": "Model not loaded. Check server logs."}), 500

    try:
        data = request.json

        # Name → ID lookup
        product_name = str(data.get('product_name', '')).lower().strip()
        store_name   = str(data.get('store_name',   '')).lower().strip()
        product_id   = product_map.get(product_name, 1)
        store_id     = store_map.get(store_name, 1)

        price      = float(data['price'])
        promotion  = 1 if data.get('promotion') else 0
        holiday    = 1 if data.get('holiday')   else 0
        stock      = int(data['stock'])
        past_sales = int(data['past_sales'])
        visits     = int(data['visits'])
        month      = int(data['month'])

        # Demand predict
        input_df = pd.DataFrame({
            'Product_ID':      [product_id],
            'Store_ID':        [store_id],
            'Price':           [price],
            'Promotion':       [promotion],
            'Holiday':         [holiday],
            'Inventory_Level': [stock],
            'Past_Sales':      [past_sales],
            'Customer_Visits': [visits],
            'Month':           [month]
        })

        predicted_demand = round(float(best_model.predict(input_df)[0]))

        # Future price (5 years)
        if data_model is not None:
            future_year  = datetime.now().year + 5
            future_df    = pd.DataFrame({'Year': [future_year]})
            future_price = float(data_model.predict(future_df)[0])
        else:
            future_price = price * (1.055 ** 5)   # 5.5% inflation fallback

        price_increase = future_price - price
        increase_pct   = (price_increase / price) * 100

        return jsonify({
            "predicted_demand":     predicted_demand,
            "current_price":        price,
            "future_price":         round(future_price, 2),
            "price_increase":       round(price_increase, 2),
            "increase_probability": round(increase_pct, 2),
            "model_used":           "RandomForest" if RF_mae < LR_mae else "LinearRegression",
            "product_id":           int(product_id),
            "store_id":             int(store_id)
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True, port=5000)
