/* Industry Dashboard Controller */

async function renderDashboardPage() {
    const container = document.getElementById('page-content');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header-title">
                <h1 id="dash-company-name">Good morning, Industry Enterprise</h1>
                <p>Overview of your active industrial approvals, compliance obligations & subsidy eligibility.</p>
            </div>
            <button onclick="Router.navigate('#/approvals')" class="btn btn-primary">➕ Find Required Approvals</button>
        </div>

        <!-- KPI Cards Grid -->
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-title">Required Approvals</div>
                <div class="kpi-value" id="kpi-approvals">18</div>
                <div class="kpi-subtext">State & Central Regulatory Clearances</div>
            </div>
            <div class="kpi-card kpi-warning">
                <div class="kpi-title">Applications in Progress</div>
                <div class="kpi-value" id="kpi-applications">6</div>
                <div class="kpi-subtext">Active Under Officer Review</div>
            </div>
            <div class="kpi-card kpi-danger">
                <div class="kpi-title">Compliance Due Soon</div>
                <div class="kpi-value" id="kpi-compliance">4</div>
                <div class="kpi-subtext">Obligations within 7 days</div>
            </div>
            <div class="kpi-card kpi-success">
                <div class="kpi-title">Eligible Schemes</div>
                <div class="kpi-value" id="kpi-schemes">7</div>
                <div class="kpi-subtext">Matched Govt Subsidies</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-title">Pending Documents</div>
                <div class="kpi-value" id="kpi-documents">3</div>
                <div class="kpi-subtext">Awaiting verification</div>
            </div>
            <div class="kpi-card kpi-danger">
                <div class="kpi-title">Critical Alerts</div>
                <div class="kpi-value" id="kpi-alerts">1</div>
                <div class="kpi-subtext">Expired boiler hydro-test doc</div>
            </div>
        </div>

        <!-- Compliance Health Gauge & Quick Actions -->
        <div class="health-score-container">
            <div class="score-circle" id="dash-score-circle">
                <div class="score-num" id="dash-health-num">82</div>
                <div class="score-label">Health Score</div>
            </div>
            <div>
                <h3 style="color:#ffffff; margin-bottom:0.25rem;">Industrial Compliance Health Score: <span id="dash-health-status">GOOD</span></h3>
                <p style="color:#94A3B8; font-size:0.9rem; margin:0;">
                    Your compliance health score is computed dynamically based on overdue filings (+40 risk), upcoming deadlines (+25 risk), and expired documents (+30 risk).
                </p>
            </div>
            <button onclick="Router.navigate('#/compliance')" class="btn btn-secondary btn-sm" style="margin-left:auto;">Manage Compliance</button>
        </div>

        <!-- Dashboard Widgets Grid -->
        <div class="dashboard-grid">
            <div class="card">
                <div class="card-header">
                    <h3>Applications in Progress</h3>
                    <a href="#/applications" class="btn btn-secondary btn-sm">View All</a>
                </div>
                <div id="dash-recent-applications">Loading applications...</div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Top Subsidies Matched</h3>
                    <a href="#/schemes" class="btn btn-secondary btn-sm">View All</a>
                </div>
                <div id="dash-matched-schemes">Loading schemes...</div>
            </div>
        </div>
    `;

    try {
        // Fetch company profile
        const compRes = await API.getCompanyProfile();
        if (compRes.success && compRes.data) {
            document.getElementById('dash-company-name').textContent = `Good morning, ${compRes.data.name}`;
        }

        // Fetch applications
        const appRes = await API.getApplications();
        if (appRes.success) {
            const apps = appRes.data;
            const inProgress = apps.filter(a => a.status !== 'APPROVED' && a.status !== 'REJECTED');
            document.getElementById('kpi-applications').textContent = inProgress.length || apps.length;

            const recentApps = apps.slice(0, 5);
            const headers = ['App #', 'Approval', 'Status', 'SLA Target'];
            const rows = recentApps.map(a => [
                `<strong>${Utils.escapeHTML(a.application_number)}</strong>`,
                Utils.escapeHTML(a.approval_name),
                Utils.getStatusBadge(a.status),
                Utils.formatDate(a.expected_completion_date)
            ]);
            document.getElementById('dash-recent-applications').innerHTML = Table.render({ headers, rows });
        }

        // Fetch compliance score
        const compSummary = await API.getCompliance();
        if (compSummary.success) {
            const summary = compSummary.data.summary;
            document.getElementById('kpi-compliance').textContent = summary.breakdown.due_soon_compliance || 4;
            document.getElementById('kpi-alerts').textContent = summary.breakdown.overdue_compliance || 1;
            document.getElementById('dash-health-num').textContent = summary.compliance_health_score;

            const statusText = summary.risk_level === 'LOW' ? 'EXCELLENT' : summary.risk_level === 'MEDIUM' ? 'GOOD' : 'CRITICAL PENALTY RISK';
            document.getElementById('dash-health-status').textContent = statusText;
        }

        // Fetch matched schemes
        const schemeRes = await API.matchSchemes();
        if (schemeRes.success) {
            const matches = schemeRes.data.matched_schemes.slice(0, 4);
            document.getElementById('kpi-schemes').textContent = schemeRes.data.matched_schemes.length;

            const html = matches.map(m => `
                <div style="padding:0.75rem 0; border-bottom:1px solid var(--border-color);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="font-size:0.9rem; color:var(--primary-navy);">${Utils.escapeHTML(m.scheme.name)}</strong>
                        <span class="badge badge-approved">${m.score}% Match</span>
                    </div>
                    <p style="font-size:0.8rem; color:var(--slate-muted); margin:0.25rem 0 0 0;">${Utils.escapeHTML(m.scheme.department)}</p>
                </div>
            `).join('');
            document.getElementById('dash-matched-schemes').innerHTML = html;
        }
    } catch (err) {
        console.error('Dashboard Load Error:', err);
    }
}

window.renderDashboardPage = renderDashboardPage;
