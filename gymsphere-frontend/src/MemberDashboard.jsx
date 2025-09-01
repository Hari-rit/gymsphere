// src/MemberDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function MemberDashboard({ username, userId, onLogout }) {
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("");

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
    images: [],
  });

  useEffect(() => {
    // Mock fetch status, replace with API later
    const mockStatus = {
      plan_status: "pending", // pending, approved, rejected
      submitted: false,
    };
    setStatus(mockStatus.plan_status);
    setSubmitted(mockStatus.submitted);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMemberData({ ...memberData, [name]: value });
  };

  const handleFileChange = (e) => {
    setMemberData({ ...memberData, images: Array.from(e.target.files) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setStatus("pending");
    alert("Details submitted successfully!");
    // TODO: Submit to backend API
  };

  return (
    <div
      className="text-white min-vh-100"
      style={{
        backgroundImage: `url('/background.jpg')`, // Replace with your gym image path
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

      <div className="d-flex justify-content-center align-items-start py-5" style={{ paddingTop: "120px" }}>
        {/* Form Card */}
        {!submitted && (
          <div className="card bg-dark bg-opacity-90 text-white shadow-lg rounded-4 p-4" style={{ maxWidth: "700px", width: "100%" }}>
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
                    onChange={(e) => {
                      const value = Math.max(0, Math.min(100, Number(e.target.value)));
                      setMemberData({ ...memberData, age: value });
                    }}
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
                          onChange={handleInputChange}
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
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="col-12 mt-3">
                  <label className="form-label">Upload Body Image (optional)</label>
                  <input
                    type="file"
                    className="form-control bg-secondary text-white border-0"
                    name="images"
                    onChange={handleFileChange}
                    multiple
                  />
                </div>

                <div className="col-12 mt-4 text-center">
                  <button className="btn btn-success btn-lg px-5" type="submit">
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Dashboard Buttons */}
        {submitted && status === "approved" && (
          <div className="d-flex flex-column align-items-center gap-4 mt-5">
            <button className="btn btn-primary btn-lg px-5 shadow">Show Fitness Plan</button>
            <button className="btn btn-info btn-lg px-5 shadow">Show Diet Plan</button>
            <button className="btn btn-warning btn-lg px-5 shadow">Mark Attendance</button>
          </div>
        )}

        {/* Messages */}
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
      </div>
    </div>
  );
}

export default MemberDashboard;
