/* Application Tracking & Creation Page */

let allAvailableApprovals = [];

async function renderApplicationsPage() {
    const container = document.getElementById('page-content');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header-title">
                <h1>Application Tracking & Workflows</h1>
                <p>Track live application progress, timeline history & submit new regulatory clearances.</p>
            </div>
            <div style="display:flex; gap:0.75rem;">
                <button onclick="openCreateApplicationModal()" class="btn btn-primary" style="display:flex; align-items:center; gap:0.5rem;">
                    <span>➕</span>
                    <span>Create New Application</span>
                </button>
                <button onclick="Router.navigate('#/approvals')" class="btn btn-secondary">
                    <span>⚡</span>
                    <span>AI Approval Discovery</span>
                </button>
            </div>
        </div>

        <div class="card">
            <div class="table-toolbar">
                <input type="text" id="app-search" class="form-control" style="max-width:250px;" placeholder="Search Application # or Clearance...">
                <select id="app-status-filter" class="form-control" style="max-width:200px;">
                    <option value="">All Statuses</option>
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="DOCUMENT_VERIFICATION">DOCUMENT VERIFICATION</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="INSPECTION">INSPECTION</option>
                    <option value="ADDITIONAL_DOCUMENTS">ADDITIONAL DOCUMENTS</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                </select>
                <select id="app-priority-filter" class="form-control" style="max-width:180px;">
                    <option value="">All Priorities</option>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                </select>
            </div>

            <div id="applications-table-container">Loading applications...</div>
        </div>
    `;

    document.getElementById('app-search').addEventListener('input', loadApplicationsList);
    document.getElementById('app-status-filter').addEventListener('change', loadApplicationsList);
    document.getElementById('app-priority-filter').addEventListener('change', loadApplicationsList);

    await loadApplicationsList();
}

async function loadApplicationsList() {
    const tableContainer = document.getElementById('applications-table-container');
    const search = document.getElementById('app-search').value;
    const status = document.getElementById('app-status-filter').value;
    const priority = document.getElementById('app-priority-filter').value;

    let queryParams = [];
    if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
    if (status) queryParams.push(`status=${encodeURIComponent(status)}`);
    if (priority) queryParams.push(`priority=${encodeURIComponent(priority)}`);

    const paramStr = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    try {
        const res = await API.getApplications(paramStr);
        if (res.success) {
            const apps = res.data;
            if (apps.length === 0) {
                tableContainer.innerHTML = `
                    <div style="text-align:center; padding:3rem 1rem; color:var(--slate-muted);">
                        <div style="font-size:2.5rem; margin-bottom:1rem;">📋</div>
                        <h3 style="color:var(--slate-dark);">No Applications Found</h3>
                        <p style="margin-bottom:1.5rem;">You have not submitted any industrial clearance applications yet.</p>
                        <button onclick="openCreateApplicationModal()" class="btn btn-primary">➕ Create First Application</button>
                    </div>
                `;
                return;
            }

            const headers = ['App Number', 'Approval Clearance', 'Department', 'Submitted', 'Status', 'Priority', 'Officer', 'Actions'];
            
            const rows = apps.map(a => [
                `<strong>${Utils.escapeHTML(a.application_number)}</strong>`,
                Utils.escapeHTML(a.approval_name),
                Utils.escapeHTML(a.department_name || 'N/A'),
                Utils.formatDate(a.submitted_at || a.created_at),
                Utils.getStatusBadge(a.status),
                Utils.getRiskBadge(a.priority),
                Utils.escapeHTML(a.officer_name || 'Unassigned'),
                `<button onclick="viewApplicationDetail('${a.id}')" class="btn btn-secondary btn-sm">👁️ View Details</button>`
            ]);

            tableContainer.innerHTML = Table.render({ headers, rows });
        }
    } catch (err) {
        tableContainer.innerHTML = `<p style="color:var(--danger-red);">Failed to load applications: ${Utils.escapeHTML(err.message)}</p>`;
    }
}

// Modal for Industry Users to Create New Applications directly
async function openCreateApplicationModal(preselectedApprovalId = null) {
    try {
        if (allAvailableApprovals.length === 0) {
            const res = await API.getApprovals();
            if (res.success) {
                allAvailableApprovals = res.data;
            }
        }

        const approvals = allAvailableApprovals;
        const defaultAppr = approvals[0] || {};

        const optionsHtml = approvals.map(a => `
            <option value="${a.id}" ${preselectedApprovalId === a.id ? 'selected' : ''}>
                ${Utils.escapeHTML(a.name)} (${Utils.escapeHTML(a.department_name || a.category)})
            </option>
        `).join('');

        const modalContent = `
            <form id="create-application-form" onsubmit="handleCreateApplicationSubmit(event)">
                <div class="form-group" style="margin-bottom:1.25rem;">
                    <label style="display:block; font-weight:700; font-size:0.9rem; margin-bottom:0.4rem; color:var(--primary-navy);">
                        Select Regulatory Approval / Clearance *
                    </label>
                    <select id="modal-appr-select" class="form-control" style="width:100%; padding:0.75rem; border:2px solid var(--gov-blue); border-radius:6px;" required onchange="updateSelectedApprovalPreview(this.value)">
                        ${optionsHtml}
                    </select>
                </div>

                <!-- Approval Metadata Preview Card -->
                <div id="modal-appr-preview" style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:8px; padding:1rem; margin-bottom:1.25rem;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                        <div>
                            <strong id="preview-dept" style="color:#1E40AF; font-size:0.85rem;">Department: ${Utils.escapeHTML(defaultAppr.department_name || 'Department of Industries')}</strong>
                            <div id="preview-cat" style="font-size:0.75rem; color:#475569; margin-top:0.2rem;">Category: ${Utils.escapeHTML(defaultAppr.category || 'Environmental')}</div>
                        </div>
                        <span id="preview-priority" class="badge badge-under_review">${defaultAppr.priority || 'HIGH'} PRIORITY</span>
                    </div>
                    <p id="preview-desc" style="font-size:0.85rem; color:#334155; margin:0.5rem 0 0.5rem 0;">
                        ${Utils.escapeHTML(defaultAppr.description || 'Regulatory approval required before commencement.')}
                    </p>
                    <div style="font-size:0.8rem; color:#1E40AF; font-weight:600;">
                        ⏱️ Estimated Processing SLA: <span id="preview-sla">${defaultAppr.estimated_processing_days || 15}</span> Days
                    </div>
                </div>

                <div class="form-group" style="margin-bottom:1.25rem;">
                    <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:0.4rem; color:var(--slate-dark);">
                        Application Notes / Project Scope Details
                    </label>
                    <textarea id="modal-appr-remarks" class="form-control" rows="3" placeholder="Enter plant capacity details, project scope, factory address or special submission notes..." style="width:100%; padding:0.65rem; border:1px solid #CBD5E1; border-radius:6px; font-family:inherit;"></textarea>
                </div>

                <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem; padding-top:1rem; border-top:1px solid var(--border-color);">
                    <button type="button" onclick="Modal.close()" class="btn btn-secondary">Cancel</button>
                    <button type="submit" id="btn-submit-application" class="btn btn-primary" style="padding:0.65rem 1.5rem;">
                        🚀 Submit Application
                    </button>
                </div>
            </form>
        `;

        Modal.open('Submit New Industrial Clearance Application', modalContent);

        if (preselectedApprovalId) {
            updateSelectedApprovalPreview(preselectedApprovalId);
        }
    } catch (err) {
        Toast.error('Failed to open application form: ' + err.message);
    }
}

function updateSelectedApprovalPreview(approvalId) {
    const appr = allAvailableApprovals.find(a => a.id === approvalId);
    if (!appr) return;

    const deptEl = document.getElementById('preview-dept');
    const catEl = document.getElementById('preview-cat');
    const priEl = document.getElementById('preview-priority');
    const descEl = document.getElementById('preview-desc');
    const slaEl = document.getElementById('preview-sla');

    if (deptEl) deptEl.textContent = `Department: ${appr.department_name || 'Regulatory Department'}`;
    if (catEl) catEl.textContent = `Category: ${appr.category || 'Regulatory'}`;
    if (priEl) {
        priEl.textContent = `${appr.priority || 'HIGH'} PRIORITY`;
        priEl.className = `badge ${appr.priority === 'CRITICAL' ? 'badge-critical' : 'badge-under_review'}`;
    }
    if (descEl) descEl.textContent = appr.description || 'Statutory regulatory approval.';
    if (slaEl) slaEl.textContent = appr.estimated_processing_days || 15;
}

async function handleCreateApplicationSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-application');
    const approvalId = document.getElementById('modal-appr-select').value;
    const remarks = document.getElementById('modal-appr-remarks').value;

    if (!approvalId) {
        Toast.error('Please select an approval clearance');
        return;
    }

    try {
        btn.disabled = true;
        btn.innerHTML = 'Submitting...';

        const res = await API.createApplication({
            approval_id: approvalId,
            remarks: remarks || 'Application submitted via industry portal'
        });

        if (res.success) {
            Modal.close();
            Toast.success(`Application created successfully! Number: ${res.data.application_number}`);
            await loadApplicationsList();
        }
    } catch (err) {
        Toast.error('Failed to submit application: ' + err.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '🚀 Submit Application';
        }
    }
}

async function viewApplicationDetail(appId) {
    try {
        const res = await API.getApplicationById(appId);
        if (res.success) {
            const { application, documents, timeline } = res.data;

            const contentHtml = `
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; padding-bottom:0.5rem; border-bottom:1px solid var(--border-color);">
                        <div>
                            <h2 style="margin:0;">${Utils.escapeHTML(application.application_number)}</h2>
                            <p style="margin:0; font-size:0.9rem; color:var(--slate-muted);">${Utils.escapeHTML(application.approval_name)} (${Utils.escapeHTML(application.department_name || 'Department')})</p>
                        </div>
                        <div>
                            ${Utils.getStatusBadge(application.status)}
                        </div>
                    </div>

                    <div class="form-grid" style="margin-bottom:1.5rem; background:var(--bg-light); padding:1rem; border-radius:var(--radius-sm);">
                        <div><strong>Company:</strong> ${Utils.escapeHTML(application.company_name)}</div>
                        <div><strong>Assigned Officer:</strong> ${Utils.escapeHTML(application.officer_name || 'Unassigned Queue')}</div>
                        <div><strong>Submitted Date:</strong> ${Utils.formatDate(application.submitted_at)}</div>
                        <div><strong>Target SLA Completion:</strong> ${Utils.formatDate(application.expected_completion_date)}</div>
                    </div>

                    <div style="margin-bottom:1.5rem;">
                        <h4 style="margin-bottom:0.5rem;">Officer Remarks</h4>
                        <p style="background:#FFFBEB; border:1px solid #FDE68A; padding:0.75rem; border-radius:var(--radius-sm); font-size:0.85rem; color:#92400E; margin:0;">
                            ${Utils.escapeHTML(application.remarks || 'No remarks added.')}
                        </p>
                    </div>

                    <div style="margin-bottom:1.5rem;">
                        <h4 style="margin-bottom:0.5rem;">Attached Verification Documents (${documents.length})</h4>
                        ${documents.length === 0 ? '<p style="font-size:0.85rem; color:var(--slate-muted);">No documents attached.</p>' : 
                            documents.map(d => `
                                <div style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem; border-bottom:1px solid var(--border-color); font-size:0.85rem;">
                                    <span>📄 ${Utils.escapeHTML(d.name)}</span>
                                    <span>${Utils.getStatusBadge(d.verification_status)}</span>
                                </div>
                            `).join('')
                        }
                    </div>

                    <div>
                        <h4 style="margin-bottom:0.5rem;">Workflow Activity Timeline</h4>
                        ${Timeline.render(timeline)}
                    </div>
                </div>
            `;

            Modal.open(`Application Details: ${application.application_number}`, contentHtml);
        }
    } catch (err) {
        Toast.error(err.message);
    }
}

window.renderApplicationsPage = renderApplicationsPage;
window.openCreateApplicationModal = openCreateApplicationModal;
window.updateSelectedApprovalPreview = updateSelectedApprovalPreview;
window.handleCreateApplicationSubmit = handleCreateApplicationSubmit;
window.viewApplicationDetail = viewApplicationDetail;
