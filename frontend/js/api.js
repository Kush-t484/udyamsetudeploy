/* Centralized API Communication Client */

const API = {
    // Allow overriding BASE_URL from hosting environment (set window.API_BASE_URL before loading scripts)
    BASE_URL: (typeof window !== 'undefined' && window.API_BASE_URL) ? window.API_BASE_URL : '/api',

    getToken() {
        return localStorage.getItem('udyamsetu_token');
    },

    setToken(token) {
        if (token) localStorage.setItem('udyamsetu_token', token);
        else localStorage.removeItem('udyamsetu_token');
    },

    async request(endpoint, options = {}) {
        const url = `${this.BASE_URL}${endpoint}`;
        const headers = options.headers || {};

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const config = {
            method: options.method || 'GET',
            headers,
            ...options
        };

        if (options.body && !(options.body instanceof FormData)) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const text = await response.text();

            let data;
            try {
                data = text ? JSON.parse(text) : {};
            } catch (error) {
                // Non-JSON response (or empty). Log raw text for debugging and continue with empty object
                console.error("Server returned non-JSON response:", text);
                data = {};
            }

            if (!response.ok) {
                // Handle unauthorized centrally
                if (response.status === 401 && !endpoint.includes('/auth/login')) {
                    this.setToken(null);
                    window.location.hash = '#/login';
                }

                // Throw an error that includes HTTP status and raw response text when available
                const message = text ? `${response.status} ${text}` : (data && data.message) ? `${response.status} ${data.message}` : `${response.status} ${response.statusText}`;
                throw new Error(`API Error: ${message}`);
            }

            return data;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error.message);
            throw error;
        }
    },

    // Auth APIs
    login(credentials) { return this.request('/auth/login', { method: 'POST', body: credentials }); },
    register(userData) { return this.request('/auth/register', { method: 'POST', body: userData }); },
    getCurrentUser() { return this.request('/auth/me'); },

    // Company APIs
    getCompanyProfile() { return this.request('/company/profile'); },
    updateCompanyProfile(data) { return this.request('/company/profile', { method: 'PUT', body: data }); },
    onboardCompany(data) { return this.request('/company/onboarding', { method: 'POST', body: data }); },

    // Approvals APIs
    getApprovals(params = '') { return this.request(`/approvals${params}`); },
    getApprovalById(id) { return this.request(`/approvals/${id}`); },
    analyzeApprovals(profile) { return this.request('/approvals/analyze', { method: 'POST', body: profile }); },

    // Applications APIs
    getApplications(params = '') { return this.request(`/applications${params}`); },
    getApplicationById(id) { return this.request(`/applications/${id}`); },
    createApplication(data) { return this.request('/applications', { method: 'POST', body: data }); },
    updateApplicationStatus(id, statusData) { return this.request(`/applications/${id}/status`, { method: 'PUT', body: statusData }); },
    requestDocuments(id, data) { return this.request(`/applications/${id}/request-documents`, { method: 'POST', body: data }); },

    // Documents APIs
    getDocuments(params = '') { return this.request(`/documents${params}`); },
    uploadDocument(formData) { return this.request('/documents/upload', { method: 'POST', body: formData }); },
    verifyDocument(id, statusData) { return this.request(`/documents/${id}/verify`, { method: 'PUT', body: statusData }); },
    deleteDocument(id) { return this.request(`/documents/${id}`, { method: 'DELETE' }); },

    // Compliance APIs
    getCompliance() { return this.request('/compliance/summary'); },
    getComplianceRisk() { return this.request('/compliance/risk-score'); },
    updateComplianceRecord(id, data) { return this.request(`/compliance/${id}`, { method: 'PUT', body: data }); },
    runComplianceCheck() { return this.request('/compliance/run-check', { method: 'POST' }); },

    // Schemes APIs
    getSchemes(params = '') { return this.request(`/schemes${params}`); },
    getSchemeById(id) { return this.request(`/schemes/${id}`); },
    matchSchemes(profile) { return this.request('/schemes/match', { method: 'POST', body: profile }); },
    saveScheme(id) { return this.request(`/schemes/${id}/save`, { method: 'POST' }); },
    unsaveScheme(id) { return this.request(`/schemes/${id}/save`, { method: 'DELETE' }); },

    // AI Assistant APIs
    sendAIMessage(data) { return this.request('/ai/chat', { method: 'POST', body: data }); },
    getAIConversations() { return this.request('/ai/conversations'); },
    getAIConversationById(id) { return this.request(`/ai/conversations/${id}`); },

    // Notifications APIs
    getNotifications() { return this.request('/notifications'); },
    markNotificationRead(id) { return this.request(`/notifications/${id}/read`, { method: 'PUT' }); },
    markAllNotificationsRead() { return this.request('/notifications/read-all', { method: 'PUT' }); },

    // Officer APIs
    getOfficerDashboard() { return this.request('/officer/dashboard'); },
    getOfficerApplications(params = '') { return this.request(`/officer/applications${params}`); },
    addOfficerRemarks(id, remarks) { return this.request(`/officer/applications/${id}/remarks`, { method: 'POST', body: { remarks } }); },

    // Admin APIs
    getAdminDashboard() { return this.request('/admin/dashboard'); },
    getAdminUsers() { return this.request('/admin/users'); },
    getAdminCompanies() { return this.request('/admin/companies'); },
    getAdminAuditLogs() { return this.request('/admin/audit-logs'); },

    // Reports & Search APIs
    getCompanyReport() { return this.request('/reports/company'); },
    getComplianceReport() { return this.request('/reports/compliance'); },
    globalSearch(query) { return this.request(`/search?q=${encodeURIComponent(query)}`); }
};

window.API = API;
