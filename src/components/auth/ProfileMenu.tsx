import { useEffect, useMemo, useRef, useState } from 'react';
import { formatBytes } from '../../lib/format';
import { useAuthStore } from '../../stores/authStore';
import { useFilesStore } from '../../stores/filesStore';
import { Tooltip } from '../ui/Tooltip';

const QUOTA_BYTES = 100 * 1024 * 1024;

export function ProfileMenu() {
  const user = useAuthStore((s) => s.user);
  const signOutAuth = useAuthStore((s) => s.signOut);
  const clearFiles = useFilesStore((s) => s.clear);
  const files = useFilesStore((s) => s.files);

  const usedBytes = useMemo(() => files.reduce((sum, f) => sum + f.sizeBytes, 0), [files]);
  const usedPct = Math.min(100, Math.round((usedBytes / QUOTA_BYTES) * 100));

  const signOut = () => {
    signOutAuth();
    clearFiles();
  };

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <Tooltip text={user.email} placement="bottom">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="block h-8 w-8 overflow-hidden rounded-full border border-border transition-opacity hover:opacity-80"
        >
          <img src={user.picture} alt={user.name} className="h-full w-full object-cover" />
        </button>
      </Tooltip>
      {open && (
        <div className="absolute right-0 top-10 z-50 w-64 rounded-lg border border-border bg-bg-terminal py-2 font-mono text-xs shadow-lg">
          <div className="px-3 py-2 text-text-secondary">
            <div className="truncate text-text-primary">{user.name}</div>
            <div className="truncate text-text-muted">{user.email}</div>
          </div>

          <div className="my-1 h-px bg-border" />

          <div className="px-3 py-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-text-muted">Storage</span>
              <span className="tabular-nums text-text-secondary">
                {formatBytes(usedBytes)} / {formatBytes(QUOTA_BYTES)}
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-bg-header">
              <div
                className={`h-full transition-all ${usedPct > 90 ? 'bg-warning' : 'bg-accent'}`}
                style={{ width: `${usedPct}%` }}
              />
            </div>
          </div>

          <div className="my-1 h-px bg-border" />

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="block w-full px-3 py-2 text-left text-text-secondary transition-colors hover:bg-bg-header hover:text-text-primary"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
