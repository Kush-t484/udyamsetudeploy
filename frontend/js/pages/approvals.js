/* Approval Discovery & Recommendation Engine Page */

async function renderApprovalsPage() {
    const container = document.getElementById('page-content');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header-title">
                <h1>Industrial Approval Intelligence & Discovery</h1>
                <p>Rule-based recommendation engine for State & Central regulatory clearances.</p>
            </div>
        </div>

        <!-- Requirement Form Card -->
        <div class="card">
            <div class="card-header">
                <h3>Analyze Industrial Clearance Requirements</h3>
            </div>
            <form id="approval-analysis-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Industry Type</label>
                        <input type="text" id="an-industry" class="form-control" value="Manufacturing" required>
                    </div>
                    <div class="form-group">
                        <label>Sector Classification</label>
                        <input type="text" id="an-sector" class="form-control" value="Heavy Engineering & Metal Fabrication" required>
                    </div>
                    <div class="form-group">
                        <label>State</label>
                        <select id="an-state" class="form-control">
                            <option value="Chhattisgarh" selected>Chhattisgarh</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Gujarat">Gujarat</option>
                            <option value="Odisha">Odisha</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Investment Amount (₹)</label>
                        <input type="number" id="an-investment" class="form-control" value="50000000" required>
                    </div>
                    <div class="form-group">
                        <label>Number of Employees</label>
                        <input type="number" id="an-employees" class="form-control" value="120" required>
                    </div>
                    <div class="form-group">
                        <label>Pollution Category</label>
                        <select id="an-pollution" class="form-control">
                            <option value="Red">Red Category (High Pollution)</option>
                            <option value="Orange" selected>Orange Category (Moderate Pollution)</option>
                            <option value="Green">Green Category (Low Pollution)</option>
                            <option value="White">White Category (Non-Polluting)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Power Requirement (HP/kW)</label>
                        <input type="number" id="an-power" class="form-control" value="450">
                    </div>
                    <div class="form-group">
                        <label>Water Consumption (KLD)</label>
                        <input type="number" id="an-water" class="form-control" value="25">
                    </div>
                    <div class="form-group">
                        <label>Hazardous Materials Handling</label>
                        <select id="an-hazardous" class="form-control">
                            <option value="true" selected>Yes - Hazardous Chemicals / Waste Present</option>
                            <option value="false">No - Standard Industrial Materials</option>
                        </select>
                    </div>
                </div>
                <div style="margin-top:1rem; display:flex; justify-content:flex-end;">
                    <button type="submit" class="btn btn-primary">⚡ Analyze Requirements</button>
                </div>
            </form>
        </div>

        <!-- Analysis Results Container -->
        <div id="analysis-results-container"></div>
    `;

    document.getElementById('approval-analysis-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await runAnalysis();
    });

    // Auto-run initial analysis
    await runAnalysis();
}

async function runAnalysis() {
    const resultsContainer = document.getElementById('analysis-results-container');
    resultsContainer.innerHTML = `<div class="card"><p>Analyzing requirements...</p></div>`;

    const profile = {
        industry: document.getElementById('an-industry').value,
        sector: document.getElementById('an-sector').value,
        state: document.getElementById('an-state').value,
        investment_amount: document.getElementById('an-investment').value,
        employees: document.getElementById('an-employees').value,
        pollution_category: document.getElementById('an-pollution').value,
        power_requirement: document.getElementById('an-power').value,
        water_consumption: document.getElementById('an-water').value,
        hazardous_materials: document.getElementById('an-hazardous').value === 'true'
    };

    try {
        const res = await API.analyzeApprovals(profile);
        if (res.success) {
            const data = res.data;
            const items = data.potentially_applicable_approvals;

            let html = `
                <div class="card" style="border-left:4px solid var(--gov-blue);">
                    <h3>Potentially Applicable Requirements Roadmap (${items.length} Approvals Recommended)</h3>
                    <p style="font-size:0.85rem; color:var(--slate-muted); margin-bottom:1rem;">
                        ${Utils.escapeHTML(data.disclaimer)}
                    </p>

                    <div style="display:flex; flex-direction:column; gap:1rem;">
            `;

            items.forEach(item => {
                html += `
                    <div style="padding:1rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:#ffffff;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <div>
                                <h4 style="margin:0 0 0.25rem 0;">${Utils.escapeHTML(item.approval_name)}</h4>
                                <span class="badge badge-submitted">${Utils.escapeHTML(item.category)}</span>
                                <span style="font-size:0.8rem; color:var(--slate-muted); margin-left:0.5rem;">Dept: ${Utils.escapeHTML(item.department)}</span>
                            </div>
                            <span class="badge ${item.priority === 'CRITICAL' ? 'badge-critical' : 'badge-under_review'}">${item.priority}</span>
                        </div>
                        <p style="font-size:0.85rem; color:var(--slate-body); margin:0.5rem 0;">
                            <strong>Why Recommended:</strong> ${Utils.escapeHTML(item.reason)}
                        </p>
                        <div style="font-size:0.8rem; color:var(--slate-muted); margin-bottom:0.75rem;">
                            ⏱️ Estimated SLA: ${item.estimated_processing_days} Days | 📄 Required Docs: ${item.required_documents.map(d => d.document_name).join(', ')}
                        </div>
                        <div style="display:flex; gap:0.5rem;">
                            <button onclick="applyForApproval('${item.approval_id}', '${Utils.escapeHTML(item.approval_name)}')" class="btn btn-primary btn-sm">📝 Create Application</button>
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
            resultsContainer.innerHTML = html;
        }
    } catch (err) {
        resultsContainer.innerHTML = `<div class="card"><p style="color:var(--danger-red);">Analysis failed: ${Utils.escapeHTML(err.message)}</p></div>`;
    }
}

async function applyForApproval(approvalId, approvalName) {
    try {
        const res = await API.createApplication({
            approval_id: approvalId,
            remarks: `Application created for ${approvalName} via AI requirement recommendation`
        });

        if (res.success) {
            Toast.success(`Application created: ${res.data.application_number}`);
            Router.navigate('#/applications');
        }
    } catch (err) {
        Toast.error(err.message);
    }
}

window.renderApprovalsPage = renderApprovalsPage;
window.applyForApproval = applyForApproval;
