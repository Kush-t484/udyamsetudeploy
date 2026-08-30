/* Company Profile & Onboarding Editor Script */

async function renderProfilePage() {
    const container = document.getElementById('page-content');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header-title">
                <h1>Company & Industrial Enterprise Profile</h1>
                <p>Manage business details, investment parameters & pollution classification.</p>
            </div>
        </div>

        <div class="card">
            <form id="company-profile-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Company Enterprise Name</label>
                        <input type="text" id="prof-name" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Registration Number (CIN)</label>
                        <input type="text" id="prof-cin" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>GSTIN</label>
                        <input type="text" id="prof-gstin" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>PAN Number</label>
                        <input type="text" id="prof-pan" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Industry</label>
                        <input type="text" id="prof-industry" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Sector</label>
                        <input type="text" id="prof-sector" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>State</label>
                        <input type="text" id="prof-state" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>District</label>
                        <input type="text" id="prof-district" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Investment Amount (₹)</label>
                        <input type="number" id="prof-investment" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Employees</label>
                        <input type="number" id="prof-employees" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Power Requirement (HP/kW)</label>
                        <input type="number" id="prof-power" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Pollution Category</label>
                        <select id="prof-pollution" class="form-control">
                            <option value="Red">Red</option>
                            <option value="Orange">Orange</option>
                            <option value="Green">Green</option>
                            <option value="White">White</option>
                        </select>
                    </div>
                </div>

                <div style="margin-top:1.5rem; display:flex; justify-content:flex-end;">
                    <button type="submit" class="btn btn-primary">💾 Save Profile Changes</button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('company-profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateProfileDetails();
    });

    await loadCompanyProfileData();
}

async function loadCompanyProfileData() {
    try {
        const res = await API.getCompanyProfile();
        if (res.success && res.data) {
            const c = res.data;
            document.getElementById('prof-name').value = c.name || '';
            document.getElementById('prof-cin').value = c.registration_number || '';
            document.getElementById('prof-gstin').value = c.gstin || '';
            document.getElementById('prof-pan').value = c.pan || '';
            document.getElementById('prof-industry').value = c.industry || '';
            document.getElementById('prof-sector').value = c.sector || '';
            document.getElementById('prof-state').value = c.state || '';
            document.getElementById('prof-district').value = c.district || '';
            document.getElementById('prof-investment').value = c.investment_amount || 0;
            document.getElementById('prof-employees').value = c.employees || 0;
            document.getElementById('prof-power').value = c.power_requirement || 0;
            document.getElementById('prof-pollution').value = c.pollution_category || 'Green';
        }
    } catch (err) {
        console.warn('Profile load error:', err.message);
    }
}

async function updateProfileDetails() {
    const data = {
        name: document.getElementById('prof-name').value,
        registration_number: document.getElementById('prof-cin').value,
        gstin: document.getElementById('prof-gstin').value,
        pan: document.getElementById('prof-pan').value,
        industry: document.getElementById('prof-industry').value,
        sector: document.getElementById('prof-sector').value,
        state: document.getElementById('prof-state').value,
        district: document.getElementById('prof-district').value,
        investment_amount: document.getElementById('prof-investment').value,
        employees: document.getElementById('prof-employees').value,
        power_requirement: document.getElementById('prof-power').value,
        pollution_category: document.getElementById('prof-pollution').value
    };

    try {
        const res = await API.updateCompanyProfile(data);
        if (res.success) {
            Toast.success('Company profile updated successfully');
        }
    } catch (err) {
        Toast.error(err.message);
    }
}

window.renderProfilePage = renderProfilePage;
