# FinTech Fraud Detection & Provenance Dashboard

A full-stack, cloud-hosted enterprise application designed to ingest financial transaction data, detect suspicious activity using rule-based algorithms, and provide an interactive workspace for fraud analysts.

## 🚀 Live Demo
* **Frontend:** https://fintech-fraud-dashboard.vercel.app/
* **Backend API:** https://fintech-fraud-dashboard.onrender.com

## ✨ Key Features
* **Role-Based Access Control (RBAC):** Secure authentication powered by Clerk, featuring tailored views for Admins, Analysts, Customer Support, and Customers.
* **Automated Data Ingestion & Archiving:** Upload raw transaction CSVs directly to the cloud, with automatic, immutable backups to **AWS S3**.
* **Explainable Anomaly Detection:** Transactions are scored based on risk thresholds (e.g., rapid velocity, high amounts, shared devices). Flagged alerts include specific, human-readable reasons.
* **Analyst Workspace & Audit Trails:** Analysts can review cases, add investigative notes, and update statuses (True Fraud / Not Fraud). All actions are permanently recorded in an immutable PostgreSQL audit log.
* **Interactive Analytics:** Real-time metrics and data visualizations (built with Recharts) tracking fraud distribution, high-risk cases, and total value at risk.
* **Master Transaction Ledger:** A fully searchable, paginated database view of all historical system transactions.

## 🛠️ Technology Stack
**Frontend (Vercel)**
* React.js (Vite)
* Tailwind CSS (Styling)
* Recharts (Data Visualization)
* Clerk (Authentication & RBAC)

**Backend (Render)**
* FastAPI (Python)
* Pandas (Data Processing)
* Boto3 (AWS S3 Integration)

**Database & Cloud**
* Neon (Managed Serverless PostgreSQL)
* AWS S3 (Raw Data Archiving)

## 🏗️ Architecture & Data Flow
1. **Ingestion:** User uploads a CSV via the React frontend.
2. **Archival:** FastAPI intercepts the file and securely archives a raw copy to an AWS S3 bucket.
3. **Processing:** Pandas parses the CSV and pushes relationships (Sender, Receiver, Device, IP) to the Postgres database.
4. **Analysis:** The Rules Engine evaluates the data and generates a `risk_score`.
5. **Action:** High-risk transactions trigger alerts, which are surfaced in real-time to the Analyst Dashboard for review.

## 📸 System Walkthrough

### 1. Analyst Dashboard & Alert Management
Real-time tracking of systemic risk, total alerts, and value at risk. Analysts can review AI-flagged transactions, read specific rule-violation reasons, and add investigative notes before classifying a case as True Fraud.
<img width="1920" height="1080" alt="dashboard1" src="https://github.com/user-attachments/assets/845369d4-bcf2-436c-be4c-66ad6be67ed7" />

<img width="1920" height="1080" alt="dashboard2" src="https://github.com/user-attachments/assets/f44ccfef-2ebb-4abd-8f23-d878a73f1265" />

### 2. Transaction Provenance Graph
A visual node-network representation of transaction flows. This allows analysts to untangle complex fraud rings, circular money movements, and shared-device anomalies that traditional tables miss.
<img width="1920" height="1080" alt="graph" src="https://github.com/user-attachments/assets/fbec2899-6354-4e7b-9fad-58303c2d31b8" />

### 3. Master Transaction Ledger
A fully searchable, paginated, and secure database view of all historical system transactions, allowing Customer Support and Admins to quickly locate specific Account IDs or IPs.
<img width="1920" height="1080" alt="ledger" src="https://github.com/user-attachments/assets/77bf7b43-2f2b-4ebc-9412-5e0f265e5853" />

### 4. Automated Cloud Archival (AWS S3)
Raw financial data is automatically and immutably backed up to an Amazon S3 bucket upon ingestion, ensuring compliance and data resilience before the rules engine even touches the information.
<img width="1920" height="1080" alt="awsS3" src="https://github.com/user-attachments/assets/bcabd32e-8f01-4b8d-8589-d9740ea3847b" />


## 👨‍💻 Author
**Balendhu S Ajay (BSA)**
*M.Tech in Artificial Intelligence & Data Science* | *IIT Dhanbad*

---
*Developed as a comprehensive demonstration of full-stack cloud engineering, database modeling, and secure API design.*
