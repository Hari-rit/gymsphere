// src/ClientList.jsx
import React from "react";
import GlassCard from "./GlassCard";

function ClientList({
  approvedForms,
  planOptionsFor,
  setPlanOptionsFor,
  generating,
  handleGeneratePlan,
  setSelectedMember,
}) {
  if (!approvedForms || approvedForms.length === 0) {
    return <p className="text-muted">No approved clients yet.</p>;
  }

  return (
    <>
      {approvedForms.map((form) => (
        <GlassCard key={form.id}>
          <h5 className="text-info" role="button" onClick={() => setSelectedMember(form)}>
            👤 {form.username}
          </h5>
          <p>🎯 {form.goal}</p>
          <p>🎂 {form.age} years</p>
          <p>
            ⏳ {form.experience_years}y {form.experience_months}m
          </p>
          <p>
            Status: <span className="badge bg-success">approved</span>
          </p>
          {form.trainer_name && <p>👨‍🏫 Assigned Trainer: {form.trainer_name}</p>}

          <div className="mt-2">
            {planOptionsFor === form.user_id ? (
              <div className="card bg-secondary text-white p-3 mt-2">
                <h6>📋 Member Details</h6>
                <p>⚖️ Weight: {form.weight} kg</p>
                <p>📏 Height: {form.height} cm</p>
                <p>
                  ⏳ Experience: {form.experience_years}y {form.experience_months}m
                </p>
                <p>🎯 Goal: {form.goal}</p>
                <div className="d-flex gap-2 mt-2">
                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm"
                    onClick={() => handleGeneratePlan(form.id, "beginner")}
                    disabled={generating}
                  >
                    {generating ? "⏳ Generating..." : "🟢 Beginner Plan"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-warning btn-sm"
                    onClick={() => handleGeneratePlan(form.id, "intermediate")}
                    disabled={generating}
                  >
                    {generating ? "⏳ Generating..." : "🟡 Intermediate Plan"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleGeneratePlan(form.id, "advanced")}
                    disabled={generating}
                  >
                    {generating ? "⏳ Generating..." : "🔴 Advanced Plan"}
                  </button>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light mt-2"
                  onClick={() => setPlanOptionsFor(null)}
                  disabled={generating}
                >
                  ❌ Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setPlanOptionsFor(form.user_id)}
                disabled={generating}
              >
                ⚡ Generate Plan
              </button>
            )}
          </div>
        </GlassCard>
      ))}
    </>
  );
}

export default ClientList;
