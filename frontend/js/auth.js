/* Auth Manager */

const Auth = {
    async init() {
        const token = API.getToken();
        if (!token) return false;

        try {
            const res = await API.getCurrentUser();
            if (res.success) {
                State.setUser(res.data.user);
                State.setCompany(res.data.company);
                return true;
            }
        } catch (e) {
            console.warn('Session verification failed:', e.message);
            API.setToken(null);
        }
        return false;
    },

    async login(email, password) {
        const res = await API.login({ email, password });
        if (res.success) {
            API.setToken(res.data.token);
            State.setUser(res.data.user);
            State.setCompany(res.data.company || null);
            
            // Securely Redirect based on user's authorized role
            if (res.data.user.role === 'OFFICER') {
                window.location.hash = '#/officer-dashboard';
            } else if (res.data.user.role === 'ADMIN') {
                window.location.hash = '#/admin-dashboard';
            } else {
                window.location.hash = '#/dashboard';
            }
            return res;
        }
        throw new Error(res.message || 'Login failed');
    },

    logout() {
        API.setToken(null);
        State.setUser(null);
        State.setCompany(null);
        window.location.hash = '#/login';
        Toast.info('Logged out successfully');
    }
};

window.Auth = Auth;
