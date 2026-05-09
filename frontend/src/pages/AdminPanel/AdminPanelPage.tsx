import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { adminApi } from '../../api/admin';

interface AdminEvent {
  id: string; title: string; status: string;
  organizer_name: string; category_name: string; start_at: string; created_at: string;
}
interface OrganizerReq {
  id: string; user_name: string; user_email: string; status: string; created_at: string;
}

export default function AdminPanelPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rejecting, setRejecting] = useState<{ id: string; note: string } | null>(null);
  const [actionError, setActionError] = useState('');
  const [orgError, setOrgError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-events', 'PENDING_REVIEW'],
    queryFn: () => adminApi.listEvents('PENDING_REVIEW').then(r => r.data),
    staleTime: 0,
  });

  const { data: allData } = useQuery({
    queryKey: ['admin-events-all'],
    queryFn: () => adminApi.listEvents().then(r => r.data),
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.listUsers().then(r => r.data),
  });

  const { data: orgReqData, isLoading: orgReqLoading } = useQuery({
    queryKey: ['admin-organizer-requests'],
    queryFn: () => adminApi.listOrganizerRequests('PENDING').then(r => r.data),
    staleTime: 0,
  });

  const pending: AdminEvent[] = data?.results ?? [];
  const orgRequests: OrganizerReq[] = orgReqData?.results ?? [];
  const liveEvents: AdminEvent[] = (allData?.results ?? []).filter((e: AdminEvent) => e.status === 'PUBLISHED');
  const liveCount = liveEvents.length;
  const userCount = usersData?.count ?? 0;

  const handleApprove = async (id: string) => {
    setActionError('');
    try {
      await adminApi.approveEvent(id);
    } catch {
      setActionError('Could not approve event. Please try again.');
    } finally {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['admin-events-all'] });
    }
  };

  const handleReject = async () => {
    if (!rejecting) return;
    if (!rejecting.note.trim() || rejecting.note.trim().length < 5) {
      setActionError('Rejection reason must be at least 5 characters.');
      return;
    }
    setActionError('');
    try {
      await adminApi.rejectEvent(rejecting.id, rejecting.note);
      setRejecting(null);
    } catch {
      setActionError('Could not reject event. Please try again.');
    } finally {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['admin-events-all'] });
    }
  };

  const handleOrgApprove = async (id: string) => {
    setOrgError('');
    try {
      await adminApi.approveOrganizerRequest(id);
    } catch {
      setOrgError('Could not approve request. Please try again.');
    } finally {
      queryClient.invalidateQueries({ queryKey: ['admin-organizer-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  };

  const handleOrgReject = async (id: string) => {
    setOrgError('');
    try {
      await adminApi.rejectOrganizerRequest(id);
    } catch {
      setOrgError('Could not reject request. Please try again.');
    } finally {
      queryClient.invalidateQueries({ queryKey: ['admin-organizer-requests'] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Review events and manage users</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Pending Review"      value={pending.length}      color="text-yellow-600" />
        <StatCard label="Live Events"         value={liveCount}           color="text-green-600" />
        <StatCard label="Total Users"         value={userCount}           color="text-blue-600" />
        <StatCard label="Organizer Requests"  value={orgRequests.length}  color="text-purple-600" />
      </div>

      {/* Organizer Requests */}
      {(orgRequests.length > 0 || orgReqLoading) && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <h2 className="font-semibold text-gray-900">Organizer Requests</h2>
            {orgRequests.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                {orgRequests.length}
              </span>
            )}
          </div>
          {orgReqLoading && <div className="py-8 flex justify-center"><Spinner size="md" /></div>}
          {orgError && (
            <div className="px-6 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">{orgError}</div>
          )}
          <ul className="divide-y divide-gray-100">
            {orgRequests.map(req => (
              <li key={req.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{req.user_name}</p>
                  <p className="text-sm text-gray-500">{req.user_email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Requested {format(new Date(req.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleOrgApprove(req.id)}
                    className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleOrgReject(req.id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {actionError && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Pending Review — shown when there are pending events */}
      {(isLoading || pending.length > 0) && (
        <div className="bg-white rounded-2xl border border-yellow-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-yellow-100 flex items-center gap-3">
            <h2 className="font-semibold text-gray-900">Pending Review</h2>
            {pending.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                {pending.length}
              </span>
            )}
          </div>

          {isLoading && <div className="py-12 flex justify-center"><Spinner size="md" /></div>}

          {!isLoading && (
            <ul className="divide-y divide-gray-100">
              {pending.map(event => (
                <li key={event.id} className="px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge>{event.category_name}</Badge>
                        <span className="text-xs text-gray-400">
                          Submitted {format(new Date(event.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/events/${event.id}`)}
                        className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-left"
                      >
                        {event.title}
                      </button>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {format(new Date(event.start_at), 'EEE, MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">by {event.organizer_name}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        onClick={() => navigate(`/admin/events/${event.id}`)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => handleApprove(event.id)}
                        className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setRejecting(r => r?.id === event.id ? null : { id: event.id, note: '' })}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {rejecting?.id === event.id && (
                    <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-4 space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        Reason for rejection (required, min 5 chars)
                      </label>
                      <textarea
                        rows={2}
                        value={rejecting.note}
                        onChange={e => setRejecting({ ...rejecting, note: e.target.value })}
                        placeholder="e.g. Missing required details..."
                        className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={handleReject} className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700">
                          Confirm Rejection
                        </button>
                        <button onClick={() => setRejecting(null)} className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Live Events — shown when no pending events */}
      {!isLoading && pending.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <h2 className="font-semibold text-gray-900">Live Events</h2>
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
              {liveCount}
            </span>
          </div>

          {liveEvents.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No live events at the moment.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {liveEvents.map(event => (
                <li key={event.id} className="px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="green">Live</Badge>
                        <Badge>{event.category_name}</Badge>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/events/${event.id}`)}
                        className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-left"
                      >
                        {event.title}
                      </button>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {format(new Date(event.start_at), 'EEE, MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">by {event.organizer_name}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/events/${event.id}`)}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
                    >
                      View
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center">
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}
