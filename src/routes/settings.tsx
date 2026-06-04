import { createFileRoute } from '@tanstack/react-router';
import { ThemePicker } from '../components/settings/ThemePicker';
import { AppShell } from '../components/shell/AppShell';
import { useAuthStore } from '../stores/authStore';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <AppShell centerSlot={<span className="text-text-primary">Settings</span>}>
      <div className="custom-scrollbar h-full overflow-y-auto px-6 py-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          <Section title="Appearance" description="Pick your theme. Stored on this device.">
            <ThemePicker />
          </Section>

          <Section
            title="Account"
            description={
              user
                ? `Signed in as ${user.email}.`
                : 'Sign in to sync settings and access your library.'
            }
          >
            <p className="font-mono text-xs text-text-muted">
              More account preferences coming soon.
            </p>
          </Section>
        </div>
      </div>
    </AppShell>
  );
}

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function Section({ title, description, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-mono text-lg text-text-primary">{title}</h2>
        {description && <p className="font-mono text-xs text-text-secondary">{description}</p>}
      </div>
      {children}
    </section>
  );
}
