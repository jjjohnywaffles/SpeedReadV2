import { create } from 'zustand';

export const THEMES = ['terminal', 'soft', 'midnight'] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_LABELS: Record<Theme, string> = {
  terminal: 'Terminal',
  soft: 'Soft',
  midnight: 'Midnight',
};

export const THEME_DESCRIPTIONS: Record<Theme, string> = {
  terminal: 'Pure black, neon green accent. The original.',
  soft: 'Warm off-black with an amber glow.',
  midnight: 'Deep blue night with indigo highlights.',
};

const STORAGE_KEY = 'sr.theme';

function loadInitial(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && (THEMES as readonly string[]).includes(v)) return v as Theme;
  } catch {
    // ignore
  }
  return 'terminal';
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const initial = loadInitial();
  applyTheme(initial);
  return {
    theme: initial,
    setTheme: (theme) => {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        // ignore
      }
      applyTheme(theme);
      set({ theme });
    },
  };
});
