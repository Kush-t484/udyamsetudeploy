// Authentication Module

const Auth = {
  login(credentials) {
    return API.post('/auth/login', credentials);
  },
  
  logout() {
    State.setUser(null);
    localStorage.removeItem('token');
  },
  
  getToken() {
    return localStorage.getItem('token');
  },
  
  setToken(token) {
    localStorage.setItem('token', token);
  }
};
