const { getDb } = require('../config/database');

async function calculateCompanyRiskScore(companyId) {
    const db = getDb();

    // 1. Fetch compliance records
    const compRes = await db.query(
        `SELECT status, due_date FROM compliance_records WHERE company_id = $1`,
        [companyId]
    );

    // 2. Fetch documents
    const docRes = await db.query(
        `SELECT verification_status, expiry_date FROM documents WHERE company_id = $1`,
        [companyId]
    );

    let totalRiskPoints = 0;
    let overdueCount = 0;
    let dueSoonCount = 0;
    let completedCount = 0;
    let pendingCount = 0;

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    for (const record of compRes.rows) {
        const dueDate = new Date(record.due_date);
        const status = record.status;

        if (status === 'COMPLETED' || status === 'EXEMPTED') {
            completedCount++;
        } else if (status === 'OVERDUE' || (dueDate < now && status !== 'COMPLETED')) {
            overdueCount++;
            totalRiskPoints += 40;
        } else if (dueDate <= sevenDaysFromNow || status === 'DUE_SOON') {
            dueSoonCount++;
            totalRiskPoints += 25;
        } else {
            pendingCount++;
            totalRiskPoints += 10;
        }
    }

    let expiredDocCount = 0;
    let pendingDocCount = 0;

    for (const doc of docRes.rows) {
        if (doc.verification_status === 'EXPIRED' || (doc.expiry_date && new Date(doc.expiry_date) < now)) {
            expiredDocCount++;
            totalRiskPoints += 30;
        } else if (doc.verification_status === 'PENDING' || doc.verification_status === 'REJECTED') {
            pendingDocCount++;
            totalRiskPoints += 20;
        }
    }

    // Health Score calculation (100 is best, 0 is worst)
    const healthScore = Math.max(0, Math.min(100, 100 - Math.round(totalRiskPoints / 3)));
    
    let riskLevel = 'LOW';
    if (totalRiskPoints >= 100) riskLevel = 'CRITICAL';
    else if (totalRiskPoints >= 50) riskLevel = 'HIGH';
    else if (totalRiskPoints >= 25) riskLevel = 'MEDIUM';

    return {
        company_id: companyId,
        risk_score: totalRiskPoints,
        compliance_health_score: healthScore,
        risk_level: riskLevel,
        breakdown: {
            overdue_compliance: overdueCount,
            due_soon_compliance: dueSoonCount,
            completed_compliance: completedCount,
            pending_compliance: pendingCount,
            expired_documents: expiredDocCount,
            pending_documents: pendingDocCount
        }
    };
}

module.exports = {
    calculateCompanyRiskScore
};
