// src/Sidebar.jsx
import React from "react";

function Sidebar({ title, open, onClose, menuItems }) {
  if (!open) return null;

  return (
    <>
      <div
        className="position-fixed top-0 start-0 h-100 bg-dark text-white shadow"
        style={{ width: "250px", zIndex: 1050 }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3 p-2 border-bottom">
          <div className="fw-bold">{title}</div>
          <button
            className="btn btn-sm btn-outline-light"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <ul className="list-unstyled px-2">
          {menuItems.map((item, idx) => (
            <li key={idx}>
              <button
                className={`btn w-100 text-start ${
                  item.disabled ? "text-muted" : "text-white"
                }`}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick();
                    onClose();
                  }
                }}
                disabled={item.disabled}
              >
                {item.label}
              </button>
            </li>
          ))}
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
