/* Data Table Generator Component */

const Table = {
    render({ headers, rows, emptyMessage = 'No records found.' }) {
        if (!rows || rows.length === 0) {
            return `
                <div class="table-responsive">
                    <div style="padding: 2rem; text-align: center; color: var(--slate-muted);">
                        ${Utils.escapeHTML(emptyMessage)}
                    </div>
                </div>
            `;
        }

        const headersHtml = headers.map(h => `<th>${Utils.escapeHTML(h)}</th>`).join('');
        const rowsHtml = rows.map(row => {
            const cells = row.map(c => `<td>${c}</td>`).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        return `
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>${headersHtml}</tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        `;
    }
};

window.Table = Table;
