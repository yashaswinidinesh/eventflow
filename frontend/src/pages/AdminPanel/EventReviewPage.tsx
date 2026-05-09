import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { adminApi } from '../../api/admin';
import { eventsApi } from '../../api/events';

export default function EventReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getById(id!).then(r => r.data),
    enabled: !!id,
  });

  if (isLoading) return <div className="py-24 flex justify-center"><Spinner size="lg" /></div>;

  if (!event) return (
    <div className="py-16 text-center text-gray-500">
      <p>Event not found.</p>
      <button onClick={() => navigate('/admin')} className="mt-4 text-sm text-blue-600 hover:underline">Back to dashboard</button>
    </div>
  );

  const handleApprove = async () => {
    setError(''); setSubmitting('approve');
    try {
      await adminApi.approveEvent(event.id);
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      navigate('/admin');
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Could not approve event.');
      setSubmitting(null);
    }
  };

  const handleReject = async () => {
    if (!note.trim() || note.trim().length < 5) { setError('Rejection reason must be at least 5 characters.'); return; }
    setError(''); setSubmitting('reject');
    try {
      await adminApi.rejectEvent(event.id, note);
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      navigate('/admin');
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Could not reject event.');
      setSubmitting(null);
    }
  };

  const locationDisplay = event.is_online ? 'Online Event' : [event.venue_name, event.address].filter(Boolean).join(', ');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate('/admin')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 rounded">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </button>

      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">Review Event</h1>
        <Badge variant={
          event.status === 'PUBLISHED' ? 'green' :
          event.status === 'CANCELLED' ? 'red' :
          event.status === 'PENDING_REVIEW' ? 'yellow' : 'gray'
        }>
          {event.status === 'PUBLISHED' ? 'Published' :
           event.status === 'CANCELLED' ? 'Cancelled' :
           event.status === 'PENDING_REVIEW' ? 'Pending Review' : 'Draft'}
        </Badge>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <Badge>{event.category}</Badge>
        <h2 className="text-xl font-semibold text-gray-900">{event.title}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-medium text-gray-900">{format(new Date(event.start_at), 'EEEE, MMMM d, yyyy')}</p>
            <p>{format(new Date(event.start_at), 'h:mm a')} – {format(new Date(event.end_at), 'h:mm a')}</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">{locationDisplay}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Organizer</p>
            <p className="font-medium text-gray-900">{event.organizer?.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Capacity</p>
            <p className="font-medium text-gray-900">{event.capacity}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
        </div>
      </div>

      {event.status === 'PENDING_REVIEW' ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Admin Decision</h3>

          {error && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="admin-note" className="text-sm font-medium text-gray-700">
              Rejection reason (required if rejecting, min 5 chars)
            </label>
            <textarea
              id="admin-note" rows={3} value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Any notes for the organizer..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleApprove} loading={submitting === 'approve'} disabled={!!submitting} fullWidth
              className="bg-green-600 hover:bg-green-700 focus-visible:ring-green-500">
              Approve Event
            </Button>
            <Button variant="outline" onClick={handleReject} loading={submitting === 'reject'} disabled={!!submitting} fullWidth
              className="border-red-300 text-red-600 hover:bg-red-50">
              Reject Event
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 text-center text-sm text-gray-500">
          This event has already been <span className="font-medium text-gray-700">{event.status.toLowerCase().replace('_', ' ')}</span> and cannot be reviewed again.
        </div>
      )}
    </div>
  );
}
