import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Sites from './pages/Sites';
import Tasks from './pages/Tasks';
import Workers from './pages/Workers';
import Attendance from './pages/Attendance';
import Materials from './pages/Materials';
import Expenses from './pages/Expenses';
import Incidents from './pages/Incidents';
import Reports from './pages/Reports';
import Users from './pages/Users';
import CalendarPage from './pages/CalendarPage';
import Notifications from './pages/Notifications';
import Timesheets from './pages/Timesheets';
import AuditLogs from './pages/AuditLogs';
import Assignments from './pages/Assignments';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sites" element={<Sites />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/users" element={<Users />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/timesheets" element={<Timesheets />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
