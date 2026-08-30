const { getDb } = require('../config/database');

async function analyzeApprovals(profile) {
    const db = getDb();
    
    // Fetch all active approvals from DB
    const res = await db.query('SELECT a.*, d.name as department_name FROM approvals a LEFT JOIN departments d ON a.department_id = d.id WHERE a.is_active = TRUE');
    const allApprovals = res.rows;

    const recommended = [];

    const industry = (profile.industry || '').toLowerCase();
    const sector = (profile.sector || '').toLowerCase();
    const pollutionCategory = (profile.pollution_category || 'Green').toLowerCase();
    const hazardous = Boolean(profile.hazardous_materials);
    const employees = parseInt(profile.employees || 0, 10);
    const power = parseFloat(profile.power_requirement || 0);
    const water = parseFloat(profile.water_consumption || 0);

    for (const appr of allApprovals) {
        let isApplicable = false;
        let reason = '';
        let priority = appr.priority || 'MEDIUM';

        const cat = (appr.category || '').toUpperCase();
        const name = (appr.name || '').toLowerCase();

        if (cat === 'ENVIRONMENT' || name.includes('cte') || name.includes('cto') || name.includes('pollution')) {
            if (pollutionCategory === 'orange' || pollutionCategory === 'red') {
                isApplicable = true;
                reason = `Required for industrial units operating under ${profile.pollution_category || 'Orange'} pollution classification under Air & Water Pollution Control Acts.`;
                priority = 'CRITICAL';
            } else if (hazardous) {
                isApplicable = true;
                reason = 'Mandatory due to handling or generation of hazardous substances/chemicals.';
                priority = 'CRITICAL';
            }
        }

        if (cat === 'FACTORY' || name.includes('factory') || name.includes('building')) {
            if (industry.includes('manufacturing') || employees >= 10) {
                isApplicable = true;
                reason = `Required under Factories Act 1948 for manufacturing facilities with ${employees} workers.`;
                priority = 'HIGH';
            }
        }

        if (cat === 'FIRE' || name.includes('fire')) {
            if (hazardous || pollutionCategory === 'orange' || pollutionCategory === 'red' || power > 100) {
                isApplicable = true;
                reason = 'Fire NOC required for high power load or hazardous material storage.';
                priority = 'HIGH';
            }
        }

        if (cat === 'LABOUR' || name.includes('labour') || name.includes('epf') || name.includes('esi')) {
            if (employees >= 20) {
                isApplicable = true;
                reason = `Mandatory labour welfare compliance for enterprises with ${employees}+ employees.`;
                priority = 'MEDIUM';
            }
        }

        if (cat === 'SAFETY' || name.includes('boiler') || name.includes('explosive')) {
            if (hazardous || power >= 200 || name.includes('boiler')) {
                isApplicable = true;
                reason = 'Industrial safety clearance for high pressure steam vessels or compressed gas systems.';
                priority = 'HIGH';
            }
        }

        if (cat === 'BUSINESS' || name.includes('power')) {
            if (power >= 50) {
                isApplicable = true;
                reason = `Required for HT power connection sanction (${power} HP requirement).`;
                priority = 'HIGH';
            }
        }

        if (cat === 'LOCAL_AUTHORITY' || name.includes('groundwater') || name.includes('water')) {
            if (water >= 10) {
                isApplicable = true;
                reason = `Central Ground Water Authority NOC required for extraction exceeding ${water} KLD.`;
                priority = 'MEDIUM';
            }
        }

        if (cat === 'TAX' || name.includes('gst')) {
            isApplicable = true;
            reason = 'Mandatory tax registration for industrial commercial operations.';
            priority = 'MEDIUM';
        }

        if (isApplicable) {
            // Fetch required documents
            const docsRes = await db.query('SELECT document_name, description, mandatory FROM approval_documents WHERE approval_id = $1', [appr.id]);
            recommended.push({
                approval_id: appr.id,
                approval_name: appr.name,
                category: appr.category,
                department: appr.department_name || 'State Competent Authority',
                priority,
                reason,
                estimated_processing_days: appr.estimated_processing_days,
                application_url: appr.application_url,
                required_documents: docsRes.rows
            });
        }
    }

    return {
        profile_analyzed: {
            industry: profile.industry,
            sector: profile.sector,
            state: profile.state,
            pollution_category: profile.pollution_category,
            hazardous_materials: profile.hazardous_materials
        },
        potentially_applicable_approvals: recommended,
        disclaimer: 'Requirements shown are recommendations based on the information provided. Verify final applicability with the relevant competent authority.'
    };
}

module.exports = {
    analyzeApprovals
};
