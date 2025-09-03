// src/TrainerDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function TrainerDashboard({ username, onLogout }) {
  const [forms, setForms] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null); // profile modal

  // 🔹 Fetch member forms
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

  // 🔹 Accept Student (by user_id)
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
        if (data.success) {
          fetchForms(); // ✅ refresh from DB instead of patching state
        }
      })
      .catch((err) => console.error("Error accepting student:", err));
  };

  // 🔹 Approve / Reject (by user_id now)
  const handleAction = (userId, action, trainerComment = "") => {
    fetch("http://localhost:100/gymsphere-backend/trainer_action.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        user_id: userId,  // ✅ send user_id
        action,
        trainer_comment: trainerComment,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        if (data.success) {
          fetchForms(); // ✅ refresh from DB
        }
      })
      .catch((err) => console.error("Error updating form:", err));
  };

  // 🔹 Filter + Search
  const filteredForms = forms.filter((f) => {
    if (filter !== "all" && f.status !== filter) return false;
    if (search && !f.username.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  // 🔹 Count stats
  const countByStatus = (status) =>
    forms.filter((f) => f.status === status).length;

  return (
    <div className="text-white">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top px-4">
        <Link className="navbar-brand text-white text-decoration-none" to="/">
          🏠 Home
        </Link>
        <div className="ms-auto d-flex align-items-center gap-3">
          <span className="badge bg-warning text-dark">Trainer</span>
          <span className="text-white">Welcome, {username}</span>
          <button className="btn btn-danger btn-sm" onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Dashboard */}
      <div className="container pt-5" style={{ paddingTop: "100px" }}>
        <h2 className="fw-bold">💪 Trainer Dashboard</h2>
        <p className="lead">Manage members, accept students, and edit plans.</p>

        {/* Stats Row */}
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

        {/* Filter & Search */}
        <div className="d-flex gap-3 mb-4">
          <select
            className="form-select w-auto"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
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

        {/* Member Forms List */}
        {filteredForms.length === 0 ? (
          <p className="text-muted">No forms found.</p>
        ) : (
          filteredForms.map((form) => (
            <div
              key={form.id}
              className="card bg-dark text-white mb-3 p-3 shadow rounded-4"
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
                    form.status === "approved"
                      ? "bg-success"
                      : form.status === "rejected"
                      ? "bg-danger"
                      : "bg-warning text-dark"
                  }`}
                >
                  {form.status}
                </span>
              </p>
              {form.assigned_trainer_id && (
                <p>👨‍🏫 Assigned Trainer: {form.trainer_name}</p>
              )}

              {/* Actions */}
              {form.assigned_trainer_id === null && (
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleAccept(form.user_id)} // ✅ accept by user_id
                >
                  🤝 Accept Student
                </button>
              )}

              {form.assigned_trainer_id !== null &&
                form.status === "pending" && (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleAction(form.user_id, "approve")} // ✅ approve by user_id
                    >
                      ✅ Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        const comment = prompt("Enter rejection reason:");
                        if (comment !== null)
                          handleAction(form.user_id, "reject", comment); // ✅ reject by user_id
                      }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
            </div>
          ))
        )}
      </div>

      {/* Member Profile Modal */}
      {selectedMember && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content bg-dark text-white rounded-4">
              <div className="modal-header">
                <h5 className="modal-title">
                  Profile: {selectedMember.username}
                </h5>
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
                    💊 Health Issues:{" "}
                    {selectedMember.health_issues || "None"}
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
