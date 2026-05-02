import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
import matplotlib.pyplot as plt
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ── CSV Paths ─────────────────────────────────────────────────
DATASET_PATH    = os.path.join(BASE_DIR, "demand_prediction_dataset_1000.csv")
MAPPING_PATH    = os.path.join(BASE_DIR, "product_store_data.csv")   # Store_ID,Store_Name,Product_ID,Product_Name
PRICE_DATA_PATH = os.path.join(BASE_DIR, "Demand_data.csv")          # year,current_price,product_id,store_id

# ── Step 1: Load main dataset ─────────────────────────────────
DF = pd.read_csv(DATASET_PATH)
print("First 10 Rows:")
print(DF.head(10))
print("\nLast 10 Rows:")
print(DF.tail(10))

# FIX: Sirf ye 9 features (Temperature/Rainfall ko ignore karo)
features = [
    'Product_ID',
    'Store_ID',
    'Price',
    'Promotion',
    'Holiday',
    'Inventory_Level',
    'Past_Sales',
    'Customer_Visits',
    'Month'
]

X = DF[features]
y = DF['Sales']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.4, random_state=42
)

# ── Step 2: Train models ──────────────────────────────────────
LR_Model = LinearRegression()
LR_Model.fit(X_train, y_train)
LR_pred = LR_Model.predict(X_test)
LR_mae  = mean_absolute_error(y_test, LR_pred)
print(f"\nLinear Regression MAE: {LR_mae:.2f}")

RF_model = RandomForestRegressor(n_estimators=100, random_state=42)
RF_model.fit(X_train, y_train)
RF_pred = RF_model.predict(X_test)
RF_mae  = mean_absolute_error(y_test, RF_pred)
print(f"Random Forest MAE:     {RF_mae:.2f}")

if RF_mae < LR_mae:
    best_model = RF_model
    print("Best Model: Random Forest")
else:
    best_model = LR_Model
    print("Best Model: Linear Regression")

# ── Step 3: Product & Store mapping ──────────────────────────
# FIX: product_store_data.csv use karo (Store_ID, Store_Name, Product_ID, Product_Name)
ps_data = pd.read_csv(MAPPING_PATH)

product_map = dict(zip(
    ps_data['Product_Name'].str.lower().str.strip(),
    ps_data['Product_ID']
))
store_map = dict(zip(
    ps_data['Store_Name'].str.lower().str.strip(),
    ps_data['Store_ID']
))

print("\nAvailable Products:", sorted(product_map.keys()))
print("Available Stores:  ", sorted(store_map.keys()))

month_map = {
    "january":1, "february":2, "march":3,    "april":4,
    "may":5,     "june":6,     "july":7,      "august":8,
    "september":9,"october":10,"november":11, "december":12
}

# ── Step 4: User Input ────────────────────────────────────────
print("\n" + "="*50)
product_name = input("Enter Product Name: ").strip().lower()
store_name   = input("Enter Store Name:   ").strip().lower()

product_id = product_map.get(product_name)
store_id   = store_map.get(store_name)

if product_id is None:
    print(f"WARNING: '{product_name}' not found in dataset. Using ID=1 as default.")
    product_id = 1
if store_id is None:
    print(f"WARNING: '{store_name}' not found in dataset. Using ID=1 as default.")
    store_id = 1

price      = float(input("Price (₹): "))
promotion  = 1 if input("Promotion? (yes/no): ").strip().lower() == "yes" else 0
holiday    = 1 if input("Holiday?   (yes/no): ").strip().lower() == "yes" else 0
stock      = int(input("Stock Available: "))
past_sales = int(input("Past Sales: "))
visits     = int(input("Customer Visits: "))
month_name = input("Month Name: ").strip().lower()
month      = month_map.get(month_name, 1)

# ── Step 5: Demand Prediction ─────────────────────────────────
new_data = pd.DataFrame({
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

print("\nInput Data:")
print(new_data)

predicted_demand = best_model.predict(new_data)
pred_rounded     = round(predicted_demand[0])
print(f"\nDemand Of The Product: {pred_rounded} Units")

# ── Step 6: Future Price Prediction ──────────────────────────
# FIX: Demand_data.csv has: year, current_price, product_id, store_id
dd = pd.read_csv(PRICE_DATA_PATH)

X_price  = pd.DataFrame({'Year': dd['year']})
y_price  = dd['current_price']

price_model = LinearRegression()
price_model.fit(X_price, y_price)

years_ahead  = int(input("\nEnter years in future: "))
current_year = datetime.now().year
future_year  = current_year + years_ahead

future_df    = pd.DataFrame({'Year': [future_year]})
future_price = price_model.predict(future_df)[0]

increase = future_price - price
percent  = (increase / price) * 100

print(f"\n{'='*50}")
print(f"Estimated Price after {years_ahead} years = ₹{round(future_price, 2)}")
print(f"Price Increase                          = ₹{round(increase, 2)}")
print(f"Increase Probability Indicator          = {round(percent, 2)}%")
print(f"Predicted Demand                        = {pred_rounded} Units")

# ── Step 7: Summary Table ─────────────────────────────────────
Table1 = pd.DataFrame({
    'Product_Name':       [product_name],
    'Store_Name':         [store_name],
    'Year':               [future_year],
    'Future_Price':       [round(future_price, 2)],
    'Increase_Amount':    [round(increase, 2)],
    'Percentage_Increase':[round(percent, 2)],
    'Predicted_Demand':   [pred_rounded]
})
print("\nSummary:")
print(Table1.to_string(index=False))
