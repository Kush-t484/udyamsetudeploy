/* Administrator Console & System Audit Script */

async function renderAdminPage() {
    const container = document.getElementById('page-content');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header-title">
                <h1>System Administration & Security Console</h1>
                <p>Monitor platform analytics, user accounts & system audit logs.</p>
            </div>
        </div>

        <div class="kpi-grid">
            <div class="kpi-card"><div class="kpi-title">Total Users</div><div class="kpi-value" id="adm-users">--</div></div>
            <div class="kpi-card"><div class="kpi-title">Total Companies</div><div class="kpi-value" id="adm-companies">--</div></div>
            <div class="kpi-card"><div class="kpi-title">Applications</div><div class="kpi-value" id="adm-apps">--</div></div>
            <div class="kpi-card kpi-warning"><div class="kpi-title">Pending Apps</div><div class="kpi-value" id="adm-pending">--</div></div>
            <div class="kpi-card kpi-danger"><div class="kpi-title">Overdue Compliance</div><div class="kpi-value" id="adm-overdue">--</div></div>
            <div class="kpi-card kpi-success"><div class="kpi-title">Audit Log Entries</div><div class="kpi-value" id="adm-audit">--</div></div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3>System Audit Trail</h3>
            </div>
            <div id="admin-audit-table-container">Loading audit logs...</div>
        </div>
    `;

    await loadAdminDashboardData();
}

async function loadAdminDashboardData() {
    const auditContainer = document.getElementById('admin-audit-table-container');
    try {
        const metricsRes = await API.getAdminDashboard();
        if (metricsRes.success) {
            const m = metricsRes.data;
            document.getElementById('adm-users').textContent = m.total_users;
            document.getElementById('adm-companies').textContent = m.total_companies;
            document.getElementById('adm-apps').textContent = m.total_applications;
            document.getElementById('adm-pending').textContent = m.pending_applications;
            document.getElementById('adm-overdue').textContent = m.overdue_compliance;
            document.getElementById('adm-audit').textContent = m.system_activities;
        }

        const logsRes = await API.getAdminAuditLogs();
        if (logsRes.success) {
            const logs = logsRes.data;
            const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address'];
            const rows = logs.map(l => [
                Utils.formatDateTime(l.created_at),
                Utils.escapeHTML(l.user_name || l.user_email || 'System'),
                `<span class="badge badge-submitted">${Utils.escapeHTML(l.action)}</span>`,
                Utils.escapeHTML(l.entity_type),
                Utils.escapeHTML(l.entity_id),
                Utils.escapeHTML(l.ip_address || '127.0.0.1')
            ]);
            auditContainer.innerHTML = Table.render({ headers, rows });
        }
    } catch (err) {
        auditContainer.innerHTML = `<p style="color:var(--danger-red);">Admin data error: ${Utils.escapeHTML(err.message)}</p>`;
    }
}

window.renderAdminPage = renderAdminPage;
