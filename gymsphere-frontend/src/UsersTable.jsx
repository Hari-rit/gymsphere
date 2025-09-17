// src/UsersTable.jsx
import React from "react";

function UsersTable({ list, loading, err }) {
  if (loading) {
    return <p className="text-center text-muted mb-0">Loading…</p>;
  }
  if (err) {
    return <p className="text-center text-warning mb-0">{err}</p>;
  }
  if (!list.length) {
    return <p className="text-center text-muted mb-0">No users found.</p>;
  }

  return (
    <div className="table-responsive mt-3">
      <table className="table table-dark table-hover rounded-3 overflow-hidden">
        <thead>
          <tr>
            <th style={{ whiteSpace: "nowrap" }}>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th style={{ whiteSpace: "nowrap" }}>Role</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTable;
