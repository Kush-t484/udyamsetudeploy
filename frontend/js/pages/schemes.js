/* Government Support Schemes & Matching Engine Page */

async function renderSchemesPage() {
    const container = document.getElementById('page-content');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header-title">
                <h1>Government Support, Subsidies & Incentives</h1>
                <p>Discover financial capital subsidies, interest subvention & PLI schemes.</p>
            </div>
            <button onclick="runSchemeMatching()" class="btn btn-success">🎯 Check My Eligibility</button>
        </div>

        <!-- Scheme Matching Container -->
        <div id="scheme-match-container"></div>

        <div class="card">
            <div class="card-header">
                <h3>Scheme Catalog & Incentive Directory</h3>
            </div>
            <div class="table-toolbar">
                <input type="text" id="sch-search" class="form-control" style="max-width:250px;" placeholder="Search scheme name...">
                <select id="sch-sector-filter" class="form-control" style="max-width:200px;">
                    <option value="">All Sectors</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Heavy Engineering & Metal Fabrication">Heavy Engineering</option>
                </select>
            </div>
            <div id="schemes-catalog-container">Loading scheme directory...</div>
        </div>
    `;

    document.getElementById('sch-search').addEventListener('input', loadSchemesCatalog);
    document.getElementById('sch-sector-filter').addEventListener('change', loadSchemesCatalog);

    await loadSchemesCatalog();
}

async function loadSchemesCatalog() {
    const container = document.getElementById('schemes-catalog-container');
    const search = document.getElementById('sch-search').value;
    const sector = document.getElementById('sch-sector-filter').value;

    let params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (sector) params.push(`sector=${encodeURIComponent(sector)}`);
    const paramStr = params.length > 0 ? `?${params.join('&')}` : '';

    try {
        const res = await API.getSchemes(paramStr);
        if (res.success) {
            const schemes = res.data;
            let html = `<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:1.25rem;">`;

            schemes.forEach(s => {
                html += `
                    <div style="border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.25rem; background:#ffffff; display:flex; flex-direction:column; justify-space-between;">
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                                <h4 style="margin:0; font-size:1rem; color:var(--primary-navy);">${Utils.escapeHTML(s.name)}</h4>
                                <button onclick="toggleSaveScheme('${s.id}', ${s.is_saved})" class="btn btn-secondary btn-sm">${s.is_saved ? '⭐ Saved' : '☆ Bookmark'}</button>
                            </div>
                            <span class="badge badge-submitted" style="margin-bottom:0.5rem;">${Utils.escapeHTML(s.department || 'Government Policy')}</span>
                            <p style="font-size:0.85rem; color:var(--slate-body); margin:0.5rem 0;">${Utils.escapeHTML(s.description)}</p>
                            <div style="background:var(--blue-subtle); padding:0.65rem; border-radius:var(--radius-sm); font-size:0.8rem; color:var(--gov-blue); margin-bottom:0.75rem;">
                                🎁 <strong>Benefits:</strong> ${Utils.escapeHTML(s.benefits)}
                            </div>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:0.75rem;">
                            <span style="font-size:0.75rem; color:var(--slate-muted);">State: ${Utils.escapeHTML(s.state)}</span>
                            <a href="${s.application_url}" target="_blank" class="btn btn-primary btn-sm">Apply Portal ↗</a>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
            container.innerHTML = html;
        }
    } catch (err) {
        container.innerHTML = `<p style="color:var(--danger-red);">Error loading schemes: ${Utils.escapeHTML(err.message)}</p>`;
    }
}

async function runSchemeMatching() {
    const matchContainer = document.getElementById('scheme-match-container');
    matchContainer.innerHTML = `<div class="card"><p>Calculating weighted scheme eligibility scores...</p></div>`;

    try {
        const res = await API.matchSchemes();
        if (res.success) {
            const data = res.data;
            let html = `
                <div class="card" style="border-left:4px solid var(--success-green);">
                    <h3>Government Subsidy Eligibility Score Results</h3>
                    <p style="font-size:0.85rem; color:var(--slate-muted); margin-bottom:1rem;">
                        ${Utils.escapeHTML(data.disclaimer)}
                    </p>

                    <div style="display:flex; flex-direction:column; gap:1rem;">
            `;

            data.matched_schemes.forEach(m => {
                let badgeClass = 'badge-approved';
                if (m.score < 50) badgeClass = 'badge-rejected';
                else if (m.score < 70) badgeClass = 'badge-under_review';

                html += `
                    <div style="padding:1rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:#ffffff;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <h4 style="margin:0;">${Utils.escapeHTML(m.scheme.name)}</h4>
                            <span class="badge ${badgeClass}">${m.score}% MATCH (${m.relevance})</span>
                        </div>
                        <p style="font-size:0.85rem; color:var(--slate-body); margin:0.5rem 0;">
                            <strong>Benefits:</strong> ${Utils.escapeHTML(m.scheme.benefits)}
                        </p>
                        <div style="font-size:0.8rem; color:var(--success-green);">
                            ✓ Matched Criteria: ${m.matchedCriteria.join(' | ')}
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
            matchContainer.innerHTML = html;
        }
    } catch (err) {
        matchContainer.innerHTML = `<div class="card"><p style="color:var(--danger-red);">Matching failed: ${Utils.escapeHTML(err.message)}</p></div>`;
    }
}

async function toggleSaveScheme(schemeId, isSaved) {
    try {
        if (isSaved) {
            await API.unsaveScheme(schemeId);
            Toast.info('Scheme removed from bookmarks');
        } else {
            await API.saveScheme(schemeId);
            Toast.success('Scheme saved to bookmarks');
        }
        await loadSchemesCatalog();
    } catch (err) {
        Toast.error(err.message);
    }
}

window.renderSchemesPage = renderSchemesPage;
window.runSchemeMatching = runSchemeMatching;
window.toggleSaveScheme = toggleSaveScheme;
