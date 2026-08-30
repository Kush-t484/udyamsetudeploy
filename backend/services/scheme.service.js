const { getDb } = require('../config/database');

async function matchSchemesForCompany(companyProfile) {
    const db = getDb();
    
    // Fetch active schemes and eligibility rules
    const schemesRes = await db.query('SELECT * FROM schemes WHERE is_active = TRUE ORDER BY created_at DESC');
    const schemes = schemesRes.rows;

    const matchedResults = [];

    for (const sch of schemes) {
        const rulesRes = await db.query('SELECT * FROM scheme_eligibility_rules WHERE scheme_id = $1', [sch.id]);
        const rules = rulesRes.rows;

        let totalWeight = 0;
        let score = 0;
        const matchedCriteria = [];
        const unmatchedCriteria = [];

        // Base evaluations if rules table has definitions
        if (rules.length > 0) {
            for (const rule of rules) {
                const w = rule.weight || 10;
                totalWeight += w;
                const fieldName = rule.field_name;
                const compVal = companyProfile[fieldName];
                const targetVal = rule.value;
                const op = rule.operator;

                let isMatch = false;

                if (compVal !== undefined && compVal !== null) {
                    if (op === '=') {
                        isMatch = String(compVal).toLowerCase() === String(targetVal).toLowerCase() || targetVal.toLowerCase() === 'all';
                    } else if (op === '>=') {
                        isMatch = parseFloat(compVal) >= parseFloat(targetVal);
                    } else if (op === '<=') {
                        isMatch = parseFloat(compVal) <= parseFloat(targetVal);
                    } else if (op === 'IN' || op === 'LIKE') {
                        isMatch = String(compVal).toLowerCase().includes(String(targetVal).toLowerCase());
                    }
                }

                if (isMatch) {
                    score += w;
                    matchedCriteria.push(`${fieldName} (${compVal}) satisfied requirement ${op} ${targetVal}`);
                } else {
                    unmatchedCriteria.push(`${fieldName} criteria (${op} ${targetVal}) not fully met`);
                }
            }
        } else {
            // General matching heuristics if explicit rules table is unpopulated
            totalWeight = 100;
            if (sch.sector === 'All' || (companyProfile.sector && companyProfile.sector.toLowerCase().includes(sch.sector.toLowerCase()))) {
                score += 35;
                matchedCriteria.push('Sector alignment satisfied');
            }
            if (sch.state === 'All' || (companyProfile.state && companyProfile.state.toLowerCase() === sch.state.toLowerCase())) {
                score += 35;
                matchedCriteria.push('State location requirement matched');
            }
            if (parseFloat(companyProfile.investment_amount || 0) >= 5000000) {
                score += 30;
                matchedCriteria.push('Industrial investment threshold satisfied');
            }
        }

        // Normalize match percentage
        const finalPercent = totalWeight > 0 ? Math.min(100, Math.round((score / totalWeight) * 100)) : 70;

        let relevance = 'Low Match';
        if (finalPercent >= 90) relevance = 'Highly Relevant';
        else if (finalPercent >= 70) relevance = 'Relevant';
        else if (finalPercent >= 50) relevance = 'Potential Match';

        matchedResults.push({
            scheme: sch,
            score: finalPercent,
            relevance,
            matchedCriteria,
            unmatchedCriteria
        });
    }

    // Sort by highest score descending
    matchedResults.sort((a, b) => b.score - a.score);

    return {
        company: {
            name: companyProfile.name,
            sector: companyProfile.sector,
            state: companyProfile.state
        },
        matched_schemes: matchedResults,
        disclaimer: 'Prototype eligibility recommendation. Scheme approval subject to formal application and government policy review.'
    };
}

module.exports = {
    matchSchemesForCompany
};
