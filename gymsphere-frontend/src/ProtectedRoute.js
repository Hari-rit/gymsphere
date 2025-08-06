// src/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ user, allowedRole, children }) {
  if (!user || user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default ProtectedRoute;
