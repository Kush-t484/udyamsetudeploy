const { getDb } = require('../config/database');
const { logAuditAction } = require('../utils/logger');
const { createNotification } = require('../services/notification.service');

async function getDashboardMetrics(req, res, next) {
    try {
        const db = getDb();
        const officerId = req.user.userId;

        const totalRes = await db.query(`SELECT COUNT(*) FROM applications WHERE assigned_officer_id = $1 OR assigned_officer_id IS NULL`, [officerId]);
        const pendingRes = await db.query(`SELECT COUNT(*) FROM applications WHERE (assigned_officer_id = $1 OR assigned_officer_id IS NULL) AND status IN ('SUBMITTED', 'DOCUMENT_VERIFICATION', 'UNDER_REVIEW')`, [officerId]);
        const inspectionRes = await db.query(`SELECT COUNT(*) FROM applications WHERE (assigned_officer_id = $1 OR assigned_officer_id IS NULL) AND status = 'INSPECTION'`, [officerId]);
        const approvedRes = await db.query(`SELECT COUNT(*) FROM applications WHERE (assigned_officer_id = $1 OR assigned_officer_id IS NULL) AND status = 'APPROVED'`, [officerId]);
        const rejectedRes = await db.query(`SELECT COUNT(*) FROM applications WHERE (assigned_officer_id = $1 OR assigned_officer_id IS NULL) AND status = 'REJECTED'`, [officerId]);
        
        const slaBreachedRes = await db.query(`SELECT COUNT(*) FROM applications WHERE (assigned_officer_id = $1 OR assigned_officer_id IS NULL) AND status NOT IN ('APPROVED', 'REJECTED', 'DRAFT') AND expected_completion_date IS NOT NULL`, [officerId]);

        const workloadRes = await db.query(`
            SELECT d.name as department_name, COUNT(a.id) as application_count
            FROM applications a
            JOIN approvals ap ON a.approval_id = ap.id
            JOIN departments d ON ap.department_id = d.id
            GROUP BY d.name
        `);

        res.json({
            success: true,
            data: {
                total_applications: parseInt(totalRes.rows[0].count, 10),
                pending_review: parseInt(pendingRes.rows[0].count, 10),
                inspection_pending: parseInt(inspectionRes.rows[0].count, 10),
                approved: parseInt(approvedRes.rows[0].count, 10),
                rejected: parseInt(rejectedRes.rows[0].count, 10),
                sla_breached: parseInt(slaBreachedRes.rows[0].count, 10),
                average_processing_days: 12.5,
                department_workload: workloadRes.rows
            }
        });
    } catch (err) {
        next(err);
    }
}

async function getOfficerApplications(req, res, next) {
    try {
        const db = getDb();
        const officerId = req.user.userId;
        const { status, priority, search } = req.query;

        let query = `
            SELECT a.*, ap.name as approval_name, ap.category, c.name as company_name, c.state, c.district,
                   d.name as department_name
            FROM applications a
            JOIN approvals ap ON a.approval_id = ap.id
            JOIN companies c ON a.company_id = c.id
            LEFT JOIN departments d ON ap.department_id = d.id
            WHERE (a.assigned_officer_id = $1 OR a.assigned_officer_id IS NULL)
        `;
        const params = [officerId];

        if (status) {
            params.push(status);
            query += ` AND a.status = $${params.length}`;
        }
        if (priority) {
            params.push(priority);
            query += ` AND a.priority = $${params.length}`;
        }
        if (search) {
            params.push(`%${search}%`);
            query += ` AND (a.application_number ILIKE $${params.length} OR c.name ILIKE $${params.length} OR ap.name ILIKE $${params.length})`;
        }

        query += ` ORDER BY a.priority DESC, a.created_at DESC`;

        const result = await db.query(query, params);
        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        next(err);
    }
}

async function addRemarks(req, res, next) {
    try {
        const db = getDb();
        const { id } = req.params;
        const { remarks } = req.body;
        const officerId = req.user.userId;

        await db.query('UPDATE applications SET remarks = $1, updated_at = NOW() WHERE id = $2', [remarks, id]);

        await logAuditAction(officerId, 'OFFICER_REMARK_ADDED', 'Application', id, { remarks });

        res.json({
            success: true,
            message: 'Official remarks updated successfully'
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getDashboardMetrics,
    getOfficerApplications,
    addRemarks
};
