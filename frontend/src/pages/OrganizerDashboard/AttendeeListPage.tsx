import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { ticketsApi } from '../../api/tickets';
import { eventsApi } from '../../api/events';
import { apiClient } from '../../api/client';

interface Attendee {
  id: string;
  name: string;
  email: string;
  tier_name: string;
  quantity: number;
  created_at: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  checked_in: boolean;
}

export default function AttendeeListPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    if (!id) return;
    setIsExporting(true);
    try {
      const res = await apiClient.get(`/tickets/events/${id}/attendees/export/`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendees-${event?.title ?? id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }

  const { data: event } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getById(id!).then(r => r.data),
    enabled: !!id,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['attendees', id],
    queryFn: () => ticketsApi.listAttendees(id!, 1).then(r => r.data),
    enabled: !!id,
  });

  const attendees: Attendee[] = data?.results ?? [];
  const confirmed = attendees.filter(a => a.status === 'CONFIRMED').length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return attendees;
    return attendees.filter(a =>
      a.name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q)
    );
  }, [search, attendees]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
      >
        <BackIcon /> Back to Dashboard
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {event?.title ?? 'Attendees'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {confirmed} confirmed · {attendees.length - confirmed} other
        </p>
      </div>

      {attendees.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Registration fill</span>
            <span>{confirmed} / {event?.capacity ?? attendees.length}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{
                width: event?.capacity
                  ? `${Math.min((confirmed / event.capacity) * 100, 100)}%`
                  : '0%',
              }}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="relative w-full max-w-xs">
            <SearchIcon />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              aria-label="Search attendees"
              className="w-full rounded-lg border border-gray-300 py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-gray-400">{filtered.length} results</span>
            <button
              onClick={handleExport}
              disabled={isExporting || attendees.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <DownloadIcon />
              {isExporting ? 'Exporting…' : 'Export CSV'}
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="py-12 flex justify-center">
            <Spinner size="md" />
          </div>
        )}

        {isError && (
          <div className="py-8 text-center text-sm text-red-500">
            Failed to load attendees.
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-400">
            {search ? 'No attendees match your search.' : 'No attendees yet.'}
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Registered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {a.name ?? '—'}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {a.email ?? '—'}
                    </td>
                    <td className="px-6 py-3 text-gray-500 hidden sm:table-cell whitespace-nowrap">
                      {format(new Date(a.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={
                        a.status === 'CONFIRMED' ? 'green' :
                        a.status === 'CANCELLED' ? 'red' : 'yellow'
                      }>
                        {a.status === 'CONFIRMED' ? 'Confirmed' :
                         a.status === 'CANCELLED' ? 'Cancelled' : 'Pending'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
