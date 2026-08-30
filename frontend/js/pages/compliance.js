/* Compliance Obligations & Risk Health Page */

async function renderCompliancePage() {
    const container = document.getElementById('page-content');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header-title">
                <h1>Industrial Compliance Management & Health Score</h1>
                <p>Track statutory filings, environmental returns & safety audit deadlines.</p>
            </div>
            <button onclick="runAutoComplianceCheck()" class="btn btn-secondary">🔄 Run Compliance Check Engine</button>
        </div>

        <!-- Health Score Banner -->
        <div class="health-score-container">
            <div class="score-circle">
                <div class="score-num" id="comp-health-num">--</div>
                <div class="score-label">Health Index</div>
            </div>
            <div style="flex:1;">
                <h3 style="color:#ffffff; margin-bottom:0.25rem;">Compliance Status: <span id="comp-risk-level">--</span></h3>
                <p style="color:#94A3B8; font-size:0.85rem; margin:0;" id="comp-breakdown-text">Loading penalty points breakdown...</p>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3>Statutory Obligation Calendar</h3>
            </div>
            <div id="compliance-table-container">Loading compliance records...</div>
        </div>
    `;

    await loadComplianceData();
}

async function loadComplianceData() {
    const tableContainer = document.getElementById('compliance-table-container');
    try {
        const res = await API.getCompliance();
        if (res.success) {
            const { summary, records } = res.data;

            document.getElementById('comp-health-num').textContent = summary.compliance_health_score;
            document.getElementById('comp-risk-level').textContent = summary.risk_level;

            const b = summary.breakdown;
            document.getElementById('comp-breakdown-text').textContent =
                `Overdue Items: ${b.overdue_compliance} (+40pts/item) | Due Soon: ${b.due_soon_compliance} (+25pts) | Expired Docs: ${b.expired_documents} (+30pts) | Total Penalty: ${summary.risk_score} pts.`;

            const headers = ['Obligation Title', 'Category', 'Frequency', 'Department', 'Due Date', 'Risk Level', 'Status', 'Action'];
            const rows = records.map(r => [
                `<strong>${Utils.escapeHTML(r.requirement_name)}</strong>`,
                `<span class="badge badge-submitted">${Utils.escapeHTML(r.category)}</span>`,
                Utils.escapeHTML(r.frequency),
                Utils.escapeHTML(r.department_name || 'Competent Authority'),
                Utils.formatDate(r.due_date),
                Utils.getRiskBadge(r.risk_level),
                Utils.getStatusBadge(r.status),
                r.status === 'COMPLETED' ? '✅ Completed' : `<button onclick="markObligationCompleted('${r.id}')" class="btn btn-primary btn-sm">Mark Complete</button>`
            ]);

            tableContainer.innerHTML = Table.render({ headers, rows });
        }
    } catch (err) {
        tableContainer.innerHTML = `<p style="color:var(--danger-red);">Error loading compliance data: ${Utils.escapeHTML(err.message)}</p>`;
    }
}

async function markObligationCompleted(recordId) {
    try {
        const res = await API.updateComplianceRecord(recordId, {
            status: 'COMPLETED',
            remarks: 'Marked as completed by industry user'
        });

        if (res.success) {
            Toast.success('Compliance obligation marked as COMPLETED!');
            await loadComplianceData();
        }
    } catch (err) {
        Toast.error(err.message);
    }
}

async function runAutoComplianceCheck() {
    try {
        Toast.info('Executing backend compliance automation check...');
        const res = await API.runComplianceCheck();
        if (res.success) {
            Toast.success(res.message);
            await loadComplianceData();
        }
    } catch (err) {
        Toast.error(err.message);
    }
}

window.renderCompliancePage = renderCompliancePage;
window.markObligationCompleted = markObligationCompleted;
window.runAutoComplianceCheck = runAutoComplianceCheck;
