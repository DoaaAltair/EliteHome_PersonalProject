import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, hasRole } from "../utils/api";

export default function ProtectedRoute({ children, requiredRole = null, allowedRoles = null }) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && !hasRole(requiredRole)) {
        return <Navigate to="/home" replace />;
    }

    if (allowedRoles && !allowedRoles.some(role => hasRole(role))) {
        return <Navigate to="/home" replace />;
    }

    return children;
}
