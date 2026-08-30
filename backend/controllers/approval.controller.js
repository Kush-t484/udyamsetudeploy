const { getDb } = require('../config/database');
const { analyzeApprovals } = require('../services/approval.service');
const { logAuditAction } = require('../utils/logger');

async function getApprovals(req, res, next) {
    try {
        const db = getDb();
        const { category, department_id, search } = req.query;

        let query = `SELECT a.*, d.name as department_name FROM approvals a LEFT JOIN departments d ON a.department_id = d.id WHERE a.is_active = TRUE`;
        const params = [];

        if (category) {
            params.push(category);
            query += ` AND a.category = $${params.length}`;
        }
        if (department_id) {
            params.push(department_id);
            query += ` AND a.department_id = $${params.length}`;
        }
        if (search) {
            params.push(`%${search}%`);
            query += ` AND (a.name ILIKE $${params.length} OR a.description ILIKE $${params.length})`;
        }

        query += ` ORDER BY a.priority DESC, a.name ASC`;

        const result = await db.query(query, params);
        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        next(err);
    }
}

async function getApprovalById(req, res, next) {
    try {
        const db = getDb();
        const { id } = req.params;

        const apprRes = await db.query(
            `SELECT a.*, d.name as department_name, d.contact_email
             FROM approvals a LEFT JOIN departments d ON a.department_id = d.id
             WHERE a.id = $1`,
            [id]
        );

        if (apprRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Approval definition not found' });
        }

        const reqsRes = await db.query('SELECT * FROM approval_requirements WHERE approval_id = $1', [id]);
        const docsRes = await db.query('SELECT * FROM approval_documents WHERE approval_id = $1', [id]);

        res.json({
            success: true,
            data: {
                approval: apprRes.rows[0],
                requirements: reqsRes.rows,
                required_documents: docsRes.rows
            }
        });
    } catch (err) {
        next(err);
    }
}

async function analyze(req, res, next) {
    try {
        const profile = req.body;
        const analysis = await analyzeApprovals(profile);

        if (req.user) {
            await logAuditAction(req.user.userId, 'APPROVAL_ANALYSIS_RUN', 'Company', profile.company_id || 'N/A', {
                industry: profile.industry,
                sector: profile.sector
            });
        }

        res.json({
            success: true,
            data: analysis
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getApprovals,
    getApprovalById,
    analyze
};
