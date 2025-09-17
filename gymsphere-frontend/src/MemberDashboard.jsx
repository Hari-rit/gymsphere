// src/MemberDashboard.jsx
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import WorkoutView from "./WorkoutView";
import DietView from "./DietView";
import AttendanceView from "./AttendanceView";
import FitnessForm from "./FitnessForm";

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
      });

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
      });
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="text-white min-vh-100"
         style={{ backgroundImage: "url('/background.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
      <Navbar
        role="member"
        username={username}
        onLogout={onLogout}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      <Sidebar
        title="GymSphere"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        menuItems={[
          { label: "🏠 Dashboard", onClick: () => setActiveView("dashboard") },
          { label: "💪 Workout Plan", onClick: () => setActiveView("workout") },
          { label: "🥗 Diet Plan", onClick: () => setActiveView("diet") },
          { label: "📅 Attendance", onClick: () => setActiveView("attendance") },
          { label: "📊 Progress (Soon)", onClick: () => {}, disabled: true },
        ]}
      />

      <div className="d-flex justify-content-center align-items-start py-5"
           style={{ paddingTop: "120px" }}>
        {!submitted && (
          <FitnessForm memberData={memberData} setMemberData={setMemberData} setSubmitted={setSubmitted} setStatus={setStatus} />
        )}

        {submitted && status === "pending" && (
          <div className="text-center mt-5">
            <div className="spinner-border text-light mb-3" role="status"></div>
            <p className="lead text-secondary">⏳ Waiting for trainer to review your details...</p>
          </div>
        )}

        {submitted && status === "rejected" && (
          <div className="text-center mt-5">
            <div className="spinner-border text-warning mb-3" role="status"></div>
            <p className="lead text-warning">⚠️ Trainer is preparing a personalized plan for you, please wait.</p>
          </div>
        )}

        {submitted && status === "approved" && (
          <div className="container mt-3">
            {activeView === "dashboard" && (
              <header className="mb-4 d-flex justify-content-center">
                <div className="rounded-4 shadow"
                     style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "saturate(140%) blur(2px)",
                              padding: "18px 24px", maxWidth: 920, width: "100%", textAlign: "center" }}>
                  <h1 className="mb-2" style={{ letterSpacing: "1px" }}>WELCOME BACK 👋</h1>
                  <p className="mb-0" style={{ color: "rgba(255,255,255,0.85)" }}>
                    Use the sidebar to access your workout, diet, and attendance.
                  </p>
                </div>
              </header>
            )}

            {activeView === "workout" && <WorkoutView plan={plan} handleCopy={handleCopy} />}
            {activeView === "diet" && <DietView plan={plan} handleCopy={handleCopy} />}
            {activeView === "attendance" && <AttendanceView />}
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberDashboard;
