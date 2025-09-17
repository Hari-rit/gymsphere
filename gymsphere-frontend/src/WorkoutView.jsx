// src/WorkoutView.jsx
import React from "react";

function WorkoutView({ plan, handleCopy }) {
  return (
    <div
      className="mx-auto p-4 text-white shadow-lg"
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
      <h3 className="mb-3" style={{ color: "#4da6ff", fontWeight: "bold" }}>
        💪 Workout Plan
      </h3>
      <p style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}>
        {plan
          ? plan.workout_plan
          : "Push/Pull/Legs 6x per week with progressive overload."}
      </p>
      <button
        className="btn btn-outline-light btn-sm mt-3"
        style={{ borderRadius: "8px" }}
        onClick={() =>
          handleCopy(
            plan
              ? plan.workout_plan
              : "Push/Pull/Legs 6x per week with progressive overload."
          )
        }
      >
        📋 Copy
      </button>
    </div>
  );
}

export default WorkoutView;
