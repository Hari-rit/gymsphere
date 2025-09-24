// src/GlassCard.jsx
import React from "react";

function GlassCard({
  children,
  maxWidth = "360px",  // ✅ smaller default max width
  minWidth = "280px",
  className = "",
  footer = null, // ✅ Optional footer slot
}) {
  return (
    <div
      className={`p-4 text-white shadow-lg d-flex flex-column justify-content-between ${className}`}
      style={{
        maxWidth,            // ✅ prevents 2 cards from stretching
        minWidth,
        width: "100%",
        margin: "0.5rem",    // ✅ spacing between cards
        borderRadius: "16px",
        background: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      }}
    >
      <div className="flex-grow-1">{children}</div>

      {/* ✅ Optional footer area always sticks to bottom */}
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
}

export default GlassCard;
