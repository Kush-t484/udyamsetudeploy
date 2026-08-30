const { getDb } = require('../config/database');

async function getDashboardMetrics(req, res, next) {
    try {
        const db = getDb();

        const usersCount = await db.query('SELECT COUNT(*) FROM users');
        const companiesCount = await db.query('SELECT COUNT(*) FROM companies');
        const appsCount = await db.query('SELECT COUNT(*) FROM applications');
        const pendingAppsCount = await db.query("SELECT COUNT(*) FROM applications WHERE status NOT IN ('APPROVED', 'REJECTED', 'DRAFT')");
        const approvalsCount = await db.query('SELECT COUNT(*) FROM approvals WHERE is_active = TRUE');
        const overdueCompCount = await db.query("SELECT COUNT(*) FROM compliance_records WHERE status = 'OVERDUE'");
        const schemesCount = await db.query('SELECT COUNT(*) FROM schemes WHERE is_active = TRUE');
        const auditCount = await db.query('SELECT COUNT(*) FROM audit_logs');

        // Chart 1: Applications by Status
        const statusDist = await db.query(`
            SELECT status, COUNT(*) as count FROM applications GROUP BY status
        `);

        // Chart 2: Applications by Department
        const deptDist = await db.query(`
            SELECT d.name as department_name, COUNT(a.id) as count
            FROM applications a
            JOIN approvals ap ON a.approval_id = ap.id
            JOIN departments d ON ap.department_id = d.id
            GROUP BY d.name
        `);

        // Chart 3: Compliance Risk Distribution
        const riskDist = await db.query(`
            SELECT status, COUNT(*) as count FROM compliance_records GROUP BY status
        `);

        res.json({
            success: true,
            data: {
                total_users: parseInt(usersCount.rows[0].count, 10),
                total_companies: parseInt(companiesCount.rows[0].count, 10),
                total_applications: parseInt(appsCount.rows[0].count, 10),
                pending_applications: parseInt(pendingAppsCount.rows[0].count, 10),
                total_approvals: parseInt(approvalsCount.rows[0].count, 10),
                overdue_compliance: parseInt(overdueCompCount.rows[0].count, 10),
                active_schemes: parseInt(schemesCount.rows[0].count, 10),
                system_activities: parseInt(auditCount.rows[0].count, 10),
                charts: {
                    status_distribution: statusDist.rows,
                    department_distribution: deptDist.rows,
                    compliance_distribution: riskDist.rows
                }
            }
        });
    } catch (err) {
        next(err);
    }
}

async function getUsers(req, res, next) {
    try {
        const db = getDb();
        const result = await db.query('SELECT id, name, email, phone, role, is_active, created_at FROM users ORDER BY created_at DESC');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        next(err);
    }
}

async function getCompanies(req, res, next) {
    try {
        const db = getDb();
        const result = await db.query('SELECT * FROM companies ORDER BY created_at DESC');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        next(err);
    }
}

async function getAuditLogs(req, res, next) {
    try {
        const db = getDb();
        const result = await db.query(
            `SELECT a.*, u.name as user_name, u.email as user_email
             FROM audit_logs a
             LEFT JOIN users u ON a.user_id = u.id
             ORDER BY a.created_at DESC LIMIT 100`
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getDashboardMetrics,
    getUsers,
    getCompanies,
    getAuditLogs
};
