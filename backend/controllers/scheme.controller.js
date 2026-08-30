const { getDb } = require('../config/database');
const { matchSchemesForCompany } = require('../services/scheme.service');
const { logAuditAction } = require('../utils/logger');

async function getSchemes(req, res, next) {
    try {
        const db = getDb();
        const userId = req.user.userId;
        const { sector, state, search } = req.query;

        let query = `SELECT s.* FROM schemes s WHERE s.is_active = TRUE`;
        const params = [];

        if (sector) {
            params.push(sector);
            query += ` AND (s.sector = $${params.length} OR s.sector = 'All')`;
        }
        if (state) {
            params.push(state);
            query += ` AND (s.state = $${params.length} OR s.state = 'All')`;
        }
        if (search) {
            params.push(`%${search}%`);
            query += ` AND (s.name ILIKE $${params.length} OR s.description ILIKE $${params.length} OR s.benefits ILIKE $${params.length})`;
        }

        query += ` ORDER BY s.created_at DESC`;

        const result = await db.query(query, params);

        // Check which ones are saved by this user
        const savedRes = await db.query('SELECT scheme_id FROM saved_schemes WHERE user_id = $1', [userId]);
        const savedIds = new Set(savedRes.rows.map(r => r.scheme_id));

        const schemes = result.rows.map(s => ({
            ...s,
            is_saved: savedIds.has(s.id)
        }));

        res.json({
            success: true,
            data: schemes
        });
    } catch (err) {
        next(err);
    }
}

async function getSchemeById(req, res, next) {
    try {
        const db = getDb();
        const { id } = req.params;
        const userId = req.user.userId;

        const schemeRes = await db.query('SELECT * FROM schemes WHERE id = $1', [id]);
        if (schemeRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Scheme record not found' });
        }

        const rulesRes = await db.query('SELECT * FROM scheme_eligibility_rules WHERE scheme_id = $1', [id]);
        const savedRes = await db.query('SELECT id FROM saved_schemes WHERE user_id = $1 AND scheme_id = $2', [userId, id]);

        res.json({
            success: true,
            data: {
                scheme: schemeRes.rows[0],
                rules: rulesRes.rows,
                is_saved: savedRes.rows.length > 0
            }
        });
    } catch (err) {
        next(err);
    }
}

async function match(req, res, next) {
    try {
        const db = getDb();
        const userId = req.user.userId;

        const compRes = await db.query('SELECT c.* FROM companies c JOIN user_company uc ON c.id = uc.company_id WHERE uc.user_id = $1 LIMIT 1', [userId]);
        const profile = compRes.rows.length > 0 ? compRes.rows[0] : (req.body || {});

        const matchResult = await matchSchemesForCompany(profile);

        res.json({
            success: true,
            data: matchResult
        });
    } catch (err) {
        next(err);
    }
}

async function saveScheme(req, res, next) {
    try {
        const db = getDb();
        const { id } = req.params;
        const userId = req.user.userId;

        const savedId = 'sav-' + Math.random().toString(36).substr(2, 9);
        await db.query(
            `INSERT INTO saved_schemes (id, user_id, scheme_id, created_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT DO NOTHING`,
            [savedId, userId, id]
        );

        await logAuditAction(userId, 'SCHEME_SAVED', 'Scheme', id, {});

        res.json({
            success: true,
            message: 'Scheme bookmarked successfully'
        });
    } catch (err) {
        next(err);
    }
}

async function unsaveScheme(req, res, next) {
    try {
        const db = getDb();
        const { id } = req.params;
        const userId = req.user.userId;

        await db.query('DELETE FROM saved_schemes WHERE user_id = $1 AND scheme_id = $2', [userId, id]);

        res.json({
            success: true,
            message: 'Scheme bookmark removed'
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getSchemes,
    getSchemeById,
    match,
    saveScheme,
    unsaveScheme
};
