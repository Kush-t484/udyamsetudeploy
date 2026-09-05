// Utility Functions

const Utils = {
  // API call helper
  async fetch(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  },
  
  // Format date
  formatDate(date) {
    return new Date(date).toLocaleDateString();
  },
  
  // Format time
  formatTime(date) {
    return new Date(date).toLocaleTimeString();
  }
};
