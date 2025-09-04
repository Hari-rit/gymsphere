// src/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function AdminDashboard({ username, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");

  // NEW: users + loading/error
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (activeView === "dashboard") return; // load only when a list is needed
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

  const renderUsersTable = (list) => {
    if (loading) {
      return <p className="text-center text-muted mb-0">Loading…</p>;
    }
    if (err) {
      return (
        <p className="text-center text-warning mb-0">
          {err}
        </p>
      );
    }
    if (!list.length) {
      return <p className="text-center text-muted mb-0">No users found.</p>;
    }
    return (
      <div className="table-responsive mt-3">
        <table className="table table-dark table-hover rounded-3 overflow-hidden">
          <thead>
            <tr>
              <th style={{ whiteSpace: "nowrap" }}>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th style={{ whiteSpace: "nowrap" }}>Role</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <span
                    className={`badge ${
                      u.role === "admin"
                        ? "bg-danger"
                        : u.role === "trainer"
                        ? "bg-warning text-dark"
                        : "bg-success"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      className="text-white min-vh-100"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* ===== Navbar ===== */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top px-4 shadow-sm">
        <div className="d-flex align-items-center gap-2">
          <Link
            className="navbar-brand text-white text-decoration-none d-flex align-items-center gap-2"
            to="/"
          >
            <span className="fs-4">🏠</span>
            <span>Home</span>
          </Link>
          <span className="badge bg-danger">Admin</span>
        </div>

        <div className="ms-auto d-flex align-items-center gap-3">
          <button
            className="btn btn-sm btn-outline-light d-flex align-items-center gap-2 rounded-pill"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            onClick={() => setSidebarOpen(true)}
          >
            <div
              className="rounded-circle bg-danger text-white d-flex justify-content-center align-items-center"
              style={{ width: "28px", height: "28px", fontSize: "0.8rem" }}
            >
              {username?.[0]?.toUpperCase()}
            </div>
            <span className="text-truncate" style={{ maxWidth: 120 }}>
              Welcome, {username}
            </span>
            ▾
          </button>

          <button className="btn btn-danger btn-sm" onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* ===== Sidebar ===== */}
      {sidebarOpen && (
        <>
          <div
            className="position-fixed top-0 start-0 h-100 bg-dark text-white shadow"
            style={{ width: "250px", zIndex: 1050 }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 p-2 border-bottom">
              <div className="fw-bold">GymSphere Admin</div>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={() => setSidebarOpen(false)}
              >
                ✕
              </button>
            </div>
            <ul className="list-unstyled px-2">
              <li>
                <button
                  className="btn w-100 text-start text-white"
                  onClick={() => {
                    setActiveView("dashboard");
                    setSidebarOpen(false);
                  }}
                >
                  🏠 Dashboard
                </button>
              </li>
              <li>
                <button
                  className="btn w-100 text-start text-white"
                  onClick={() => {
                    setActiveView("users");
                    setSidebarOpen(false);
                  }}
                >
                  👥 Manage Users
                </button>
              </li>
              <li>
                <button
                  className="btn w-100 text-start text-white"
                  onClick={() => {
                    setActiveView("trainers");
                    setSidebarOpen(false);
                  }}
                >
                  🏋️ Trainers
                </button>
              </li>
              <li>
                <button
                  className="btn w-100 text-start text-white"
                  onClick={() => {
                    setActiveView("members");
                    setSidebarOpen(false);
                  }}
                >
                  💪 Members
                </button>
              </li>
              <li>
                <button className="btn w-100 text-start text-muted mt-2" disabled>
                  📊 Reports (Soon)
                </button>
              </li>
            </ul>
          </div>
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ zIndex: 1040 }}
            onClick={() => setSidebarOpen(false)}
          />
        </>
      )}

      {/* ===== Page Content ===== */}
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
              Use the sidebar to manage users, trainers, and members.
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
            <p className="mb-2">Here you will be able to see and manage all registered users.</p>
            {renderUsersTable(users)}
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
            <p className="mb-2">Here you will be able to manage trainer accounts.</p>
            {renderUsersTable(trainers)}
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
            <p className="mb-2">Here you will be able to manage member accounts.</p>
            {renderUsersTable(members)}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
