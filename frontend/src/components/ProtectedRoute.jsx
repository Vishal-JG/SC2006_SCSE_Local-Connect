import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

// role can be 'admin', 'provider', or 'customer'
export default function ProtectedRoute({ children, allowedRoles }) {
  const { userRole, initializing } = useAuth();

  // Wait until auth state and role are resolved to avoid redirect flicker
  if (initializing) {
    return null; // or a loader component
  }

  // Check localStorage as fallback for race condition during login navigation
  const storedRole = localStorage.getItem("role");
  const effectiveRole = userRole || storedRole;

  if (!effectiveRole) {
    // Not logged in or role unknown
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(effectiveRole)) {
    // Role not allowed
    return <Navigate to="/" replace />;
  }

  return children;
}