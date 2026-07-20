import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Attendance from './pages/Attendance';
import Tasks from './pages/Tasks';
import Leaves from './pages/Leaves';
import Holidays from './pages/Holidays';
import Checklists from './pages/Checklists';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import { fetchMe } from './redux/slices/authSlice';

// Renders the right dashboard based on logged-in role
const DashboardRouter = () => {
  const { user } = useSelector((state) => state.auth);
  return user?.role === 'employee' ? <EmployeeDashboard /> : <AdminDashboard />;
};

function App() {
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);

  // Re-validate session on load (auto login / session persistence)
  useEffect(() => {
    if (accessToken) dispatch(fetchMe());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/leaves" element={<Leaves />} />
          <Route path="/profile" element={<Profile />} />

          <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
            <Route path="/employees" element={<Employees />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/holidays" element={<Holidays />} />
            <Route path="/checklists" element={<Checklists />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
