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

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content bg-dark text-white rounded-4">
          <div className="modal-header">
            <h5 className="modal-title">Review & Edit Plan</h5>
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
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSavePlan}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Plan"}
            </button>
            {generatedPlan.plan_id && (
              <>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={() => handleUpdatePlan(generatedPlan.plan_id)}
                  disabled={saving}
                >
                  {saving ? "Updating…" : "Update"}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDeletePlan(generatedPlan.plan_id)}
                  disabled={saving}
                >
                  Delete
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
