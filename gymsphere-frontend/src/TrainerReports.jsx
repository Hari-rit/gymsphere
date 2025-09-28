// src/TrainerReports.jsx
import React, { useState, useEffect } from "react";

/**
 * Normalize backend summary object to the shape the UI expects:
 * {
 *   monthly: { present, absent, sessions, start, end },
 *   all_time: { present, absent, sessions },
 *   total_clients
 * }
 */
function normalizeSummary(resp = {}) {
  const monthlyRaw = resp.monthly || resp.month || {};
  const allRaw = resp.all_time || resp.alltime || resp.allTime || {};

  const monthly = {
    present: Number(monthlyRaw.present ?? 0),
    absent: Number(monthlyRaw.absent ?? 0),
    // backend may use "total_sessions" — map it to sessions
    sessions: Number(monthlyRaw.sessions ?? monthlyRaw.total_sessions ?? 0),
    start: monthlyRaw.start ?? monthlyRaw.start_date ?? "",
    end: monthlyRaw.end ?? monthlyRaw.end_date ?? "",
  };

  const all_time = {
    present: Number(allRaw.present ?? 0),
    absent: Number(allRaw.absent ?? 0),
    sessions: Number(allRaw.sessions ?? allRaw.total_sessions ?? 0),
  };

  const total_clients =
    Number(resp.total_clients ?? monthlyRaw.total_clients ?? allRaw.total_clients ?? 0);

  return { monthly, all_time, total_clients };
}

function TrainerReports() {
  const [summary, setSummary] = useState({
    monthly: { present: 0, absent: 0, sessions: 0, start: "", end: "" },
    all_time: { present: 0, absent: 0, sessions: 0 },
    total_clients: 0,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const fetchSummary = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(
        "http://localhost:100/gymsphere-backend/get_attendance_summary.php",
        {
          method: "GET",
          credentials: "include", // important - session auth on backend
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText} — ${text}`);
      }

      const data = await res.json();

      if (!data.success) {
        // backend might send success:false plus message
        throw new Error(data.message || "Failed to load summary");
      }

      setSummary(normalizeSummary(data));
    } catch (e) {
      console.error("Error fetching reports:", e);
      setErr(e.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">📊 Attendance Reports</h2>
        <button
          className="btn btn-info"
          onClick={fetchSummary}
          disabled={loading}
          title="Refresh"
        >
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      {err && (
        <div className="alert alert-warning">
          ⚠️ {err}
          <div className="small mt-1 text-muted">
            Make sure you're logged in as a trainer (session + credentials included).
          </div>
        </div>
      )}

      {/* Monthly */}
      <h4 className="mb-3 text-info text-center">📅 This Month</h4>
      <div className="row g-4 text-center mb-4">
        <div className="col-md-3">
          <div className="card bg-dark bg-opacity-50 text-white shadow rounded-4">
            <div className="card-body">
              <h6>✅ Present</h6>
              <p className="fw-bold text-success fs-4">
                {summary.monthly.present}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-dark bg-opacity-50 text-white shadow rounded-4">
            <div className="card-body">
              <h6>❌ Absent</h6>
              <p className="fw-bold text-danger fs-4">
                {summary.monthly.absent}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-dark bg-opacity-50 text-white shadow rounded-4">
            <div className="card-body">
              <h6>👥 Clients</h6>
              <p className="fw-bold text-info fs-4">{summary.total_clients}</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-dark bg-opacity-50 text-white shadow rounded-4">
            <div className="card-body">
              <h6>📅 Sessions</h6>
              <p className="fw-bold text-warning fs-4">
                {summary.monthly.sessions}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* All time */}
      <h4 className="mb-3 text-info text-center">🌍 All Time</h4>
      <div className="row g-4 text-center mb-4">
        <div className="col-md-3">
          <div className="card bg-dark bg-opacity-50 text-white shadow rounded-4">
            <div className="card-body">
              <h6>✅ Present</h6>
              <p className="fw-bold text-success fs-4">
                {summary.all_time.present}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-dark bg-opacity-50 text-white shadow rounded-4">
            <div className="card-body">
              <h6>❌ Absent</h6>
              <p className="fw-bold text-danger fs-4">
                {summary.all_time.absent}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-dark bg-opacity-50 text-white shadow rounded-4">
            <div className="card-body">
              <h6>👥 Clients</h6>
              <p className="fw-bold text-info fs-4">{summary.total_clients}</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-dark bg-opacity-50 text-white shadow rounded-4">
            <div className="card-body">
              <h6>📅 Sessions</h6>
              <p className="fw-bold text-warning fs-4">
                {summary.all_time.sessions}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrainerReports;
