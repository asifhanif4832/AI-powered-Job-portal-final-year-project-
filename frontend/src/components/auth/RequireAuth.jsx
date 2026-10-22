import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Redirects guests to login; preserves intended path in location state.
 */
export default function RequireAuth({ children }) {
  const user = useSelector((s) => s.auth.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
