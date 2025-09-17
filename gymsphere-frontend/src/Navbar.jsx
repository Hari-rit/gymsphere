// src/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";

function Navbar({ role = "member", username = "", onLogout, onOpenSidebar }) {
  const roleLower = String(role).toLowerCase();
  const roleBadge =
    roleLower === "admin"
      ? "bg-danger"
      : roleLower === "trainer"
      ? "bg-warning text-dark"
      : "bg-success";

  const roleLabel = roleLower === "admin" ? "Admin" : roleLower === "trainer" ? "Trainer" : "Member";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top px-4 shadow-sm">
      <div className="d-flex align-items-center gap-2">
        <Link className="navbar-brand text-white text-decoration-none d-flex align-items-center gap-2" to="/">
          <span className="fs-4">🏠</span>
          <span>Home</span>
        </Link>
        <span className={`badge ${roleBadge}`}>{roleLabel}</span>
      </div>

      <div className="ms-auto d-flex align-items-center gap-3">
        <button
          className="btn btn-sm btn-outline-light d-flex align-items-center gap-2 rounded-pill"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          onClick={onOpenSidebar}
        >
          <div
            className={`rounded-circle ${roleLower === "trainer" ? "bg-warning text-dark" : roleLower === "admin" ? "bg-danger text-white" : "bg-primary text-white"} d-flex justify-content-center align-items-center`}
            style={{ width: "28px", height: "28px", fontSize: "0.8rem" }}
          >
            {username?.[0]?.toUpperCase() ?? "U"}
          </div>
          <span className="text-truncate" style={{ maxWidth: 120 }}>
            Welcome, {username}
          </span>
          ▾
        </button>

        <button className="btn btn-danger btn-sm" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
