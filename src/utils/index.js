export const createPageUrl = (pageName) => {
  const routes = {
    'Home': '/home',
    'ReportIssue': '/report-issue',
    'AdminDashboard': '/admin-dashboard',
    'AdminComplaints': '/admin-complaints'
  };
  
  return routes[pageName] || '/';
};
