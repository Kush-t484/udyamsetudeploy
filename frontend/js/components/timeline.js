/* Application Timeline Visualizer Component */

const Timeline = {
    render(historyItems) {
        if (!historyItems || historyItems.length === 0) {
            return `<p style="color:var(--slate-muted); font-size:0.85rem;">No status history recorded yet.</p>`;
        }

        const stepsHtml = historyItems.map(item => `
            <div class="roadmap-step completed">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="color:var(--primary-navy);">${Utils.escapeHTML(item.new_status)}</strong>
                    <span style="font-size:0.75rem; color:var(--slate-muted);">${Utils.formatDateTime(item.created_at)}</span>
                </div>
                <p style="margin:0.25rem 0 0 0; font-size:0.85rem; color:var(--slate-body);">
                    ${Utils.escapeHTML(item.remarks || 'Status update')}
                </p>
                <div style="font-size:0.75rem; color:var(--slate-muted); margin-top:0.2rem;">
                    Updated by: ${Utils.escapeHTML(item.changed_by_name || 'System')} (${Utils.escapeHTML(item.changed_by_role || 'Officer')})
                </div>
            </div>
        `).join('');

        return `<div class="roadmap-timeline">${stepsHtml}</div>`;
    }
};

window.Timeline = Timeline;
