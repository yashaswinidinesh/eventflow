import { useState } from 'react';
import { useEvents } from '../../hooks/useEvents';
import EventCard from '../../components/event/EventCard';
import EventFilters from '../../components/event/EventFilters';
import Spinner from '../../components/ui/Spinner';

export default function DiscoveryPage() {
  const [filters, setFilters] = useState({ search: '', category: '' });

  const { data, isLoading, isError } = useEvents({
    search: filters.search || undefined,
    category: filters.category || undefined,
  });

  const events = data?.results ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Discover Events</h1>
        <p className="mt-1 text-gray-500">Find events happening around you</p>
      </div>

      <EventFilters filters={filters} onChange={setFilters} />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {isError && (
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-600">
          Failed to load events. Make sure the backend is running.
        </div>
      )}

      {!isLoading && !isError && events.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg font-medium text-gray-700">No events found</p>
          <p className="mt-1 text-sm text-gray-400">Try adjusting your search or selecting a different category</p>
        </div>
      )}

      {!isLoading && !isError && events.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((event: any) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {data && (
        <p className="text-center text-sm text-gray-400">
          {data.count} event{data.count !== 1 ? 's' : ''} found
        </p>
      )}
    </div>
  );
}
