import React from "react";

export default function Sidebar({ open, onClose, go }) {
  return (
    <>
      <aside className={`gs-sidebar ${open ? "open" : ""}`}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="avatar-circle">GS</div>
            <strong>GymSphere</strong>
          </div>
          <button className="btn btn-sm btn-outline-light" onClick={onClose}>✕</button>
        </div>

        <ul className="list-unstyled sidebar-list">
          <li><button onClick={() => { go("dashboard"); onClose(); }}>🏠 Dashboard</button></li>
          <li><button onClick={() => { go("workout"); onClose(); }}>💪 Workout Plan</button></li>
          <li><button onClick={() => { go("diet"); onClose(); }}>🥗 Diet Plan</button></li>
          <li><button onClick={() => { go("attendance"); onClose(); }}>📅 Attendance</button></li>
          <li className="mt-2 pt-2 border-top"><button disabled>📊 Progress (Soon)</button></li>
          <li><button disabled>⚙️ Settings (Soon)</button></li>
        </ul>
      </aside>

      {open && <div className="gs-backdrop" onClick={onClose} />}
    </>
  );
}
