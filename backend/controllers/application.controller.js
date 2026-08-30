const { getDb } = require('../config/database');
const { logAuditAction } = require('../utils/logger');
const { createNotification } = require('../services/notification.service');

async function getApplications(req, res, next) {
    try {
        const db = getDb();
        const userId = req.user.userId;
        const userRole = req.user.role;
        const { status, priority, department_id, search } = req.query;

        let query = `
            SELECT a.*, ap.name as approval_name, ap.category, c.name as company_name,
                   d.name as department_name, u.name as officer_name
            FROM applications a
            JOIN approvals ap ON a.approval_id = ap.id
            JOIN companies c ON a.company_id = c.id
            LEFT JOIN departments d ON ap.department_id = d.id
            LEFT JOIN users u ON a.assigned_officer_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (userRole === 'INDUSTRY') {
            const compRes = await db.query(
                `SELECT company_id FROM user_company WHERE user_id = $1 LIMIT 1`,
                [userId]
            );
            if (compRes.rows.length === 0) {
                return res.json({ success: true, data: [] });
            }
            params.push(compRes.rows[0].company_id);
            query += ` AND a.company_id = $${params.length}`;
        } else if (userRole === 'OFFICER') {
            // Assigned or unassigned officer queue
            params.push(userId);
            query += ` AND (a.assigned_officer_id = $${params.length} OR a.assigned_officer_id IS NULL)`;
        }

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
            query += ` AND (a.application_number ILIKE $${params.length} OR ap.name ILIKE $${params.length} OR c.name ILIKE $${params.length})`;
        }

        query += ` ORDER BY a.updated_at DESC`;

        const result = await db.query(query, params);
        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        next(err);
    }
}

async function getApplicationById(req, res, next) {
    try {
        const db = getDb();
        const { id } = req.params;

        const appRes = await db.query(
            `SELECT a.*, ap.name as approval_name, ap.description as approval_desc, ap.category, ap.estimated_processing_days,
                    c.name as company_name, c.industry, c.state, c.district, c.gstin, c.pan, c.employees, c.investment_amount,
                    d.name as department_name, u.name as officer_name
             FROM applications a
             JOIN approvals ap ON a.approval_id = ap.id
             JOIN companies c ON a.company_id = c.id
             LEFT JOIN departments d ON ap.department_id = d.id
             LEFT JOIN users u ON a.assigned_officer_id = u.id
             WHERE a.id = $1 OR a.application_number = $1`,
            [id]
        );

        if (appRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Application record not found' });
        }

        const app = appRes.rows[0];

        // Fetch documents attached to this application
        const docsRes = await db.query(
            `SELECT * FROM documents WHERE application_id = $1 ORDER BY uploaded_at DESC`,
            [app.id]
        );

        // Fetch status history timeline
        const historyRes = await db.query(
            `SELECT h.*, u.name as changed_by_name, u.role as changed_by_role
             FROM application_status_history h
             LEFT JOIN users u ON h.changed_by = u.id
             WHERE h.application_id = $1
             ORDER BY h.created_at ASC`,
            [app.id]
        );

        res.json({
            success: true,
            data: {
                application: app,
                documents: docsRes.rows,
                timeline: historyRes.rows
            }
        });
    } catch (err) {
        next(err);
    }
}

async function createApplication(req, res, next) {
    try {
        const db = getDb();
        const userId = req.user.userId;
        const { approval_id, remarks } = req.body;

        const compRes = await db.query(
            `SELECT company_id FROM user_company WHERE user_id = $1 LIMIT 1`,
            [userId]
        );

        let companyId;
        if (compRes.rows.length === 0) {
            // Find default company or create one
            const anyComp = await db.query(`SELECT id FROM companies LIMIT 1`);
            if (anyComp.rows.length > 0) {
                companyId = anyComp.rows[0].id;
                await db.query(
                    `INSERT INTO user_company (user_id, company_id, role_in_company) VALUES ($1, $2, 'OWNER') ON CONFLICT DO NOTHING`,
                    [userId, companyId]
                );
            } else {
                companyId = 'cmp-shakti-01';
            }
        } else {
            companyId = compRes.rows[0].company_id;
        }

        // Fetch approval details
        const apprRes = await db.query('SELECT name, priority, estimated_processing_days FROM approvals WHERE id = $1', [approval_id]);
        if (apprRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Approval specified does not exist.' });
        }

        const appr = apprRes.rows[0];
        const appId = 'ap-' + Math.random().toString(36).substr(2, 9);
        const appNum = 'APP-2026-' + Math.floor(10000 + Math.random() * 90000);

        const processingDays = appr.estimated_processing_days || 15;
        const expectedCompletion = new Date(Date.now() + processingDays * 24 * 60 * 60 * 1000);

        // Assign to default officer
        const officerRes = await db.query(`SELECT id FROM users WHERE role = 'OFFICER' LIMIT 1`);
        const defaultOfficerId = officerRes.rows.length > 0 ? officerRes.rows[0].id : null;

        await db.query(
            `INSERT INTO applications (
                id, application_number, company_id, approval_id, assigned_officer_id,
                status, priority, submitted_at, updated_at, expected_completion_date, remarks, created_at
            ) VALUES ($1, $2, $3, $4, $5, 'SUBMITTED', $6, NOW(), NOW(), $7, $8, NOW())`,
            [appId, appNum, companyId, approval_id, defaultOfficerId, appr.priority || 'MEDIUM', expectedCompletion, remarks || 'Application submitted via portal']
        );

        // History entry
        const histId = 'hist-' + Math.random().toString(36).substr(2, 9);
        await db.query(
            `INSERT INTO application_status_history (id, application_id, old_status, new_status, changed_by, remarks, created_at)
             VALUES ($1, $2, 'DRAFT', 'SUBMITTED', $3, $4, NOW())`,
            [histId, appId, userId, remarks || 'Application created and submitted']
        );

        await logAuditAction(userId, 'APPLICATION_CREATED', 'Application', appId, { application_number: appNum });

        await createNotification(
            userId,
            'APPROVAL_UPDATE',
            `Application ${appNum} Submitted`,
            `Your application for ${appr.name} has been submitted successfully.`
        );

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: {
                id: appId,
                application_number: appNum,
                status: 'SUBMITTED'
            }
        });
    } catch (err) {
        next(err);
    }
}

async function updateStatus(req, res, next) {
    try {
        const db = getDb();
        const { id } = req.params;
        const { status, remarks } = req.body;
        const userId = req.user.userId;

        const appRes = await db.query(
            `SELECT a.*, c.name as company_name, ap.name as approval_name, uc.user_id as company_user_id
             FROM applications a
             JOIN companies c ON a.company_id = c.id
             JOIN approvals ap ON a.approval_id = ap.id
             LEFT JOIN user_company uc ON c.id = uc.company_id
             WHERE a.id = $1 OR a.application_number = $1`,
            [id]
        );

        if (appRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const app = appRes.rows[0];
        const oldStatus = app.status;

        // Perform Database Transaction for Status Update
        await db.query('UPDATE applications SET status = $1, remarks = COALESCE($2, remarks), updated_at = NOW() WHERE id = $3', [status, remarks, app.id]);

        // Insert Status History
        const histId = 'hist-' + Math.random().toString(36).substr(2, 9);
        await db.query(
            `INSERT INTO application_status_history (id, application_id, old_status, new_status, changed_by, remarks, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [histId, app.id, oldStatus, status, userId, remarks || `Status changed from ${oldStatus} to ${status}`]
        );

        await logAuditAction(userId, 'STATUS_CHANGED', 'Application', app.id, {
            app_number: app.application_number,
            old_status: oldStatus,
            new_status: status
        });

        // Notify company user
        if (app.company_user_id) {
            await createNotification(
                app.company_user_id,
                'APPROVAL_UPDATE',
                `Status Changed: ${app.application_number}`,
                `Your application for ${app.approval_name} status is now ${status}.`
            );
        }

        res.json({
            success: true,
            message: `Application status updated to ${status}`,
            data: { id: app.id, old_status: oldStatus, new_status: status }
        });
    } catch (err) {
        next(err);
    }
}

async function requestDocuments(req, res, next) {
    try {
        const db = getDb();
        const { id } = req.params;
        const { document_list, remarks } = req.body;
        const userId = req.user.userId;

        const appRes = await db.query(
            `SELECT a.*, uc.user_id as company_user_id, ap.name as approval_name
             FROM applications a
             JOIN companies c ON a.company_id = c.id
             JOIN approvals ap ON a.approval_id = ap.id
             LEFT JOIN user_company uc ON c.id = uc.company_id
             WHERE a.id = $1`,
            [id]
        );

        if (appRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const app = appRes.rows[0];

        await db.query(`UPDATE applications SET status = 'ADDITIONAL_DOCUMENTS', remarks = $1, updated_at = NOW() WHERE id = $2`, [remarks || 'Additional documents requested', app.id]);

        const histId = 'hist-' + Math.random().toString(36).substr(2, 9);
        await db.query(
            `INSERT INTO application_status_history (id, application_id, old_status, new_status, changed_by, remarks, created_at)
             VALUES ($1, $2, $3, 'ADDITIONAL_DOCUMENTS', $4, $5, NOW())`,
            [histId, app.id, app.status, userId, `Officer requested: ${document_list || remarks}`]
        );

        if (app.company_user_id) {
            await createNotification(
                app.company_user_id,
                'DOCUMENT_REQUEST',
                `Additional Documents Requested for ${app.application_number}`,
                `Remarks: ${remarks || document_list || 'Please upload missing verification files.'}`
            );
        }

        res.json({
            success: true,
            message: 'Document request sent to applicant',
            data: { id: app.id, status: 'ADDITIONAL_DOCUMENTS' }
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getApplications,
    getApplicationById,
    createApplication,
    updateStatus,
    requestDocuments
};
