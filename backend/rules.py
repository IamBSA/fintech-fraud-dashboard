import joblib
import os
import warnings

# Suppress some noisy scikit-learn warnings
warnings.filterwarnings("ignore", category=UserWarning)

# Load the AI model into memory when the server starts
MODEL_PATH = "fraud_model.joblib"
ml_model = None
if os.path.exists(MODEL_PATH):
    ml_model = joblib.load(MODEL_PATH)

def evaluate_transaction_rules(amount: float, device_id: str):
    """
    Combined Layer 1 (Rules) & Layer 2 (ML)
    """
    risk_score = 0
    reasons = []

    # ---------------------------------------------------------
    # LAYER 1: DETERMINISTIC RULES
    # ---------------------------------------------------------
    if amount > 1000:
        risk_score += 40
        reasons.append(f"Rule: Unusually high transaction amount (${amount})")

    suspicious_devices = ["DEV_D", "DEV_X"] 
    if device_id in suspicious_devices:
        risk_score += 30
        reasons.append(f"Rule: Device ID ({device_id}) flagged for suspicious activity")

    # ---------------------------------------------------------
    # LAYER 2: MACHINE LEARNING (ISOLATION FOREST)
    # ---------------------------------------------------------
    if ml_model is not None:
        # The model expects a 2D array: [[feature1, feature2]]
        # predict() returns 1 for normal, -1 for anomaly
        prediction = ml_model.predict([[amount]])[0]
        
        if prediction == -1:
            risk_score += 30
            reasons.append("AI: Amount deviates significantly from historical customer baseline")

    # Cap the maximum risk score at 100
    risk_score = min(risk_score, 100)

    return risk_score, reasons