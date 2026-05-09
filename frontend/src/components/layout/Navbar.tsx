import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navLink = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-0.5'
    : 'text-gray-500 hover:text-gray-900 transition-colors';

export default function Navbar() {
  const { user, isAuthenticated, isOrganizer, isAdmin, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between h-16">

        {/* Left: logo + nav links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-blue-600 shrink-0">Eventure</Link>
          <div className="flex items-center gap-6 text-sm">
            {!isOrganizer && !isAdmin && <NavLink to="/" end className={navLink}>Discover</NavLink>}
            {isOrganizer && <NavLink to="/dashboard" className={navLink}>Dashboard</NavLink>}
            {isAdmin     && <NavLink to="/admin"                  className={navLink}>Dashboard</NavLink>}
            {isAdmin     && <NavLink to="/admin/event-management" className={navLink}>Event Management</NavLink>}
            {isAdmin     && <NavLink to="/admin/users"            className={navLink}>User Management</NavLink>}
            {!isOrganizer && !isAdmin && isAuthenticated && <NavLink to="/my-tickets" className={navLink}>My Tickets</NavLink>}
          </div>
        </div>

        {/* Right: account area */}
        <div className="flex items-center gap-3 text-sm">
          {isAuthenticated ? (
            <>
              {/* User pill */}
              <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold shrink-0">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
                <span className="font-medium text-gray-700 max-w-[120px] truncate">{user?.name}</span>
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLink}>Login</NavLink>
              <NavLink
                to="/register"
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}
