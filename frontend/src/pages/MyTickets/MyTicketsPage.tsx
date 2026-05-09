import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { ticketsApi } from '../../api/tickets';

interface Registration {
  id: string;
  event_id: string;
  event_title: string;
  event_start: string;
  tier_name: string;
  is_free: boolean;
  quantity: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  checked_in: boolean;
  created_at: string;
}

type TabKey = 'ALL' | 'CONFIRMED' | 'CANCELLED';

export default function MyTicketsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: () => ticketsApi.myTickets().then(r => r.data),
  });

  const tickets: Registration[] = data?.results ?? [];
  const counts = {
    ALL: tickets.length,
    CONFIRMED: tickets.filter(t => t.status === 'CONFIRMED').length,
    CANCELLED: tickets.filter(t => t.status === 'CANCELLED').length,
  };
  const visibleTickets = activeTab === 'ALL' ? tickets : tickets.filter(t => t.status === activeTab);

  async function handleCancel(ticket: Registration) {
    if (!window.confirm(`Cancel your registration for "${ticket.event_title}"? This cannot be undone.`)) return;
    setCancellingId(ticket.id);
    setErrorId(null);
    try {
      await ticketsApi.cancel(ticket.id);
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['event', ticket.event_id] });
    } catch {
      setErrorId(ticket.id);
    } finally {
      setCancellingId(null);
    }
  }

  if (isLoading) return <div className="py-24 flex justify-center"><Spinner size="lg" /></div>;

  if (isError) return (
    <div className="py-16 text-center text-sm text-red-500">Failed to load tickets.</div>
  );

  if (tickets.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-medium text-gray-700">No tickets yet</p>
        <p className="mt-1 text-sm text-gray-400">Register for an event to see your tickets here</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
          Browse Events
        </Link>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  const emptyMessages: Record<TabKey, string> = {
    ALL: 'No tickets yet.',
    CONFIRMED: 'No confirmed tickets.',
    CANCELLED: 'No cancelled tickets.',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
        <p className="mt-1 text-sm text-gray-500">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              activeTab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
            <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
              activeTab === key ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
            }`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {visibleTickets.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">{emptyMessages[activeTab]}</p>
      ) : (
      <div className="space-y-4">
        {visibleTickets.map((ticket) => (
          <div
            key={ticket.id}
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
              ticket.status === 'CANCELLED' ? 'border-gray-200 opacity-60' : 'border-gray-200'
            }`}
          >
            <div className={`h-1.5 ${ticket.status === 'CANCELLED' ? 'bg-gray-300' : ticket.status === 'CONFIRMED' ? 'bg-blue-500' : 'bg-yellow-400'}`} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant={ticket.status === 'CONFIRMED' ? 'green' : ticket.status === 'CANCELLED' ? 'red' : 'yellow'}>
                      {ticket.status === 'CONFIRMED' ? 'Confirmed' : ticket.status === 'CANCELLED' ? 'Cancelled' : 'Pending'}
                    </Badge>
                    <span className="text-xs text-gray-400">{ticket.tier_name} · Qty {ticket.quantity}</span>
                    {ticket.checked_in && (
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Checked In</span>
                    )}
                  </div>
                  <Link
                    to={`/events/${ticket.event_id}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {ticket.event_title}
                  </Link>
                  <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                    <CalendarIcon />
                    <span>{format(new Date(ticket.event_start), 'EEE, MMM d, yyyy · h:mm a')}</span>
                  </div>
                  {errorId === ticket.id && (
                    <p className="mt-2 text-xs text-red-500">Could not cancel. Please try again.</p>
                  )}
                </div>

                {ticket.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleCancel(ticket)}
                    disabled={cancellingId === ticket.id}
                    className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  >
                    {cancellingId === ticket.id ? 'Cancelling…' : 'Cancel RSVP'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
