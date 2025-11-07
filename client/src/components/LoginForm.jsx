import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import { useAuth } from '../utils/auth';

export default function LoginForm() {
  const [form, setForm] = useState({ accountNumber: '', password: '' });
  const [msg, setMsg] = useState('');
  const { login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch('/api/auth/login', { method: 'POST', body: form });
      login(data.accessToken, data.csrfToken);
      setMsg('Logged in!');
    } catch (err) {
      setMsg(err.error || 'Login failed');
    }
  };

  return (
    <form onSubmit={submit}>
      <input placeholder="Account number" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} />
      <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Login</button>
      <div>{msg}</div>
    </form>
  );
}
