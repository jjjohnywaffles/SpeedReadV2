import { create } from 'zustand';

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

export const useAuthStore = create<AuthState>((set) => ({
  ...loadInitialState(),

  signIn: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.removeItem(GUEST_KEY);
    set({ token, user, isGuest: false });
  },

  signOut: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(GUEST_KEY);
    set({ token: null, user: null, isGuest: false });
  },

  continueAsGuest: () => {
    localStorage.setItem(GUEST_KEY, '1');
    set({ token: null, user: null, isGuest: true });
  },
}));
