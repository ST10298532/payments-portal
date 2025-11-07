import React, { useState } from "react";
import { useAuth } from "../utils/auth";
import { apiFetch } from "../utils/api";

const PaymentForm = () => {
  const { accessToken } = useAuth(); // from AuthProvider
  const [formData, setFormData] = useState({
    amount: "",
    currency: "",
    provider: "SWIFT",
    payeeAccount: "",
    swiftCode: ""
  });
  const [message, setMessage] = useState("");

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    try {
      const result = await apiFetch("/api/pay", {
        method: "POST",
        body: formData,
        accessToken
      });
      setMessage(result.message || "Payment sent successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Error processing payment");
    }
  };

  return (
    <div>
      <h2>Make International Payment</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="currency"
          placeholder="Currency (e.g. USD)"
          value={formData.currency}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="payeeAccount"
          placeholder="Payee Account Number"
          value={formData.payeeAccount}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="swiftCode"
          placeholder="SWIFT Code"
          value={formData.swiftCode}
          onChange={handleChange}
          required
        />
        <button type="submit">Pay Now</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default PaymentForm;
