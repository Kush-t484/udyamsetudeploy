-- UdyamSetu AI PostgreSQL Schema

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(30) NOT NULL DEFAULT 'INDUSTRY', -- INDUSTRY, OFFICER, ADMIN
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    gstin VARCHAR(50),
    pan VARCHAR(50),
    industry VARCHAR(100) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    business_type VARCHAR(100),
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    address TEXT,
    pincode VARCHAR(10),
    investment_amount NUMERIC(15, 2) DEFAULT 0.00,
    annual_turnover NUMERIC(15, 2) DEFAULT 0.00,
    employees INTEGER DEFAULT 0,
    land_area NUMERIC(12, 2) DEFAULT 0.00, -- sq meters
    power_requirement NUMERIC(10, 2) DEFAULT 0.00, -- HP/kW
    production_capacity TEXT,
    pollution_category VARCHAR(50) DEFAULT 'Green', -- Red, Orange, Green, White
    water_consumption NUMERIC(10, 2) DEFAULT 0.00, -- KLD
    hazardous_materials BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_company (
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    company_id VARCHAR(36) REFERENCES companies(id) ON DELETE CASCADE,
    role_in_company VARCHAR(50) DEFAULT 'OWNER',
    PRIMARY KEY (user_id, company_id)
);

CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    state VARCHAR(100) DEFAULT 'Chhattisgarh',
    contact_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS approvals (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- BUSINESS, FACTORY, ENVIRONMENT, LABOUR, FIRE, LOCAL_AUTHORITY, SAFETY, TAX, OTHER
    department_id VARCHAR(36) REFERENCES departments(id) ON DELETE SET NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- CRITICAL, HIGH, MEDIUM, LOW
    estimated_processing_days INTEGER DEFAULT 15,
    application_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS approval_requirements (
    id VARCHAR(36) PRIMARY KEY,
    approval_id VARCHAR(36) REFERENCES approvals(id) ON DELETE CASCADE,
    requirement_type VARCHAR(100),
    description TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS approval_documents (
    id VARCHAR(36) PRIMARY KEY,
    approval_id VARCHAR(36) REFERENCES approvals(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    description TEXT,
    mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(36) PRIMARY KEY,
    application_number VARCHAR(50) UNIQUE NOT NULL,
    company_id VARCHAR(36) REFERENCES companies(id) ON DELETE CASCADE,
    approval_id VARCHAR(36) REFERENCES approvals(id) ON DELETE CASCADE,
    assigned_officer_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, DOCUMENT_VERIFICATION, UNDER_REVIEW, INSPECTION, ADDITIONAL_DOCUMENTS, APPROVED, REJECTED
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    submitted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expected_completion_date TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS application_status_history (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) REFERENCES applications(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) REFERENCES companies(id) ON DELETE CASCADE,
    application_id VARCHAR(36) REFERENCES applications(id) ON DELETE SET NULL,
    uploaded_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    document_type VARCHAR(100) DEFAULT 'General', -- Business, Tax, Land, Environment, Labour, Safety, Financial, Other
    verification_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED, EXPIRED
    expiry_date TIMESTAMP WITH TIME ZONE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    remarks TEXT
);

CREATE TABLE IF NOT EXISTS compliance_requirements (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    department_id VARCHAR(36) REFERENCES departments(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL, -- Environment, Labour, Tax, Safety, Factory, Local
    frequency VARCHAR(50) NOT NULL, -- Monthly, Quarterly, Bi-Annually, Annually, One-time
    applicable_industry VARCHAR(100) DEFAULT 'All',
    risk_level VARCHAR(20) DEFAULT 'MEDIUM', -- HIGH, MEDIUM, LOW
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_records (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) REFERENCES companies(id) ON DELETE CASCADE,
    requirement_id VARCHAR(36) REFERENCES compliance_requirements(id) ON DELETE CASCADE,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLETED, DUE_SOON, OVERDUE, EXEMPTED
    risk_points INTEGER DEFAULT 10,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schemes (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(150),
    description TEXT,
    sector VARCHAR(100) DEFAULT 'All',
    state VARCHAR(100) DEFAULT 'All',
    benefits TEXT,
    eligibility_description TEXT,
    application_process TEXT,
    application_url TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scheme_eligibility_rules (
    id VARCHAR(36) PRIMARY KEY,
    scheme_id VARCHAR(36) REFERENCES schemes(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL, -- industry, state, investment_amount, employees, etc.
    operator VARCHAR(20) DEFAULT '=', -- =, >=, <=, IN, LIKE, CONTAINS
    value TEXT NOT NULL,
    weight INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saved_schemes (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    scheme_id VARCHAR(36) REFERENCES schemes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, scheme_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- APPROVAL_UPDATE, DOCUMENT_REQUEST, DOCUMENT_EXPIRY, COMPLIANCE_DUE, COMPLIANCE_OVERDUE, NEW_SCHEME, SYSTEM
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    metadata TEXT, -- JSON formatted metadata string
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_conversations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) REFERENCES ai_conversations(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL, -- user, assistant
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_appnum ON applications(application_number);
CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_compliance_company ON compliance_records(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
