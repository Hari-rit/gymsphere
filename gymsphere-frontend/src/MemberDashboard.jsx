// src/MemberDashboard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

function MemberDashboard({ username, onLogout }) {
  const [showDiet, setShowDiet] = useState(false);
  const [showWorkout, setShowWorkout] = useState(false);

  // Temporary sample AI-generated plans (replace with API later)
  const dietPlan = `
  🍎 Sample Diet Plan
  - Breakfast: Oats + Milk + Banana
  - Lunch: Grilled Chicken + Brown Rice + Veggies
  - Snack: Nuts + Protein Shake
  - Dinner: Fish + Salad
  `;

  const workoutPlan = `
  🏋️ Sample Workout Plan
  - Day 1: Chest + Triceps
  - Day 2: Back + Biceps
  - Day 3: Shoulders + Core
  - Day 4: Legs
  - Day 5: Cardio + Stretch
  `;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="text-white">
      {/* Fixed Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top px-4">
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

      {/* Dashboard Content */}
      <div className="container text-center pt-5" style={{ paddingTop: "100px" }}>
        <h2>🏋️ Member Dashboard</h2>
        <p className="lead">Your personalized gym experience starts here.</p>

        {/* Action Buttons */}
        <div className="d-flex justify-content-center gap-3 mt-4">
          <button
            className="btn btn-primary"
            onClick={() => setShowDiet(!showDiet)}
          >
            {showDiet ? "Hide Diet Plan" : "Show Diet Plan"}
          </button>
          <button
            className="btn btn-info"
            onClick={() => setShowWorkout(!showWorkout)}
          >
            {showWorkout ? "Hide Workout Plan" : "Show Workout Plan"}
          </button>
        </div>

        {/* Diet Plan Section */}
        {showDiet && (
          <div className="card bg-dark text-white mt-4 p-3 shadow">
            <h4>🍽️ AI-Generated Diet Plan</h4>
            <pre className="text-start">{dietPlan}</pre>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => copyToClipboard(dietPlan)}
            >
              Copy Diet Plan
            </button>
          </div>
        )}

        {/* Workout Plan Section */}
        {showWorkout && (
          <div className="card bg-dark text-white mt-4 p-3 shadow">
            <h4>🏋️ AI-Generated Workout Plan</h4>
            <pre className="text-start">{workoutPlan}</pre>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => copyToClipboard(workoutPlan)}
            >
              Copy Workout Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberDashboard;
