// Main Application Bootstrapper

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Router
  Router.register('/dashboard', DashboardPage);
  Router.register('/approvals', ApprovalsPage);
  Router.register('/applications', ApplicationsPage);
  Router.register('/documents', DocumentsPage);
  Router.register('/compliance', CompliancePage);
  Router.register('/schemes', SchemesPage);
  Router.register('/assistant', AssistantPage);
  Router.register('/notifications', NotificationsPage);
  Router.register('/reports', ReportsPage);
  Router.register('/profile', ProfilePage);
  Router.register('/officer', OfficerPage);
  Router.register('/admin', AdminPage);
  
  // Render initial page
  Router.render();
  
  // Show welcome message
  Toast.success('Application loaded successfully');
});
