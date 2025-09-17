// src/PlanModal.jsx
import React from "react";

function PlanModal({
  generatedPlan,
  editingWorkout,
  editingDiet,
  saving,
  setGeneratedPlan,
  setEditingWorkout,
  setEditingDiet,
  handleSavePlan,
  handleUpdatePlan,
  handleDeletePlan,
}) {
  if (!generatedPlan) return null;

  const isExistingPlan = !!generatedPlan.plan_id;

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content bg-dark text-white rounded-4">
          <div className="modal-header">
            <h5 className="modal-title">
              {isExistingPlan ? "View / Update Plan" : "Review & Save Plan"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                if (!saving) {
                  setGeneratedPlan(null);
                  setEditingWorkout("");
                  setEditingDiet("");
                }
              }}
            />
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">🏋️ Workout Plan</label>
              <textarea
                className="form-control"
                rows={10}
                value={editingWorkout}
                onChange={(e) => setEditingWorkout(e.target.value)}
                style={{ whiteSpace: "pre-wrap" }}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">🥗 Diet Plan</label>
              <textarea
                className="form-control"
                rows={10}
                value={editingDiet}
                onChange={(e) => setEditingDiet(e.target.value)}
                style={{ whiteSpace: "pre-wrap" }}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline-light"
              onClick={() => {
                if (!saving) {
                  setGeneratedPlan(null);
                  setEditingWorkout("");
                  setEditingDiet("");
                }
              }}
              disabled={saving}
            >
              Close
            </button>

            {/* First-time plan (INSERT) */}
            {!isExistingPlan && (
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSavePlan}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Plan"}
              </button>
            )}

            {/* Existing plan (UPDATE / DELETE) */}
            {isExistingPlan && (
              <>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={() => handleUpdatePlan(generatedPlan.plan_id)}
                  disabled={saving}
                >
                  {saving ? "Updating…" : "Update Plan"}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDeletePlan(generatedPlan.plan_id)}
                  disabled={saving}
                >
                  Delete Plan
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanModal;
