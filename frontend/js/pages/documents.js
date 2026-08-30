/* Document Vault & Management Page */

async function renderDocumentsPage() {
    const container = document.getElementById('page-content');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header-title">
                <h1>Document Vault & Compliance Repository</h1>
                <p>Upload, store & manage verified certificates, factory blueprints & permits.</p>
            </div>
            <button onclick="openUploadDocumentModal()" class="btn btn-primary">📤 Upload New Document</button>
        </div>

        <div class="card">
            <div class="table-toolbar">
                <select id="doc-type-filter" class="form-control" style="max-width:200px;">
                    <option value="">All Document Categories</option>
                    <option value="Business">Business & Incorporation</option>
                    <option value="Environment">Environment & CTE/CTO</option>
                    <option value="Factory">Factory & Layout Blueprint</option>
                    <option value="Safety">Safety & Fire NOC</option>
                    <option value="Labour">Labour & Welfare</option>
                    <option value="Tax">Tax & GST</option>
                    <option value="Land">Land & Lease</option>
                </select>
                <select id="doc-status-filter" class="form-control" style="max-width:200px;">
                    <option value="">All Verification Statuses</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="EXPIRED">EXPIRED</option>
                </select>
            </div>

            <div id="documents-table-container">Loading document vault...</div>
        </div>
    `;

    document.getElementById('doc-type-filter').addEventListener('change', loadDocumentsList);
    document.getElementById('doc-status-filter').addEventListener('change', loadDocumentsList);

    await loadDocumentsList();
}

async function loadDocumentsList() {
    const tableContainer = document.getElementById('documents-table-container');
    const docType = document.getElementById('doc-type-filter').value;
    const status = document.getElementById('doc-status-filter').value;

    let params = [];
    if (docType) params.push(`document_type=${encodeURIComponent(docType)}`);
    if (status) params.push(`verification_status=${encodeURIComponent(status)}`);
    const paramStr = params.length > 0 ? `?${params.join('&')}` : '';

    try {
        const res = await API.getDocuments(paramStr);
        if (res.success) {
            const docs = res.data;
            const headers = ['Document Name', 'Category', 'Original File', 'Uploaded Date', 'Expiry Warning', 'Status', 'Actions'];

            const rows = docs.map(d => {
                let expiryBadge = '<span>N/A</span>';
                if (d.expiry_date) {
                    const daysLeft = Math.ceil((new Date(d.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
                    if (daysLeft < 0) {
                        expiryBadge = `<span class="badge badge-critical">EXPIRED (${Math.abs(daysLeft)}d ago)</span>`;
                    } else if (daysLeft <= 7) {
                        expiryBadge = `<span class="badge badge-due_soon">DUE IN ${daysLeft} DAYS</span>`;
                    } else if (daysLeft <= 30) {
                        expiryBadge = `<span class="badge badge-under_review">Expires in ${daysLeft}d</span>`;
                    } else {
                        expiryBadge = `<span style="font-size:0.8rem; color:var(--slate-muted);">${Utils.formatDate(d.expiry_date)}</span>`;
                    }
                }

                return [
                    `<strong>${Utils.escapeHTML(d.name)}</strong>`,
                    `<span class="badge badge-submitted">${Utils.escapeHTML(d.document_type || 'General')}</span>`,
                    `<a href="${d.file_path}" target="_blank" style="font-size:0.85rem;">📄 ${Utils.escapeHTML(d.original_filename)}</a>`,
                    Utils.formatDate(d.uploaded_at),
                    expiryBadge,
                    Utils.getStatusBadge(d.verification_status),
                    `<button onclick="deleteDocRecord('${d.id}')" class="btn btn-danger btn-sm">🗑️</button>`
                ];
            });

            tableContainer.innerHTML = Table.render({ headers, rows, emptyMessage: 'No documents in vault.' });
        }
    } catch (err) {
        tableContainer.innerHTML = `<p style="color:var(--danger-red);">Error loading documents: ${Utils.escapeHTML(err.message)}</p>`;
    }
}

function openUploadDocumentModal() {
    const html = `
        <form id="upload-doc-form" enctype="multipart/form-data">
            <div class="form-group">
                <label>Document Title Name</label>
                <input type="text" id="up-doc-name" class="form-control" placeholder="e.g. Factory Layout Blueprint 2026" required>
            </div>
            <div class="form-group">
                <label>Document Category</label>
                <select id="up-doc-type" class="form-control">
                    <option value="Business">Business & Incorporation</option>
                    <option value="Environment">Environment & CTE/CTO</option>
                    <option value="Factory">Factory & Layout</option>
                    <option value="Safety">Safety & Fire NOC</option>
                    <option value="Labour">Labour Welfare</option>
                    <option value="Tax">Tax & GST</option>
                    <option value="Land">Land Lease</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Expiry Date (If applicable)</label>
                <input type="date" id="up-doc-expiry" class="form-control">
            </div>
            <div class="form-group">
                <label>Select File (PDF, DOC, DOCX, JPG, PNG)</label>
                <input type="file" id="up-doc-file" class="form-control" required>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1.5rem;">
                <button type="button" onclick="Modal.close()" class="btn btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-primary">Submit Upload</button>
            </div>
        </form>
    `;

    Modal.open('Upload Document to Vault', html);

    document.getElementById('upload-doc-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('up-doc-name').value;
        const docType = document.getElementById('up-doc-type').value;
        const expiry = document.getElementById('up-doc-expiry').value;
        const fileInput = document.getElementById('up-doc-file');

        if (!fileInput.files[0]) {
            Toast.error('Please select a file to upload');
            return;
        }

        const formData = new FormData();
        formData.append('document', fileInput.files[0]);
        formData.append('name', name);
        formData.append('document_type', docType);
        if (expiry) formData.append('expiry_date', expiry);

        try {
            const res = await API.uploadDocument(formData);
            if (res.success) {
                Toast.success('Document uploaded successfully');
                Modal.close();
                await loadDocumentsList();
            }
        } catch (err) {
            Toast.error(err.message);
        }
    });
}

async function deleteDocRecord(docId) {
    if (!confirm('Are you sure you want to delete this document from vault?')) return;
    try {
        const res = await API.deleteDocument(docId);
        if (res.success) {
            Toast.success('Document deleted');
            await loadDocumentsList();
        }
    } catch (err) {
        Toast.error(err.message);
    }
}

window.renderDocumentsPage = renderDocumentsPage;
window.openUploadDocumentModal = openUploadDocumentModal;
window.deleteDocRecord = deleteDocRecord;
