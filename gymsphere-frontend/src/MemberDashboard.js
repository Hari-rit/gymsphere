// src/MemberDashboard.js
import React from 'react';

function MemberDashboard({ username, onLogout }) {
  return (
    <div className="container text-center mt-5 text-white">
      <h2>Welcome, {username} (Member)</h2>
      <p>You are now logged into the GymSphere Member Dashboard.</p>
      <button className="btn btn-outline-light mt-3" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}

export default MemberDashboard;
