import { create } from 'zustand';

const SIDEBAR_KEY = 'sr.ui.sidebarOpen';

interface UiState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

function loadSidebar(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === '1';
  } catch {
    return false;
  }
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarOpen: loadSidebar(),
  toggleSidebar: () => {
    const next = !get().sidebarOpen;
    localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0');
    set({ sidebarOpen: next });
  },
  setSidebarOpen: (open) => {
    localStorage.setItem(SIDEBAR_KEY, open ? '1' : '0');
    set({ sidebarOpen: open });
  },
}));
