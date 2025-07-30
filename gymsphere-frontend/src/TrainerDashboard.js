// src/TrainerDashboard.js
import React from 'react';

function TrainerDashboard({ username, onLogout }) {
  return (
    <div className="text-white">
      {/* Fixed Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top px-4">
        <span className="navbar-brand">GymSphere</span>
        <div className="ms-auto">
          <span className="me-3">Trainer: {username}</span>
          <button className="btn btn-danger btn-sm" onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container text-center pt-5 mt-5">
        <h2>💪 Trainer Dashboard</h2>
        <p className="lead">Manage workouts, members, and progress tracking.</p>
      </div>
    </div>
  );
}

export default TrainerDashboard;
