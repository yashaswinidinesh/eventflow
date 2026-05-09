const CATEGORIES = [
  'Technology', 'Music', 'Food & Drink', 'Arts', 'Sports',
  'Business', 'Health', 'Education', 'Networking', 'Community',
];

interface Filters {
  search: string;
  category: string;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

export default function EventFilters({ filters, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <SearchIcon />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search events by name or location..."
          aria-label="Search events"
          className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by category">
        <button
          onClick={() => onChange({ ...filters, category: '' })}
          aria-pressed={!filters.category}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            !filters.category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange({ ...filters, category: filters.category === cat ? '' : cat })}
            aria-pressed={filters.category === cat}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              filters.category === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
      fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
