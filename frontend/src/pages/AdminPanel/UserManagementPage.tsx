import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { adminApi } from '../../api/admin';

type RoleFilter = 'All' | 'ATTENDEE' | 'ORGANIZER';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ATTENDEE' | 'ORGANIZER' | 'ADMIN';
  is_banned: boolean;
  is_active: boolean;
  created_at: string;
}

const TABS: { label: string; value: RoleFilter }[] = [
  { label: 'All', value: 'All' },
  { label: 'Attendees', value: 'ATTENDEE' },
  { label: 'Organizers', value: 'ORGANIZER' },
];

export default function UserManagementPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<RoleFilter>('All');
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.listUsers().then(r => r.data),
  });

  const allUsers: User[] = data?.results ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allUsers.filter(u => {
      const matchesTab    = tab === 'All' || u.role === tab;
      const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [allUsers, tab, search]);

  const handleToggle = async (user: User) => {
    const ban = !user.is_banned;
    setTogglingId(user.id);
    try {
      await adminApi.banUser(user.id, ban);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch {
      // silently fail
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 rounded">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-500">{allUsers.length} total users</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 pt-4 pb-3 border-b border-gray-100 space-y-3">
          <div className="flex gap-1" role="tablist">
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
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-gray-300 py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {isLoading && <div className="py-12 flex justify-center"><Spinner size="md" /></div>}

        {!isLoading && filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-400">No users match your search.</div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-3 text-gray-500 hidden sm:table-cell">{user.email}</td>
                    <td className="px-6 py-3">
                      <Badge variant={user.role === 'ORGANIZER' ? 'blue' : user.role === 'ADMIN' ? 'yellow' : 'gray'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={user.is_banned ? 'red' : 'green'}>
                        {user.is_banned ? 'Suspended' : 'Active'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-gray-400 hidden md:table-cell whitespace-nowrap">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggle(user)}
                          disabled={togglingId === user.id}
                          className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${
                            user.is_banned
                              ? 'border-green-200 text-green-700 hover:bg-green-50'
                              : 'border-red-200 text-red-600 hover:bg-red-50'
                          }`}
                        >
                          {user.is_banned ? 'Activate' : 'Suspend'}
                        </button>
                      )}
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
