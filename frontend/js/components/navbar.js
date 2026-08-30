/* Topbar Component with Fixed Authenticated Identity */

const Navbar = {
    render() {
        const user = State.user || { name: 'User', role: 'INDUSTRY' };
        const role = user.role;

        let roleLabel = 'Industry Enterprise';
        let roleBadgeClass = 'badge-submitted';
        if (role === 'OFFICER') {
            roleLabel = 'Government Officer';
            roleBadgeClass = 'badge-inspection';
        } else if (role === 'ADMIN') {
            roleLabel = 'System Administrator';
            roleBadgeClass = 'badge-critical';
        }

        return `
            <header class="topbar">
                <div class="brand-logo">
                    <span style="display:flex; align-items:center; gap:0.5rem;">
                        <span style="color:#1D4ED8; font-size:1.4rem;">⚡</span>
                        <span>UdyamSetu AI</span>
                    </span>
                    <span class="badge ${roleBadgeClass}" style="margin-left:0.5rem; font-size:0.7rem; font-weight:700;">
                        ${roleLabel}
                    </span>
                </div>

                <div class="flex items-center gap-4">
                    <!-- Authenticated User Profile & Logout -->
                    <div class="user-profile-badge flex items-center gap-3" style="background:#F8FAFC; padding:0.4rem 0.85rem; border-radius:8px; border:1px solid #E2E8F0;">
                        <div style="width:32px; height:32px; border-radius:50%; background:#1D4ED8; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.85rem;">
                            ${Utils.escapeHTML(user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                        </div>
                        <div class="flex flex-col" style="text-align:left; line-height:1.2;">
                            <span class="font-semibold text-sm" style="color:#0A192F;">${Utils.escapeHTML(user.name)}</span>
                            <span class="text-xs" style="color:#64748B;">${Utils.escapeHTML(user.email || '')}</span>
                        </div>
                        <button onclick="Auth.logout()" class="btn btn-secondary btn-sm" style="margin-left:0.5rem; padding:0.25rem 0.6rem; font-size:0.75rem;" title="Log out from system">
                            Logout
                        </button>
                    </div>
                </div>
            </header>
        `;
    },

    initEvents() {
        // Role is securely fixed by session authentication
    }
};

window.Navbar = Navbar;
