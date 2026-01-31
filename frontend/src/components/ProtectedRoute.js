import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthed, loading } = useAuth() || {};
  if (loading) return <div className="container"><div className="info">Loading…</div></div>;
  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
}
