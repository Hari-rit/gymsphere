// src/Sidebar.jsx
import React from "react";

function Sidebar({ title = "GymSphere", open, onClose, items = [], activeView, setActiveView }) {
  if (!open) return null;

  return (
    <>
      <div
        className="position-fixed top-0 start-0 h-100 bg-dark text-white shadow"
        style={{ width: "250px", zIndex: 1050 }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3 p-2 border-bottom">
          <div className="fw-bold">{title}</div>
          <button className="btn btn-sm btn-outline-light" onClick={onClose}>
            ✕
          </button>
        </div>

        <ul className="list-unstyled px-2">
          {items.map((item, idx) => {
            const isDisabled = !!item.disabled;
            const key = item.key ?? idx;
            const isActive = activeView && item.key && activeView === item.key;

            const handleClick = () => {
              if (isDisabled) return;
              if (typeof item.onClick === "function") {
                item.onClick();
              } else if (typeof setActiveView === "function" && item.key) {
                setActiveView(item.key);
              }
              if (typeof onClose === "function") onClose();
            };

            return (
              <li key={key}>
                <button
                  className={`btn w-100 text-start ${isDisabled ? "text-muted" : "text-white"} ${isActive ? "fw-bold" : ""}`}
                  onClick={handleClick}
                  disabled={isDisabled}
                  type="button"
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      />
    </>
  );
}

export default Sidebar;
