// Dashboard Page

const DashboardPage = {
  async render() {
    try {
      const data = await API.get('/dashboard');
      return `
        <div class="dashboard">
          <h1>Dashboard</h1>
          <p>Welcome to UdyamSetu AI</p>
        </div>
      `;
    } catch (error) {
      Toast.error('Failed to load dashboard');
      return '<p>Error loading dashboard</p>';
    }
  }
};
