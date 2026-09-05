// Sidebar Component

const Sidebar = {
  render() {
    return `
      <aside class="sidebar">
        <ul class="nav-menu">
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/approvals">Approvals</a></li>
          <li><a href="/applications">Applications</a></li>
          <li><a href="/documents">Documents</a></li>
          <li><a href="/compliance">Compliance</a></li>
          <li><a href="/schemes">Schemes</a></li>
        </ul>
      </aside>
    `;
  }
};
