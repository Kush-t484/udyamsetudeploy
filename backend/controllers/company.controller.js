const { getDb } = require('../config/database');
const { logAuditAction } = require('../utils/logger');

async function getProfile(req, res, next) {
    try {
        const db = getDb();
        const userId = req.user.userId;

        const result = await db.query(
            `SELECT c.* FROM companies c JOIN user_company uc ON c.id = uc.company_id WHERE uc.user_id = $1 LIMIT 1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No company profile linked to this user'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (err) {
        next(err);
    }
}

async function updateProfile(req, res, next) {
    try {
        const db = getDb();
        const userId = req.user.userId;

        // Fetch existing company
        const existingRes = await db.query(
            `SELECT c.id FROM companies c JOIN user_company uc ON c.id = uc.company_id WHERE uc.user_id = $1 LIMIT 1`,
            [userId]
        );

        if (existingRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        const companyId = existingRes.rows[0].id;
        const {
            name, registration_number, gstin, pan, industry, sector, business_type,
            state, district, city, address, pincode, investment_amount, annual_turnover,
            employees, land_area, power_requirement, production_capacity,
            pollution_category, water_consumption, hazardous_materials
        } = req.body;

        await db.query(
            `UPDATE companies SET
                name = COALESCE($1, name),
                registration_number = COALESCE($2, registration_number),
                gstin = COALESCE($3, gstin),
                pan = COALESCE($4, pan),
                industry = COALESCE($5, industry),
                sector = COALESCE($6, sector),
                business_type = COALESCE($7, business_type),
                state = COALESCE($8, state),
                district = COALESCE($9, district),
                city = COALESCE($10, city),
                address = COALESCE($11, address),
                pincode = COALESCE($12, pincode),
                investment_amount = COALESCE($13, investment_amount),
                annual_turnover = COALESCE($14, annual_turnover),
                employees = COALESCE($15, employees),
                land_area = COALESCE($16, land_area),
                power_requirement = COALESCE($17, power_requirement),
                production_capacity = COALESCE($18, production_capacity),
                pollution_category = COALESCE($19, pollution_category),
                water_consumption = COALESCE($20, water_consumption),
                hazardous_materials = COALESCE($21, hazardous_materials),
                updated_at = NOW()
             WHERE id = $22`,
            [
                name, registration_number, gstin, pan, industry, sector, business_type,
                state, district, city, address, pincode, investment_amount, annual_turnover,
                employees, land_area, power_requirement, production_capacity,
                pollution_category, water_consumption, hazardous_materials, companyId
            ]
        );

        const updated = await db.query('SELECT * FROM companies WHERE id = $1', [companyId]);

        await logAuditAction(userId, 'COMPANY_UPDATED', 'Company', companyId, { company_name: name });

        res.json({
            success: true,
            message: 'Company profile updated successfully',
            data: updated.rows[0]
        });
    } catch (err) {
        next(err);
    }
}

async function onboarding(req, res, next) {
    try {
        const db = getDb();
        const userId = req.user.userId;
        const companyId = 'cmp-' + Math.random().toString(36).substr(2, 9);

        const {
            name, registration_number, gstin, pan, industry, sector, business_type,
            state, district, city, address, pincode, investment_amount, annual_turnover,
            employees, land_area, power_requirement, production_capacity,
            pollution_category, water_consumption, hazardous_materials
        } = req.body;

        await db.query(
            `INSERT INTO companies (
                id, name, registration_number, gstin, pan, industry, sector, business_type,
                state, district, city, address, pincode, investment_amount, annual_turnover,
                employees, land_area, power_requirement, production_capacity,
                pollution_category, water_consumption, hazardous_materials, created_at, updated_at
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,NOW(),NOW())`,
            [
                companyId, name, registration_number || '', gstin || '', pan || '', industry, sector, business_type || 'Private Limited',
                state, district, city || '', address || '', pincode || '', investment_amount || 0, annual_turnover || 0,
                employees || 0, land_area || 0, power_requirement || 0, production_capacity || '',
                pollution_category || 'Green', water_consumption || 0, hazardous_materials || false
            ]
        );

        await db.query(
            `INSERT INTO user_company (user_id, company_id, role_in_company) VALUES ($1, $2, 'OWNER')`,
            [userId, companyId]
        );

        await logAuditAction(userId, 'COMPANY_CREATED', 'Company', companyId, { name });

        res.status(201).json({
            success: true,
            message: 'Company profile onboarded successfully',
            data: { id: companyId, name }
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getProfile,
    updateProfile,
    onboarding
};
