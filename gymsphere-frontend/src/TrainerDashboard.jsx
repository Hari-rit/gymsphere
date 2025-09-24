import React, { useState, useEffect } from "react";
import GlassCard from "./GlassCard";
import PlanModal from "./PlanModal";
import ClientList from "./ClientList";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function TrainerDashboard({ username, onLogout }) {
  const [forms, setForms] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [planOptionsFor, setPlanOptionsFor] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");

  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState("");
  const [editingDiet, setEditingDiet] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Fetch member forms + attendance
  const fetchForms = () => {
    fetch("http://localhost:100/gymsphere-backend/trainer_get_forms.php", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setForms(data.forms);
      })
      .catch((err) => console.error("Error fetching forms:", err));

    fetch("http://localhost:100/gymsphere-backend/get_attendance.php", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAttendance(data.attendance || {});
      })
      .catch((err) => console.error("Error fetching attendance:", err));
  };

  useEffect(() => {
    fetchForms();
  }, []);

  // Accept student
  const handleAccept = (userId) => {
    fetch("http://localhost:100/gymsphere-backend/trainer_accept.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ user_id: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        if (data.success) fetchForms();
      })
      .catch((err) => console.error("Error accepting student:", err));
  };

  // Approve / Reject
  const handleAction = (userId, action, trainerComment = "") => {
    fetch("http://localhost:100/gymsphere-backend/trainer_action.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ user_id: userId, action, trainer_comment: trainerComment }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        if (data.success) fetchForms();
      })
      .catch((err) => console.error("Error updating form:", err));
  };

  // Generate plan
  const handleGeneratePlan = (formId, level) => {
    setGenerating(true);
    fetch("http://localhost:100/gymsphere-backend/generate_plan.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ form_id: formId, level }),
    })
      .then((res) => res.json())
      .then((data) => {
        setGenerating(false);
        if (data.success) {
          setGeneratedPlan(data);
          setEditingWorkout(data.workout_plan || "");
          setEditingDiet(data.diet_plan || "");
          setPlanOptionsFor(null);
        } else {
          alert(`Failed: ${data.error || data.message}`);
        }
      })
      .catch((err) => {
        setGenerating(false);
        console.error("Error generating plan:", err);
        alert("Error generating plan. Check console.");
      });
  };

  // Save plan
  const handleSavePlan = () => {
    if (!generatedPlan) return;
    setSaving(true);
    fetch("http://localhost:100/gymsphere-backend/save_plan.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        user_id: generatedPlan.member_form_id,
        workout_plan: editingWorkout,
        diet_plan: editingDiet,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSaving(false);
        if (data.success) {
          alert("Plan saved!");
          setGeneratedPlan(null);
          setEditingWorkout("");
          setEditingDiet("");
          fetchForms();
        } else {
          alert(`Failed: ${data.error || "Failed to save plan"}`);
        }
      })
      .catch((err) => {
        setSaving(false);
        console.error("Error saving plan:", err);
        alert("Error saving plan. Check console.");
      });
  };

  // Update plan
  const handleUpdatePlan = (planId) => {
    setSaving(true);
    fetch("http://localhost:100/gymsphere-backend/update_plan.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        plan_id: planId,
        workout_plan: editingWorkout,
        diet_plan: editingDiet,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSaving(false);
        if (data.success) {
          alert("Plan updated!");
          setGeneratedPlan(null);
          setEditingWorkout("");
          setEditingDiet("");
          fetchForms();
        } else {
          alert(`Failed: ${data.error || "Failed to update plan"}`);
        }
      })
      .catch((err) => {
        setSaving(false);
        console.error("Error updating plan:", err);
        alert("Error updating plan. Check console.");
      });
  };

  // Delete plan
  const handleDeletePlan = (planId) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    fetch("http://localhost:100/gymsphere-backend/delete_plan.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ plan_id: planId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Plan deleted!");
          fetchForms();
          if (generatedPlan && generatedPlan.plan_id === planId) {
            setGeneratedPlan(null);
            setEditingWorkout("");
            setEditingDiet("");
          }
        } else {
          alert(`Failed: ${data.error || "Failed to delete plan"}`);
        }
      })
      .catch((err) => {
        console.error("Error deleting plan:", err);
        alert("Error deleting plan. Check console.");
      });
  };

  // Mark attendance
  const handleAttendance = (memberId, status) => {
    fetch("http://localhost:100/gymsphere-backend/mark_attendance.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ member_id: memberId, status }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        if (data.success) fetchForms();
      })
      .catch((err) => console.error("Error marking attendance:", err));
  };

  const countByStatus = (status) => forms.filter((f) => f.status === status).length;

  const approvedForms = forms.filter((f) => f.status === "approved");
  const requestForms = forms.filter((f) => f.status === "pending" || f.status === "rejected");

  const filteredRequests = requestForms.filter((f) => {
    if (filter !== "all" && f.status !== filter) return false;
    if (search && !f.username.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sidebarItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "clients", label: "My Clients" },
    { key: "requests", label: "Member Requests" },
    { key: "analytics", label: "Analytics (Soon)", disabled: true },
  ];

  return (
    <div
      className="text-white min-vh-100"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Navbar username={username} role="Trainer" onLogout={onLogout} onOpenSidebar={() => setSidebarOpen(true)} />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        items={sidebarItems}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <div className="container-fluid pt-5" style={{ paddingTop: "120px" }}>
        {activeView === "dashboard" && (
          <>
            <header className="mb-4 d-flex justify-content-center">
              <div
                className="rounded-4 shadow"
                style={{
                  background: "rgba(0,0,0,0.55)",
                  backdropFilter: "saturate(140%) blur(2px)",
                  padding: "18px 24px",
                  maxWidth: 920,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <h1 className="mb-2" style={{ letterSpacing: "1px" }}>
                  Welcome Trainer
                </h1>
                <p className="mb-0" style={{ color: "rgba(255,255,255,0.85)" }}>
                  Manage members, accept students, create plans, and mark attendance.
                </p>
              </div>
            </header>

            <div className="row text-center my-4 g-4">
              <div className="col">
                <h6>Pending</h6>
                <p className="fw-bold text-warning">{countByStatus("pending")}</p>
              </div>
              <div className="col">
                <h6>Approved</h6>
                <p className="fw-bold text-success">{countByStatus("approved")}</p>
              </div>
              <div className="col">
                <h6>Rejected</h6>
                <p className="fw-bold text-danger">{countByStatus("rejected")}</p>
              </div>
              <div className="col">
                <h6>Total</h6>
                <p className="fw-bold text-info">{forms.length}</p>
              </div>
            </div>
          </>
        )}

        {activeView === "clients" && (
          <div className="d-flex flex-column align-items-center gap-4">
            <ClientList
              approvedForms={approvedForms}
              planOptionsFor={planOptionsFor}
              setPlanOptionsFor={setPlanOptionsFor}
              generating={generating}
              handleGeneratePlan={handleGeneratePlan}
              setSelectedMember={setSelectedMember}
              setGeneratedPlan={setGeneratedPlan}
              setEditingWorkout={setEditingWorkout}
              setEditingDiet={setEditingDiet}
              handleDeletePlan={handleDeletePlan}
              handleAttendance={handleAttendance}
              attendance={attendance}
            />
          </div>
        )}

        {activeView === "requests" && (
          <>
            <div className="d-flex gap-3 mb-4 flex-wrap">
              <select
                className="form-select w-auto"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <input
                type="text"
                className="form-control w-auto"
                placeholder="Search by username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="d-flex flex-column align-items-center gap-4">
              {filteredRequests.length === 0 ? (
                <p className="text-muted">No member requests found.</p>
              ) : (
                filteredRequests.map((form) => (
                  <div key={form.id} style={{ width: "100%", maxWidth: "600px" }}>
                    <GlassCard>
                      <h5 className="text-info" role="button" onClick={() => setSelectedMember(form)}>
                        {form.username}
                      </h5>
                      <p>Goal: {form.goal}</p>
                      <p>Age: {form.age} years</p>
                      <p>
                        Experience: {form.experience_years}y {form.experience_months}m
                      </p>
                      <p>
                        Status:{" "}
                        <span
                          className={`badge ${
                            form.status === "rejected" ? "bg-danger" : "bg-warning text-dark"
                          }`}
                        >
                          {form.status}
                        </span>
                      </p>

                      {form.assigned_trainer_id === null && (
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={() => handleAccept(form.user_id)}
                        >
                          Accept Student
                        </button>
                      )}

                      {form.assigned_trainer_id !== null && form.status === "pending" && (
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => handleAction(form.user_id, "approve")}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              const comment = prompt("Enter rejection reason:");
                              if (comment !== null) handleAction(form.user_id, "reject", comment);
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </GlassCard>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {selectedMember && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content bg-dark text-white rounded-4">
              <div className="modal-header">
                <h5 className="modal-title">Profile: {selectedMember.username}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedMember(null)}
                />
              </div>
              <div className="modal-body">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item bg-dark text-white">
                    Name: {selectedMember.name}
                  </li>
                  <li className="list-group-item bg-dark text-white">
                    Goal: {selectedMember.goal}
                  </li>
                  <li className="list-group-item bg-dark text-white">
                    Age: {selectedMember.age}
                  </li>
                  <li className="list-group-item bg-dark text-white">
                    Health Issues: {selectedMember.health_issues || "None"}
                  </li>
                  <li className="list-group-item bg-dark text-white">
                    Status: {selectedMember.status}
                  </li>
                  {selectedMember.trainer_name && (
                    <li className="list-group-item bg-dark text-white">
                      Assigned Trainer: {selectedMember.trainer_name}
                    </li>
                  )}
                </ul>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedMember(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PlanModal
        generatedPlan={generatedPlan}
        editingWorkout={editingWorkout}
        editingDiet={editingDiet}
        saving={saving}
        setGeneratedPlan={setGeneratedPlan}
        setEditingWorkout={setEditingWorkout}
        setEditingDiet={setEditingDiet}
        handleSavePlan={handleSavePlan}
        handleUpdatePlan={handleUpdatePlan}
        handleDeletePlan={handleDeletePlan}
      />
    </div>
  );
}

export default TrainerDashboard;
