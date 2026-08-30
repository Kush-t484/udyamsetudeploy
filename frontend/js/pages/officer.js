/* Government Officer Console & Review Workflow Script */

async function renderOfficerPage() {
    const container = document.getElementById('page-content');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header-title">
                <h1>Government Officer Review Console</h1>
                <p>Verify documents, perform site inspection checks & process clearance approvals.</p>
            </div>
        </div>

        <!-- Officer KPI Grid -->
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-title">Applications Assigned</div>
                <div class="kpi-value" id="off-kpi-total">12</div>
            </div>
            <div class="kpi-card kpi-warning">
                <div class="kpi-title">Pending Review</div>
                <div class="kpi-value" id="off-kpi-pending">5</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-title">Inspection Pending</div>
                <div class="kpi-value" id="off-kpi-inspection">2</div>
            </div>
            <div class="kpi-card kpi-danger">
                <div class="kpi-title">SLA Breached</div>
                <div class="kpi-value" id="off-kpi-sla">1</div>
            </div>
            <div class="kpi-card kpi-success">
                <div class="kpi-title">Approved Clearances</div>
                <div class="kpi-value" id="off-kpi-approved">4</div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3>Application Review Queue</h3>
            </div>
            <div id="officer-queue-table-container">Loading assigned queue...</div>
        </div>
    `;

    await loadOfficerDashboard();
}

async function loadOfficerDashboard() {
    const tableBox = document.getElementById('officer-queue-table-container');

    try {
        const metricsRes = await API.getOfficerDashboard();
        if (metricsRes.success) {
            const m = metricsRes.data;
            document.getElementById('off-kpi-total').textContent = m.total_applications;
            document.getElementById('off-kpi-pending').textContent = m.pending_review;
            document.getElementById('off-kpi-inspection').textContent = m.inspection_pending;
            document.getElementById('off-kpi-sla').textContent = m.sla_breached;
            document.getElementById('off-kpi-approved').textContent = m.approved;
        }

        const appRes = await API.getOfficerApplications();
        if (appRes.success) {
            const apps = appRes.data;
            const headers = ['App Number', 'Enterprise Name', 'Approval Clearance', 'Submitted Date', 'Status', 'Priority', 'Review Action'];

            const rows = apps.map(a => [
                `<strong>${Utils.escapeHTML(a.application_number)}</strong>`,
                Utils.escapeHTML(a.company_name),
                Utils.escapeHTML(a.approval_name),
                Utils.formatDate(a.submitted_at || a.created_at),
                Utils.getStatusBadge(a.status),
                Utils.getRiskBadge(a.priority),
                `<button onclick="openOfficerReviewModal('${a.id}')" class="btn btn-primary btn-sm">📝 Review & Transition</button>`
            ]);

            tableBox.innerHTML = Table.render({ headers, rows });
        }
    } catch (err) {
        tableBox.innerHTML = `<p style="color:var(--danger-red);">Error loading officer queue: ${Utils.escapeHTML(err.message)}</p>`;
    }
}

async function openOfficerReviewModal(appId) {
    try {
        const res = await API.getApplicationById(appId);
        if (res.success) {
            const { application, documents, timeline } = res.data;

            const docsHtml = documents.map(d => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem; border-bottom:1px solid var(--border-color); font-size:0.85rem;">
                    <div>
                        📄 <a href="${d.file_path}" target="_blank"><strong>${Utils.escapeHTML(d.name)}</strong></a>
                        <span style="margin-left:0.5rem;">${Utils.getStatusBadge(d.verification_status)}</span>
                    </div>
                    <div>
                        <button onclick="verifyDocStatus('${d.id}', 'VERIFIED')" class="btn btn-success btn-sm">Verify</button>
                        <button onclick="verifyDocStatus('${d.id}', 'REJECTED')" class="btn btn-danger btn-sm">Reject</button>
                    </div>
                </div>
            `).join('');

            const contentHtml = `
                <div>
                    <div style="background:var(--bg-light); padding:1rem; border-radius:var(--radius-sm); margin-bottom:1rem; font-size:0.85rem;">
                        <strong>Enterprise:</strong> ${Utils.escapeHTML(application.company_name)}<br>
                        <strong>Application Number:</strong> ${Utils.escapeHTML(application.application_number)}<br>
                        <strong>Current Status:</strong> ${Utils.getStatusBadge(application.status)}
                    </div>

                    <h4 style="margin-bottom:0.5rem;">Document Review & Verification</h4>
                    <div style="margin-bottom:1.5rem; max-height:150px; overflow-y:auto; border:1px solid var(--border-color); padding:0.5rem; border-radius:var(--radius-sm);">
                        ${documents.length > 0 ? docsHtml : '<p style="font-size:0.8rem; color:var(--slate-muted);">No documents attached.</p>'}
                    </div>

                    <h4 style="margin-bottom:0.5rem;">Official Officer Action</h4>
                    <form id="officer-action-form">
                        <div class="form-group">
                            <label>Transition Application Status</label>
                            <select id="off-new-status" class="form-control">
                                <option value="DOCUMENT_VERIFICATION" ${application.status === 'DOCUMENT_VERIFICATION' ? 'selected' : ''}>DOCUMENT VERIFICATION</option>
                                <option value="UNDER_REVIEW" ${application.status === 'UNDER_REVIEW' ? 'selected' : ''}>UNDER REVIEW</option>
                                <option value="INSPECTION" ${application.status === 'INSPECTION' ? 'selected' : ''}>INSPECTION SCHEDULED</option>
                                <option value="ADDITIONAL_DOCUMENTS" ${application.status === 'ADDITIONAL_DOCUMENTS' ? 'selected' : ''}>REQUEST ADDITIONAL DOCUMENTS</option>
                                <option value="APPROVED" ${application.status === 'APPROVED' ? 'selected' : ''}>GRANT APPROVAL (APPROVED)</option>
                                <option value="REJECTED" ${application.status === 'REJECTED' ? 'selected' : ''}>REJECT APPLICATION</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Official Remarks / Inspection Notes</label>
                            <textarea id="off-remarks" class="form-control" placeholder="Enter official remarks..." required>${Utils.escapeHTML(application.remarks || '')}</textarea>
                        </div>
                        <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
                            <button type="button" onclick="Modal.close()" class="btn btn-secondary">Cancel</button>
                            <button type="submit" class="btn btn-primary">Update Status & Notify Enterprise</button>
                        </div>
                    </form>
                </div>
            `;

            Modal.open(`Officer Review: ${application.application_number}`, contentHtml);

            document.getElementById('officer-action-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const newStatus = document.getElementById('off-new-status').value;
                const remarks = document.getElementById('off-remarks').value;

                try {
                    const updateRes = await API.updateApplicationStatus(application.id, { status: newStatus, remarks });
                    if (updateRes.success) {
                        Toast.success(`Status updated to ${newStatus}`);
                        Modal.close();
                        await loadOfficerDashboard();
                    }
                } catch (err) {
                    Toast.error(err.message);
                }
            });
        }
    } catch (err) {
        Toast.error(err.message);
    }
}

async function verifyDocStatus(docId, status) {
    try {
        const res = await API.verifyDocument(docId, {
            verification_status: status,
            remarks: `Verified by officer on ${new Date().toLocaleDateString()}`
        });

        if (res.success) {
            Toast.success(`Document marked as ${status}`);
        }
    } catch (err) {
        Toast.error(err.message);
    }
}

window.renderOfficerPage = renderOfficerPage;
window.openOfficerReviewModal = openOfficerReviewModal;
window.verifyDocStatus = verifyDocStatus;
