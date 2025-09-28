// src/TrainerAttendanceList.jsx
import React, { useEffect, useState } from "react";
import TrainerAttendanceCalendar from "./TrainerAttendanceCalendar";
import GlassCard from "./GlassCard"; // ✅ reuse glass style

function TrainerAttendanceList() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetch("http://localhost:100/gymsphere-backend/get_attendance.php", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.members) {
          setMembers(data.members);
        }
      })
      .catch((err) => console.error("Error fetching members:", err));
  }, []);

  if (selectedMember) {
    return (
      <TrainerAttendanceCalendar
        member={selectedMember}
        onBack={() => setSelectedMember(null)}
      />
    );
  }

  return (
    <div className="d-flex justify-content-center mt-4">
      <GlassCard maxWidth="900px" className="w-100">
        {/* Header */}
        <h2 className="text-info mb-4 text-center">
          📅 Attendance Overview
        </h2>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-dark table-hover rounded-3 overflow-hidden">
            <thead>
              <tr>
                <th className="text-center">Member</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length > 0 ? (
                members.map((m) => (
                  <tr key={m.id}>
                    <td className="text-center">{m.username}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-primary"
                        onClick={() => setSelectedMember(m)}
                      >
                        📅 View Attendance
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center text-muted">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

export default TrainerAttendanceList;
