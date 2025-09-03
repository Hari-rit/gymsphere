// src/MemberDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function MemberDashboard({ username, userId, onLogout }) {
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("");
  const [showWorkout, setShowWorkout] = useState(false);
  const [showDiet, setShowDiet] = useState(false);

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

  const [plan, setPlan] = useState(null); // fetched workout/diet plan

  // 🔹 Check form + plan status on load
  useEffect(() => {
    // First fetch form status
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

    // Then fetch plan (if approved)
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
        backgroundImage: `url('/background.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top px-4 shadow">
        <Link className="navbar-brand text-white text-decoration-none" to="/">
          🏠 Home
        </Link>
        <div className="ms-auto d-flex align-items-center gap-3">
          <span className="badge bg-success">Member</span>
          <span className="text-white">Welcome, {username}</span>
          <button className="btn btn-danger btn-sm" onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div
        className="d-flex justify-content-center align-items-start py-5"
        style={{ paddingTop: "120px" }}
      >
        {/* Fitness Form */}
        {!submitted && (
          <div
            className="card bg-dark bg-opacity-90 text-white shadow-lg rounded-4 p-4"
            style={{ maxWidth: "700px", width: "100%" }}
          >
            <h3 className="text-center mb-4">Submit Your Fitness Details</h3>
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
                  <label className="form-label">
                    Have you been working out before?
                  </label>
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

        {/* Submitted Status */}
        {submitted && status === "pending" && (
          <p className="lead mt-5 text-center text-secondary">
            ⏳ Waiting for trainer to review your details...
          </p>
        )}

        {submitted && status === "rejected" && (
          <p className="lead mt-5 text-center text-warning">
            ⚠️ Trainer is preparing a personalized plan for you, please wait.
          </p>
        )}

        {/* Approved State (Cards Layout) */}
        {submitted && status === "approved" && (
          <div className="container mt-5">
            <div className="row g-4">
              {/* Workout Plan Card */}
              <div className="col-md-4">
                <div className="card bg-dark text-white shadow rounded-4 p-3 h-100 text-center">
                  <h5 className="text-primary">💪 Workout Plan</h5>
                  <p className="small text-muted">
                    {showWorkout
                      ? "Hide your personalized workout"
                      : "View your personalized workout"}
                  </p>
                  <button
                    className="btn btn-primary btn-sm mb-3"
                    onClick={() => setShowWorkout(!showWorkout)}
                  >
                    {showWorkout ? "Hide Plan" : "Show Plan"}
                  </button>
                  {showWorkout && (
                    <div>
                      <p>
                        {plan
                          ? plan.workout_plan
                          : "Push/Pull/Legs 6x per week with progressive overload."}
                      </p>
                      <button
                        className="btn btn-outline-light btn-sm"
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
                </div>
              </div>

              {/* Diet Plan Card */}
              <div className="col-md-4">
                <div className="card bg-dark text-white shadow rounded-4 p-3 h-100 text-center">
                  <h5 className="text-info">🥗 Diet Plan</h5>
                  <p className="small text-muted">
                    {showDiet
                      ? "Hide your personalized diet"
                      : "View your personalized diet"}
                  </p>
                  <button
                    className="btn btn-info btn-sm mb-3"
                    onClick={() => setShowDiet(!showDiet)}
                  >
                    {showDiet ? "Hide Plan" : "Show Plan"}
                  </button>
                  {showDiet && (
                    <div>
                      <p>
                        {plan
                          ? plan.diet_plan
                          : "High protein (2g/kg bodyweight), complex carbs, healthy fats."}
                      </p>
                      <button
                        className="btn btn-outline-light btn-sm"
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
                </div>
              </div>

              {/* Attendance Card */}
              <div className="col-md-4">
                <div className="card bg-dark text-white shadow rounded-4 p-3 h-100 text-center">
                  <h5 className="text-warning">📅 Attendance</h5>
                  <p className="small text-muted">
                    Mark your daily gym attendance
                  </p>
                  <button className="btn btn-warning btn-sm px-4 shadow">
                    Mark Attendance
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberDashboard;
