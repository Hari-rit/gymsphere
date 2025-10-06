import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import GlassCard from "./GlassCard";

function MemberAttendanceCalendar() {
  const [records, setRecords] = useState({});
  const [joinDate, setJoinDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:100/gymsphere-backend/get_attendance.php", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRecords(data.attendance || {});
          setJoinDate(data.join_date ? data.join_date.split(" ")[0] : null);
        } else {
          setErr(data.message || "Failed to load attendance.");
        }
      })
      .catch(() => setErr("Network error"))
      .finally(() => setLoading(false));
  }, []);

  //  Highlight logic
  const tileClassName = ({ date }) => {
    const dateStr = date.toISOString().split("T")[0];

    // Sundays → gray/red text
    if (date.getDay() === 0) return "holiday";

    // Joining date
    if (joinDate && dateStr === joinDate) return "join-date";

    // Attendance marks
    if (records[dateStr] === "present") return "present";
    if (records[dateStr] === "absent") return "absent";

    return null;
  };

  if (loading) return <p className="text-center text-muted">Loading attendance...</p>;
  if (err) return <p className="text-center text-danger">{err}</p>;

  return (
    <div className="d-flex justify-content-center mt-4">
      <GlassCard maxWidth="700px" className="w-100 text-center">
        {/* Header */}
        <h2 className="text-info mb-4">📅 My Attendance</h2>

        {/* Calendar */}
        <div className="d-flex justify-content-center">
          <Calendar tileClassName={tileClassName} className="p-3 rounded-4" />
        </div>

        {/* Legend */}
        <div className="d-flex justify-content-center flex-wrap gap-3 mt-4">
          <span className="badge bg-success">Present</span>
          <span className="badge bg-danger">Absent</span>
          <span className="badge bg-secondary">Sunday (Holiday)</span>
          <span className="badge bg-info text-dark">Joining Date</span>
        </div>
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

        /* Default day text */
        .react-calendar__month-view__days__day {
          color: white;
        }

        /* Present */
        .present {
          background: #198754 !important;
          color: white !important;
          font-weight: bold;
        }

        /* Absent */
        .absent {
          background: #dc3545 !important;
          color: white !important;
          font-weight: bold;
        }

        /* Sunday holiday */
        .holiday {
          background: transparent !important;
          color: #ff4d4d !important;
          font-weight: bold;
        }

        /* Join date */
        .join-date {
          background: #0dcaf0 !important;
          color: black !important;
          font-weight: bold;
        }

        /* Today highlight */
        .react-calendar__tile--now {
          background: rgba(255, 255, 255, 0.2) !important;
          border-radius: 8px;
          color: white !important;
        }

        /* Navigation buttons */
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

export default MemberAttendanceCalendar;
