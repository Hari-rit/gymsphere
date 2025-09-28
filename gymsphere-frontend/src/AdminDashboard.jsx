// src/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import UsersTable from "./UsersTable";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import AdminReports from "./AdminReports"; // ✅ Import reports

function AdminDashboard({ username, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (activeView === "dashboard" || activeView === "reports") return; // ✅ Don't fetch when on reports
    setLoading(true);
    setErr("");

    fetch("http://localhost:100/gymsphere-backend/get_users.php", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setErr(data.message || "Failed to fetch users.");
          setUsers([]);
        } else {
          setUsers(Array.isArray(data.users) ? data.users : []);
        }
      })
      .catch((e) => {
        console.error("Error fetching users:", e);
        setErr("Network error while fetching users.");
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, [activeView]);

  const trainers = users.filter((u) => u.role === "trainer");
  const members = users.filter((u) => u.role === "member");

  return (
    <div
      className="text-white min-vh-100"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Navbar
        role="admin"
        username={username}
        onLogout={onLogout}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      <Sidebar
        title="GymSphere Admin"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        items={[
          { label: "🏠 Dashboard", onClick: () => setActiveView("dashboard") },
          { label: "👥 Manage Users", onClick: () => setActiveView("users") },
          { label: "🏋️ Trainers", onClick: () => setActiveView("trainers") },
          { label: "💪 Members", onClick: () => setActiveView("members") },
          { label: "📊 Reports", onClick: () => setActiveView("reports") }, // ✅ Reports tab
        ]}
      />

      <div className="container pt-5" style={{ paddingTop: "120px" }}>
        {activeView === "dashboard" && (
          <div
            className="rounded-4 shadow p-4 text-center"
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "saturate(140%) blur(2px)",
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >
            <h1 className="mb-3"> Welcome Admin </h1>
            <p style={{ color: "rgba(255,255,255,0.8)" }}>
              Use the sidebar to manage users, trainers, members, and reports.
            </p>
          </div>
        )}

        {activeView === "users" && (
          <div
            className="mx-auto mt-3 p-4 shadow-lg rounded-4 text-white"
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(12px)",
              maxWidth: "1000px",
            }}
          >
            <h3 className="text-info mb-3">👥 All Users</h3>
            <UsersTable list={users} loading={loading} err={err} />
          </div>
        )}

        {activeView === "trainers" && (
          <div
            className="mx-auto mt-3 p-4 shadow-lg rounded-4 text-white"
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(12px)",
              maxWidth: "1000px",
            }}
          >
            <h3 className="text-warning mb-3">🏋️ Trainers</h3>
            <UsersTable list={trainers} loading={loading} err={err} />
          </div>
        )}

        {activeView === "members" && (
          <div
            className="mx-auto mt-3 p-4 shadow-lg rounded-4 text-white"
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(12px)",
              maxWidth: "1000px",
            }}
          >
            <h3 className="text-success mb-3">💪 Members</h3>
            <UsersTable list={members} loading={loading} err={err} />
          </div>
        )}

        {activeView === "reports" && (
          <div
            className="mx-auto mt-3 p-4 shadow-lg rounded-4 text-white"
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(12px)",
              maxWidth: "1100px",
            }}
          >
            <AdminReports /> {/* ✅ Integrated reports view */}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
