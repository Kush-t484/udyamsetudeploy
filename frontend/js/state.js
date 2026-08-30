/* Central Reactive Client State Store */

const State = {
    user: null,
    company: null,
    activeRole: 'INDUSTRY', // INDUSTRY, OFFICER, ADMIN
    notifications: [],
    unreadNotificationsCount: 0,

    setUser(user) {
        this.user = user;
        if (user) this.activeRole = user.role;
    },

    setCompany(company) {
        this.company = company;
    },

    setNotifications(list, unreadCount) {
        this.notifications = list || [];
        this.unreadNotificationsCount = unreadCount || 0;
    }
};

window.State = State;
