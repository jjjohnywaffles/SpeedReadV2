import {
  THEMES,
  THEME_DESCRIPTIONS,
  THEME_LABELS,
  useThemeStore,
  type Theme,
} from '../../stores/themeStore';

export function ThemePicker() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {THEMES.map((t) => (
        <ThemeCard key={t} theme={t} active={theme === t} onSelect={() => setTheme(t)} />
      ))}
    </div>
  );
}

interface CardProps {
  theme: Theme;
  active: boolean;
  onSelect: () => void;
}

function ThemeCard({ theme, active, onSelect }: CardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      data-theme={theme}
      className={`group relative flex flex-col items-stretch gap-3 rounded-lg border p-4 text-left transition-colors ${
        active ? 'border-accent' : 'border-border hover:border-text-muted'
      }`}
      style={{ background: 'var(--color-bg-terminal)' }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm" style={{ color: 'var(--color-text-primary)' }}>
          {THEME_LABELS[theme]}
        </span>
        {active && (
          <span
            className="flex h-4 w-4 items-center justify-center rounded-full"
            style={{ background: 'var(--color-accent)' }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="black"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}
      </div>

      <div className="flex h-12 w-full overflow-hidden rounded-md">
        <div className="flex-1" style={{ background: 'var(--color-bg-primary)' }} />
        <div className="flex-1" style={{ background: 'var(--color-bg-terminal)' }} />
        <div className="flex-1" style={{ background: 'var(--color-bg-header)' }} />
        <div className="w-6" style={{ background: 'var(--color-accent)' }} />
      </div>

      <p className="font-mono text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
        {THEME_DESCRIPTIONS[theme]}
      </p>
    </button>
  );
}
