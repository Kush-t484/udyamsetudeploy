/* Modal Popup Component */

const Modal = {
    open(title, contentHtml, footerHtml = '') {
        this.close(); // Close any existing modal

        const backdrop = document.createElement('div');
        backdrop.id = 'active-modal-backdrop';
        backdrop.className = 'modal-backdrop active';
        backdrop.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h3 style="margin:0;">${Utils.escapeHTML(title)}</h3>
                    <button onclick="Modal.close()" class="btn btn-secondary btn-sm">✕</button>
                </div>
                <div class="modal-body">
                    ${contentHtml}
                </div>
                ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
            </div>
        `;

        document.body.appendChild(backdrop);
    },

    close() {
        const backdrop = document.getElementById('active-modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
    }
};

window.Modal = Modal;
