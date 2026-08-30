const { getDb } = require('../config/database');
const { getComplianceSummary, runComplianceCheck } = require('../services/compliance.service');
const { calculateCompanyRiskScore } = require('../services/risk.service');
const { logAuditAction } = require('../utils/logger');

async function getCompliance(req, res, next) {
    try {
        const db = getDb();
        const userId = req.user.userId;

        const compRes = await db.query('SELECT company_id FROM user_company WHERE user_id = $1 LIMIT 1', [userId]);
        if (compRes.rows.length === 0) {
            return res.json({ success: true, data: { summary: {}, records: [] } });
        }

        const companyId = compRes.rows[0].company_id;
        const data = await getComplianceSummary(companyId);

        res.json({
            success: true,
            data
        });
    } catch (err) {
        next(err);
    }
}

async function updateRecord(req, res, next) {
    try {
        const db = getDb();
        const { id } = req.params;
        const { status, remarks, completed_date } = req.body;
        const userId = req.user.userId;

        const recordRes = await db.query('SELECT * FROM compliance_records WHERE id = $1', [id]);
        if (recordRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Compliance record not found' });
        }

        const dateVal = status === 'COMPLETED' ? (completed_date || new Date()) : null;

        await db.query(
            `UPDATE compliance_records SET
                status = COALESCE($1, status),
                remarks = COALESCE($2, remarks),
                completed_date = $3,
                updated_at = NOW()
             WHERE id = $4`,
            [status, remarks, dateVal, id]
        );

        await logAuditAction(userId, 'COMPLIANCE_UPDATED', 'ComplianceRecord', id, { status });

        res.json({
            success: true,
            message: 'Compliance obligation record updated',
            data: { id, status }
        });
    } catch (err) {
        next(err);
    }
}

async function getRiskScore(req, res, next) {
    try {
        const db = getDb();
        const userId = req.user.userId;

        const compRes = await db.query('SELECT company_id FROM user_company WHERE user_id = $1 LIMIT 1', [userId]);
        if (compRes.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'No company profile found' });
        }

        const companyId = compRes.rows[0].company_id;
        const riskData = await calculateCompanyRiskScore(companyId);

        res.json({
            success: true,
            data: riskData
        });
    } catch (err) {
        next(err);
    }
}

async function triggerCheck(req, res, next) {
    try {
        const db = getDb();
        const userId = req.user.userId;

        const compRes = await db.query('SELECT company_id FROM user_company WHERE user_id = $1 LIMIT 1', [userId]);
        if (compRes.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'No company profile linked' });
        }

        const companyId = compRes.rows[0].company_id;
        const result = await runComplianceCheck(companyId);

        res.json({
            success: true,
            message: `Compliance automation check completed (${result.status_updates} status updates generated)`,
            data: result
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getCompliance,
    updateRecord,
    getRiskScore,
    triggerCheck
};
