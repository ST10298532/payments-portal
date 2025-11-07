import React from 'react';
import EmployeePortal from '../components/EmployeePortal';
import { useAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export default function EmployeePage(){
  const { logout } = useAuth();
  const nav = useNavigate();
  return (
    <div style={{ padding: 20 }}>
      <h2>Employee Portal</h2>
      <button onClick={()=>{ logout(); nav('/login'); }}>Logout</button>
      <EmployeePortal />
    </div>
  );
}
