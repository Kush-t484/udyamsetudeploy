# UdyamSetu AI (उद्यमसेतु AI)
> **Tagline**: One Platform. Every Approval. Smarter Compliance.  
> **Problem Statement**: Efficiency in streamlining industrial approvals, compliance processes, and access to government support services.

---

## 🚀 System Architecture Overview

UdyamSetu AI is an enterprise-grade digital platform designed for Smart India Hackathon (SIH). It unifies industrial clearance discovery, application workflow management, document verification, statutory compliance monitoring, government scheme matching, and AI-driven regulatory assistance into one integrated ecosystem.

```
+-----------------------------------------------------------------------+
|                           UDYAMSETU AI FRONTEND                       |
|           HTML5 | CSS3 (Grid/Flexbox/Vars) | Vanilla JS ES6+          |
|      (Single Page Application with Modular Components & Router)       |
+-----------------------------------------------------------------------+
                                   │  REST APIs (Fetch + JWT Bearer)
                                   ▼
+-----------------------------------------------------------------------+
|                          EXPRESS.JS BACKEND                           |
|       JWT Auth | RBAC | Multer | express-validator | Helmet | CORS    |
+-----------------------------------------------------------------------+
       │                     │                        │
       ▼                     ▼                        ▼
+--------------+   +-------------------+    +--------------------+
| POSTGRESQL   |   | AI SERVICE LAYER  |    | CORE ENGINES       |
| 18 Tables    |   | Context Builder   |    | • Approvals Rule   |
| Relational   |   | + Intent Engine / |    | • Risk Calculator  |
| Data Vault   |   | LLM API Abstraction|   | • Scheme Matcher   |
+--------------+   +-------------------+    +--------------------+
```

---

## ✨ Key Features & User Workflows

### 🏭 1. Industry User Workflow
- **Business Profile**: Configure enterprise investment, headcount, state, district, pollution category (Red/Orange/Green/White), and hazardous material usage.
- **Approval Discovery Engine**: Rule-based engine analyzing sector & capacity to recommend applicable approvals (CTE, CTO, Factory License, Fire NOC, Labour Registrations).
- **Application Workflow & Tracking**: Submit applications (`APP-2026-XXXX`), upload required documents, and track real-time SLA completion dates.
- **Document Vault**: Upload blueprints, safety audits, and monitor expiry warnings (30-day warning, 7-day high alert, expired critical).
- **Compliance Health & Risk Score**: Dynamic score calculation (0–100) based on overdue returns (+40pts), upcoming deadlines (+25pts), and expired documents (+30pts).
- **Government Support Scheme Matcher**: Weighted scoring algorithm matching enterprise parameters against state and central subsidy rules (Capital Investment Subsidies, Interest Subvention, PLI Schemes).
- **Context-Aware AI Assistant**: Natural language Q&A drawing real context from company profile, active applications, and compliance obligations.

### 👮 2. Government Officer Workflow
- **Officer Review Console**: View assigned applications across departments (CECB, Directorate of Factories & Boilers, Fire Services, Labour, Commercial Tax).
- **Document Verification**: Inspect attached blueprints, verify or reject uploaded certificates, and add official remarks.
- **Status Workflow**: Transition applications cleanly: `DRAFT` ➔ `SUBMITTED` ➔ `DOCUMENT_VERIFICATION` ➔ `UNDER_REVIEW` ➔ `INSPECTION` ➔ `ADDITIONAL_DOCUMENTS` ➔ `APPROVED` / `REJECTED`.
- **SLA Delay Monitoring**: Track processing workloads and overdue SLA completion targets.

### 👑 3. Administrator Console
- **System Analytics**: Real-time KPI counters and distribution charts for applications, department workloads, and compliance risk levels.
- **Master Data Management**: System-wide oversight of users, companies, approval catalog, and scheme rules.
- **Audit Logs**: Immutable system audit trail capturing user logins, document uploads, status changes, and administrative actions.

---

## ⚡ Tech Stack & Technology Requirements

- **Frontend**: Pure HTML5, CSS3 (CSS Grid, Flexbox, CSS Variables), Modular Vanilla JavaScript ES6+. *No React, Angular, Vue, Tailwind, Bootstrap or jQuery used.*
- **Backend**: Node.js & Express.js RESTful API, bcryptjs password hashing, JWT authorization, Multer multipart upload handler, Helmet security, rate-limiting, centralized error handler.
- **Database**: PostgreSQL database schema with 18 normalized tables, foreign key constraints, indexes, and full SQL transaction support (`pg` / `pg-mem` dual database driver).
- **AI Integration**: Dual-mode AI service with context builder and intent-driven fallback response generator.

---

## 📊 Database Schema (18 Tables)

```sql
users                     -- User credentials, roles (INDUSTRY, OFFICER, ADMIN)
companies                 -- Industrial enterprise profile, investment, pollution category
user_company              -- Junction table connecting users to enterprise
departments               -- State government regulatory departments
approvals                 -- Catalog of industrial approvals and clearances
approval_requirements     -- Regulatory requirements for each approval
approval_documents        -- Mandatory document definitions for approvals
applications              -- Application tracking records and SLA targets
application_status_history-- Audit trail of application workflow status changes
documents                 -- Document vault metadata, verification & expiry dates
compliance_requirements   -- Statutory compliance obligation definitions
compliance_records        -- Enterprise compliance status, due dates & risk points
schemes                   -- Government support schemes and subsidy catalog
scheme_eligibility_rules  -- Weighted rule definitions for scheme matching
saved_schemes             -- User bookmarked schemes
notifications             -- Real-time user notification messages
audit_logs                -- System security audit logs
ai_conversations / messages-- AI assistant chat logs
```

---

## 🛠️ Setup & Installation Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Optional; built-in automatic fallback engine `pg-mem` allows out-of-the-box running without manual PostgreSQL daemon setup!)

### 1. Clone & Install Dependencies
```bash
cd udyamsetu-ai
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root (copied from `.env.example`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/udyamsetu
JWT_SECRET=udyamsetu_ai_super_secret_jwt_key_2026_sih
JWT_EXPIRES_IN=7d
AI_API_KEY=
UPLOAD_DIR=./uploads
```

### 3. Initialize Database (For External PostgreSQL)
If using an external PostgreSQL instance:
```bash
psql -U postgres -d udyamsetu -f database/schema.sql
psql -U postgres -d udyamsetu -f database/seed.sql
```

### 4. Start Application
```bash
npm start
```
Access the application in your web browser at:  
👉 **`http://localhost:5000`**

---

## 🔑 Demo Credentials (Judge Demo Accounts)

| Role | Email | Password | Quick Switcher |
| :--- | :--- | :--- | :--- |
| **Industry User** | `industry@demo.com` | `demo123` | Topbar Select ➔ "Industry User" |
| **Government Officer** | `officer@demo.com` | `demo123` | Topbar Select ➔ "Government Officer" |
| **Administrator** | `admin@demo.com` | `demo123` | Topbar Select ➔ "Administrator" |

---

## 🧪 End-to-End Judge Test Walkthrough

1. Open `http://localhost:5000` in your browser.
2. Login as **`industry@demo.com`** (`demo123`).
3. Navigate to **Find Approvals** and click **Analyze Requirements** with manufacturing parameters. Verify backend recommended clearance roadmap.
4. Click **Create Application** for Factory License. Note down the generated application number (e.g., `APP-2026-XXXX`).
5. Open the topbar **Demo Role Switcher** and select **Government Officer**. Notice instant session re-authentication as Officer `officer@demo.com`.
6. Open the **Review Queue**, find the submitted application, review attached documents, add official remarks, and change status to `UNDER_REVIEW`.
7. Switch back to **Industry User**. Check the **Notification Center** to see real-time alert: *"Your application has moved to Under Review"*.
8. Open **Compliance Obligations** and click **Run Compliance Check Engine** to calculate the live Compliance Health Index.
9. Open **Government Support Schemes**, click **Check My Eligibility**, and view weighted subsidy match scores.
10. Open **AI Assistant** and query *"What approvals are required for my manufacturing plant?"*. Inspect contextual response.
11. Switch to **Administrator** and inspect live platform analytics and **System Audit Logs**.

---

## ⚖️ Information & Legal Disclaimer

> *UdyamSetu AI provides technology-assisted guidance and workflow management. Approval applicability, eligibility and compliance obligations should be verified with the relevant competent authority.*
#   u d y a m s e t u - a i  
 