import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useFilesStore } from '../../stores/filesStore';

export function ProfileMenu() {
  const user = useAuthStore((s) => s.user);
  const signOutAuth = useAuthStore((s) => s.signOut);
  const clearFiles = useFilesStore((s) => s.clear);
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
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="block h-8 w-8 overflow-hidden rounded-full border border-border transition-opacity hover:opacity-80"
        title={user.email}
      >
        <img src={user.picture} alt={user.name} className="h-full w-full object-cover" />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-50 w-56 rounded-lg border border-border bg-bg-terminal py-2 font-mono text-xs shadow-lg">
          <div className="px-3 py-2 text-text-secondary">
            <div className="truncate text-text-primary">{user.name}</div>
            <div className="truncate text-text-muted">{user.email}</div>
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
