# FinTech Fraud Detection & Provenance Dashboard

A full-stack, cloud-hosted enterprise application designed to ingest financial transaction data, detect suspicious activity using rule-based algorithms, and provide an interactive workspace for fraud analysts.

## 🚀 Live Demo
* **Frontend:** [Insert your Vercel URL here]
* **Backend API:** [Insert your Render URL here]

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

## 👨‍💻 Author
**Balendhu S Ajay (BSA)**
*M.Tech in Artificial Intelligence & Data Science* | *IIT Dhanbad*

---
*Developed as a comprehensive demonstration of full-stack cloud engineering, database modeling, and secure API design.*