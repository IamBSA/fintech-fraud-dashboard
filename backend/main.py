from pydantic import BaseModel

import random

from rules import evaluate_transaction_rules
import json

import os
import pandas as pd
import psycopg2
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import io

# Data model for updating an alert
class StatusUpdate(BaseModel):
    status: str
    user_id: str = "Analyst_1" # Hardcoded for now until we add real login

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

app = FastAPI(title="FinTech Fraud Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to get DB connection
def get_db_connection():
    try:
        return psycopg2.connect(DATABASE_URL)
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

@app.get("/")
def read_root():
    return {"message": "Welcome to the FinTech Fraud Detection API!"}

@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a CSV.")

    try:
        # Read the file content into a Pandas DataFrame
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Open database connection
        conn = get_db_connection()
        if not conn:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        cursor = conn.cursor()
        
        # Track how many records we insert
        accounts_inserted = 0
        transactions_inserted = 0

        # Process the DataFrame row by row
        # Process the DataFrame row by row
        for _, row in df.iterrows():
            tx_id = str(row['transaction_id'])
            sender = str(row['sender_id'])
            receiver = str(row['receiver_id'])
            amount = float(row['amount'])
            device = str(row['device_id'])
            ip = str(row['ip_address'])

            # 1. Insert SENDER Account
            cursor.execute("""
                INSERT INTO accounts (account_id, customer_name) 
                VALUES (%s, %s) ON CONFLICT (account_id) DO NOTHING;
            """, (sender, f"Customer_{sender}"))
            
            # 2. Insert RECEIVER Account
            cursor.execute("""
                INSERT INTO accounts (account_id, customer_name) 
                VALUES (%s, %s) ON CONFLICT (account_id) DO NOTHING;
            """, (receiver, f"Customer_{receiver}"))
            
            # 3. Insert the Transaction
            cursor.execute("""
                INSERT INTO transactions (transaction_id, sender_id, receiver_id, amount, device_id, ip_address)
                VALUES (%s, %s, %s, %s, %s, %s) ON CONFLICT (transaction_id) DO NOTHING;
            """, (tx_id, sender, receiver, amount, device, ip))
            
            transactions_inserted += 1

            # ---------------------------------------------------------
            # NEW: PHASE 3 - PASS THROUGH THE RULES ENGINE
            # ---------------------------------------------------------
            risk_score, reasons = evaluate_transaction_rules(amount, device)

            # If the transaction triggered any rules, create a Fraud Alert!
            if risk_score > 0:
                # Convert the reasons list to JSON for the database
                reasons_json = json.dumps(reasons)
                
                cursor.execute("""
                    INSERT INTO alerts (transaction_id, status, risk_score, reasons)
                    VALUES (%s, 'Pending', %s, %s);
                """, (tx_id, risk_score, reasons_json))
                print(f"⚠️ FRAUD ALERT CREATED: Transaction {tx_id} scored {risk_score}")

        # Commit all changes to the database
        conn.commit()
        cursor.close()
        conn.close()

        return {
            "status": "success", 
            "message": f"Successfully processed {transactions_inserted} transactions!"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    
@app.get("/api/alerts")
def get_alerts():
    """
    Fetches all fraud alerts and their associated transaction details
    to display on the frontend dashboard.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor()
        # Join the alerts table with the transactions table so the frontend
        # has everything it needs to draw the graph (sender, receiver, amount)
        cursor.execute("""
            SELECT a.case_id, a.transaction_id, a.status, a.risk_score, a.reasons,
                   t.amount, t.sender_id, t.receiver_id, t.device_id
            FROM alerts a
            JOIN transactions t ON a.transaction_id = t.transaction_id
            ORDER BY a.risk_score DESC, a.created_at DESC;
        """)
        
        # Convert the SQL results into a list of dictionaries (JSON)
        columns = [desc[0] for desc in cursor.description]
        alerts = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        return {"status": "success", "data": alerts}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching alerts: {str(e)}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

@app.get("/api/network")
def get_network_graph():
    """Returns all accounts as nodes and transactions as edges for React Flow."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor()
        
        # 1. Fetch Accounts (Nodes)
        cursor.execute("SELECT account_id FROM accounts")
        accounts = cursor.fetchall()
        
        nodes = []
        for row in accounts:
            nodes.append({
                "id": row[0],
                # Start them at random coordinates, we will drag them around!
                "position": {"x": random.randint(50, 600), "y": random.randint(50, 400)},
                "data": {"label": f"Account: {row[0]}"},
                "style": {
                    "backgroundColor": "#1f2937", 
                    "color": "#60a5fa", 
                    "border": "2px solid #3b82f6", 
                    "borderRadius": "8px", 
                    "padding": "10px",
                    "fontWeight": "bold"
                }
            })
            
        # 2. Fetch Transactions (Edges)
        cursor.execute("SELECT transaction_id, sender_id, receiver_id, amount FROM transactions")
        transactions = cursor.fetchall()
        
        edges = []
        for row in transactions:
            edges.append({
                "id": row[0],
                "source": row[1],
                "target": row[2],
                "label": f"${row[3]}",
                "animated": True, # Makes the transaction lines "flow"
                "style": {"stroke": "#f87171", "strokeWidth": 2},
                "labelStyle": {"fill": "#f87171", "fontWeight": 700}
            })
            
        return {"status": "success", "nodes": nodes, "edges": edges}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching network: {str(e)}")
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

@app.patch("/api/alerts/{case_id}")
def update_alert_status(case_id: int, data: StatusUpdate):
    """Updates an alert's status and logs the action for compliance."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        cursor = conn.cursor()

        # 1. Update the alert status
        cursor.execute("""
            UPDATE alerts 
            SET status = %s 
            WHERE case_id = %s;
        """, (data.status, case_id))

        # 2. Write to the immutable Audit Log
        action_text = f"Changed status to: {data.status}"
        cursor.execute("""
            INSERT INTO audit_logs (user_id, action, target_resource)
            VALUES (%s, %s, %s);
        """, (data.user_id, action_text, f"Case #{case_id}"))

        conn.commit()
        return {"status": "success", "message": f"Case {case_id} updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating alert: {str(e)}")
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()