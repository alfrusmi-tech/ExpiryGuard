
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Checking permissions...</div>;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
