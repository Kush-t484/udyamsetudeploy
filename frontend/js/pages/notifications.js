/* Notifications Center Script */

async function renderNotificationsPage() {
    const container = document.getElementById('page-content');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header-title">
                <h1>Notifications & Real-Time System Alerts</h1>
                <p>Track status changes, officer remarks & compliance warnings.</p>
            </div>
            <button onclick="markAllNotifsRead()" class="btn btn-secondary btn-sm">✓ Mark All as Read</button>
        </div>

        <div class="card">
            <div id="notifications-list-box">Loading notifications...</div>
        </div>
    `;

    await loadNotificationsList();
}

async function loadNotificationsList() {
    const box = document.getElementById('notifications-list-box');
    try {
        const res = await API.getNotifications();
        if (res.success) {
            const { notifications, unread_count } = res.data;
            if (notifications.length === 0) {
                box.innerHTML = `<p style="text-align:center; padding:2rem; color:var(--slate-muted);">No notifications on file.</p>`;
                return;
            }

            const html = notifications.map(n => `
                <div style="padding:1rem; border-bottom:1px solid var(--border-color); background:${n.is_read ? '#ffffff' : '#EFF6FF'}; display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
                            <span class="badge badge-submitted">${Utils.escapeHTML(n.type)}</span>
                            <strong style="color:var(--primary-navy); font-size:0.95rem;">${Utils.escapeHTML(n.title)}</strong>
                        </div>
                        <p style="margin:0.25rem 0 0 0; font-size:0.85rem; color:var(--slate-body);">${Utils.escapeHTML(n.message)}</p>
                        <span style="font-size:0.75rem; color:var(--slate-muted);">${Utils.formatDateTime(n.created_at)}</span>
                    </div>
                    ${!n.is_read ? `<button onclick="markNotifRead('${n.id}')" class="btn btn-secondary btn-sm">Mark Read</button>` : ''}
                </div>
            `).join('');

            box.innerHTML = html;
        }
    } catch (err) {
        box.innerHTML = `<p style="color:var(--danger-red);">Failed to load notifications: ${Utils.escapeHTML(err.message)}</p>`;
    }
}

async function markNotifRead(id) {
    try {
        await API.markNotificationRead(id);
        await loadNotificationsList();
    } catch (err) {
        Toast.error(err.message);
    }
}

async function markAllNotifsRead() {
    try {
        await API.markAllNotificationsRead();
        Toast.success('All notifications marked as read');
        await loadNotificationsList();
    } catch (err) {
        Toast.error(err.message);
    }
}

window.renderNotificationsPage = renderNotificationsPage;
window.markNotifRead = markNotifRead;
window.markAllNotifsRead = markAllNotifsRead;
