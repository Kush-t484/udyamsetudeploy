// Global State Management

const State = {
  user: null,
  isAuthenticated: false,
  notifications: [],
  
  setUser(user) {
    this.user = user;
    this.isAuthenticated = !!user;
  },
  
  addNotification(notification) {
    this.notifications.push(notification);
  },
  
  clearNotifications() {
    this.notifications = [];
  }
};
