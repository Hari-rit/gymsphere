// src/AttendanceView.jsx
import React from "react";

function AttendanceView() {
  return (
    <div
      className="mx-auto p-4 text-white shadow-lg text-center"
      style={{
        maxWidth: "1000px",
        width: "100%",
        borderRadius: "16px",
        background: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      }}
    >
      <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
        <h3 className="mb-0" style={{ color: "#ffc107", fontWeight: "bold" }}>
          📅 Attendance
        </h3>
        <span className="badge rounded-pill bg-secondary">Soon</span>
      </div>
      <p className="mb-3" style={{ lineHeight: "1.6" }}>
        Mark your daily gym attendance here.
      </p>
      <button className="btn btn-warning btn-sm px-4 shadow" disabled title="Coming soon">
        Mark Attendance
      </button>
    </div>
  );
}

export default AttendanceView;
