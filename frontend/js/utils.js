/* UdyamSetu AI Utility Helpers */

const Utils = {
    formatCurrency(amount) {
        if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    },

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return 'N/A';
        return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    },

    formatDateTime(dateString) {
        if (!dateString) return 'N/A';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return 'N/A';
        return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    getStatusBadge(status) {
        const s = (status || 'UNKNOWN').toLowerCase();
        const label = status ? status.replace(/_/g, ' ') : 'Unknown';
        return `<span class="badge badge-${s}">${Utils.escapeHTML(label)}</span>`;
    },

    getRiskBadge(level) {
        const l = (level || 'MEDIUM').toLowerCase();
        return `<span class="badge badge-${l}">${Utils.escapeHTML(level)}</span>`;
    }
};

window.Utils = Utils;
