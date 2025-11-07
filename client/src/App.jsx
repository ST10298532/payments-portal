import React from 'react';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import PaymentForm from './components/PaymentForm';
import EmployeePortal from './components/EmployeePortal';
import { AuthProvider } from './utils/auth.jsx';

export default function App() {
  return (
    <AuthProvider>
      <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Customer International Payments Portal
        </h1>

        {/* Customer section */}
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '3rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}>
          <RegisterForm />
          <LoginForm />
          <PaymentForm />
        </div>

        <hr style={{ margin: '2rem 0' }} />

        {/* Employee Portal section */}
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '10px',
          padding: '1rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}>
          <EmployeePortal />
        </div>
      </div>
    </AuthProvider>
  );
}
