import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type Role = 'ATTENDEE' | 'ORGANIZER' | 'ADMIN';

const ROLE_HOME: Record<Role, string> = {
  ATTENDEE:  '/',
  ORGANIZER: '/dashboard',
  ADMIN:     '/admin',
};

interface ProtectedRouteProps {
  role?: Role;
}

export default function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={ROLE_HOME[user!.role]} replace />;
  }

  return <Outlet />;
}
