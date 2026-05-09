import { useAuthStore } from '../store/auth.store';
export function useAuth() {
  const { user, accessToken, setAuth, logout } = useAuthStore();
  return { user, accessToken, isAuthenticated: !!accessToken, isOrganizer: user?.role === 'ORGANIZER', isAdmin: user?.role === 'ADMIN', setAuth, logout };
}

