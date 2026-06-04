import { useRouterState } from '@tanstack/react-router';
import { NavButton } from './NavButton';

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-bg-primary p-3">
      <nav className="flex flex-col gap-1">
        <NavButton
          to="/home"
          label="Library"
          active={pathname === '/home' || pathname.startsWith('/read')}
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          }
        />
      </nav>
    </aside>
  );
}
