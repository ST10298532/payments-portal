import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { useAuth } from '../utils/auth';

export default function EmployeePortal() {
  const [payments, setPayments] = useState([]);
  const [msg, setMsg] = useState('');
  const { accessToken, csrfToken } = useAuth();

  // Load all pending transactions when employee logs in
  useEffect(() => {
    async function loadPayments() {
      try {
        const data = await apiFetch('/api/employee/pending', {
          accessToken,
          csrfToken,
        });
        setPayments(data.payments);
      } catch (err) {
        setMsg(err.error || 'Could not load payments');
      }
    }

    if (accessToken) loadPayments();
  }, [accessToken, csrfToken]);

  // Approve or submit a transaction
  async function handleAction(txId, action) {
    try {
      await apiFetch('/api/employee/verify', {
        method: 'POST',
        body: { txId, action },
        accessToken,
        csrfToken,
      });
      setMsg(`${action} successful`);
      // Remove it from the list after success
      setPayments((p) => p.filter((x) => x.tx_id !== txId));
    } catch (err) {
      setMsg(err.error || 'Action failed');
    }
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Employee Portal</h2>
      {msg && <div style={{ color: 'green' }}>{msg}</div>}
      {payments.length === 0 ? (
        <p>No pending transactions.</p>
      ) : (
        <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Payee</th>
              <th>SWIFT</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.tx_id}>
                <td>{p.tx_id}</td>
                <td>{p.amount}</td>
                <td>{p.currency}</td>
                <td>****{p.payee_account_last4}</td>
                <td>{p.swift}</td>
                <td>
                  <button onClick={() => handleAction(p.tx_id, 'VERIFY')}>Verify</button>{' '}
                  <button onClick={() => handleAction(p.tx_id, 'SUBMIT')}>Submit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
