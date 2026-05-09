import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ticketsApi } from '../../api/tickets';
import { eventsApi } from '../../api/events';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

interface Tier {
  id: string;
  name: string;
  price: string;
  available: number;
  is_free: boolean;
  is_on_sale: boolean;
}

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTierId, setSelectedTierId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getById(id!).then(r => r.data),
    enabled: !!id,
  });

  const { data: tiersData, isLoading: tiersLoading } = useQuery({
    queryKey: ['tiers', id],
    queryFn: () => ticketsApi.listTiers(id!).then(r => r.data),
    enabled: !!id,
  });

  const tiers: Tier[] = Array.isArray(tiersData) ? tiersData : (tiersData?.results ?? []);

  const isLoading = eventLoading || tiersLoading;

  const handleRegister = async () => {
    if (!selectedTierId) { setServerError('Please select a ticket type.'); return; }
    setServerError('');
    setSubmitting(true);
    try {
      await ticketsApi.register(id!, { tier_id: selectedTierId, quantity: 1 });
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      setSuccess(true);
    } catch (err: any) {
      const code = err?.response?.data?.error?.code;
      if (code === 'CAPACITY_EXCEEDED') setServerError('Sorry, this ticket tier is sold out.');
      else if (code === 'SALES_CLOSED') setServerError('Ticket sales have ended for this tier.');
      else setServerError('Could not complete registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <div className="py-24 flex justify-center"><Spinner size="lg" /></div>;

  if (!event) return (
    <div className="py-16 text-center">
      <p className="text-gray-500">Event not found.</p>
      <Link to="/" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Browse events</Link>
    </div>
  );

  if (success) return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">You're registered!</h2>
        <p className="mt-2 text-sm text-gray-500">Your ticket has been confirmed for <span className="font-medium text-gray-700">{event.title}</span></p>
        <div className="mt-6 flex flex-col gap-2">
          <Link to="/my-tickets"><Button fullWidth>View My Tickets</Button></Link>
          <Link to="/"><Button fullWidth variant="outline">Browse More Events</Button></Link>
        </div>
      </div>
    </div>
  );

  const locationDisplay = event.is_online ? 'Online Event' : [event.venue_name, event.address].filter(Boolean).join(', ');

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 rounded">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back
      </button>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <p className="text-xs font-medium text-blue-500 uppercase tracking-wide">Registering for</p>
        <p className="mt-1 font-semibold text-gray-900">{event.title}</p>
        <p className="mt-0.5 text-sm text-gray-500">
          {format(new Date(event.start_at), 'EEE, MMM d, yyyy · h:mm a')} · {locationDisplay}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h1 className="text-lg font-semibold text-gray-900">Select Ticket Type</h1>

        {tiers.length === 0 ? (
          <p className="text-sm text-gray-500">No ticket tiers available for this event yet.</p>
        ) : (
          <div className="space-y-2">
            {tiers.map(tier => (
              <button
                key={tier.id}
                type="button"
                disabled={!tier.is_on_sale || tier.available === 0}
                onClick={() => setSelectedTierId(tier.id)}
                className={`w-full text-left rounded-xl border p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed ${
                  selectedTierId === tier.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{tier.name}</span>
                  <span className="font-semibold text-gray-900">
                    {tier.is_free ? 'Free' : `$${parseFloat(tier.price).toFixed(2)}`}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-400">
                  {tier.available > 0 ? `${tier.available} spots left` : 'Sold out'}
                </p>
              </button>
            ))}
          </div>
        )}

        {serverError && (
          <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        {tiers.length > 0 && (
          <Button fullWidth loading={submitting} onClick={handleRegister} disabled={!selectedTierId}>
            Confirm Registration
          </Button>
        )}
      </div>
    </div>
  );
}
