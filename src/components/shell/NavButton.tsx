import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

interface Props {
  to: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
}

export function NavButton({ to, icon, label, active }: Props) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-md px-3 py-2 font-mono text-sm transition-colors ${
        active
          ? 'bg-bg-terminal text-accent'
          : 'text-text-secondary hover:bg-bg-terminal hover:text-text-primary'
      }`}
    >
      <span className="flex h-5 w-5 items-center justify-center">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
