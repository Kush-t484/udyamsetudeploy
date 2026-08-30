/* Role-Aware Sidebar Component */

const Sidebar = {
    render() {
        const user = State.user || { role: 'INDUSTRY' };
        const role = user.role;

        let menuHtml = '';

        if (role === 'INDUSTRY') {
            menuHtml = `
                <li class="sidebar-item"><a href="#/dashboard">📊 Industry Dashboard</a></li>
                <li class="sidebar-item"><a href="#/profile">🏢 Company Profile</a></li>
                <li class="sidebar-item"><a href="#/approvals">🔍 Find Approvals</a></li>
                <li class="sidebar-item"><a href="#/applications">📋 Applications</a></li>
                <li class="sidebar-item"><a href="#/documents">📁 Document Vault</a></li>
                <li class="sidebar-item"><a href="#/compliance">⚖️ Compliance Obligations</a></li>
                <li class="sidebar-item"><a href="#/schemes">🎁 Government Support Schemes</a></li>
                <li class="sidebar-item"><a href="#/assistant">🤖 UdyamSetu AI Assistant</a></li>
                <li class="sidebar-item"><a href="#/notifications">🔔 Notifications</a></li>
                <li class="sidebar-item"><a href="#/reports">📈 Audit & Reports</a></li>
            `;
        } else if (role === 'OFFICER') {
            menuHtml = `
                <li class="sidebar-item"><a href="#/officer-dashboard">📊 Officer Console</a></li>
                <li class="sidebar-item"><a href="#/applications">📥 Review Queue</a></li>
                <li class="sidebar-item"><a href="#/documents">🔍 Document Verification</a></li>
                <li class="sidebar-item"><a href="#/notifications">🔔 Officer Notifications</a></li>
                <li class="sidebar-item"><a href="#/reports">📑 Reports</a></li>
            `;
        } else if (role === 'ADMIN') {
            menuHtml = `
                <li class="sidebar-item"><a href="#/admin-dashboard">📊 Admin Dashboard</a></li>
                <li class="sidebar-item"><a href="#/admin-management">👥 Users & Companies</a></li>
                <li class="sidebar-item"><a href="#/approvals">📜 Approvals Master</a></li>
                <li class="sidebar-item"><a href="#/schemes">🎁 Schemes Master</a></li>
                <li class="sidebar-item"><a href="#/admin-audit">🔒 System Audit Logs</a></li>
                <li class="sidebar-item"><a href="#/reports">📑 Analytics Reports</a></li>
            `;
        }

        return `
            <aside class="sidebar">
                <div class="sidebar-header">
                    <h3 style="color:#ffffff; font-size:1.1rem; font-weight:800;">UdyamSetu AI</h3>
                    <p style="font-size:0.7rem; color:#94A3B8; margin:0;">One Platform. Every Approval.</p>
                </div>
                <ul class="sidebar-menu">
                    ${menuHtml}
                </ul>
            </aside>
        `;
    },

    initEvents() {}
};

window.Sidebar = Sidebar;
