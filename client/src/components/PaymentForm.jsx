import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import { useAuth } from '../utils/auth';

export default function PaymentForm() {
  const [form, setForm] = useState({ amount: '', currency: 'ZAR', provider: 'SWIFT', payeeAccount: '', swift: '' });
  const [msg, setMsg] = useState('');
  const { accessToken, csrfToken } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch('/api/pay', { method: 'POST', body: form, accessToken, csrfToken });
      setMsg('Payment submitted: ' + data.txId);
    } catch (err) {
      setMsg(err.error || 'Error');
    }
  };

  return (
    <form onSubmit={submit}>
      <input placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
      <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
        <option>ZAR</option><option>USD</option><option>EUR</option>
      </select>
      <input placeholder="Payee account" value={form.payeeAccount} onChange={(e) => setForm({ ...form, payeeAccount: e.target.value })} />
      <input placeholder="SWIFT/BIC" value={form.swift} onChange={(e) => setForm({ ...form, swift: e.target.value })} />
      <button type="submit">Pay Now</button>
      <div>{msg}</div>
    </form>
  );
}
