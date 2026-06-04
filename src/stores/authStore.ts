import { create } from 'zustand';
import { silentRefresh } from '../lib/googleAuth';
import { decodeGoogleJwt } from '../lib/jwt';

export interface UserProfile {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isGuest: boolean;
  signIn: (token: string, user: UserProfile) => void;
  signOut: () => void;
  continueAsGuest: () => void;
  refresh: () => Promise<string | null>;
}

const TOKEN_KEY = 'sr.auth.token';
const USER_KEY = 'sr.auth.user';
const GUEST_KEY = 'sr.auth.guest';

function loadInitialState(): Pick<AuthState, 'token' | 'user' | 'isGuest'> {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    const guest = localStorage.getItem(GUEST_KEY) === '1';
    if (token && userRaw) {
      return { token, user: JSON.parse(userRaw) as UserProfile, isGuest: false };
    }
    return { token: null, user: null, isGuest: guest };
  } catch {
    return { token: null, user: null, isGuest: false };
  }
}

function persist(token: string, user: UserProfile) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.removeItem(GUEST_KEY);
}

function clearPersisted() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(GUEST_KEY);
}

let refreshInFlight: Promise<string | null> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  ...loadInitialState(),

  signIn: (token, user) => {
    persist(token, user);
    set({ token, user, isGuest: false });
  },

  signOut: () => {
    clearPersisted();
    set({ token: null, user: null, isGuest: false });
  },

  continueAsGuest: () => {
    localStorage.setItem(GUEST_KEY, '1');
    set({ token: null, user: null, isGuest: true });
  },

  refresh: async () => {
    if (refreshInFlight) return refreshInFlight;
    refreshInFlight = (async () => {
      try {
        const token = await silentRefresh();
        const payload = decodeGoogleJwt(token);
        const user: UserProfile = {
          sub: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
        };
        persist(token, user);
        set({ token, user, isGuest: false });
        return token;
      } catch (err) {
        console.warn('[auth] silent refresh failed', err);
        if (get().user) {
          clearPersisted();
          set({ token: null, user: null, isGuest: false });
        }
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
    return refreshInFlight;
  },
}));
