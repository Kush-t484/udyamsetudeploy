/* Printable Audit & Analytics Reports Script */

async function renderReportsPage() {
    const container = document.getElementById('page-content');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header-title">
                <h1>Printable Compliance & Audit Reports</h1>
                <p>Generate certified statutory compliance summaries & enterprise clearance reports.</p>
            </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
            <div class="card">
                <h3>Enterprise Summary & Approval Report</h3>
                <p style="font-size:0.85rem; color:var(--slate-muted); margin:0.5rem 0 1rem 0;">
                    Comprehensive audit statement detailing company profile, active applications, attached documents, and scheme matches.
                </p>
                <button onclick="generateReport('company')" class="btn btn-primary">🖨️ View & Print Enterprise Audit Report</button>
            </div>

            <div class="card">
                <h3>Compliance Health & Risk Score Report</h3>
                <p style="font-size:0.85rem; color:var(--slate-muted); margin:0.5rem 0 1rem 0;">
                    Detailed risk penalty points report, overdue statutory returns, and upcoming deadline calendar.
                </p>
                <button onclick="generateReport('compliance')" class="btn btn-primary">🖨️ View & Print Compliance Risk Report</button>
            </div>
        </div>

        <div id="report-view-container" style="margin-top:2rem;"></div>
    `;
}

async function generateReport(type) {
    const box = document.getElementById('report-view-container');
    box.innerHTML = `<div class="card"><p>Generating report...</p></div>`;

    try {
        let res;
        if (type === 'company') res = await API.getCompanyReport();
        else res = await API.getComplianceReport();

        if (res.success) {
            const data = res.data;
            let contentHtml = '';

            if (type === 'company') {
                contentHtml = `
                    <div style="background:#ffffff; padding:2rem; border:1px solid var(--border-color); border-radius:var(--radius-md);">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--primary-navy); padding-bottom:1rem; margin-bottom:1.5rem;">
                            <div>
                                <h2 style="margin:0;">${Utils.escapeHTML(data.company.name)}</h2>
                                <p style="margin:0; font-size:0.85rem; color:var(--slate-muted);">${Utils.escapeHTML(data.report_type)}</p>
                            </div>
                            <button onclick="window.print()" class="btn btn-secondary btn-sm">🖨️ Print Document</button>
                        </div>
                        <div class="form-grid" style="margin-bottom:1.5rem;">
                            <div><strong>Registration (CIN):</strong> ${Utils.escapeHTML(data.company.registration_number)}</div>
                            <div><strong>GSTIN:</strong> ${Utils.escapeHTML(data.company.gstin)}</div>
                            <div><strong>State/District:</strong> ${Utils.escapeHTML(data.company.state)} / ${Utils.escapeHTML(data.company.district)}</div>
                            <div><strong>Pollution Category:</strong> ${Utils.escapeHTML(data.company.pollution_category)}</div>
                        </div>

                        <h4>Applications Summary (${data.applications_count})</h4>
                        ${Table.render({
                            headers: ['App #', 'Approval Clearance', 'Status', 'Submitted Date'],
                            rows: data.applications.map(a => [a.application_number, a.approval_name, a.status, Utils.formatDate(a.submitted_at)])
                        })}
                    </div>
                `;
            } else {
                contentHtml = `
                    <div style="background:#ffffff; padding:2rem; border:1px solid var(--border-color); border-radius:var(--radius-md);">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--primary-navy); padding-bottom:1rem; margin-bottom:1.5rem;">
                            <div>
                                <h2 style="margin:0;">Statutory Compliance Health Report</h2>
                                <p style="margin:0; font-size:0.85rem; color:var(--slate-muted);">${Utils.escapeHTML(data.report_type)}</p>
                            </div>
                            <button onclick="window.print()" class="btn btn-secondary btn-sm">🖨️ Print Report</button>
                        </div>

                        <div style="background:var(--blue-subtle); padding:1rem; border-radius:var(--radius-sm); margin-bottom:1.5rem;">
                            <strong>Health Index Score: ${data.risk_summary.compliance_health_score}/100</strong> (${data.risk_summary.risk_level} RISK)<br>
                            Risk Penalty Points: ${data.risk_summary.risk_score} pts
                        </div>

                        <h4>Compliance Obligations Audit (${data.obligations.length})</h4>
                        ${Table.render({
                            headers: ['Obligation Title', 'Category', 'Frequency', 'Due Date', 'Status'],
                            rows: data.obligations.map(o => [o.requirement_name, o.category, o.frequency, Utils.formatDate(o.due_date), o.status])
                        })}
                    </div>
                `;
            }

            box.innerHTML = contentHtml;
        }
    } catch (err) {
        box.innerHTML = `<div class="card"><p style="color:var(--danger-red);">Report generation failed: ${Utils.escapeHTML(err.message)}</p></div>`;
    }
}

window.renderReportsPage = renderReportsPage;
window.generateReport = generateReport;
