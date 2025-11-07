import React from 'react';
import PaymentForm from '../components/PaymentForm';
import { useAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export default function CustomerPage(){
  const { logout } = useAuth();
  const nav = useNavigate();
  return (
    <div style={{ padding: 20 }}>
      <h2>Customer Dashboard</h2>
      <button onClick={()=>{ logout(); nav('/login'); }}>Logout</button>
      <PaymentForm />
    </div>
  );
}
