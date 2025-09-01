import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function MemberDashboard({ username, userId, onLogout }) {
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("");
  const [formData, setFormData] = useState({
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
    // Mock initial status
    const mockStatus = { plan_status: "pending", submitted: false };
    setStatus(mockStatus.plan_status);
    setSubmitted(mockStatus.submitted);
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? Array.from(files) : value,
    });
  };

  const handleSlider = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value, 10),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("user_id", userId);
    form.append("name", formData.name);
    form.append("age", formData.age);
    form.append("height", formData.height);
    form.append("weight", formData.weight);
    form.append("fitness_goal", formData.goal);
    form.append("health_issues", formData.health_issues);
    form.append("experience_years", formData.experience_years);
    form.append("experience_months", formData.experience_months);

    formData.images.forEach((file) => form.append("images[]", file));

    try {
      const res = await fetch(
        "http://localhost:100/gymsphere-backend/submitMember.php",
        { method: "POST", body: form }
      );
      const result = await res.json();
      if (result.success) {
        alert("Details submitted successfully!");
        setSubmitted(true);
        setStatus("pending");
      } else {
        alert("Failed to submit: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit. Check server connection.");
    }
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
        {!submitted ? (
          <div
            className="card bg-dark bg-opacity-90 text-white shadow-lg rounded-4 p-4"
            style={{ maxWidth: "700px", width: "100%" }}
          >
            <h3 className="text-center mb-4">Submit Your Fitness Details</h3>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Name */}
                <div className="col-md-6">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control bg-secondary text-white border-0"
                    required
                  />
                </div>

                {/* Age */}
                <div className="col-md-3">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="form-control bg-secondary text-white border-0"
                    min="1"
                    required
                  />
                </div>

                {/* Height */}
                <div className="col-md-3">
                  <label className="form-label">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="form-control bg-secondary text-white border-0"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>

                {/* Weight */}
                <div className="col-md-6">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="form-control bg-secondary text-white border-0"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>

                {/* Fitness Goal */}
                <div className="col-md-6">
                  <label className="form-label">Fitness Goal</label>
                  <input
                    type="text"
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    className="form-control bg-secondary text-white border-0"
                    required
                  />
                </div>

                {/* Health Issues */}
                <div className="col-md-6">
                  <label className="form-label">Health Issues (if any)</label>
                  <input
                    type="text"
                    name="health_issues"
                    value={formData.health_issues}
                    onChange={handleChange}
                    className="form-control bg-secondary text-white border-0"
                  />
                </div>

                {/* Worked out before */}
                <div className="col-md-6">
                  <label className="form-label">Worked Out Before?</label>
                  <select
                    name="worked_out_before"
                    value={formData.worked_out_before}
                    onChange={handleChange}
                    className="form-select bg-secondary text-white border-0"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                {/* Experience sliders */}
                {formData.worked_out_before === "yes" && (
                  <div className="col-12 mt-3">
                    <label className="form-label">Experience</label>
                    <div className="d-flex gap-3 align-items-center">
                      <div className="flex-grow-1">
                        <label className="form-label text-white">
                          Years: {formData.experience_years}
                        </label>
                        <input
                          type="range"
                          name="experience_years"
                          min="0"
                          max="50"
                          value={formData.experience_years}
                          onChange={handleSlider}
                          className="form-range"
                        />
                      </div>
                      <div className="flex-grow-1">
                        <label className="form-label text-white">
                          Months: {formData.experience_months}
                        </label>
                        <input
                          type="range"
                          name="experience_months"
                          min="0"
                          max="11"
                          value={formData.experience_months}
                          onChange={handleSlider}
                          className="form-range"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Body Images */}
                <div className="col-12 mt-3">
                  <label className="form-label">Upload Body Image (optional)</label>
                  <input
                    type="file"
                    name="images"
                    onChange={handleChange}
                    className="form-control bg-secondary text-white border-0"
                    multiple
                  />
                </div>

                {/* Submit */}
                <div className="col-12 mt-4 text-center">
                  <button type="submit" className="btn btn-success btn-lg px-5">
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : status === "approved" ? (
          <div className="d-flex flex-column align-items-center gap-4 mt-5">
            <button className="btn btn-primary btn-lg px-5 shadow">
              Show Fitness Plan
            </button>
            <button className="btn btn-info btn-lg px-5 shadow">
              Show Diet Plan
            </button>
            <button className="btn btn-warning btn-lg px-5 shadow">
              Mark Attendance
            </button>
          </div>
        ) : status === "pending" ? (
          <p className="lead mt-5 text-center text-secondary">
            ⏳ Waiting for trainer to review your details...
          </p>
        ) : (
          <p className="lead mt-5 text-center text-warning">
            ⚠️ Trainer is preparing a personalized plan for you, please wait.
          </p>
        )}
      </div>
    </div>
  );
}

export default MemberDashboard;
