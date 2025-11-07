import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CustomerPage from './pages/CustomerPage';
import EmployeePage from './pages/EmployeePage';
import { AuthProvider } from './utils/auth.jsx';

export default function App() {
  return (
    <AuthProvider>
       <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/customer" element={<RequireAuth role="customer"><CustomerPage/></RequireAuth>} />
        <Route path="/employee" element={<RequireAuth role="employee"><EmployeePage/></RequireAuth>} />
      </Routes>
    </AuthProvider>
  );
}

function RequireAuth({ children, role }) {
  const { role: userRole } = useAuth();
  if (!userRole) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to="/login" replace />;
  return children;
}
