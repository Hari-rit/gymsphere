// src/TrainerAttendanceCalendar.jsx
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import GlassCard from "./GlassCard";

function TrainerAttendanceCalendar({ member, onBack }) {
  const [records, setRecords] = useState({});
  const [joinDate, setJoinDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetch(
      `http://localhost:100/gymsphere-backend/get_attendance.php?member_id=${member.id}`,
      {
        method: "GET",
        credentials: "include",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRecords(data.attendance || {});
          setJoinDate(data.join_date ? data.join_date.split(" ")[0] : null);
        }
      })
      .catch((err) => console.error("Error loading attendance:", err));
  }, [member]);

  //  Update attendance
  const updateAttendance = (status) => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split("T")[0];

    fetch("http://localhost:100/gymsphere-backend/mark_attendance.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        member_id: member.id,
        date: dateStr,
        status,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        if (data.success) {
          setRecords((prev) => ({ ...prev, [dateStr]: status }));
        }
      })
      .catch((err) => console.error("Error updating attendance:", err));
  };

  //  Highlight logic
  const tileClassName = ({ date }) => {
    const dateStr = date.toISOString().split("T")[0];

    if (date.getDay() === 0) return "holiday"; // Sunday
    if (joinDate && dateStr === joinDate) return "join-date";
    if (records[dateStr] === "present") return "present";
    if (records[dateStr] === "absent") return "absent";

    return null;
  };

  //  Rules: allow marking from join date → today, excluding Sundays
  const canMarkSelected = () => {
    if (!selectedDate || !joinDate) return false;

    const today = new Date().toISOString().split("T")[0];
    const dateStr = selectedDate.toISOString().split("T")[0];

    // must not be before join date
    if (dateStr < joinDate) return false;

    // must not be in the future
    if (dateStr > today) return false;

    // must not be a Sunday
    if (selectedDate.getDay() === 0) return false;

    return true;
  };

  return (
    <div className="d-flex justify-content-center mt-4">
      <GlassCard maxWidth="700px" className="w-100 text-center">
        {/* Header */}
        <h2 className="text-info mb-4">
          📅 Attendance for{" "}
          <span className="text-warning">{member.username}</span>
        </h2>

        {/* Calendar */}
        <div className="d-flex justify-content-center">
          <Calendar
            tileClassName={tileClassName}
            onClickDay={(value) => setSelectedDate(value)}
            className="p-3 rounded-4"
          />
        </div>

        {/* Mark buttons */}
        {selectedDate && (
          <div className="mt-3">
            <p>
              Selected: <b>{selectedDate.toISOString().split("T")[0]}</b>
            </p>

            {canMarkSelected() ? (
              <div className="d-flex justify-content-center gap-2">
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => updateAttendance("present")}
                >
                   Mark Present
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => updateAttendance("absent")}
                >
                   Mark Absent
                </button>
              </div>
            ) : (
              <p className="text-warning fw-bold">
                 Attendance can only be marked from <b>{joinDate}</b> up to{" "}
                <b>today</b>, excluding Sundays.
              </p>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="d-flex justify-content-center flex-wrap gap-3 mt-4">
          <span className="badge bg-success">Present</span>
          <span className="badge bg-danger">Absent</span>
          <span className="badge bg-secondary">Sunday (Holiday)</span>
          <span className="badge bg-info text-dark">Joining Date</span>
        </div>

        {/* Back button */}
        <button className="btn btn-outline-light mt-4" onClick={onBack}>
          ⬅ Back to Members
        </button>
      </GlassCard>

      {/* Extra CSS */}
      <style>{`
        .react-calendar {
          background: rgba(0, 0, 0, 0.6);
          border: none;
          border-radius: 12px;
          color: white;
          width: 100%;
          max-width: 500px;
        }

        .react-calendar__tile {
          border-radius: 8px;
          text-align: center;
          padding: 10px;
          color: white;
        }

        .react-calendar__month-view__days__day {
          color: white;
        }

        .present {
          background: #198754 !important;
          color: white !important;
          font-weight: bold;
        }

        .absent {
          background: #dc3545 !important;
          color: white !important;
          font-weight: bold;
        }

        .holiday {
          background: transparent !important;
          color: #ff4d4d !important;
          font-weight: bold;
        }

        .join-date {
          background: #0dcaf0 !important;
          color: black !important;
          font-weight: bold;
        }

        .react-calendar__tile--now {
          background: rgba(255, 255, 255, 0.2) !important;
          border-radius: 8px;
          color: white !important;
        }

        .react-calendar__navigation button {
          color: white !important;
          font-weight: bold;
          font-size: 1.2rem;
          background: none !important;
        }
      `}</style>
    </div>
  );
}

export default TrainerAttendanceCalendar;
