-- 1. Accounts Table (The "Nodes" in our graph)
CREATE TABLE accounts (
    account_id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    risk_level VARCHAR(20) DEFAULT 'Low' -- Low, Medium, High
);

-- 2. Transactions Table (The "Edges" connecting the nodes)
CREATE TABLE transactions (
    transaction_id VARCHAR(50) PRIMARY KEY,
    sender_id VARCHAR(50) REFERENCES accounts(account_id),
    receiver_id VARCHAR(50) REFERENCES accounts(account_id),
    amount DECIMAL(12, 2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_id VARCHAR(100),
    ip_address VARCHAR(45)
);

-- 3. Alerts / Fraud Cases Table
CREATE TABLE alerts (
    case_id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) REFERENCES transactions(transaction_id),
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, True Fraud, Not Fraud
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    reasons JSONB, -- Stores the explainability array e.g., ["Velocity Spike", "Device shared"]
    assigned_analyst VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Audit Logs Table (For compliance)
CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50),
    action VARCHAR(255),
    target_resource VARCHAR(100), -- e.g., "Alert #102"
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);