import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login and save the attempted location in navigation state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
