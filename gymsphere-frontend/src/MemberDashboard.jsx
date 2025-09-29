// src/MemberDashboard.jsx
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import WorkoutView from "./WorkoutView";
import DietView from "./DietView";
import FitnessForm from "./FitnessForm";
import MemberAttendanceCalendar from "./MemberAttendanceCalendar";

function MemberDashboard({ username, userId, onLogout }) {
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMemberData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setMemberData((prev) => ({ ...prev, [name]: Number(value) }));
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
          alert("Form submitted successfully!");
          setSubmitted(true);
          setStatus("pending");
        } else {
          alert("Failed to submit form: " + (data.message || "Unknown error"));
        }
      })
      .catch((err) => console.error("Error submitting form:", err));
  };

  // ✅ fetch member form + plan
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
      .catch((e) => console.error("get_member_form error:", e));

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
      .catch((e) => console.error("get_plan error:", e));
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const sidebarItems = [
    { key: "dashboard", label: "🏠 Dashboard", onClick: () => setActiveView("dashboard") },
    { key: "workout", label: "💪 Workout Plan", onClick: () => setActiveView("workout") },
    { key: "diet", label: "🥗 Diet Plan", onClick: () => setActiveView("diet") },
    { key: "attendance", label: "📅 Attendance", onClick: () => setActiveView("attendance") },
    { key: "progress", label: "📊 Progress (Soon)", onClick: () => {}, disabled: true },
  ];

  return (
    <div
      className="text-white min-vh-100"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Navbar role="member" username={username} onLogout={onLogout} onOpenSidebar={() => setSidebarOpen(true)} />

      <Sidebar
        title="GymSphere"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        items={sidebarItems}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <div
        className="d-flex justify-content-center align-items-start py-5"
        style={{ paddingTop: "120px" }}
      >
        {/* If no form yet → show form */}
        {!submitted && (
          <FitnessForm
            memberData={memberData}
            handleInputChange={handleInputChange}
            handleSliderChange={handleSliderChange}
            handleSubmit={handleSubmit}
          />
        )}

        {/* Pending status */}
        {submitted && status === "pending" && (
          <div className="text-center mt-5">
            <div className="spinner-border text-light mb-3" role="status"></div>
            <p className="lead text-secondary">
              ⏳ Waiting for trainer to review your details...
            </p>
          </div>
        )}

        {/* Rejected → show form again (reason will be in Notifications, not here) */}
        {submitted && status === "rejected" && (
          <div className="mt-5 w-100 d-flex justify-content-center">
            <div
              className="card shadow-lg p-4 rounded-4"
              style={{
                background: "rgba(0,0,0,0.65)",
                maxWidth: "600px",
                width: "100%",
              }}
            >
              <h4 className="text-warning mb-3">⚠️ Your form was rejected</h4>
              <p className="text-secondary mb-4">
                Please check your <strong>Notifications</strong> for the reason,
                then correct your details and resubmit:
              </p>
              <FitnessForm
                memberData={memberData}
                handleInputChange={handleInputChange}
                handleSliderChange={handleSliderChange}
                handleSubmit={handleSubmit}
              />
            </div>
          </div>
        )}

        {/* Approved view */}
        {submitted && status === "approved" && (
          <div className="container mt-3">
            {activeView === "dashboard" && (
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
                    WELCOME BACK 👋
                  </h1>
                  <p className="mb-0" style={{ color: "rgba(255,255,255,0.85)" }}>
                    Use the sidebar to access your workout, diet, and attendance.
                  </p>
                </div>
              </header>
            )}

            {activeView === "workout" && <WorkoutView plan={plan} handleCopy={handleCopy} />}
            {activeView === "diet" && <DietView plan={plan} handleCopy={handleCopy} />}
            {activeView === "attendance" && <MemberAttendanceCalendar />}
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberDashboard;
