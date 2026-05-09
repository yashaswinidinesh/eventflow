import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface User { id: string; name: string; email: string; role: 'ATTENDEE' | 'ORGANIZER' | 'ADMIN'; }
interface AuthState { user: User | null; accessToken: string | null; refreshToken: string | null; setAuth: (user: User, access: string, refresh: string) => void; setAccessToken: (access: string) => void; logout: () => void; }
export const useAuthStore = create<AuthState>()(
  persist((set) => ({
    user: null, accessToken: null, refreshToken: null,
    setAuth: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),
    setAccessToken: (accessToken) => set({ accessToken }),
    logout: () => set({ user: null, accessToken: null, refreshToken: null }),
  }), { name: 'eventure-auth' })
);
