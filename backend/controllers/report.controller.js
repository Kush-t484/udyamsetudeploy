const { getDb } = require('../config/database');
const { calculateCompanyRiskScore } = require('../services/risk.service');
const { matchSchemesForCompany } = require('../services/scheme.service');

async function getCompanySummaryReport(req, res, next) {
    try {
        const db = getDb();
        const userId = req.user.userId;

        const compRes = await db.query('SELECT c.* FROM companies c JOIN user_company uc ON c.id = uc.company_id WHERE uc.user_id = $1 LIMIT 1', [userId]);
        if (compRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No company profile found' });
        }

        const company = compRes.rows[0];
        const appsRes = await db.query('SELECT a.*, ap.name as approval_name FROM applications a JOIN approvals ap ON a.approval_id = ap.id WHERE a.company_id = $1', [company.id]);
        const docsRes = await db.query('SELECT * FROM documents WHERE company_id = $1', [company.id]);
        const riskData = await calculateCompanyRiskScore(company.id);
        const schemeMatches = await matchSchemesForCompany(company);

        res.json({
            success: true,
            data: {
                report_type: 'Comprehensive Enterprise Profile & Compliance Audit Summary',
                generated_at: new Date().toISOString(),
                company,
                risk_summary: riskData,
                applications_count: appsRes.rows.length,
                applications: appsRes.rows,
                documents_count: docsRes.rows.length,
                matched_schemes: schemeMatches.matched_schemes.slice(0, 5)
            }
        });
    } catch (err) {
        next(err);
    }
}

async function getComplianceReport(req, res, next) {
    try {
        const db = getDb();
        const userId = req.user.userId;

        const compRes = await db.query('SELECT company_id FROM user_company WHERE user_id = $1 LIMIT 1', [userId]);
        if (compRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No company profile found' });
        }

        const companyId = compRes.rows[0].company_id;
        const recordsRes = await db.query(
            `SELECT cr.*, req.name as requirement_name, req.category, req.frequency, req.risk_level
             FROM compliance_records cr
             JOIN compliance_requirements req ON cr.requirement_id = req.id
             WHERE cr.company_id = $1
             ORDER BY cr.due_date ASC`,
            [companyId]
        );

        const riskData = await calculateCompanyRiskScore(companyId);

        res.json({
            success: true,
            data: {
                report_type: 'Industrial Compliance Health & Risk Audit Report',
                generated_at: new Date().toISOString(),
                risk_summary: riskData,
                obligations: recordsRes.rows
            }
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getCompanySummaryReport,
    getComplianceReport
};
