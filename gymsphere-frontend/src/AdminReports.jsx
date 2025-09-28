// src/AdminReports.jsx
import React, { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function normalizeSummary(resp = {}) {
  const monthlyRaw = resp.monthly || {};
  const allRaw = resp.all_time || resp.alltime || {};

  const monthly = {
    present: Number(monthlyRaw.present ?? 0),
    absent: Number(monthlyRaw.absent ?? 0),
    sessions: Number(monthlyRaw.sessions ?? monthlyRaw.total_sessions ?? 0),
  };

  const all_time = {
    present: Number(allRaw.present ?? 0),
    absent: Number(allRaw.absent ?? 0),
    sessions: Number(allRaw.sessions ?? allRaw.total_sessions ?? 0),
  };

  const total_clients = Number(
    resp.total_clients ?? monthlyRaw.total_clients ?? allRaw.total_clients ?? 0
  );

  return { monthly, all_time, total_clients };
}

function AdminReports() {
  const [summary, setSummary] = useState({
    monthly: { present: 0, absent: 0, sessions: 0 },
    all_time: { present: 0, absent: 0, sessions: 0 },
    total_clients: 0,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendance, setAttendance] = useState([]);

  // Filters
  const [filterTrainer, setFilterTrainer] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  // Fetch summary
  const fetchSummary = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(
        "http://localhost:100/gymsphere-backend/get_attendance_summary.php",
        { method: "GET", credentials: "include" }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to load summary");
      setSummary(normalizeSummary(data));
    } catch (e) {
      console.error("Error fetching summary:", e);
      setErr(e.message || "Failed to fetch summary");
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance
  const fetchAttendance = async (date) => {
    try {
      let url = `http://localhost:100/gymsphere-backend/get_attendance_admin.php?date=${date.toISOString().split("T")[0]}`;
      const res = await fetch(url, { method: "GET", credentials: "include" });
      const data = await res.json();
      if (data.success) setAttendance(data.records || []);
      else setAttendance([]);
    } catch (e) {
      console.error("Error fetching attendance:", e);
      setAttendance([]);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  // Chart Data
  const pieData = [
    { name: "Present", value: summary.monthly.present },
    { name: "Absent", value: summary.monthly.absent },
  ];
  const COLORS = ["#28a745", "#dc3545"];

  const barData = [
    {
      name: "This Month",
      Present: summary.monthly.present,
      Absent: summary.monthly.absent,
    },
    {
      name: "All Time",
      Present: summary.all_time.present,
      Absent: summary.all_time.absent,
    },
  ];

  // Trainers list
  const trainerList = [...new Set(attendance.map((a) => a.trainer_name || "Unassigned"))];

  // Apply filters
  const filteredAttendance = attendance.filter((a) => {
    if (filterTrainer !== "all" && a.trainer_name !== filterTrainer) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (search && !a.member_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">📊 Attendance Reports (Admin)</h2>
        <button
          className="btn btn-info"
          onClick={() => {
            fetchSummary();
            fetchAttendance(selectedDate);
          }}
          disabled={loading}
        >
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>
      {err && <div className="alert alert-warning">⚠️ {err}</div>}

      {/* SUMMARY CARDS */}
      <h4 className="mb-3 text-info text-center">📅 This Month</h4>
      <div className="row g-4 text-center mb-4">
        {[
          { label: "✅ Present", value: summary.monthly.present, color: "text-success" },
          { label: "❌ Absent", value: summary.monthly.absent, color: "text-danger" },
          { label: "👥 Clients", value: summary.total_clients, color: "text-info" },
          { label: "📅 Sessions", value: summary.monthly.sessions, color: "text-warning" },
        ].map((card, i) => (
          <div className="col-md-3" key={i}>
            <div className="card bg-dark bg-opacity-50 text-white shadow rounded-4">
              <div className="card-body">
                <h6>{card.label}</h6>
                <p className={`fw-bold fs-4 ${card.color}`}>{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <h4 className="text-info text-center mb-4">📈 Visual Insights</h4>
      <div className="row mb-5">
        <div className="col-md-6">
          <div className="card bg-dark bg-opacity-50 text-white shadow rounded-4 p-3">
            <h6 className="text-center mb-3">This Month (Present vs Absent)</h6>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card bg-dark bg-opacity-50 text-white shadow rounded-4 p-3">
            <h6 className="text-center mb-3">Monthly vs All Time</h6>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />
                <Legend />
                <Bar dataKey="Present" fill="#28a745" />
                <Bar dataKey="Absent" fill="#dc3545" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CALENDAR + ATTENDANCE TABLE */}
      <h4 className="text-info text-center mb-3">📅 Attendance Records</h4>
      <div className="row">
        <div className="col-md-4 mb-4">
          <Calendar value={selectedDate} onChange={setSelectedDate} />
        </div>
        <div className="col-md-8">
          <div className="card bg-dark bg-opacity-50 text-white shadow rounded-4 p-3">
            <h6 className="text-center mb-3">
              Records for {selectedDate.toDateString()}
            </h6>

            {/* Filters */}
            <div className="d-flex gap-3 mb-3 flex-wrap">
              <select
                className="form-select w-auto"
                value={filterTrainer}
                onChange={(e) => setFilterTrainer(e.target.value)}
              >
                <option value="all">All Trainers</option>
                {trainerList.map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>

              <select
                className="form-select w-auto"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>

              <input
                type="text"
                className="form-control w-auto"
                placeholder="Search member..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {filteredAttendance.length > 0 ? (
              <table className="table table-dark table-striped text-center">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Member</th>
                    <th>Trainer</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((a, i) => (
                    <tr key={i}>
                      <td>{a.date}</td>
                      <td>{a.member_name}</td>
                      <td>{a.trainer_name}</td>
                      <td className={a.status === "present" ? "text-success" : "text-danger"}>
                        {a.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-muted">No records found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
