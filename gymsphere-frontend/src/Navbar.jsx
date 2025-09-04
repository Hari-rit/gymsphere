import React from "react";

export default function Navbar({ username = "Member", onLogout, onToggleSidebar }) {
  return (
    <nav className="navbar navbar-dark bg-dark fixed-top shadow-sm px-3">
      <div className="d-flex align-items-center gap-2">
        <span className="fs-4">🏠</span>
        <span className="navbar-brand mb-0 h1">Home</span>
        <span className="badge bg-success ms-2">Member</span>
      </div>

      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-sm btn-outline-secondary profile-chip d-flex align-items-center gap-2"
          onClick={onToggleSidebar}
          title="Open menu"
        >
          <span className="avatar-circle">GS</span>
          <span className="text-truncate" style={{ maxWidth: 140 }}>
            Welcome, {username}
          </span>
          <span className="ms-1">▾</span>
        </button>
        <button className="btn btn-sm btn-danger" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}
