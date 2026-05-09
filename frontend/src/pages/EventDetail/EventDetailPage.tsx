import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEvent } from '../../hooks/useEvents';
import { useAuth } from '../../hooks/useAuth';
import { ticketsApi } from '../../api/tickets';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

function buildCalendarUrl(event: {
  title: string; description: string; start_at: string;
  end_at: string; venue_name?: string; address?: string;
}) {
  const fmt = (d: string) => new Date(d).toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${fmt(event.start_at)}/${fmt(event.end_at)}`,
    details: event.description?.slice(0, 500) ?? '',
    location: event.venue_name ?? event.address ?? '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { data: event, isLoading, isError } = useEvent(id ?? '');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const { data: myTickets } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: () => ticketsApi.myTickets().then(r => r.data),
    enabled: isAuthenticated,
  });

  const tickets: any[] = myTickets?.results ?? myTickets ?? [];
  const myRegistration = tickets.find(
    (t: any) => t.event_id === id && (t.status === 'CONFIRMED' || t.status === 'PENDING')
  );
  const alreadyRegistered = !!myRegistration;

  async function handleCancel() {
    if (!myRegistration) return;
    if (!window.confirm(`Cancel your registration for "${event?.title}"? This cannot be undone.`)) return;
    setIsCancelling(true);
    setCancelError('');
    try {
      await ticketsApi.cancel(myRegistration.id);
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
    } catch {
      setCancelError('Could not cancel. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-medium text-gray-700">Event not found</p>
        <button onClick={() => navigate('/')} className="mt-4 text-sm text-blue-600 hover:underline">
          Back to events
        </button>
      </div>
    );
  }

  const locationDisplay = event.is_online
    ? 'Online Event'
    : [event.venue_name, event.address].filter(Boolean).join(', ');

  const fillPct = event.capacity > 0
    ? Math.min((event.registered_count / event.capacity) * 100, 100)
    : 0;
  const isFull = event.registered_count >= event.capacity;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <BackIcon /> Back
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-700 flex items-end p-6">
          {event.cover_image
            ? <img src={event.cover_image} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
            : null}
          <Badge>{event.category}</Badge>
        </div>

        <div className="p-6 space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <CalendarIcon />
              <div>
                <p className="font-medium text-gray-900">
                  {format(new Date(event.start_at), 'EEEE, MMMM d, yyyy')}
                </p>
                <p>
                  {format(new Date(event.start_at), 'h:mm a')}
                  {' – '}
                  {format(new Date(event.end_at), 'h:mm a')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <LocationIcon />
              <div>
                {event.is_online ? (
                  <p className="font-medium text-blue-600">Online Event</p>
                ) : (
                  <>
                    <p className="font-medium text-gray-900">{event.venue_name}</p>
                    {event.address && <p>{event.address}</p>}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <PersonIcon />
            <span>
              Organized by{' '}
              <span className="font-medium text-gray-700">{event.organizer?.name}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-3">About this event</h2>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {event.description}
        </p>
      </div>

      {/* Schedule slots */}
      {event.schedule_slots?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Schedule</h2>
          <ul className="space-y-3">
            {event.schedule_slots.map((slot: any) => (
              <li key={slot.id} className="flex gap-4 text-sm">
                <div className="w-28 shrink-0 text-gray-400">
                  {format(new Date(slot.starts_at), 'h:mm a')}
                  {' – '}
                  {format(new Date(slot.ends_at), 'h:mm a')}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{slot.title}</p>
                  {slot.speaker && <p className="text-gray-500">{slot.speaker}</p>}
                  {slot.description && <p className="text-gray-400 mt-0.5">{slot.description}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Map */}
      {!event.is_online && locationDisplay && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Location</h2>
          <p className="text-sm text-gray-600 mb-3">{locationDisplay}</p>
          <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent(locationDisplay)}&output=embed`}
            className="w-full h-48 rounded-xl border border-gray-100"
            loading="lazy"
            title="Event location map"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      {/* Register + Calendar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Capacity</span>
          <span className="text-sm text-gray-500">
            {event.registered_count ?? 0} / {event.capacity} registered
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-5">
          <div
            className={`h-full rounded-full transition-all ${isFull ? 'bg-red-400' : 'bg-blue-500'}`}
            style={{ width: `${fillPct}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {alreadyRegistered ? (
            <>
              <Button fullWidth variant="secondary" onClick={() => navigate('/my-tickets')}>
                Already Registered — View Ticket
              </Button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 w-full sm:w-auto"
              >
                {isCancelling ? 'Cancelling…' : 'Cancel RSVP'}
              </button>
            </>
          ) : (
            <Button
              fullWidth
              disabled={isFull}
              onClick={() => navigate(`/events/${event.id}/checkout`)}
            >
              {isFull ? 'Event Full' : 'Register Now'}
            </Button>
          )}
          <a
            href={buildCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 w-full sm:w-auto"
          >
            <CalendarIcon /> Add to Calendar
          </a>
        </div>

        {cancelError && (
          <p className="mt-3 text-center text-sm text-red-600">{cancelError}</p>
        )}
        {isFull && !alreadyRegistered && (
          <p className="mt-3 text-center text-sm text-red-600">
            This event has reached full capacity.
          </p>
        )}
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function LocationIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
