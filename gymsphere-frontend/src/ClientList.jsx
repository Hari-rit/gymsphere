
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
    <div className="d-flex flex-column align-items-center gap-4 w-100">
      {approvedForms.map((form) => (
        <div
          key={form.form_id}
          style={{ width: "100%", maxWidth: "600px" }} // glasscard
        >
          <GlassCard>
            <h5
              className="text-primary text-center mb-3"
              role="button"
              onClick={() => setSelectedMember(form)}
            >
              {form.username}
            </h5>

            <p>
              <strong>Goal:</strong> {form.goal}
            </p>
            <p>
              <strong>Age:</strong> {form.age} years
            </p>
            <p>
              <strong>Experience:</strong>{" "}
              {form.experience_years}y {form.experience_months}m
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className="badge bg-success">{form.status}</span>
            </p>

            {/* Plan actions only */}
            <div className="mt-3 d-flex flex-column gap-2">
              <div className="d-flex justify-content-center gap-2 flex-wrap">
                {!form.plan_id ? (
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={() => setPlanOptionsFor(form.form_id)}
                    disabled={generating && planOptionsFor === form.form_id}
                  >
                    {generating && planOptionsFor === form.form_id
                      ? "Generating..."
                      : "Generate Plan"}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setGeneratedPlan(form);
                        setEditingWorkout(form.workout_plan || "");
                        setEditingDiet(form.diet_plan || "");
                      }}
                    >
                      View / Update
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeletePlan(form.plan_id)}
                    >
                      Delete Plan
                    </button>
                  </>
                )}
              </div>

              {/* Level selection */}
              {planOptionsFor === form.form_id && (
                <div className="mt-2 d-flex justify-content-center gap-2 flex-wrap">
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={() => handleGeneratePlan(form.form_id, "beginner")}
                    disabled={generating}
                  >
                    Beginner
                  </button>
                  <button
                    className="btn btn-outline-warning btn-sm"
                    onClick={() => handleGeneratePlan(form.form_id, "intermediate")}
                    disabled={generating}
                  >
                    Intermediate
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleGeneratePlan(form.form_id, "advanced")}
                    disabled={generating}
                  >
                    Advanced
                  </button>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      ))}
    </div>
  );
}

export default ClientList;
