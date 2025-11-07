import React, { useEffect, useState } from "react";
import { useAuth } from "../utils/auth";
import { apiFetch } from "../utils/api";

const EmployeePortal = () => {
  const { accessToken, user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await apiFetch("/api/employee/pending", {
          accessToken
        });
        setPayments(data.payments || []);
      } catch (err) {
        console.error(err);
        setMessage("Error loading payments");
      }
    };
    fetchPayments();
  }, [accessToken]);

  const handleVerify = async tx_id => {
    try {
      await apiFetch(`/api/employee/verify/${tx_id}`, {
        method: "POST",
        accessToken
      });
      setPayments(payments.map(p => 
        p.tx_id === tx_id ? { ...p, verified: true } : p
      ));
    } catch (err) {
      console.error(err);
      setMessage("Error verifying payment");
    }
  };

  const handleSubmitToSwift = async () => {
    try {
      const result = await apiFetch("/api/employee/submit", {
        method: "POST",
        accessToken
      });
      setMessage(result.message || "Payments submitted to SWIFT!");
      setPayments([]);
    } catch (err) {
      console.error(err);
      setMessage("Error submitting to SWIFT");
    }
  };

  if (!user || user.role !== "employee") {
    return <p>Access denied. Employees only.</p>;
  }

  return (
    <div>
      <h2>Employee Portal – Pending Payments</h2>
      {message && <p>{message}</p>}
      {payments.length === 0 ? (
        <p>No pending payments</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Payee Account</th>
              <th>SWIFT</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.tx_id}>
                <td>{p.tx_id}</td>
                <td>{p.amount}</td>
                <td>{p.currency}</td>
                <td>{p.payee_account}</td>
                <td>{p.swift}</td>
                <td>{p.verified ? "Verified" : "Pending"}</td>
                <td>
                  {!p.verified && (
                    <button onClick={() => handleVerify(p.tx_id)}>
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {payments.some(p => p.verified) && (
        <button onClick={handleSubmitToSwift} style={{ marginTop: "1rem" }}>
          Submit to SWIFT
        </button>
      )}
    </div>
  );
};

export default EmployeePortal;
