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

const HEADER_HEIGHT = 56;

export function AppShell({ centerSlot, children }: Props) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const user = useAuthStore((s) => s.user);

  return (
    <div className="relative flex h-screen w-full flex-col bg-bg-primary">
      <header
        className="relative z-30 flex shrink-0 items-center border-b border-border bg-bg-terminal px-4"
        style={{ height: HEADER_HEIGHT }}
      >
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

      <main className="flex-1 overflow-hidden">{children}</main>

      <button
        type="button"
        aria-label="Close sidebar"
        onClick={() => setSidebarOpen(false)}
        tabIndex={sidebarOpen ? 0 : -1}
        className={`absolute inset-0 z-40 cursor-default ${
          sidebarOpen ? '' : 'pointer-events-none'
        }`}
      />
      <div
        className={`absolute inset-y-0 left-0 z-50 transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!sidebarOpen}
      >
        <Sidebar topPadding={HEADER_HEIGHT} />
      </div>
    </div>
  );
}
