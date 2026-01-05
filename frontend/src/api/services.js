import api from './axios';

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  uploadProfilePhoto: (formData) => api.post('/auth/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getByRole: (role) => api.get(`/users/role/${role}`)
};

// Sites API
export const sitesAPI = {
  getAll: (params) => api.get('/sites', { params }),
  getById: (id) => api.get(`/sites/${id}`),
  create: (data) => api.post('/sites', data),
  update: (id, data) => api.put(`/sites/${id}`, data),
  delete: (id) => api.delete(`/sites/${id}`),
  getStats: (id) => api.get(`/sites/${id}/stats`),
  getMySites: () => api.get('/sites/my-sites')
};

// Tasks API
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  getBySite: (siteId) => api.get(`/tasks/site/${siteId}`),
  getByWorker: (workerId) => api.get(`/tasks/worker/${workerId}`),
  assign: (id, workerId) => api.post(`/tasks/${id}/assign`, { workerId }),
  getOverdue: () => api.get('/tasks/overdue')
};

// Workers API
export const workersAPI = {
  getAll: (params) => api.get('/workers', { params }),
  getById: (id) => api.get(`/workers/${id}`),
  create: (data) => api.post('/workers', data),
  update: (id, data) => api.put(`/workers/${id}`, data),
  delete: (id) => api.delete(`/workers/${id}`),
  getBySite: (siteId) => api.get(`/workers/site/${siteId}`),
  getStats: (id, params) => api.get(`/workers/${id}/stats`, { params }),
  assignToSite: (id, siteId) => api.post(`/workers/${id}/assign`, { siteId }),
  uploadPhoto: (id, formData) => api.post(`/workers/${id}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Attendance API
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  getById: (id) => api.get(`/attendance/${id}`),
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (id, checkOut) => api.put(`/attendance/${id}/check-out`, { checkOut }),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
  getDaily: (siteId, date) => api.get(`/attendance/site/${siteId}/daily`, { params: { date } }),
  getSummary: (siteId, params) => api.get(`/attendance/site/${siteId}/summary`, { params })
};

// Materials API
export const materialsAPI = {
  getAll: (params) => api.get('/materials', { params }),
  getById: (id) => api.get(`/materials/${id}`),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`),
  addStock: (id, quantity) => api.post(`/materials/${id}/add-stock`, { quantity }),
  recordUsage: (data) => api.post('/materials/usage', data),
  getLowStock: () => api.get('/materials/alerts/low-stock'),
  getUsageBySite: (siteId) => api.get(`/materials/usage/site/${siteId}`),
  uploadPhoto: (id, formData) => api.post(`/materials/${id}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Expenses API
export const expensesAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  approve: (id) => api.post(`/expenses/${id}/approve`),
  getBySite: (siteId) => api.get(`/expenses/site/${siteId}`),
  getBudgetComparison: (siteId) => api.get(`/expenses/site/${siteId}/budget-comparison`),
  getSummary: (params) => api.get('/expenses/summary', { params })
};

// Incidents API
export const incidentsAPI = {
  getAll: (params) => api.get('/incidents', { params }),
  getById: (id) => api.get(`/incidents/${id}`),
  create: (data) => api.post('/incidents', data),
  update: (id, data) => api.put(`/incidents/${id}`, data),
  delete: (id) => api.delete(`/incidents/${id}`),
  updateStatus: (id, status, actionTaken) => api.put(`/incidents/${id}/status`, { status, actionTaken }),
  getBySite: (siteId) => api.get(`/incidents/site/${siteId}`),
  getStats: (params) => api.get('/incidents/stats', { params })
};

// Budgets API
export const budgetsAPI = {
  getBySite: (siteId) => api.get(`/budgets/site/${siteId}`),
  getOverview: (siteId) => api.get(`/budgets/site/${siteId}/overview`),
  upsert: (siteId, data) => api.post(`/budgets/site/${siteId}`, data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`)
};

// Reports API
export const reportsAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getAlerts: () => api.get('/reports/alerts'),
  getSiteProgress: () => api.get('/reports/sites/progress'),
  getExpenses: (params) => api.get('/reports/expenses', { params }),
  getWorkerProductivity: (params) => api.get('/reports/workers/productivity', { params }),
  getSafety: (params) => api.get('/reports/safety', { params }),
  getBudgetVsActual: () => api.get('/reports/budget-vs-actual')
};

// Attachments API
export const attachmentsAPI = {
  upload: (entityType, entityId, files, category) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (category) formData.append('category', category);
    return api.post(`/attachments/${entityType}/${entityId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getByEntity: (entityType, entityId, params) => api.get(`/attachments/${entityType}/${entityId}`, { params }),
  getGallery: (siteId) => api.get(`/attachments/sites/${siteId}/gallery`),
  update: (id, data) => api.put(`/attachments/file/${id}`, data),
  delete: (id) => api.delete(`/attachments/file/${id}`)
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`)
};

// Assignments API
export const assignmentsAPI = {
  getAll: (params) => api.get('/assignments', { params }),
  getById: (id) => api.get(`/assignments/${id}`),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  complete: (id) => api.put(`/assignments/${id}/complete`),
  cancel: (id, reason) => api.put(`/assignments/${id}/cancel`, { reason }),
  reassign: (id, newAssigneeId, reason) => api.post(`/assignments/${id}/reassign`, { newAssigneeId, reason }),
  getHistory: (id) => api.get(`/assignments/${id}/history`),
  getWorkerAssignments: (workerId) => api.get(`/assignments/worker/${workerId}`),
  getSiteAssignments: (siteId) => api.get(`/assignments/site/${siteId}`),
  getWorkerTimeline: (workerId, params) => api.get(`/assignments/worker/${workerId}/timeline`, { params }),
  checkConflicts: (data) => api.post('/assignments/check-conflicts', data)
};

// Calendar API
export const calendarAPI = {
  getEvents: (params) => api.get('/calendar/events', { params }),
  getEventById: (id) => api.get(`/calendar/events/${id}`),
  create: (data) => api.post('/calendar/events', data),
  update: (id, data) => api.put(`/calendar/events/${id}`, data),
  delete: (id) => api.delete(`/calendar/events/${id}`),
  getSiteWeekly: (siteId, weekStart) => api.get(`/calendar/sites/${siteId}/weekly`, { params: { weekStart } }),
  getWorkerSchedule: (workerId, params) => api.get(`/calendar/workers/${workerId}`, { params }),
  syncTasks: (siteId) => api.post(`/calendar/sites/${siteId}/sync-tasks`),
  checkConflicts: (data) => api.post('/calendar/check-conflicts', data),
  getSummary: (days) => api.get('/calendar/summary', { params: { days } })
};

// Timesheets API
export const timesheetsAPI = {
  getAll: (params) => api.get('/timesheets', { params }),
  getById: (id) => api.get(`/timesheets/${id}`),
  generate: (workerId, siteId, weekStartDate) => api.post('/timesheets/generate', { workerId, siteId, weekStartDate }),
  update: (id, data) => api.put(`/timesheets/${id}`, data),
  submit: (id) => api.put(`/timesheets/${id}/submit`),
  approve: (id) => api.put(`/timesheets/${id}/approve`),
  reject: (id, reason) => api.put(`/timesheets/${id}/reject`, { reason }),
  getSiteSummary: (siteId, weekStartDate) => api.get(`/timesheets/sites/${siteId}/summary`, { params: { weekStartDate } }),
  generateSiteTimesheets: (siteId, weekStartDate) => api.post(`/timesheets/sites/${siteId}/generate`, { weekStartDate })
};

// Audit Logs API
export const auditLogsAPI = {
  getAll: (params) => api.get('/audit-logs', { params }),
  getSummary: (days) => api.get('/audit-logs/summary', { params: { days } }),
  getEntityHistory: (entityType, entityId) => api.get(`/audit-logs/entity/${entityType}/${entityId}`),
  getUserActivity: (userId, limit) => api.get(`/audit-logs/user/${userId}`, { params: { limit } })
};

// Alerts API
export const alertsAPI = {
  getAll: () => api.get('/alerts'),
  runChecks: () => api.post('/alerts/check'),
  canCloseSite: (siteId) => api.get(`/alerts/sites/${siteId}/can-close`),
  getSiteSuggestions: (siteId) => api.get(`/alerts/sites/${siteId}/suggestions`)
};

// PDF Reports API
export const pdfReportsAPI = {
  generateSiteReport: (siteId) => api.get(`/reports/pdf/site/${siteId}`),
  generateTimesheetReport: (workerId, params) => api.get(`/reports/pdf/timesheet/${workerId}`, { params }),
  generateExpenseReport: (params) => api.get('/reports/pdf/expenses', { params }),
  generateIncidentReport: (params) => api.get('/reports/pdf/incidents', { params }),
  downloadPdf: (filename) => `/api/reports/pdf/download/${filename}`
};

