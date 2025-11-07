import React, { useState } from 'react';
import { apiFetch } from '../utils/api';

export default function RegisterForm() {
  const [form, setForm] = useState({ fullname: '', idNumber: '', accountNumber: '', password: '' });
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch('/api/auth/register', { method: 'POST', body: form });
      setMsg('Registered successfully!');
    } catch (err) {
      setMsg(err.error || 'Error registering');
    }
  };

  return (
    <form onSubmit={submit}>
      <input placeholder="Full name" value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })} />
      <input placeholder="ID number" value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} />
      <input placeholder="Account number" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} />
      <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Register</button>
      <div>{msg}</div>
    </form>
  );
}
