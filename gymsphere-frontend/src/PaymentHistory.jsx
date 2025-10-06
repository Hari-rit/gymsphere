import React, { useEffect, useState } from "react";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:100/gymsphere-backend/get_user_payments.php", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.payments) {
          setPayments(data.payments);
        } else {
          setError(data.message || "No payment history available.");
        }
      })
      .catch((err) => {
        console.error("Error fetching payment history:", err);
        setError("Error loading payment history.");
      })
      .finally(() => setLoading(false));
  }, []);

  //  Safe MySQL date formatter (handles YYYY-MM-DD HH:mm:ss)
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";

    try {
      // Split into date and time parts
      const [datePart, timePart] = dateStr.split(" ");
      if (!datePart || !timePart) return dateStr;

      const [year, month, day] = datePart.split("-");
      if (!year || !month || !day) return dateStr;

      // Return consistent format → DD-MM-YYYY HH:mm:ss
      return `${day}-${month}-${year} ${timePart}`;
    } catch (e) {
      console.error("Date format error:", e);
      return dateStr;
    }
  };

  if (loading)
    return (
      <p className="text-center text-light mt-4">
        Loading payment history...
      </p>
    );

  return (
    <div className="container mt-4">
      <div
        className="card bg-dark bg-opacity-50 text-white shadow rounded-4 p-4 mx-auto"
        style={{ maxWidth: "980px" }} // Slightly increased width
      >
        <h4 className="text-center mb-4">💳 Payment History</h4>

        {error && <p className="text-center text-warning">{error}</p>}

        {!error && payments.length > 0 && (
          <div className="table-responsive">
            <table className="table table-dark table-striped text-center align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Amount (₹)</th>
                  <th>Transaction ID</th>
                  <th>Status</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{p.amount}</td>
                    <td>{p.transaction_id}</td>
                    <td
                      className={
                        p.status === "Success" ? "text-success" : "text-danger"
                      }
                    >
                      {p.status}
                    </td>
                    <td>{formatDateTime(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!error && payments.length === 0 && (
          <p className="text-center text-secondary">No payment records found.</p>
        )}
      </div>
    </div>
  );
}
