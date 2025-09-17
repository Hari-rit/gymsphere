    // src/FitnessForm.jsx
import React from "react";

function FitnessForm({ memberData, handleInputChange, handleSliderChange, handleSubmit }) {
  return (
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
                handleInputChange({
                  target: { name: "age", value: Math.max(0, Math.min(100, Number(e.target.value))) },
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
  );
}

export default FitnessForm;
