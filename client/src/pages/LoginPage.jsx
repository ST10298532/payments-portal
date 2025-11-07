import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useAuth } from '../utils/auth';

export default function LoginPage(){
  const [role, setRole] = useState('customer'); // 'customer' or 'employee'
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async () => {
    try {
      // customer registration
      const body = { fullname, idNumber, accountNumber: account, password };
      await apiFetch('/api/auth/register', { method:'POST', body });
      alert('Registered');
    } catch (err) {
      alert(err.error || 'Registration failed');
    }
  };

  const handleLogin = async () => {
    try {
      if (role === 'customer') {
        const r = await apiFetch('/api/auth/login', { method:'POST', body:{ accountNumber: account, password }});
        login(r.accessToken, 'customer'); // set role in auth
        navigate('/customer');
      } else {
        const r = await apiFetch('/api/employee/login', { method:'POST', body:{ username: account, password }});
        login(r.accessToken, 'employee');
        navigate('/employee');
      }
    } catch (err) {
      alert(err.error || 'Login failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Portal Login</h1>
      <div>
        <label>
          <input type="radio" checked={role==='customer'} onChange={()=>setRole('customer')} /> Customer
        </label>
        <label style={{ marginLeft: 12 }}>
          <input type="radio" checked={role==='employee'} onChange={()=>setRole('employee')} /> Employee
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        {role==='customer' && (
          <>
            <input placeholder="Full name" value={fullname} onChange={e=>setFullname(e.target.value)} />
            <input placeholder="ID number" value={idNumber} onChange={e=>setIdNumber(e.target.value)} />
          </>
        )}
        <input placeholder={role==='customer' ? 'Account number' : 'Username'} value={account} onChange={e=>setAccount(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      </div>

      <div style={{ marginTop: 12 }}>
        {role === 'customer' ? <button onClick={handleRegister}>Register</button> : null}
        <button onClick={handleLogin} style={{ marginLeft: 8 }}>Login</button>
      </div>
    </div>
  );
}
