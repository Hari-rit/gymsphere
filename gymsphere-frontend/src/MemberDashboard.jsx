// src/MemberDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function MemberDashboard({ username, userId, onLogout }) {
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // which section to show when approved
  const [activeView, setActiveView] = useState("dashboard"); // "dashboard" | "workout" | "diet" | "attendance"

  const [memberData, setMemberData] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    goal: "",
    health_issues: "",
    worked_out_before: "no",
    experience_years: 0,
    experience_months: 0,
  });

  const [plan, setPlan] = useState(null);

  // load form status + plan
  useEffect(() => {
    fetch("http://localhost:100/gymsphere-backend/get_member_form.php", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.form) {
          setSubmitted(true);
          setStatus(data.form.status);
        }
      })
      .catch((err) => console.error("Error fetching form status:", err));

    fetch("http://localhost:100/gymsphere-backend/get_plan.php", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.plan) {
          setSubmitted(true);
          setStatus("approved");
          setPlan(data.plan);
        }
      })
      .catch((err) => console.error("Error fetching plan:", err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMemberData({ ...memberData, [name]: value });
  };

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setMemberData({ ...memberData, [name]: Number(value) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:100/gymsphere-backend/submit_form.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(memberData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("✅ Details submitted successfully!");
          setSubmitted(true);
          setStatus("pending");
        } else {
          alert("Error: " + data.message);
        }
      })
      .catch((err) => {
        console.error(err);
        alert("An error occurred. Please try again.");
      });
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
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
          <span className="badge bg-success">Member</span>
        </div>

        <div className="ms-auto d-flex align-items-center gap-3">
          <button
            className="btn btn-sm btn-outline-light d-flex align-items-center gap-2 rounded-pill"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            onClick={() => setSidebarOpen(true)}
          >
            <div
              className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center"
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
                    setActiveView("workout");
                    setSidebarOpen(false);
                  }}
                >
                  💪 Workout Plan
                </button>
              </li>
              <li>
                <button
                  className="btn w-100 text-start text-white"
                  onClick={() => {
                    setActiveView("diet");
                    setSidebarOpen(false);
                  }}
                >
                  🥗 Diet Plan
                </button>
              </li>
              <li>
                <button
                  className="btn w-100 text-start text-white"
                  onClick={() => {
                    setActiveView("attendance");
                    setSidebarOpen(false);
                  }}
                >
                  📅 Attendance
                </button>
              </li>
              <li>
                <button className="btn w-100 text-start text-muted mt-2" disabled>
                  📊 Progress (Soon)
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
      <div
        className="d-flex justify-content-center align-items-start py-5"
        style={{ paddingTop: "120px" }}
      >
        {/* ===== Fitness Form (unchanged & complete so handlers are used) ===== */}
        {!submitted && (
          <div
            className="card text-white shadow-lg rounded-4 p-4 w-100"
            style={{
              maxWidth: "820px",
              backgroundColor: "rgba(0,0,0,0.75)",
            }}
          >
            <h3 className="text-center mb-4">Submit Your Fitness Details</h3>

            <div className="d-flex justify-content-center gap-3 mb-3 small text-muted">
              <span className="badge bg-secondary bg-opacity-50">Step 1 · Details</span>
              <span className="badge bg-secondary bg-opacity-25">Step 2 · Review</span>
              <span className="badge bg-secondary bg-opacity-25">Step 3 · Plan</span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control bg-secondary text-white border-0"
                    name="name"
                    value={memberData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    className="form-control bg-secondary text-white border-0"
                    name="age"
                    value={memberData.age}
                    onChange={(e) =>
                      setMemberData({
                        ...memberData,
                        age: Math.max(0, Math.min(100, Number(e.target.value))),
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Height (cm)</label>
                  <input
                    type="number"
                    className="form-control bg-secondary text-white border-0"
                    name="height"
                    value={memberData.height}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    className="form-control bg-secondary text-white border-0"
                    name="weight"
                    value={memberData.weight}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Fitness Goal</label>
                  <input
                    type="text"
                    className="form-control bg-secondary text-white border-0"
                    name="goal"
                    value={memberData.goal}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Health Issues (if any)</label>
                  <input
                    type="text"
                    className="form-control bg-secondary text-white border-0"
                    name="health_issues"
                    value={memberData.health_issues}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Have you been working out before?</label>
                  <select
                    className="form-select bg-secondary text-white border-0"
                    name="worked_out_before"
                    value={memberData.worked_out_before}
                    onChange={handleInputChange}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                {memberData.worked_out_before === "yes" && (
                  <div className="col-12 mt-3">
                    <label className="form-label">Experience</label>
                    <div className="d-flex gap-3 align-items-center">
                      <div className="flex-grow-1">
                        <label className="form-label text-white">
                          Years: {memberData.experience_years}
                        </label>
                        <input
                          type="range"
                          className="form-range"
                          name="experience_years"
                          min="0"
                          max="50"
                          value={memberData.experience_years}
                          onChange={handleSliderChange}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <label className="form-label text-white">
                          Months: {memberData.experience_months}
                        </label>
                        <input
                          type="range"
                          className="form-range"
                          name="experience_months"
                          min="0"
                          max="11"
                          value={memberData.experience_months}
                          onChange={handleSliderChange}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="col-12 mt-4 text-center">
                  <button className="btn btn-success btn-lg px-5" type="submit">
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ===== Pending / Rejected ===== */}
        {submitted && status === "pending" && (
          <div className="text-center mt-5">
            <div className="spinner-border text-light mb-3" role="status"></div>
            <p className="lead text-secondary">
              ⏳ Waiting for trainer to review your details...
            </p>
          </div>
        )}
        {submitted && status === "rejected" && (
          <div className="text-center mt-5">
            <div className="spinner-border text-warning mb-3" role="status"></div>
            <p className="lead text-warning">
              ⚠️ Trainer is preparing a personalized plan for you, please wait.
            </p>
          </div>
        )}

        {/* ===== Approved (single view at a time) ===== */}
        {submitted && status === "approved" && (
          <div className="container mt-3">
            {activeView === "dashboard" && (
              <header className="mb-4 d-flex justify-content-center">
                {/* readable panel for welcome text */}
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
                    WELCOME BACK 👋
                  </h1>
                  <p className="mb-0" style={{ color: "rgba(255,255,255,0.85)" }}>
                    Use the sidebar to access your workout, diet, and attendance.
                  </p>
                </div>
              </header>
            )}

            {/* Workout (wide + glass) */}
            {activeView === "workout" && (
              <div
                className="mx-auto p-4 text-white shadow-lg"
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
                <h3 className="mb-3" style={{ color: "#4da6ff", fontWeight: "bold" }}>
                  💪 Workout Plan
                </h3>
                <p style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}>
                  {plan
                    ? plan.workout_plan
                    : "Push/Pull/Legs 6x per week with progressive overload."}
                </p>
                <button
                  className="btn btn-outline-light btn-sm mt-3"
                  style={{ borderRadius: "8px" }}
                  onClick={() =>
                    handleCopy(
                      plan
                        ? plan.workout_plan
                        : "Push/Pull/Legs 6x per week with progressive overload."
                    )
                  }
                >
                  📋 Copy
                </button>
              </div>
            )}

            {/* Diet (wide + glass) */}
            {activeView === "diet" && (
              <div
                className="mx-auto p-4 text-white shadow-lg"
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
                <h3 className="mb-3" style={{ color: "#20c997", fontWeight: "bold" }}>
                  🥗 Diet Plan
                </h3>
                <p style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}>
                  {plan
                    ? plan.diet_plan
                    : "High protein (2g/kg bodyweight), complex carbs, healthy fats."}
                </p>
                <button
                  className="btn btn-outline-light btn-sm mt-3"
                  style={{ borderRadius: "8px" }}
                  onClick={() =>
                    handleCopy(
                      plan
                        ? plan.diet_plan
                        : "High protein (2g/kg bodyweight), complex carbs, healthy fats."
                    )
                  }
                >
                  📋 Copy
                </button>
              </div>
            )}

            {/* Attendance (wide + glass) with "Soon" */}
            {activeView === "attendance" && (
              <div
                className="mx-auto p-4 text-white shadow-lg text-center"
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
                <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                  <h3 className="mb-0" style={{ color: "#ffc107", fontWeight: "bold" }}>
                    📅 Attendance
                  </h3>
                  <span className="badge rounded-pill bg-secondary">Soon</span>
                </div>
                <p className="mb-3" style={{ lineHeight: "1.6" }}>
                  Mark your daily gym attendance here.
                </p>
                <button className="btn btn-warning btn-sm px-4 shadow" disabled title="Coming soon">
                  Mark Attendance
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberDashboard;
