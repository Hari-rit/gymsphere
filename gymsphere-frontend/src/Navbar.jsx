// src/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function Navbar({ role = "member", username = "", onLogout, onOpenSidebar }) {
  const roleLower = String(role).toLowerCase();
  const roleBadge =
    roleLower === "admin"
      ? "bg-danger"
      : roleLower === "trainer"
      ? "bg-warning text-dark"
      : "bg-success";

  const roleLabel =
    roleLower === "admin" ? "Admin" : roleLower === "trainer" ? "Trainer" : "Member";

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(false);

  const dropdownRef = useRef(null);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:100/gymsphere-backend/get_notifications.php", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        let notifs = data.notifications || [];

        // Sort: unread first, then newest first
        notifs = notifs.sort((a, b) => {
          if (a.is_read === b.is_read) {
            return new Date(b.created_at) - new Date(a.created_at);
          }
          return a.is_read ? 1 : -1;
        });

        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.is_read).length);
      }
    } catch (e) {
      console.error("Error fetching notifications:", e);
    }
  };

  // Mark all notifications as read
  const markAllRead = async () => {
    try {
      await fetch("http://localhost:100/gymsphere-backend/mark_notification_read.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      await fetchNotifications();
    } catch (e) {
      console.error("Error marking notifications:", e);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await fetch("http://localhost:100/gymsphere-backend/clear_notifications.php", {
        method: "POST",
        credentials: "include",
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch (e) {
      console.error("Error clearing notifications:", e);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setOpenDropdown((v) => !v);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top px-4 shadow-sm">
      <div className="d-flex align-items-center gap-2">
        <Link
          className="navbar-brand text-white text-decoration-none d-flex align-items-center gap-2"
          to="/"
        >
          <span className="fs-4">🏠</span>
          <span>Home</span>
        </Link>
        <span className={`badge ${roleBadge}`}>{roleLabel}</span>
      </div>

      <div className="ms-auto d-flex align-items-center gap-3">
        {/* 🔔 Notifications */}
        <div className="position-relative" ref={dropdownRef}>
          <button
            className="btn btn-sm btn-outline-light rounded-circle"
            style={{ width: "38px", height: "38px" }}
            onClick={toggleDropdown}
            aria-label="Notifications"
            title="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span
                className="badge bg-danger position-absolute top-0 start-100 translate-middle rounded-pill"
                style={{ fontSize: "0.7rem" }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {openDropdown && (
            <div
              className="dropdown-menu dropdown-menu-end show shadow p-0"
              style={{
                position: "absolute",
                right: 0,
                top: "110%",
                minWidth: "320px",
                maxHeight: "420px",
                overflowY: "auto",
                background: "rgba(33, 37, 41, 0.95)",
                border: "1px solid rgba(255,255,255,0.08)",
                zIndex: 2000,
              }}
            >
              {/* Header */}
              <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
                <h6 className="mb-0 text-white">Notifications</h6>
                <div className="d-flex gap-2">
                  {notifications.length > 0 && (
                    <button
                      className="btn btn-sm btn-outline-light"
                      onClick={markAllRead}
                      title="Mark all read"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={clearAllNotifications}
                      title="Clear all notifications"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* Notification list */}
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="px-3 py-2 text-wrap"
                    style={{
                      cursor: "pointer",
                      transition: "background .15s ease",
                      color: n.is_read ? "rgba(200,200,200,0.85)" : "#fff",
                      fontWeight: n.is_read ? "normal" : "bold",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(0,123,255,0.08)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "8px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div>{n.message}</div>
                        <small className="text-secondary">{n.created_at}</small>
                      </div>
                      {!n.is_read && (
                        <span className="badge bg-warning text-dark align-self-start">
                          new
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-3 text-light">No notifications</div>
              )}
            </div>
          )}
        </div>

        {/* Profile Button */}
        <button
          className="btn btn-sm btn-outline-light d-flex align-items-center gap-2 rounded-pill"
          style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          onClick={onOpenSidebar}
        >
          <div
            className={`rounded-circle ${
              roleLower === "trainer"
                ? "bg-warning text-dark"
                : roleLower === "admin"
                ? "bg-danger text-white"
                : "bg-primary text-white"
            } d-flex justify-content-center align-items-center`}
            style={{ width: "28px", height: "28px", fontSize: "0.8rem" }}
          >
            {username?.[0]?.toUpperCase() ?? "U"}
          </div>
          <span className="text-truncate" style={{ maxWidth: 120 }}>
            Welcome, {username}
          </span>
          ▾
        </button>

        <button className="btn btn-danger btn-sm" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
