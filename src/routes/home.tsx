import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '../components/shell/AppShell';
import { GuestPanel } from '../components/library/GuestPanel';
import { Library } from '../components/library/Library';
import { SignedOutPanel } from '../components/library/SignedOutPanel';
import { useAuthStore } from '../stores/authStore';

export const Route = createFileRoute('/home')({
  component: HomePage,
});

function HomePage() {
  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);

  const welcome = user ? `Welcome to SpeedRead, ${user.name.split(' ')[0]}!` : 'SpeedRead';

  return (
    <AppShell centerSlot={<span className="text-text-primary">{welcome}</span>}>
      {user ? <Library /> : isGuest ? <GuestPanel /> : <SignedOutPanel />}
    </AppShell>
  );
}
