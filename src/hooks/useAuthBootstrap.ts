import { useEffect } from 'react';
import { msUntilExpiry } from '../lib/jwt';
import { useAuthStore } from '../stores/authStore';
import { useFilesStore } from '../stores/filesStore';

const REFRESH_LEAD_MS = 5 * 60 * 1000;
const MIN_DELAY_MS = 1000;

export function useAuthBootstrap() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const refresh = useAuthStore((s) => s.refresh);
  const refreshFiles = useFilesStore((s) => s.refresh);
  const clearFiles = useFilesStore((s) => s.clear);

  useEffect(() => {
    if (!token) return;

    const remaining = msUntilExpiry(token);

    if (remaining <= 0) {
      void refresh();
      return;
    }

    const delay = Math.max(MIN_DELAY_MS, remaining - REFRESH_LEAD_MS);
    const timer = setTimeout(() => {
      void refresh();
    }, delay);

    return () => clearTimeout(timer);
  }, [token, refresh]);

  useEffect(() => {
    if (user) {
      void refreshFiles();
    } else {
      clearFiles();
    }
  }, [user, refreshFiles, clearFiles]);
}
