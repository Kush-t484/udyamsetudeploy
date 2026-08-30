const { getDb } = require('../config/database');
const { calculateCompanyRiskScore } = require('./risk.service');
const { createNotification } = require('./notification.service');

async function getComplianceSummary(companyId) {
    const db = getDb();
    
    const recordsRes = await db.query(
        `SELECT cr.*, req.name as requirement_name, req.category, req.frequency, req.risk_level, d.name as department_name
         FROM compliance_records cr
         JOIN compliance_requirements req ON cr.requirement_id = req.id
         LEFT JOIN departments d ON req.department_id = d.id
         WHERE cr.company_id = $1
         ORDER BY cr.due_date ASC`,
        [companyId]
    );

    const riskData = await calculateCompanyRiskScore(companyId);

    return {
        summary: riskData,
        records: recordsRes.rows
    };
}

async function runComplianceCheck(companyId) {
    const db = getDb();
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Fetch all pending or due records
    const recordsRes = await db.query(
        `SELECT cr.*, req.name as req_name, uc.user_id
         FROM compliance_records cr
         JOIN compliance_requirements req ON cr.requirement_id = req.id
         JOIN user_company uc ON cr.company_id = uc.company_id
         WHERE cr.company_id = $1 AND cr.status != 'COMPLETED' AND cr.status != 'EXEMPTED'`,
        [companyId]
    );

    let updatedCount = 0;

    for (const rec of recordsRes.rows) {
        const dueDate = new Date(rec.due_date);
        let newStatus = rec.status;

        if (dueDate < now && rec.status !== 'OVERDUE') {
            newStatus = 'OVERDUE';
            updatedCount++;

            await db.query(
                `UPDATE compliance_records SET status = 'OVERDUE', updated_at = NOW() WHERE id = $1`,
                [rec.id]
            );

            if (rec.user_id) {
                await createNotification(
                    rec.user_id,
                    'COMPLIANCE_OVERDUE',
                    `CRITICAL: Overdue Compliance - ${rec.req_name}`,
                    `Your compliance obligation '${rec.req_name}' was due on ${dueDate.toLocaleDateString()}. Please complete it immediately.`
                );
            }
        } else if (dueDate <= sevenDays && dueDate >= now && rec.status !== 'DUE_SOON') {
            newStatus = 'DUE_SOON';
            updatedCount++;

            await db.query(
                `UPDATE compliance_records SET status = 'DUE_SOON', updated_at = NOW() WHERE id = $1`,
                [rec.id]
            );

            if (rec.user_id) {
                await createNotification(
                    rec.user_id,
                    'COMPLIANCE_DUE',
                    `Upcoming Compliance Deadline - ${rec.req_name}`,
                    `Your compliance obligation '${rec.req_name}' is due soon on ${dueDate.toLocaleDateString()}.`
                );
            }
        }
    }

    return {
        checked_count: recordsRes.rows.length,
        status_updates: updatedCount
    };
}

module.exports = {
    getComplianceSummary,
    runComplianceCheck
};
