import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { eventsApi } from '../../api/events';

type EventStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'CANCELLED';

interface OrgEvent {
  id: string;
  title: string;
  category: string;
  start_at: string;
  status: EventStatus;
  capacity: number;
  registered_count: number;
}

const STATUS_LABEL: Record<EventStatus, string> = {
  DRAFT:          'Draft',
  PENDING_REVIEW: 'Pending Review',
  PUBLISHED:      'Live',
  CANCELLED:      'Cancelled',
};

const STATUS_VARIANT: Record<EventStatus, 'gray' | 'yellow' | 'green' | 'red'> = {
  DRAFT:          'gray',
  PENDING_REVIEW: 'yellow',
  PUBLISHED:      'green',
  CANCELLED:      'red',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cancelError, setCancelError] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-events'],
    queryFn: () => eventsApi.myEvents().then(r => r.data),
  });

  const allEvents: OrgEvent[] = data?.results ?? [];
  const events = search.trim()
    ? allEvents.filter(e => e.title.toLowerCase().includes(search.toLowerCase()))
    : allEvents;

  const stats = {
    live:    allEvents.filter(e => e.status === 'PUBLISHED').length,
    pending: allEvents.filter(e => e.status === 'PENDING_REVIEW').length,
    rsvps:   allEvents.filter(e => e.status !== 'CANCELLED').reduce((sum, e) => sum + (e.registered_count ?? 0), 0),
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this event? All registered attendees will be notified by email. This cannot be undone.')) return;
    setCancelError('');
    try {
      await eventsApi.cancel(id);
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
    } catch {
      setCancelError('Could not cancel event. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizer Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your events and registrations</p>
        </div>
        <Link to="/events/create">
          <Button>Create Event</Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Live Events"    value={stats.live}    color="text-green-600" />
        <StatCard label="Pending Review" value={stats.pending} color="text-yellow-600" />
        <StatCard label="Total RSVPs"    value={stats.rsvps}   color="text-blue-600" />
      </div>

      {cancelError && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {cancelError}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <h2 className="font-semibold text-gray-900">Your Events</h2>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search events…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
            />
          </div>
        </div>

        {isLoading && (
          <div className="py-12 flex justify-center">
            <Spinner size="md" />
          </div>
        )}

        {isError && (
          <div className="py-8 text-center text-sm text-red-500">
            Failed to load events. Make sure the backend is running.
          </div>
        )}

        {!isLoading && !isError && events.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            {search.trim() ? (
              <>No events match "<span className="font-medium text-gray-600">{search}</span>".</>
            ) : (
              <>No events yet.{' '}<Link to="/events/create" className="text-blue-600 hover:underline">Create your first event.</Link></>
            )}
          </div>
        )}

        {!isLoading && !isError && events.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {events.map(event => (
              <li key={event.id} className="px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant={STATUS_VARIANT[event.status]}>
                        {STATUS_LABEL[event.status]}
                      </Badge>
                      {event.status === 'PENDING_REVIEW' && (
                        <span className="text-xs text-yellow-600">Awaiting admin approval</span>
                      )}
                    </div>
                    <p className="font-medium text-gray-900 truncate">{event.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {format(new Date(event.start_at), 'EEE, MMM d, yyyy · h:mm a')}
                      {' · '}{event.capacity} capacity
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {event.status !== 'DRAFT' && (
                      <button
                        onClick={() => navigate(`/dashboard/events/${event.id}/attendees`)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Attendees
                        {event.registered_count > 0 && (
                          <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                            {event.registered_count}
                          </span>
                        )}
                      </button>
                    )}
                    {event.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancel(event.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
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
