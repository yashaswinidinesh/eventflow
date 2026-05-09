import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { adminApi } from '../../api/admin';

type StatusFilter = 'All' | 'PUBLISHED' | 'PENDING_REVIEW' | 'CANCELLED' | 'DRAFT';

interface AdminEvent {
  id: string;
  title: string;
  status: string;
  organizer_name: string;
  category_name: string;
  start_at: string;
  created_at: string;
}

const TABS: { label: string; value: StatusFilter }[] = [
  { label: 'All',     value: 'All' },
  { label: 'Live',    value: 'PUBLISHED' },
  { label: 'Pending', value: 'PENDING_REVIEW' },
  { label: 'Draft',   value: 'DRAFT' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const STATUS_VARIANT: Record<string, 'green' | 'yellow' | 'gray' | 'red'> = {
  PUBLISHED:      'green',
  PENDING_REVIEW: 'yellow',
  DRAFT:          'gray',
  CANCELLED:      'red',
};
const STATUS_LABEL: Record<string, string> = {
  PUBLISHED:      'Live',
  PENDING_REVIEW: 'Pending Review',
  DRAFT:          'Draft',
  CANCELLED:      'Cancelled',
};

export default function EventManagementPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<StatusFilter>('All');
  const [search, setSearch] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-all-events'],
    queryFn: () => adminApi.listEvents().then(r => r.data),
  });

  const allEvents: AdminEvent[] = data?.results ?? [];

  const now = new Date();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allEvents.filter(e => {
      const matchesTab =
        tab === 'All' ||
        (tab === 'PUBLISHED'
          ? e.status === 'PUBLISHED' && new Date(e.start_at) >= now
          : e.status === tab);
      const matchesSearch = !q || e.title.toLowerCase().includes(q) || e.organizer_name?.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [allEvents, tab, search]);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this event? Attendees will no longer be able to register.')) return;
    setError('');
    setCancellingId(id);
    try {
      await adminApi.cancelEvent(id);
      queryClient.invalidateQueries({ queryKey: ['admin-all-events'] });
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    } catch (err: any) {
      const data = err?.response?.data;
      let msg = 'Could not cancel event. Please try again.';
      if (typeof data === 'string') msg = data;
      else if (data?.error && typeof data.error === 'string') msg = data.error;
      else if (data?.message && typeof data.message === 'string') msg = data.message;
      else if (data?.detail && typeof data.detail === 'string') msg = data.detail;
      else if (err?.response?.status) msg = `Server error ${err.response.status}. Please try again.`;
      setError(msg);
    } finally {
      setCancellingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Permanently delete this event? This cannot be undone.')) return;
    setError('');
    setDeletingId(id);
    try {
      await adminApi.deleteEvent(id);
      queryClient.invalidateQueries({ queryKey: ['admin-all-events'] });
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    } catch (err: any) {
      const data = err?.response?.data;
      const msg = (typeof data === 'string' ? data : data?.error ?? data?.message ?? data?.detail ?? 'Could not delete event.');
      setError(typeof msg === 'string' ? msg : 'Could not delete event.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 rounded">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
        <p className="mt-1 text-sm text-gray-500">{allEvents.length} total events</p>
      </div>

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 pt-4 pb-3 border-b border-gray-100 space-y-3">
          <div className="flex gap-1 flex-wrap" role="tablist">
            {TABS.map(t => (
              <button key={t.value} role="tab" aria-selected={tab === t.value} onClick={() => setTab(t.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${tab === t.value ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative max-w-xs">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or organizer..."
              className="w-full rounded-lg border border-gray-300 py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {isLoading && <div className="py-12 flex justify-center"><Spinner size="md" /></div>}

        {!isLoading && filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-400">No events found.</div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Organizer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(event => {
                  const isPast = event.status === 'PUBLISHED' && new Date(event.start_at) < now;
                  const badgeVariant = isPast ? 'gray' : (STATUS_VARIANT[event.status] ?? 'gray');
                  const badgeLabel   = isPast ? 'Completed' : (STATUS_LABEL[event.status] ?? event.status);
                  return (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-400">{event.category_name}</p>
                    </td>
                    <td className="px-6 py-3 text-gray-500 hidden sm:table-cell">{event.organizer_name}</td>
                    <td className="px-6 py-3 text-gray-400 hidden md:table-cell whitespace-nowrap">
                      {format(new Date(event.start_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={badgeVariant}>
                        {badgeLabel}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {event.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleCancel(event.id)}
                            disabled={cancellingId === event.id}
                            className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                          >
                            {cancellingId === event.id ? 'Cancelling…' : 'Cancel'}
                          </button>
                        )}
                        {event.status === 'CANCELLED' && (
                          <button
                            onClick={() => handleDelete(event.id)}
                            disabled={deletingId === event.id}
                            className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                          >
                            {deletingId === event.id ? 'Deleting…' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
