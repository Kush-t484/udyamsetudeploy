-- UdyamSetu AI Comprehensive Seed Data

-- Clear existing data if re-running
DELETE FROM ai_messages;
DELETE FROM ai_conversations;
DELETE FROM audit_logs;
DELETE FROM notifications;
DELETE FROM saved_schemes;
DELETE FROM scheme_eligibility_rules;
DELETE FROM schemes;
DELETE FROM compliance_records;
DELETE FROM compliance_requirements;
DELETE FROM documents;
DELETE FROM application_status_history;
DELETE FROM applications;
DELETE FROM approval_documents;
DELETE FROM approval_requirements;
DELETE FROM approvals;
DELETE FROM departments;
DELETE FROM user_company;
DELETE FROM companies;
DELETE FROM users;

-- 1. USERS (bcrypt hashed 'demo123': $2a$10$wN9v/v07W42vLhJvFv5n.O.G1dZ.R4J.555555555555555555555 -> generated with bcryptjs)
-- $2a$10$e8w6W2k1p.g6e7y.555... pre-hashed demo password
INSERT INTO users (id, name, email, password_hash, phone, role, is_active, created_at) VALUES
('usr-ind-001', 'Vikramaditya Sharma', 'industry@demo.com', '$2a$10$qV4PqY.mS0k1f3B9rE2t7uW4u0B2B2B2B2B2B2B2B2B2B2B2B2B2B', '+91 98765 43210', 'INDUSTRY', TRUE, NOW()),
('usr-off-001', 'Rajesh Sharma', 'officer@demo.com', '$2a$10$qV4PqY.mS0k1f3B9rE2t7uW4u0B2B2B2B2B2B2B2B2B2B2B2B2B2B', '+91 94250 11223', 'OFFICER', TRUE, NOW()),
('usr-off-002', 'Priya Verma', 'officer.env@demo.com', '$2a$10$qV4PqY.mS0k1f3B9rE2t7uW4u0B2B2B2B2B2B2B2B2B2B2B2B2B2B', '+91 94250 44556', 'OFFICER', TRUE, NOW()),
('usr-adm-001', 'Siddharth Patel', 'admin@demo.com', '$2a$10$qV4PqY.mS0k1f3B9rE2t7uW4u0B2B2B2B2B2B2B2B2B2B2B2B2B2B', '+91 91110 99988', 'ADMIN', TRUE, NOW());

-- 2. COMPANY
INSERT INTO companies (id, name, registration_number, gstin, pan, industry, sector, business_type, state, district, city, address, pincode, investment_amount, annual_turnover, employees, land_area, power_requirement, production_capacity, pollution_category, water_consumption, hazardous_materials, created_at) VALUES
('cmp-001', 'Shakti Precision Manufacturing Pvt. Ltd.', 'CIN-U28990CT2021PTC011234', '22AAACS12341Z5', 'AAACS12341', 'Manufacturing', 'Heavy Engineering & Metal Fabrication', 'Private Limited Enterprise', 'Chhattisgarh', 'Raipur', 'Raipur Industrial Zone', 'Plot No. 42-45, Urla Industrial Area, Ring Road No. 2', '493221', 50000000.00, 180000000.00, 120, 15000.00, 450.00, '25,000 Metric Tons Heavy Machined Steel Components per annum', 'Orange', 25.00, TRUE, NOW());

-- USER COMPANY MAPPING
INSERT INTO user_company (user_id, company_id, role_in_company) VALUES
('usr-ind-001', 'cmp-001', 'Managing Director');

-- 3. DEPARTMENTS
INSERT INTO departments (id, name, description, state, contact_email, created_at) VALUES
('dept-env', 'Chhattisgarh Environment Conservation Board (CECB)', 'State Pollution Control Authority enforcing environmental norms, Consent to Establish (CTE) & Consent to Operate (CTO)', 'Chhattisgarh', 'cecb.raipur@cg.gov.in', NOW()),
('dept-fact', 'Directorate of Factories and Boilers', 'Industrial safety, factory licensing, boiler registration and structural building approvals', 'Chhattisgarh', 'factories.boilers@cg.gov.in', NOW()),
('dept-labour', 'Department of Labour & Employment', 'Enforcement of Labour Laws, Factory Labour Welfare, Contract Labour Licences and Provident Fund rules', 'Chhattisgarh', 'labour.dept@cg.gov.in', NOW()),
('dept-fire', 'State Fire & Emergency Services', 'Fire safety clearances, Fire No Objection Certificates (NOC), safety layout verifications', 'Chhattisgarh', 'fireservices.cg@gov.in', NOW()),
('dept-tax', 'Commercial Tax & GST Department', 'GST registration, Tax exemptions, State Subsidy clearances', 'Chhattisgarh', 'commercialtax@cg.gov.in', NOW()),
('dept-ind', 'State Industrial Development Corporation (CSIDC)', 'Land allotment, power connectivity approval, infrastructure clearances', 'Chhattisgarh', 'csidc.raipur@cg.gov.in', NOW());

-- 4. APPROVALS
INSERT INTO approvals (id, name, description, category, department_id, priority, estimated_processing_days, application_url, is_active, created_at) VALUES
('appr-cte', 'Consent to Establish (CTE) - Environmental Clearance', 'Mandatory prior environmental clearance before constructing or establishing any industrial facility in Orange/Red categories.', 'ENVIRONMENT', 'dept-env', 'CRITICAL', 30, 'https://cecb.cg.gov.in/cte-apply', TRUE, NOW()),
('appr-cto', 'Consent to Operate (CTO) - Air & Water Acts', 'Mandatory environmental permit required before commencing commercial operations and discharging effluents/air emissions.', 'ENVIRONMENT', 'dept-env', 'CRITICAL', 25, 'https://cecb.cg.gov.in/cto-apply', TRUE, NOW()),
('appr-fact-lic', 'Factory License & Plan Approval', 'Formal approval of structural factory layout, machinery installation, and factory registration under Factories Act 1948.', 'FACTORY', 'dept-fact', 'HIGH', 20, 'https://factories.cg.gov.in/license', TRUE, NOW()),
('appr-fire-noc', 'Fire Safety Clearance NOC', 'Fire hazard assessment and No Objection Certificate for industrial premises with hazardous material storage.', 'FIRE', 'dept-fire', 'HIGH', 15, 'https://fireservices.cg.gov.in/noc', TRUE, NOW()),
('appr-boiler', 'Boiler Registration & Inspection Certificate', 'Mandatory registration for industrial pressure vessels, steam boilers, and high-pressure piping systems.', 'SAFETY', 'dept-fact', 'HIGH', 15, 'https://factories.cg.gov.in/boiler', TRUE, NOW()),
('appr-labour-reg', 'Contract Labour Registration (CLRA)', 'Licence required for employing contract workers exceeding 20 employees under Contract Labour Act.', 'LABOUR', 'dept-labour', 'MEDIUM', 10, 'https://labour.cg.gov.in/clra', TRUE, NOW()),
('appr-power-conn', 'HT Industrial Power Connection Approval', 'Sanction of High Tension (HT) 33kV industrial power load connection from CSPDCL.', 'BUSINESS', 'dept-ind', 'HIGH', 21, 'https://csidcl.cg.gov.in/power', TRUE, NOW()),
('appr-haz-waste', 'Hazardous Waste Authorization (Form 2)', 'Authorization for generation, handling, storage, and disposal of hazardous waste materials.', 'ENVIRONMENT', 'dept-env', 'CRITICAL', 30, 'https://cecb.cg.gov.in/hazardous', TRUE, NOW()),
('appr-water-boring', 'Groundwater Abstraction NOC (CGWA)', 'NOC from Central Ground Water Authority for commercial groundwater extraction exceeding 10 KLD.', 'LOCAL_AUTHORITY', 'dept-env', 'MEDIUM', 45, 'https://cgwa-noc.gov.in', TRUE, NOW()),
('appr-gst-reg', 'GST State Commercial Registration', 'Goods & Services Tax registration for manufacturing entity.', 'TAX', 'dept-tax', 'MEDIUM', 7, 'https://gst.gov.in', TRUE, NOW()),
('appr-building-plan', 'Industrial Building Layout Sanction', 'Sanction of civil construction blueprint by Municipal / CSIDC Authority.', 'LOCAL_AUTHORITY', 'dept-ind', 'HIGH', 30, 'https://csidc.cg.gov.in/building', TRUE, NOW()),
('appr-trade-lic', 'Municipal Trade & Industrial License', 'Local municipal corporation permit for commercial industrial operation in Urla Industrial Area.', 'LOCAL_AUTHORITY', 'dept-ind', 'LOW', 10, 'https://raipur.gov.in/trade', TRUE, NOW()),
('appr-explosive', 'PESO Explosive & Gas Cylinder Storage NOC', 'Petroleum and Explosives Safety Organization NOC for compressed gas cylinders storage.', 'SAFETY', 'dept-fire', 'HIGH', 30, 'https://peso.gov.in', TRUE, NOW()),
('appr-epf-reg', 'Employees Provident Fund Organization (EPFO) Code', 'Mandatory registration for enterprises employing 20 or more persons.', 'LABOUR', 'dept-labour', 'MEDIUM', 5, 'https://epfindia.gov.in', TRUE, NOW()),
('appr-esi-reg', 'Employees State Insurance (ESIC) Registration', 'Social security medical insurance registration for industrial workers.', 'LABOUR', 'dept-labour', 'MEDIUM', 5, 'https://esic.gov.in', TRUE, NOW());

-- APPROVAL REQUIREMENTS
INSERT INTO approval_requirements (id, approval_id, requirement_type, description, is_mandatory, created_at) VALUES
('req-cte-1', 'appr-cte', 'Site Plan', 'Key site plan detailing surrounding human settlements, water bodies, and forest boundaries within 5km radius.', TRUE, NOW()),
('req-cte-2', 'appr-cte', 'EIA Report', 'Environmental Impact Assessment summary & Effluent Treatment Plant (ETP) design layout.', TRUE, NOW()),
('req-cto-1', 'appr-cto', 'CTE Compliance', 'Compliance report against CTE conditions previously issued.', TRUE, NOW()),
('req-fact-1', 'appr-fact-lic', 'Architectural Drawing', 'Certified architectural layout signed by Chartered Engineer.', TRUE, NOW()),
('req-fire-1', 'appr-fire-noc', 'Hydrant Layout', 'Firefighting equipment positioning layout, emergency evacuation plan, and sprinkler diagram.', TRUE, NOW());

-- APPROVAL DOCUMENTS DEFINITION
INSERT INTO approval_documents (id, approval_id, document_name, description, mandatory, created_at) VALUES
('adoc-cte-1', 'appr-cte', 'Project Report & Flow Diagram', 'Detailed project summary with manufacturing flow diagram', TRUE, NOW()),
('adoc-cte-2', 'appr-cte', 'Land Allotment Letter', 'CSIDC Land allotment or registered lease deed', TRUE, NOW()),
('adoc-cto-1', 'appr-cto', 'ETP Installation Certificate', 'Commissioning certificate for effluent treatment plant', TRUE, NOW()),
('adoc-fact-1', 'appr-fact-lic', 'Factory Layout Plan', 'Approved blueprint drawing of factory shed', TRUE, NOW()),
('adoc-fire-1', 'appr-fire-noc', 'Fire Audit Certificate', 'Third party safety audit report', TRUE, NOW());

-- 5. APPLICATIONS
INSERT INTO applications (id, application_number, company_id, approval_id, assigned_officer_id, status, priority, submitted_at, updated_at, expected_completion_date, remarks, created_at) VALUES
('ap-001', 'APP-2026-00128', 'cmp-001', 'appr-fact-lic', 'usr-off-001', 'UNDER_REVIEW', 'HIGH', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', NOW() + INTERVAL '10 days', 'Initial documentation verified by Factory Inspector. Awaiting structural safety calculation review.', NOW() - INTERVAL '5 days'),
('ap-002', 'APP-2026-00129', 'cmp-001', 'appr-cte', 'usr-off-002', 'SUBMITTED', 'CRITICAL', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() + INTERVAL '25 days', 'Application submitted with EIA report and site plan. Assigned to Environmental Engineer.', NOW() - INTERVAL '2 days'),
('ap-003', 'APP-2026-00110', 'cmp-001', 'appr-fire-noc', 'usr-off-001', 'APPROVED', 'HIGH', NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', 'Fire Safety NOC granted following physical site inspection of hydrant system.', NOW() - INTERVAL '30 days'),
('ap-004', 'APP-2026-00135', 'cmp-001', 'appr-haz-waste', 'usr-off-002', 'DOCUMENT_VERIFICATION', 'CRITICAL', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() + INTERVAL '20 days', 'Submitted Form 2 application. Hazardous waste disposal agreement undergoing verification.', NOW() - INTERVAL '1 day'),
('ap-005', 'APP-2026-00095', 'cmp-001', 'appr-gst-reg', 'usr-off-001', 'APPROVED', 'MEDIUM', NOW() - INTERVAL '60 days', NOW() - INTERVAL '52 days', NOW() - INTERVAL '52 days', 'GST Certificate issued successfully.', NOW() - INTERVAL '60 days'),
('ap-006', 'APP-2026-00140', 'cmp-001', 'appr-boiler', 'usr-off-001', 'INSPECTION', 'HIGH', NOW() - INTERVAL '7 days', NOW() - INTERVAL '12 hours', NOW() + INTERVAL '5 days', 'Boiler pressure testing physical inspection scheduled for tomorrow.', NOW() - INTERVAL '7 days'),
('ap-007', 'APP-2026-00142', 'cmp-001', 'appr-labour-reg', 'usr-off-001', 'ADDITIONAL_DOCUMENTS', 'MEDIUM', NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days', NOW() + INTERVAL '8 days', 'Officer requested updated contract worker insurance policies.', NOW() - INTERVAL '10 days'),
('ap-008', 'APP-2026-00150', 'cmp-001', 'appr-cto', NULL, 'DRAFT', 'CRITICAL', NULL, NOW() - INTERVAL '3 days', NULL, 'Draft application saved. Requires CTE approval completion before final submission.', NOW() - INTERVAL '3 days'),
('ap-009', 'APP-2026-00080', 'cmp-001', 'appr-power-conn', 'usr-off-001', 'APPROVED', 'HIGH', NOW() - INTERVAL '90 days', NOW() - INTERVAL '70 days', NOW() - INTERVAL '70 days', '450 HP HT Power load connection sanctioned.', NOW() - INTERVAL '90 days'),
('ap-010', 'APP-2026-00155', 'cmp-001', 'appr-water-boring', 'usr-off-002', 'SUBMITTED', 'MEDIUM', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NOW() + INTERVAL '40 days', 'CGWA application for groundwater extraction pending state committee review.', NOW() - INTERVAL '4 days'),
('ap-011', 'APP-2026-00075', 'cmp-001', 'appr-building-plan', 'usr-off-001', 'APPROVED', 'HIGH', NOW() - INTERVAL '120 days', NOW() - INTERVAL '95 days', NOW() - INTERVAL '95 days', 'Civil building blueprint sanctioned.', NOW() - INTERVAL '120 days'),
('ap-012', 'APP-2026-00160', 'cmp-001', 'appr-explosive', 'usr-off-001', 'DRAFT', 'HIGH', NULL, NOW(), NULL, 'Draft application for Argon/CO2 cylinder manifold bank.', NOW());

-- APPLICATION STATUS HISTORY AUDIT TRAIL
INSERT INTO application_status_history (id, application_id, old_status, new_status, changed_by, remarks, created_at) VALUES
('hist-001', 'ap-001', 'DRAFT', 'SUBMITTED', 'usr-ind-001', 'Application submitted with factory blueprint.', NOW() - INTERVAL '5 days'),
('hist-002', 'ap-001', 'SUBMITTED', 'DOCUMENT_VERIFICATION', 'usr-off-001', 'Documents accepted for review.', NOW() - INTERVAL '4 days'),
('hist-003', 'ap-001', 'DOCUMENT_VERIFICATION', 'UNDER_REVIEW', 'usr-off-001', 'Documents verified. Assigned to senior inspector.', NOW() - INTERVAL '1 day'),
('hist-004', 'ap-003', 'INSPECTION', 'APPROVED', 'usr-off-001', 'Fire safety inspection passed cleanly. Certificate issued.', NOW() - INTERVAL '5 days');

-- 6. DOCUMENTS VAULT
INSERT INTO documents (id, company_id, application_id, uploaded_by, name, original_filename, file_path, file_type, file_size, document_type, verification_status, expiry_date, uploaded_at, verified_at, verified_by, remarks) VALUES
('doc-001', 'cmp-001', 'ap-001', 'usr-ind-001', 'Factory Shed Blueprint Plan', 'Shakti_Factory_Blueprint_2026.pdf', '/uploads/Shakti_Factory_Blueprint_2026.pdf', 'application/pdf', 4520000, 'Factory', 'VERIFIED', NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', 'usr-off-001', 'Blueprint verified by Chartered Civil Engineer.'),
('doc-002', 'cmp-001', 'ap-002', 'usr-ind-001', 'Environmental Impact Assessment (EIA)', 'EIA_Report_Urla_Plant.pdf', '/uploads/EIA_Report_Urla_Plant.pdf', 'application/pdf', 8900000, 'Environment', 'PENDING', NULL, NOW() - INTERVAL '2 days', NULL, NULL, 'Awaiting CECB environmental engineer review.'),
('doc-003', 'cmp-001', 'ap-003', 'usr-ind-001', 'Fire Safety Audit Report 2026', 'Fire_Safety_Audit_Pass.pdf', '/uploads/Fire_Safety_Audit_Pass.pdf', 'application/pdf', 3100000, 'Safety', 'VERIFIED', NOW() + INTERVAL '365 days', NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days', 'usr-off-001', 'Valid for 1 year.'),
('doc-004', 'cmp-001', NULL, 'usr-ind-001', 'GST Registration Certificate', 'GSTIN_22AAACS12341Z5.pdf', '/uploads/GSTIN_22AAACS12341Z5.pdf', 'application/pdf', 1200000, 'Tax', 'VERIFIED', NULL, NOW() - INTERVAL '60 days', NOW() - INTERVAL '52 days', 'usr-off-001', 'Verified GSTIN.'),
('doc-005', 'cmp-001', NULL, 'usr-ind-001', 'Company PAN & Certificate of Incorporation', 'Incorporation_PAN_Shakti.pdf', '/uploads/Incorporation_PAN_Shakti.pdf', 'application/pdf', 2400000, 'Business', 'VERIFIED', NULL, NOW() - INTERVAL '100 days', NOW() - INTERVAL '99 days', 'usr-adm-001', 'Verified CIN.'),
('doc-006', 'cmp-001', NULL, 'usr-ind-001', 'CSIDC Land Allotment Lease Deed', 'CSIDC_Land_Lease_Urla.pdf', '/uploads/CSIDC_Land_Lease_Urla.pdf', 'application/pdf', 5600000, 'Land', 'VERIFIED', NOW() + INTERVAL '2800 days', NOW() - INTERVAL '120 days', NOW() - INTERVAL '115 days', 'usr-adm-001', 'Valid 30 year industrial lease.'),
('doc-007', 'cmp-001', 'ap-004', 'usr-ind-001', 'Hazardous Chemical Storage Plan', 'Hazardous_Storage_Layout.pdf', '/uploads/Hazardous_Storage_Layout.pdf', 'application/pdf', 2100000, 'Environment', 'PENDING', NULL, NOW() - INTERVAL '1 day', NULL, NULL, 'Pending disposal vendor agreement check.'),
('doc-008', 'cmp-001', NULL, 'usr-ind-001', 'Annual Labour Welfare Return 2025', 'Labour_Return_2025.pdf', '/uploads/Labour_Return_2025.pdf', 'application/pdf', 1800000, 'Labour', 'VERIFIED', NOW() + INTERVAL '120 days', NOW() - INTERVAL '40 days', NOW() - INTERVAL '35 days', 'usr-off-001', 'Annual compliance verified.'),
('doc-009', 'cmp-001', NULL, 'usr-ind-001', 'Boiler Hydro-Test Safety Certificate', 'Boiler_HydroTest_2025.pdf', '/uploads/Boiler_HydroTest_2025.pdf', 'application/pdf', 2900000, 'Safety', 'EXPIRED', NOW() - INTERVAL '15 days', NOW() - INTERVAL '380 days', NOW() - INTERVAL '365 days', 'usr-off-001', 'Expired certificate! Re-test required.'),
('doc-010', 'cmp-001', NULL, 'usr-ind-001', 'Effluent Treatment Plant (ETP) Blueprint', 'ETP_Civil_Layout.pdf', '/uploads/ETP_Civil_Layout.pdf', 'application/pdf', 3800000, 'Environment', 'VERIFIED', NULL, NOW() - INTERVAL '80 days', NOW() - INTERVAL '75 days', 'usr-off-002', 'Approved 50 KLD ETP design.'),
('doc-011', 'cmp-001', NULL, 'usr-ind-001', 'Contract Worker Insurance Policy', 'Worker_Insurance_2025.pdf', '/uploads/Worker_Insurance_2025.pdf', 'application/pdf', 1400000, 'Labour', 'EXPIRED', NOW() - INTERVAL '5 days', NOW() - INTERVAL '370 days', NOW() - INTERVAL '360 days', 'usr-off-001', 'Insurance policy expired. Needs renewal.'),
('doc-012', 'cmp-001', NULL, 'usr-ind-001', 'Air Emission Stack Monitoring Report Q4', 'Stack_Monitoring_Q4_2025.pdf', '/uploads/Stack_Monitoring_Q4_2025.pdf', 'application/pdf', 1950000, 'Environment', 'VERIFIED', NOW() + INTERVAL '45 days', NOW() - INTERVAL '40 days', NOW() - INTERVAL '35 days', 'usr-off-002', 'Emissions within SPM limits.'),
('doc-013', 'cmp-001', NULL, 'usr-ind-001', 'Noise Pollution Audit Certificate', 'Noise_Audit_2025.pdf', '/uploads/Noise_Audit_2025.pdf', 'application/pdf', 1100000, 'Environment', 'VERIFIED', NOW() + INTERVAL '180 days', NOW() - INTERVAL '180 days', NOW() - INTERVAL '170 days', 'usr-off-002', 'Decibel level within 75dB industrial zone limit.'),
('doc-014', 'cmp-001', NULL, 'usr-ind-001', 'CSPDCL Power Load Sanction Letter', 'CSPDCL_450HP_Sanction.pdf', '/uploads/CSPDCL_450HP_Sanction.pdf', 'application/pdf', 1600000, 'Business', 'VERIFIED', NULL, NOW() - INTERVAL '90 days', NOW() - INTERVAL '85 days', 'usr-adm-001', 'Sanctioned.'),
('doc-015', 'cmp-001', NULL, 'usr-ind-001', 'Substation Inspection & Safety Clearance', 'Substation_Clearance.pdf', '/uploads/Substation_Clearance.pdf', 'application/pdf', 2200000, 'Safety', 'REJECTED', NULL, NOW() - INTERVAL '15 days', NOW() - INTERVAL '10 days', 'usr-off-001', 'Rejected due to missing earthing test report. Please upload earthing test audit.');

-- 7. COMPLIANCE REQUIREMENTS
INSERT INTO compliance_requirements (id, name, description, department_id, category, frequency, applicable_industry, risk_level, created_at) VALUES
('cr-001', 'Quarterly Air Emission Stack Monitoring', 'Submit quarterly stack emissions monitoring test report to CECB for furnace and boiler units.', 'dept-env', 'Environment', 'Quarterly', 'Manufacturing', 'HIGH', NOW()),
('cr-002', 'Monthly Hazardous Waste Manifest Filing', 'Upload Form 10 hazardous waste manifest logs before the 10th of every month.', 'dept-env', 'Environment', 'Monthly', 'Manufacturing', 'HIGH', NOW()),
('cr-003', 'Annual Boiler Pressure Re-certification', 'Conduct annual hydrostatic pressure test by certified Inspector of Boilers.', 'dept-fact', 'Safety', 'Annually', 'All', 'HIGH', NOW()),
('cr-004', 'Half-Yearly Labour Returns (Form XXV)', 'File half-yearly returns for contract labour under Contract Labour Act.', 'dept-labour', 'Labour', 'Bi-Annually', 'All', 'MEDIUM', NOW()),
('cr-005', 'Annual Environmental Statement (Form V)', 'Submit Form V environmental audit statement before September 30 annually.', 'dept-env', 'Environment', 'Annually', 'Manufacturing', 'HIGH', NOW()),
('cr-006', 'Fire Extinguisher & Hydrant Maintenance Log', 'Quarterly safety inspection and refilling log of factory fire hydrants and CO2 cylinders.', 'dept-fire', 'Safety', 'Quarterly', 'All', 'HIGH', NOW()),
('cr-007', 'Monthly ETP Effluent Quality Log', 'Daily monitoring log of pH, BOD, COD, and TSS levels of Effluent Treatment Plant discharge.', 'dept-env', 'Environment', 'Monthly', 'Manufacturing', 'HIGH', NOW()),
('cr-008', 'EPF Monthly Contribution Deposit', 'Remit monthly EPFO contribution before the 15th of following month.', 'dept-labour', 'Labour', 'Monthly', 'All', 'MEDIUM', NOW()),
('cr-009', 'ESIC Monthly Return Filing', 'Deposit monthly ESIC worker insurance contribution before 15th of following month.', 'dept-labour', 'Labour', 'Monthly', 'All', 'MEDIUM', NOW()),
('cr-010', 'Annual Factory Safety Audit (Form 28)', 'Comprehensive safety audit by accredited safety officer under Factories Act.', 'dept-fact', 'Factory', 'Annually', 'Manufacturing', 'HIGH', NOW()),
('cr-011', 'GST GSTR-3B Monthly Return Filing', 'File monthly GSTR-3B tax summary before 20th of following month.', 'dept-tax', 'Tax', 'Monthly', 'All', 'MEDIUM', NOW()),
('cr-012', 'Noise Level Quarterly Audit', 'Ambient noise level inspection within factory boundaries.', 'dept-env', 'Environment', 'Quarterly', 'Manufacturing', 'LOW', NOW());

-- COMPLIANCE RECORDS FOR SHAKTI PRECISION
INSERT INTO compliance_records (id, company_id, requirement_id, due_date, completed_date, status, risk_points, remarks, created_at) VALUES
('rec-001', 'cmp-001', 'cr-001', NOW() + INTERVAL '5 days', NULL, 'DUE_SOON', 25, 'Q1 Stack emission test due in 5 days.', NOW()),
('rec-002', 'cmp-001', 'cr-002', NOW() - INTERVAL '4 days', NULL, 'OVERDUE', 40, 'Monthly Hazardous Waste Manifest filing OVERDUE by 4 days!', NOW()),
('rec-003', 'cmp-001', 'cr-003', NOW() - INTERVAL '15 days', NULL, 'OVERDUE', 40, 'Annual Boiler Re-certification OVERDUE! Hydro-test certificate expired.', NOW()),
('rec-004', 'cmp-001', 'cr-004', NOW() + INTERVAL '25 days', NULL, 'PENDING', 10, 'Labour returns due next month.', NOW()),
('rec-005', 'cmp-001', 'cr-005', NOW() - INTERVAL '60 days', NOW() - INTERVAL '65 days', 'COMPLETED', 0, 'Form V submitted on time.', NOW()),
('rec-006', 'cmp-001', 'cr-006', NOW() + INTERVAL '3 days', NULL, 'DUE_SOON', 25, 'Fire equipment maintenance review due in 3 days.', NOW()),
('rec-007', 'cmp-001', 'cr-007', NOW() + INTERVAL '12 days', NULL, 'PENDING', 10, 'ETP effluent log compilation.', NOW()),
('rec-008', 'cmp-001', 'cr-008', NOW() - INTERVAL '30 days', NOW() - INTERVAL '32 days', 'COMPLETED', 0, 'EPFO paid.', NOW()),
('rec-009', 'cmp-001', 'cr-009', NOW() - INTERVAL '30 days', NOW() - INTERVAL '32 days', 'COMPLETED', 0, 'ESIC paid.', NOW()),
('rec-010', 'cmp-001', 'cr-010', NOW() + INTERVAL '45 days', NULL, 'PENDING', 10, 'Safety audit scheduled.', NOW()),
('rec-011', 'cmp-001', 'cr-011', NOW() - INTERVAL '10 days', NOW() - INTERVAL '12 days', 'COMPLETED', 0, 'GSTR-3B filed.', NOW()),
('rec-012', 'cmp-001', 'cr-012', NOW() + INTERVAL '60 days', NULL, 'PENDING', 10, 'Noise audit scheduled.', NOW());

-- 8. GOVERNMENT SCHEMES
INSERT INTO schemes (id, name, department, description, sector, state, benefits, eligibility_description, application_process, application_url, deadline, is_active, created_at) VALUES
('sch-cg-capital', 'Chhattisgarh Industrial Capital Investment Subsidy 2024-29', 'State Industrial Development Department', 'Provides up to 45% capital subsidy on plant and machinery investment for manufacturing units established in industrial areas.', 'Manufacturing', 'Chhattisgarh', 'Capital Subsidy up to ₹1.5 Crore (45% of eligible plant & machinery cost)', 'Manufacturing MSME or Large units with minimum investment of ₹50 Lakhs in Chhattisgarh.', 'Submit detailed project report, machinery invoices, and CSIDC clearance via online portal.', 'https://csidc.cg.gov.in/capital-subsidy', NOW() + INTERVAL '180 days', TRUE, NOW()),
('sch-cg-interest', 'State Industrial Interest Subsidy Scheme', 'Commerce & Industries Dept, CG', 'Interest subvention subsidy of 6% per annum on term loans taken for industrial expansion or modernization.', 'Manufacturing', 'Chhattisgarh', '6% interest subvention for 7 years up to maximum ₹25 Lakhs per year', 'Units with active bank term loan and operational status in Chhattisgarh.', 'Apply with bank loan sanction letter and interest payment certificates.', 'https://industries.cg.gov.in/interest-subvention', NOW() + INTERVAL '240 days', TRUE, NOW()),
('sch-cg-green', 'Green & Clean Energy Industrial Incentive Scheme', 'Chhattisgarh Environment Conservation Board', 'Financial incentive for installing Effluent Treatment Plants (ETP), Solar Power plants, and Zero Liquid Discharge systems.', 'All', 'Chhattisgarh', '50% reimbursement of ETP/Solar plant equipment cost up to ₹30 Lakhs', 'Industrial units installing certified pollution control or renewable energy equipment.', 'Submit equipment commissioning certificate certified by CECB engineer.', 'https://cecb.cg.gov.in/green-incentive', NOW() + INTERVAL '120 days', TRUE, NOW()),
('sch-pm-mudra', 'PM Mudra Yojana - Tarun Industrial Expansion', 'Ministry of Micro, Small & Medium Enterprises (MoMSME)', 'Collateral-free business expansion loan for machinery purchase and working capital.', 'All', 'All', 'Loans up to ₹20 Lakhs with subsidized interest rate and zero collateral requirements', 'Registered MSME enterprises with at least 2 years operational history.', 'Apply through designated public sector banks or Mudra portal.', 'https://mudra.org.in', NOW() + INTERVAL '300 days', TRUE, NOW()),
('sch-pli-heavy', 'PLI Scheme for Heavy Engineering & Capital Goods', 'Ministry of Heavy Industries, Govt of India', 'Production Linked Incentive (PLI) providing 4% to 7% incentive on incremental sales of engineered steel components.', 'Heavy Engineering & Metal Fabrication', 'All', 'Cash incentive of 5% on annual incremental turnover above baseline', 'Manufacturing enterprises with annual turnover exceeding ₹10 Crore and investment > ₹2 Crore.', 'Online registration on MHI PLI portal followed by quarterly sales audit.', 'https://heavyindustries.gov.in/pli', NOW() + INTERVAL '90 days', TRUE, NOW()),
('sch-msme-zed', 'MSME ZED Certification Subsidy Scheme', 'MoMSME', 'Reimbursement of certification cost for Zero Defect Zero Effect (ZED) quality & environmental audit.', 'Manufacturing', 'All', '80% subsidy on ZED certification fees plus ₹5 Lakhs testing equipment grant', 'All registered Udyam MSME manufacturing enterprises.', 'Register on ZED portal, complete assessment, and submit invoice.', 'https://zed.msme.gov.in', NOW() + INTERVAL '365 days', TRUE, NOW()),
('sch-cg-power', 'Industrial Electricity Duty Exemption Scheme', 'Energy Department, Chhattisgarh', '100% exemption from Electricity Duty for 10 years for new industrial enterprises in heavy manufacturing.', 'Manufacturing', 'Chhattisgarh', '100% Electricity Duty waiver saving approx ₹4 Lakhs - ₹8 Lakhs annually', 'New manufacturing units with power requirement exceeding 100 HP in designated industrial areas.', 'Apply through CSPDCL along with industrial registration certificate.', 'https://cspdcl.co.in/duty-waiver', NOW() + INTERVAL '210 days', TRUE, NOW());

-- SCHEME ELIGIBILITY RULES
INSERT INTO scheme_eligibility_rules (id, scheme_id, field_name, operator, value, weight, created_at) VALUES
('rule-cap-1', 'sch-cg-capital', 'industry', '=', 'Manufacturing', 30, NOW()),
('rule-cap-2', 'sch-cg-capital', 'state', '=', 'Chhattisgarh', 30, NOW()),
('rule-cap-3', 'sch-cg-capital', 'investment_amount', '>=', '5000000', 25, NOW()),
('rule-cap-4', 'sch-cg-capital', 'employees', '>=', '10', 15, NOW()),

('rule-pli-1', 'sch-pli-heavy', 'sector', '=', 'Heavy Engineering & Metal Fabrication', 35, NOW()),
('rule-pli-2', 'sch-pli-heavy', 'annual_turnover', '>=', '100000000', 35, NOW()),
('rule-pli-3', 'sch-pli-heavy', 'investment_amount', '>=', '20000000', 30, NOW()),

('rule-green-1', 'sch-cg-green', 'state', '=', 'Chhattisgarh', 30, NOW()),
('rule-green-2', 'sch-cg-green', 'hazardous_materials', '=', 'true', 35, NOW()),
('rule-green-3', 'sch-cg-green', 'water_consumption', '>=', '10', 35, NOW()),

('rule-pow-1', 'sch-cg-power', 'state', '=', 'Chhattisgarh', 40, NOW()),
('rule-pow-2', 'sch-cg-power', 'power_requirement', '>=', '100', 40, NOW()),
('rule-pow-3', 'sch-cg-power', 'industry', '=', 'Manufacturing', 20, NOW());

-- SAVED SCHEMES
INSERT INTO saved_schemes (id, user_id, scheme_id, created_at) VALUES
('sav-001', 'usr-ind-001', 'sch-cg-capital', NOW()),
('sav-002', 'usr-ind-001', 'sch-pli-heavy', NOW());

-- 9. NOTIFICATIONS
INSERT INTO notifications (id, user_id, type, title, message, is_read, created_at) VALUES
('nt-001', 'usr-ind-001', 'APPROVAL_UPDATE', 'Application Status Updated: Factory License', 'Your Factory License application (APP-2026-00128) status was changed to UNDER_REVIEW by Officer Rajesh Sharma.', FALSE, NOW() - INTERVAL '1 day'),
('nt-002', 'usr-ind-001', 'DOCUMENT_REQUEST', 'Additional Document Requested', 'Officer Rajesh Sharma requested updated contract worker insurance policies for Labour Registration application APP-2026-00142.', FALSE, NOW() - INTERVAL '2 days'),
('nt-003', 'usr-ind-001', 'COMPLIANCE_OVERDUE', 'CRITICAL ALERT: Overdue Compliance Obligation', 'Boiler Pressure Re-certification (cr-003) is OVERDUE by 15 days! High risk penalty points added to compliance score.', FALSE, NOW() - INTERVAL '3 days'),
('nt-004', 'usr-ind-001', 'DOCUMENT_EXPIRY', 'Document Expired: Boiler Safety Certificate', 'Boiler Hydro-Test Safety Certificate (Boiler_HydroTest_2025.pdf) has expired. Upload renewed certificate immediately.', FALSE, NOW() - INTERVAL '5 days'),
('nt-005', 'usr-ind-001', 'APPROVAL_UPDATE', 'Fire Safety NOC Granted!', 'Congratulations! Fire Safety Clearance NOC (APP-2026-00110) has been APPROVED by Officer Rajesh Sharma.', TRUE, NOW() - INTERVAL '5 days'),
('nt-006', 'usr-ind-001', 'NEW_SCHEME', 'New Eligible Subsidy Scheme Available', 'Your business matches 95% eligibility criteria for the Chhattisgarh Industrial Capital Investment Subsidy 2024-29.', TRUE, NOW() - INTERVAL '7 days'),
('nt-007', 'usr-off-001', 'SYSTEM', 'New Application Assigned', 'Application APP-2026-00128 for Factory License from Shakti Precision Mfg has been assigned to your review queue.', FALSE, NOW() - INTERVAL '5 days'),
('nt-008', 'usr-adm-001', 'SYSTEM', 'Monthly Platform SLA Audit Generated', 'Monthly SLA processing report for Chhattisgarh Environment & Factory Departments is ready for review.', TRUE, NOW() - INTERVAL '10 days');

-- 10. AUDIT LOGS
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, metadata, ip_address, created_at) VALUES
('aud-001', 'usr-ind-001', 'USER_LOGIN', 'User', 'usr-ind-001', '{"device": "Chrome Windows 11", "method": "Password Auth"}', '192.168.1.45', NOW() - INTERVAL '2 hours'),
('aud-002', 'usr-ind-001', 'APPLICATION_SUBMITTED', 'Application', 'ap-001', '{"app_num": "APP-2026-00128", "approval": "Factory License"}', '192.168.1.45', NOW() - INTERVAL '5 days'),
('aud-003', 'usr-off-001', 'STATUS_CHANGED', 'Application', 'ap-001', '{"old_status": "DOCUMENT_VERIFICATION", "new_status": "UNDER_REVIEW", "remarks": "Documents verified."}', '10.20.4.12', NOW() - INTERVAL '1 day'),
('aud-004', 'usr-ind-001', 'DOCUMENT_UPLOADED', 'Document', 'doc-007', '{"filename": "Hazardous_Storage_Layout.pdf", "size_bytes": 2100000}', '192.168.1.45', NOW() - INTERVAL '1 day'),
('aud-005', 'usr-off-001', 'DOCUMENT_VERIFIED', 'Document', 'doc-001', '{"status": "VERIFIED", "verified_by": "Rajesh Sharma"}', '10.20.4.12', NOW() - INTERVAL '1 day'),
('aud-006', 'usr-ind-001', 'SCHEME_SAVED', 'Scheme', 'sch-cg-capital', '{"scheme_name": "Chhattisgarh Industrial Capital Investment Subsidy"}', '192.168.1.45', NOW() - INTERVAL '7 days');

-- 11. AI CONVERSATIONS
INSERT INTO ai_conversations (id, user_id, title, created_at, updated_at) VALUES
('conv-001', 'usr-ind-001', 'Environmental Clearance & CTO Requirements', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

INSERT INTO ai_messages (id, conversation_id, sender, message, created_at) VALUES
('msg-001', 'conv-001', 'user', 'What environmental approvals are mandatory for my heavy engineering plant in Raipur?', NOW() - INTERVAL '2 days'),
('msg-002', 'conv-001', 'assistant', 'Based on Shakti Precision Manufacturing Pvt. Ltd. (Orange pollution category, 25 KLD water consumption, hazardous materials present), the key environmental approvals required are:\n\n1. **Consent to Establish (CTE)** from Chhattisgarh Environment Conservation Board (CECB) prior to construction.\n2. **Consent to Operate (CTO)** under Air & Water Acts before commercial production.\n3. **Hazardous Waste Authorization (Form 2)** for managing waste fluids and metal slag.\n4. **Groundwater Extraction NOC (CGWA)** if abstracting groundwater exceeding 10 KLD.\n\nWould you like me to guide you through document preparation for CTE?', NOW() - INTERVAL '2 days');
