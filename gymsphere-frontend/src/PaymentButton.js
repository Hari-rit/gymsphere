// src/PaymentButton.js
import React, { useState } from "react";

export default function PaymentButton({ onPaymentComplete }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setResult(null);
    try {
      // ✅ No amount sent, backend uses DB membership_fee
      const res = await fetch("http://localhost:100/gymsphere-backend/dummy_create_payment.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}) // empty payload
      });
      const data = await res.json();

      if (data.success) {
        setResult(`✅ Payment successful! Amount: ₹${data.amount}`);
        if (onPaymentComplete) onPaymentComplete("success");
      } else {
        // Special handling for duplicate payment
        if (data.message && data.message.includes("already paid")) {
          setResult("ℹ️ You have already paid for this month.");
          if (onPaymentComplete) onPaymentComplete("duplicate");
        } else {
          setResult("❌ Payment failed: " + (data.message || "Unknown error"));
          if (onPaymentComplete) onPaymentComplete("failed");
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      setResult("⚠️ Error while processing payment.");
      if (onPaymentComplete) onPaymentComplete("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={handlePayment}
        disabled={loading}
        className="btn btn-success btn-lg"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
      {result && <p className="mt-3">{result}</p>}
    </div>
  );
}
