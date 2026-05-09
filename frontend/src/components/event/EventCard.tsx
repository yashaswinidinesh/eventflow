import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Badge from '../ui/Badge';

interface Event {
  id: string;
  title: string;
  category: string;
  start_at: string;
  venue_name: string;
  address: string;
  is_online: boolean;
  cover_image: string;
  organizer: { name: string };
}

export default function EventCard({ event }: { event: Event }) {
  const date = format(new Date(event.start_at), 'EEE, MMM d · h:mm a');
  const location = event.is_online ? 'Online' : event.venue_name || event.address;

  return (
    <Link
      to={`/events/${event.id}`}
      className="group block bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden rounded-t-2xl">
        {event.cover_image
          ? <img src={event.cover_image} alt={event.title} className="h-full w-full object-cover" />
          : <span className="text-4xl">{categoryEmoji(event.category)}</span>
        }
      </div>
      <div className="p-4 space-y-2">
        <Badge>{event.category}</Badge>
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CalendarIcon />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
          <LocationIcon />
          <span className="truncate">{location}</span>
        </div>
        <p className="text-xs text-gray-400">by {event.organizer.name}</p>
      </div>
    </Link>
  );
}

function categoryEmoji(cat: string) {
  const map: Record<string, string> = {
    Technology: '💻', Music: '🎵', 'Food & Drink': '🍔', Arts: '🎨',
    Sports: '🏆', Business: '💼', Health: '❤️', Education: '📚',
    Networking: '🤝', Community: '🏠',
  };
  return map[cat] ?? '📅';
}

function CalendarIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
