/* UdyamSetu AI Main Application Bootstrapper */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Bootstrapping UdyamSetu AI Platform...');

    // Register Routes
    Router.register('#/', renderLandingPage);
    Router.register('#/login', renderLoginPage);
    Router.register('#/register', renderRegisterPage);
    Router.register('#/dashboard', renderDashboardPage);
    Router.register('#/approvals', renderApprovalsPage);
    Router.register('#/applications', renderApplicationsPage);
    Router.register('#/documents', renderDocumentsPage);
    Router.register('#/compliance', renderCompliancePage);
    Router.register('#/schemes', renderSchemesPage);
    Router.register('#/assistant', renderAssistantPage);
    Router.register('#/notifications', renderNotificationsPage);
    Router.register('#/reports', renderReportsPage);
    Router.register('#/profile', renderProfilePage);
    Router.register('#/officer-dashboard', renderOfficerPage);
    Router.register('#/admin-dashboard', renderAdminPage);
    Router.register('#/admin-management', renderAdminPage);
    Router.register('#/admin-audit', renderAdminPage);

    // Initialize Auth Session
    await Auth.init();

    // Route Handler for Hash Changes
    window.addEventListener('hashchange', () => {
        Router.navigate(window.location.hash);
    });

    // Default Navigation
    if (!window.location.hash) {
        window.location.hash = State.user ? '#/dashboard' : '#/';
    } else {
        Router.navigate(window.location.hash);
    }
});

// Render Landing Page Function
function renderLandingPage() {
    const root = document.getElementById('app-root');
    root.innerHTML = `
        <div style="min-height:100vh; background:#0A192F; color:#ffffff;">
            <!-- Navigation -->
            <header style="padding:1.5rem 3rem; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #112240;">
                <div style="font-size:1.5rem; font-weight:800; color:#ffffff; display:flex; align-items:center; gap:0.5rem;">
                    <span style="color:#1D4ED8;">⚡</span>
                    <span>UdyamSetu AI</span>
                </div>
                <div style="display:flex; gap:1rem;">
                    <a href="#/login" class="btn btn-secondary">Login</a>
                    <a href="#/register" class="btn btn-primary">Register Account</a>
                </div>
            </header>

            <!-- Hero Section -->
            <section style="padding:5rem 2rem; text-align:center; max-width:900px; margin:0 auto;">
                <h1 style="font-size:3rem; color:#ffffff; margin-bottom:1.5rem; line-height:1.2;">
                    Simplifying Industrial Approvals.<br>
                    Strengthening Compliance.<br>
                    Connecting Businesses to Government Support.
                </h1>
                <p style="font-size:1.2rem; color:#94A3B8; margin-bottom:2.5rem;">
                    UdyamSetu AI brings approvals, compliance monitoring and government support discovery into one intelligent platform.
                </p>
                <div style="display:flex; justify-content:center; gap:1rem;">
                    <a href="#/register" class="btn btn-primary" style="padding:1rem 2rem; font-size:1.1rem;">GET STARTED</a>
                    <a href="#/login" class="btn btn-secondary" style="padding:1rem 2rem; font-size:1.1rem;">EXPLORE PLATFORM</a>
                </div>
            </section>

            <!-- Visual Workflow Narrative Section -->
            <section style="padding:4rem 2rem; background:#112240; border-top:1px solid #1E293B;">
                <h2 style="text-align:center; color:#ffffff; margin-bottom:3rem;">Visual User Journey & Workflow</h2>
                <div style="display:flex; justify-content:center; flex-wrap:wrap; gap:1rem; max-width:1200px; margin:0 auto;">
                    <div style="background:#0A192F; padding:1.25rem; border-radius:10px; border:1px solid #1E293B; width:220px; text-align:center;">
                        <h4 style="color:#1D4ED8;">1. Business Profile</h4>
                        <p style="font-size:0.8rem; color:#94A3B8; margin-top:0.5rem;">Enterprise registration & pollution category onboarding.</p>
                    </div>
                    <div style="font-size:1.5rem; align-self:center; color:#1D4ED8;">↓</div>
                    <div style="background:#0A192F; padding:1.25rem; border-radius:10px; border:1px solid #1E293B; width:220px; text-align:center;">
                        <h4 style="color:#1D4ED8;">2. AI Requirement Analysis</h4>
                        <p style="font-size:0.8rem; color:#94A3B8; margin-top:0.5rem;">Rule engine detects CTE, CTO, Fire NOC & Factory licenses.</p>
                    </div>
                    <div style="font-size:1.5rem; align-self:center; color:#1D4ED8;">↓</div>
                    <div style="background:#0A192F; padding:1.25rem; border-radius:10px; border:1px solid #1E293B; width:220px; text-align:center;">
                        <h4 style="color:#1D4ED8;">3. Document Vault</h4>
                        <p style="font-size:0.8rem; color:#94A3B8; margin-top:0.5rem;">Upload blueprints & monitoring reports with expiry alerts.</p>
                    </div>
                    <div style="font-size:1.5rem; align-self:center; color:#1D4ED8;">↓</div>
                    <div style="background:#0A192F; padding:1.25rem; border-radius:10px; border:1px solid #1E293B; width:220px; text-align:center;">
                        <h4 style="color:#1D4ED8;">4. Government Review</h4>
                        <p style="font-size:0.8rem; color:#94A3B8; margin-top:0.5rem;">Officers verify docs, add remarks & grant approvals.</p>
                    </div>
                    <div style="font-size:1.5rem; align-self:center; color:#1D4ED8;">↓</div>
                    <div style="background:#0A192F; padding:1.25rem; border-radius:10px; border:1px solid #1E293B; width:220px; text-align:center;">
                        <h4 style="color:#1D4ED8;">5. Subsidy Matching</h4>
                        <p style="font-size:0.85rem; color:#94A3B8; margin-top:0.5rem;">Weighted matching for State Capital Investment Subsidies.</p>
                    </div>
                </div>
            </section>

            <!-- Footer -->
            <footer style="padding:2rem; text-align:center; border-top:1px solid #112240; color:#64748B; font-size:0.85rem;">
                <p>UdyamSetu AI — One Platform. Every Approval. Smarter Compliance.</p>
                <p style="font-size:0.75rem; margin-top:0.5rem;">UdyamSetu AI provides technology-assisted guidance and workflow management. Approval applicability, eligibility and compliance obligations should be verified with the relevant competent authority.</p>
            </footer>
        </div>
    `;
}

// Render Login Page Function
function renderLoginPage() {
    const root = document.getElementById('app-root');
    root.innerHTML = `
        <div style="min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0A192F; padding:2rem;">
            <div style="background:#ffffff; width:100%; max-width:480px; padding:2.5rem; border-radius:16px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.3);">
                <div style="text-align:center; margin-bottom:1.75rem;">
                    <div style="display:inline-flex; align-items:center; gap:0.5rem; font-size:1.5rem; font-weight:800; color:#0A192F;">
                        <span style="color:#1D4ED8;">⚡</span>
                        <span>UdyamSetu AI</span>
                    </div>
                    <p style="color:#64748B; font-size:0.9rem; margin-top:0.25rem;">Sign in to your authorized role portal</p>
                </div>

                <!-- One-Click Demo Role Accounts -->
                <div style="background:#EFF6FF; border:1px solid #BFDBFE; padding:1rem; border-radius:8px; margin-bottom:1.5rem; font-size:0.85rem;">
                    <div style="font-weight:700; color:#1E40AF; margin-bottom:0.5rem;">Select Demo Account by Role:</div>
                    <div style="display:flex; flex-direction:column; gap:0.4rem;">
                        <button type="button" onclick="fillDemo('industry@demo.com')" class="btn btn-secondary btn-sm" style="text-align:left; justify-content:flex-start;">
                            🏭 <strong>Industry:</strong> industry@demo.com
                        </button>
                        <button type="button" onclick="fillDemo('officer@demo.com')" class="btn btn-secondary btn-sm" style="text-align:left; justify-content:flex-start;">
                            👮 <strong>Officer:</strong> officer@demo.com
                        </button>
                        <button type="button" onclick="fillDemo('admin@demo.com')" class="btn btn-secondary btn-sm" style="text-align:left; justify-content:flex-start;">
                            👑 <strong>Administrator:</strong> admin@demo.com
                        </button>
                    </div>
                </div>

                <form id="login-form">
                    <div class="form-group" style="margin-bottom:1rem;">
                        <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:0.35rem; color:#334155;">Email Address</label>
                        <input type="email" id="login-email" class="form-control" placeholder="user@domain.com" style="width:100%; padding:0.65rem 0.85rem; border:1px solid #CBD5E1; border-radius:6px;" required>
                    </div>
                    <div class="form-group" style="margin-bottom:1.25rem;">
                        <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:0.35rem; color:#334155;">Password</label>
                        <input type="password" id="login-password" class="form-control" placeholder="••••••••" style="width:100%; padding:0.65rem 0.85rem; border:1px solid #CBD5E1; border-radius:6px;" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%; padding:0.75rem; font-size:1rem;">Sign In</button>
                </form>
                <div style="text-align:center; margin-top:1.5rem; font-size:0.85rem;">
                    <span style="color:#64748B;">Need an account?</span>
                    <a href="#/register" style="font-weight:600; margin-left:0.25rem;">Register Account</a>
                </div>
            </div>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            await Auth.login(email, password);
        } catch (err) {
            Toast.error(err.message);
        }
    });
}

function fillDemo(email) {
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = 'demo123';
}

// Render Register Page Function with Role Selection
function renderRegisterPage() {
    const root = document.getElementById('app-root');
    root.innerHTML = `
        <div style="min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0A192F; padding:2rem;">
            <div style="background:#ffffff; width:100%; max-width:520px; padding:2.5rem; border-radius:16px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.3);">
                <div style="text-align:center; margin-bottom:1.75rem;">
                    <div style="display:inline-flex; align-items:center; gap:0.5rem; font-size:1.5rem; font-weight:800; color:#0A192F;">
                        <span style="color:#1D4ED8;">⚡</span>
                        <span>UdyamSetu AI</span>
                    </div>
                    <p style="color:#64748B; font-size:0.9rem; margin-top:0.25rem;">Register New Account & Select Role</p>
                </div>

                <form id="reg-form">
                    <!-- Role Selection Dropdown -->
                    <div class="form-group" style="margin-bottom:1rem;">
                        <label style="display:block; font-weight:700; font-size:0.85rem; margin-bottom:0.35rem; color:#1E293B;">Select Account Role / Type *</label>
                        <select id="reg-role" class="form-control" style="width:100%; padding:0.65rem 0.85rem; border:2px solid #1D4ED8; border-radius:6px; background:#EFF6FF; font-weight:600; color:#1E40AF;" required>
                            <option value="INDUSTRY" selected>🏭 Industry / Enterprise User (Businesses, Factories, MSMEs)</option>
                            <option value="OFFICER">👮 Government Review Officer (Regulatory & Verification)</option>
                            <option value="ADMIN">👑 System Administrator (System Management & Audit)</option>
                        </select>
                    </div>

                    <div class="form-group" style="margin-bottom:1rem;">
                        <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:0.35rem; color:#334155;">Full Name *</label>
                        <input type="text" id="reg-name" class="form-control" placeholder="e.g. Vikramaditya Sharma" style="width:100%; padding:0.65rem 0.85rem; border:1px solid #CBD5E1; border-radius:6px;" required>
                    </div>

                    <div id="company-name-group" class="form-group" style="margin-bottom:1rem;">
                        <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:0.35rem; color:#334155;">Enterprise / Company Name</label>
                        <input type="text" id="reg-company" class="form-control" placeholder="e.g. Shakti Precision Manufacturing Pvt. Ltd." style="width:100%; padding:0.65rem 0.85rem; border:1px solid #CBD5E1; border-radius:6px;">
                    </div>

                    <div class="form-group" style="margin-bottom:1rem;">
                        <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:0.35rem; color:#334155;">Email Address *</label>
                        <input type="email" id="reg-email" class="form-control" placeholder="name@domain.com" style="width:100%; padding:0.65rem 0.85rem; border:1px solid #CBD5E1; border-radius:6px;" required>
                    </div>

                    <div class="form-group" style="margin-bottom:1rem;">
                        <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:0.35rem; color:#334155;">Phone Number</label>
                        <input type="text" id="reg-phone" class="form-control" placeholder="+91 98765 43210" style="width:100%; padding:0.65rem 0.85rem; border:1px solid #CBD5E1; border-radius:6px;">
                    </div>

                    <div class="form-group" style="margin-bottom:1.5rem;">
                        <label style="display:block; font-weight:600; font-size:0.85rem; margin-bottom:0.35rem; color:#334155;">Password *</label>
                        <input type="password" id="reg-password" class="form-control" placeholder="••••••••" style="width:100%; padding:0.65rem 0.85rem; border:1px solid #CBD5E1; border-radius:6px;" required>
                    </div>

                    <button type="submit" class="btn btn-primary" style="width:100%; padding:0.75rem; font-size:1rem;">Complete Registration</button>
                </form>
                <div style="text-align:center; margin-top:1.5rem; font-size:0.85rem;">
                    <span style="color:#64748B;">Already registered?</span>
                    <a href="#/login" style="font-weight:600; margin-left:0.25rem;">Sign In</a>
                </div>
            </div>
        </div>
    `;

    const roleSelect = document.getElementById('reg-role');
    const compGroup = document.getElementById('company-name-group');

    roleSelect.addEventListener('change', () => {
        if (roleSelect.value === 'INDUSTRY') {
            compGroup.style.display = 'block';
        } else {
            compGroup.style.display = 'none';
        }
    });

    document.getElementById('reg-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const role = document.getElementById('reg-role').value;
        const data = {
            name: document.getElementById('reg-name').value,
            email: document.getElementById('reg-email').value,
            phone: document.getElementById('reg-phone').value,
            password: document.getElementById('reg-password').value,
            company_name: document.getElementById('reg-company') ? document.getElementById('reg-company').value : '',
            role
        };

        try {
            const res = await API.register(data);
            if (res.success) {
                API.setToken(res.data.token);
                State.setUser(res.data.user);
                State.setCompany(res.data.company || null);
                Toast.success(`Registered successfully as ${role}`);
                
                // Route to appropriate role dashboard
                if (role === 'OFFICER') {
                    window.location.hash = '#/officer-dashboard';
                } else if (role === 'ADMIN') {
                    window.location.hash = '#/admin-dashboard';
                } else {
                    window.location.hash = '#/dashboard';
                }
            }
        } catch (err) {
            Toast.error(err.message);
        }
    });
}

window.renderLandingPage = renderLandingPage;
window.renderLoginPage = renderLoginPage;
window.renderRegisterPage = renderRegisterPage;
window.fillDemo = fillDemo;
