// src/MemberDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';

function MemberDashboard({ username, onLogout }) {
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
      <div className="container text-center pt-5" style={{ paddingTop: '100px' }}>
        <h2>🏋️ Member Dashboard</h2>
        <p className="lead">Your personalized gym experience starts here.</p>
      </div>
    </div>
  );
}

export default MemberDashboard;
