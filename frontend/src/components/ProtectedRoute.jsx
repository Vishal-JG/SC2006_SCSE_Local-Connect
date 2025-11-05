import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

// role can be 'admin', 'provider', or 'customer'
export default function ProtectedRoute({ children, allowedRoles }) {
  const { userRole } = useAuth();

  if (!userRole) {
    // Not logged in or role unknown
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userRole)) {
    // Role not allowed
    return <Navigate to="/" />;
  }

  return children;
}