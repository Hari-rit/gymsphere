// src/TrainerDashboard.js
import React from 'react';

function TrainerDashboard({ username, onLogout }) {
  return (
    <div className="container text-center mt-5 text-white">
      <h2>Welcome, {username} (Trainer)</h2>
      <p>You are now logged into the GymSphere Trainer Dashboard.</p>
      <button className="btn btn-outline-light mt-3" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}

export default TrainerDashboard;
