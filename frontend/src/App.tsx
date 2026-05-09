import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import DiscoveryPage      from './pages/Discovery/DiscoveryPage';
import EventDetailPage    from './pages/EventDetail/EventDetailPage';
import LoginPage          from './pages/Auth/LoginPage';
import RegisterPage       from './pages/Auth/RegisterPage';
import CheckoutPage       from './pages/Checkout/CheckoutPage';
import MyTicketsPage      from './pages/MyTickets/MyTicketsPage';
import DashboardPage      from './pages/OrganizerDashboard/DashboardPage';
import AttendeeListPage   from './pages/OrganizerDashboard/AttendeeListPage';
import CreateEventPage    from './pages/CreateEvent/CreateEventPage';
import AdminPanelPage     from './pages/AdminPanel/AdminPanelPage';
import EventReviewPage    from './pages/AdminPanel/EventReviewPage';
import UserManagementPage    from './pages/AdminPanel/UserManagementPage';
import EventManagementPage  from './pages/AdminPanel/EventManagementPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route index element={<DiscoveryPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />

        {/* Any authenticated user */}
        <Route element={<ProtectedRoute />}>
          <Route path="events/:id/checkout" element={<CheckoutPage />} />
          <Route path="my-tickets" element={<MyTicketsPage />} />
        </Route>

        {/* Organizer only */}
        <Route element={<ProtectedRoute role="ORGANIZER" />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="dashboard/events/:id/attendees" element={<AttendeeListPage />} />
          <Route path="events/create" element={<CreateEventPage />} />
        </Route>

        {/* Admin only */}
        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route path="admin" element={<AdminPanelPage />} />
          <Route path="admin/events/:id" element={<EventReviewPage />} />
          <Route path="admin/users" element={<UserManagementPage />} />
          <Route path="admin/event-management" element={<EventManagementPage />} />
        </Route>
      </Route>

      {/* Auth — no layout */}
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
    </Routes>
  );
}
