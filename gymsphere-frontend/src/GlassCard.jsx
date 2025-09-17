// src/GlassCard.jsx
import React from "react";

function GlassCard({ children, maxWidth = "1000px", className = "" }) {
  return (
    <div
      className={`mx-auto p-4 text-white shadow-lg mb-4 ${className}`}
      style={{
        maxWidth,
        width: "100%",
        borderRadius: "16px",
        background: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      }}
    >
      {children}
    </div>
  );
}

export default GlassCard;
