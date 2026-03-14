import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib

def train_isolation_forest():
    print("Generating historical transaction data...")
    # Generate 1,000 normal, boring transactions (average around $100)
    np.random.seed(42)
    normal_amounts = np.random.normal(loc=100, scale=40, size=1000)
    normal_amounts = np.clip(normal_amounts, 5, 400) # Keep them between $5 and $400

    df = pd.DataFrame({'amount': normal_amounts})

    print("Training the Isolation Forest AI...")
    # contamination=0.05 means we expect roughly 5% of future data to be anomalies
    model = IsolationForest(contamination=0.05, random_state=42)
    
    # Train the model purely on transaction amounts for now
    model.fit(df[['amount']])

    # Save the trained model to a file so our API can use it instantly
    joblib.dump(model, 'fraud_model.joblib')
    print("✅ ML Model trained and saved as 'fraud_model.joblib'!")

if __name__ == "__main__":
    train_isolation_forest()