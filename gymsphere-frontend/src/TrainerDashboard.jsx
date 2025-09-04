// src/TrainerDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function TrainerDashboard({ username, onLogout }) {
  const [forms, setForms] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [planOptionsFor, setPlanOptionsFor] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard"); // NEW: controls sidebar view

  // Fetch member forms
  const fetchForms = () => {
    fetch("http://localhost:100/gymsphere-backend/trainer_get_forms.php", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setForms(data.forms);
      })
      .catch((err) => console.error("Error fetching forms:", err));
  };

  useEffect(() => {
    fetchForms();
  }, []);

  // Accept Student
  const handleAccept = (userId) => {
    fetch("http://localhost:100/gymsphere-backend/trainer_accept.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ user_id: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        if (data.success) fetchForms();
      })
      .catch((err) => console.error("Error accepting student:", err));
  };

  // Approve / Reject
  const handleAction = (userId, action, trainerComment = "") => {
    fetch("http://localhost:100/gymsphere-backend/trainer_action.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ user_id: userId, action, trainer_comment: trainerComment }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        if (data.success) fetchForms();
      })
      .catch((err) => console.error("Error updating form:", err));
  };

  // Generate Plan
  const handleGeneratePlan = (userId, level) => {
    fetch("http://localhost:100/gymsphere-backend/trainer_action.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ user_id: userId, action: "generate_plan", level }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.success ? "✅ Plan generated!" : `❌ Failed: ${data.error || data.message}`);
        if (data.success) {
          fetchForms();
          setPlanOptionsFor(null);
        }
      })
      .catch((err) => console.error("Error generating plan:", err));
  };

  const countByStatus = (status) => forms.filter((f) => f.status === status).length;

  // Separate views
  const approvedForms = forms.filter((f) => f.status === "approved");
  const requestForms = forms.filter((f) => f.status === "pending" || f.status === "rejected");

  // Apply filter + search only in Member Requests
  const filteredRequests = requestForms.filter((f) => {
    if (filter !== "all" && f.status !== filter) return false;
    if (search && !f.username.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
          <span className="badge bg-warning text-dark">Trainer</span>
        </div>

        <div className="ms-auto d-flex align-items-center gap-3">
          <button
            className="btn btn-sm btn-outline-light d-flex align-items-center gap-2 rounded-pill"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            onClick={() => setSidebarOpen(true)}
          >
            <div
              className="rounded-circle bg-warning text-dark d-flex justify-content-center align-items-center"
              style={{ width: "28px", height: "28px", fontSize: "0.8rem" }}
            >
              {username[0]?.toUpperCase()}
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
              <div className="fw-bold">GymSphere</div>
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
                    setActiveView("clients");
                    setSidebarOpen(false);
                  }}
                >
                  👥 My Clients
                </button>
              </li>
              <li>
                <button
                  className="btn w-100 text-start text-white"
                  onClick={() => {
                    setActiveView("requests");
                    setSidebarOpen(false);
                  }}
                >
                  📋 Member Requests
                </button>
              </li>
              <li>
                <button className="btn w-100 text-start text-muted mt-2" disabled>
                  📊 Analytics (Soon)
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
        {/* Dashboard View */}
        {activeView === "dashboard" && (
          <>
            <header className="mb-4 d-flex justify-content-center">
              <div
                className="rounded-4 shadow"
                style={{
                  background: "rgba(0,0,0,0.55)",
                  backdropFilter: "saturate(140%) blur(2px)",
                  padding: "18px 24px",
                  maxWidth: 920,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <h1 className="mb-2" style={{ letterSpacing: "1px" }}>
                  WELCOME TRAINER 👋
                </h1>
                <p className="mb-0" style={{ color: "rgba(255,255,255,0.85)" }}>
                  Manage members, accept students, and create plans.
                </p>
              </div>
            </header>

            <div className="row text-center my-4">
              <div className="col">
                <h6>🕒 Pending</h6>
                <p className="fw-bold">{countByStatus("pending")}</p>
              </div>
              <div className="col">
                <h6>✅ Approved</h6>
                <p className="fw-bold">{countByStatus("approved")}</p>
              </div>
              <div className="col">
                <h6>❌ Rejected</h6>
                <p className="fw-bold">{countByStatus("rejected")}</p>
              </div>
              <div className="col">
                <h6>👥 Total</h6>
                <p className="fw-bold">{forms.length}</p>
              </div>
            </div>
          </>
        )}

        {/* My Clients View */}
        {activeView === "clients" && (
          <>
            {approvedForms.length === 0 ? (
              <p className="text-muted">No approved clients yet.</p>
            ) : (
              approvedForms.map((form) => (
                <div
                  key={form.id}
                  className="mx-auto p-4 text-white shadow-lg mb-4"
                  style={{
                    maxWidth: "1000px",
                    width: "100%",
                    borderRadius: "16px",
                    background: "rgba(0, 0, 0, 0.55)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  <h5
                    className="text-info"
                    role="button"
                    onClick={() => setSelectedMember(form)}
                  >
                    👤 {form.username}
                  </h5>
                  <p>🎯 {form.goal}</p>
                  <p>🎂 {form.age} years</p>
                  <p>
                    ⏳ {form.experience_years}y {form.experience_months}m
                  </p>
                  <p>
                    Status: <span className="badge bg-success">approved</span>
                  </p>
                  {form.trainer_name && <p>👨‍🏫 Assigned Trainer: {form.trainer_name}</p>}

                  <div className="mt-2">
                    {planOptionsFor === form.user_id ? (
                      <div className="card bg-secondary text-white p-3 mt-2">
                        <h6>📋 Member Details</h6>
                        <p>⚖️ Weight: {form.weight} kg</p>
                        <p>📏 Height: {form.height} cm</p>
                        <p>
                          ⏳ Experience: {form.experience_years}y {form.experience_months}m
                        </p>
                        <p>🎯 Goal: {form.goal}</p>
                        <div className="d-flex gap-2 mt-2">
                          <button
                            className="btn btn-outline-light btn-sm"
                            onClick={() => handleGeneratePlan(form.user_id, "beginner")}
                          >
                            🟢 Beginner Plan
                          </button>
                          <button
                            className="btn btn-outline-warning btn-sm"
                            onClick={() => handleGeneratePlan(form.user_id, "intermediate")}
                          >
                            🟡 Intermediate Plan
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleGeneratePlan(form.user_id, "advanced")}
                          >
                            🔴 Advanced Plan
                          </button>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-light mt-2"
                          onClick={() => setPlanOptionsFor(null)}
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setPlanOptionsFor(form.user_id)}
                      >
                        ⚡ Generate Plan
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* Member Requests View */}
        {activeView === "requests" && (
          <>
            <div className="d-flex gap-3 mb-4">
              <select
                className="form-select w-auto"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <input
                type="text"
                className="form-control w-auto"
                placeholder="Search by username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {filteredRequests.length === 0 ? (
              <p className="text-muted">No member requests found.</p>
            ) : (
              filteredRequests.map((form) => (
                <div
                  key={form.id}
                  className="mx-auto p-4 text-white shadow-lg mb-4"
                  style={{
                    maxWidth: "1000px",
                    width: "100%",
                    borderRadius: "16px",
                    background: "rgba(0, 0, 0, 0.55)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  <h5
                    className="text-info"
                    role="button"
                    onClick={() => setSelectedMember(form)}
                  >
                    👤 {form.username}
                  </h5>
                  <p>🎯 {form.goal}</p>
                  <p>🎂 {form.age} years</p>
                  <p>
                    ⏳ {form.experience_years}y {form.experience_months}m
                  </p>
                  <p>
                    Status:{" "}
                    <span
                      className={`badge ${
                        form.status === "rejected"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {form.status}
                    </span>
                  </p>

                  {form.assigned_trainer_id === null && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleAccept(form.user_id)}
                    >
                      🤝 Accept Student
                    </button>
                  )}

                  {form.assigned_trainer_id !== null && form.status === "pending" && (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleAction(form.user_id, "approve")}
                      >
                        ✅ Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          const comment = prompt("Enter rejection reason:");
                          if (comment !== null)
                            handleAction(form.user_id, "reject", comment);
                        }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Member Profile Modal */}
      {selectedMember && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content bg-dark text-white rounded-4">
              <div className="modal-header">
                <h5 className="modal-title">Profile: {selectedMember.username}</h5>
                <button
                  className="btn-close"
                  onClick={() => setSelectedMember(null)}
                ></button>
              </div>
              <div className="modal-body">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item bg-dark text-white">
                    👤 Name: {selectedMember.name}
                  </li>
                  <li className="list-group-item bg-dark text-white">
                    🎯 Goal: {selectedMember.goal}
                  </li>
                  <li className="list-group-item bg-dark text-white">
                    🎂 Age: {selectedMember.age}
                  </li>
                  <li className="list-group-item bg-dark text-white">
                    💊 Health Issues: {selectedMember.health_issues || "None"}
                  </li>
                  <li className="list-group-item bg-dark text-white">
                    📌 Status: {selectedMember.status}
                  </li>
                  {selectedMember.trainer_name && (
                    <li className="list-group-item bg-dark text-white">
                      👨‍🏫 Assigned Trainer: {selectedMember.trainer_name}
                    </li>
                  )}
                </ul>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedMember(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrainerDashboard;
