// src/UsersTable.jsx
import React from "react";

function UsersTable({ list, loading, err, onUserRemoved }) {
  if (loading) {
    return <p className="text-center text-muted mb-0">Loading…</p>;
  }
  if (err) {
    return <p className="text-center text-warning mb-0">{err}</p>;
  }
  if (!list.length) {
    return <p className="text-center text-muted mb-0">No users found.</p>;
  }

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;

    try {
      const res = await fetch("http://localhost:100/gymsphere-backend/remove_user.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id: id }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ " + data.message);
        if (typeof onUserRemoved === "function") {
          onUserRemoved(id);
        }
      } else {
        alert("❌ " + data.message);
      }
    } catch (e) {
      console.error("Remove error:", e);
      alert("Network error while removing user");
    }
  };

  return (
    <div className="table-responsive mt-3">
      <table className="table table-dark table-hover rounded-3 overflow-hidden">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>
                <span
                  className={`badge ${
                    u.role === "admin"
                      ? "bg-danger"
                      : u.role === "trainer"
                      ? "bg-warning text-dark"
                      : "bg-success"
                  }`}
                >
                  {u.role}
                </span>
              </td>
              <td>
                {/*  Hide remove button if user is admin */}
                {u.role !== "admin" && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRemove(u.id)}
                  >
                    ❌ Remove
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTable;
