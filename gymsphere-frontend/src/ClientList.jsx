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
  setGeneratedPlan,
  setEditingWorkout,
  setEditingDiet,
  handleDeletePlan,
}) {
  if (!approvedForms.length) {
    return <p className="text-muted">No clients found.</p>;
  }

  return (
    <div className="row">
      {approvedForms.map((form) => (
        <div key={form.form_id} className="col-md-6 mb-4">
          <GlassCard>
            <h5
              className="text-info"
              role="button"
              onClick={() => setSelectedMember(form)}
            >
              👤 {form.username}
            </h5>
            <p>🎯 {form.goal}</p>
            <p>🎂 {form.age} years</p>
            <p>
              ⏳ {form.experience_years}y {form.experience_months}m
            </p>
            <p>
              Status:{" "}
              <span className="badge bg-success">{form.status}</span>
            </p>

            <div className="d-flex justify-content-center gap-2 mt-3">
              {/* If no plan → Generate Plan */}
              {!form.plan_id ? (
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={() => setPlanOptionsFor(form.form_id)}
                  disabled={generating && planOptionsFor === form.form_id}
                >
                  ⚡ {generating && planOptionsFor === form.form_id
                    ? "Generating..."
                    : "Generate Plan"}
                </button>
              ) : (
                <>
                  {/* If plan exists → View/Update + Delete */}
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setGeneratedPlan(form);
                      setEditingWorkout(form.workout_plan || "");
                      setEditingDiet(form.diet_plan || "");
                    }}
                  >
                    👀 View / ✏️ Update
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeletePlan(form.plan_id)}
                  >
                    🗑️ Delete Plan
                  </button>
                </>
              )}
            </div>

            {/* Level selection when generating */}
            {planOptionsFor === form.form_id && (
              <div className="mt-3 d-flex justify-content-center gap-2">
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={() => handleGeneratePlan(form.form_id, "beginner")}
                  disabled={generating}
                >
                  🟢 Beginner
                </button>
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => handleGeneratePlan(form.form_id, "intermediate")}
                  disabled={generating}
                >
                  🟡 Intermediate
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleGeneratePlan(form.form_id, "advanced")}
                  disabled={generating}
                >
                  🔴 Advanced
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      ))}
    </div>
  );
}

export default ClientList;
