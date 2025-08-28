import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import AdminLayout from './components/common/AdminLayout';
import SchoolLayout from './components/common/SchoolLayout';
import Login from './components/common/Login';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import SchoolManagement from './components/admin/SchoolManagement';
import StudentManagement from './components/admin/StudentManagement';
import ExamCenterManagement from './components/admin/ExamCenterManagement';
import SchoolDashboard from './components/school/SchoolDashboard';
import Scanner from './components/school/Scanner';
import MyDossiers from './components/school/MyDossiers';
import AvailableCenters from './components/school/AvailableCenters';
import StudentProfile from './components/common/StudentProfile';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a',
      light: '#3b82f6',
      dark: '#0f172a',
    },
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="schools" element={<SchoolManagement />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="exam-centers" element={<ExamCenterManagement />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
            // Update the School routes to include StudentManagement
<Route
  path="/school"
  element={
    <ProtectedRoute requiredRole="school">
      <SchoolLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<Navigate to="dashboard" replace />} />
  <Route path="dashboard" element={<SchoolDashboard />} />
  <Route path="scanner" element={<Scanner />} />
  <Route path="my-dossiers" element={<MyDossiers />} />
  <Route path="available-centers" element={<AvailableCenters />} />
  <Route path="students" element={<StudentManagement />} />
  <Route path="student/:id" element={<StudentProfile />} />
  <Route path="*" element={<Navigate to="/school/dashboard" replace />} />
</Route>
            <Route path="/student/:id" element={<StudentProfile />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;