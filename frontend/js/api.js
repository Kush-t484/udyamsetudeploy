// API Client

const API = {
  baseURL: '/api',
  
  async get(endpoint) {
    return Utils.fetch(`${this.baseURL}${endpoint}`);
  },
  
  async post(endpoint, data) {
    return Utils.fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  async put(endpoint, data) {
    return Utils.fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  async delete(endpoint) {
    return Utils.fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE'
    });
  }
};
