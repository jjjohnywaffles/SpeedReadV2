import type { ReactNode } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { ProfileMenu } from '../auth/ProfileMenu';
import { SignInButton } from '../auth/SignInButton';
import { Sidebar } from './Sidebar';

interface Props {
  centerSlot?: ReactNode;
  children: ReactNode;
}

export function AppShell({ centerSlot, children }: Props) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex h-screen w-full flex-col bg-bg-primary">
      <header className="relative flex h-14 shrink-0 items-center border-b border-border px-4">
        <div className="flex flex-1 items-center">
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-md p-2 text-text-secondary transition-colors hover:bg-bg-terminal hover:text-text-primary"
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            aria-label="Toggle sidebar"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 truncate font-mono text-sm text-text-secondary">
          {centerSlot}
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          {user ? <ProfileMenu /> : <SignInButton />}
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden">
        {sidebarOpen && (
          <>
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 z-10 cursor-default bg-transparent"
            />
            <div className="absolute left-0 top-0 z-20 h-full">
              <Sidebar />
            </div>
          </>
        )}
        <main className="h-full overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
