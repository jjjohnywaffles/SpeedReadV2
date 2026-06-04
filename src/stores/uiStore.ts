import { create } from 'zustand';

const SIDEBAR_KEY = 'sr.ui.sidebarOpen';
const VIEW_KEY = 'sr.ui.libraryView';
const SORT_KEY = 'sr.ui.librarySort';

export type LibraryView = 'grid' | 'list';
export type LibrarySort =
  | 'lastOpened'
  | 'name'
  | 'uploadedAt'
  | 'sizeDesc'
  | 'progressDesc'
  | 'progressAsc';

export const LIBRARY_SORT_LABELS: Record<LibrarySort, string> = {
  lastOpened: 'Last opened',
  name: 'Name',
  uploadedAt: 'Date uploaded',
  sizeDesc: 'Largest first',
  progressDesc: 'Most read',
  progressAsc: 'Least read',
};

interface UiState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  libraryView: LibraryView;
  setLibraryView: (view: LibraryView) => void;
  librarySort: LibrarySort;
  setLibrarySort: (sort: LibrarySort) => void;
}

function loadSidebar(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === '1';
  } catch {
    return false;
  }
}

function loadView(): LibraryView {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    if (v === 'grid' || v === 'list') return v;
  } catch {
    // ignore
  }
  return 'grid';
}

function loadSort(): LibrarySort {
  try {
    const v = localStorage.getItem(SORT_KEY);
    if (v && v in LIBRARY_SORT_LABELS) return v as LibrarySort;
  } catch {
    // ignore
  }
  return 'lastOpened';
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
  libraryView: loadView(),
  setLibraryView: (view) => {
    localStorage.setItem(VIEW_KEY, view);
    set({ libraryView: view });
  },
  librarySort: loadSort(),
  setLibrarySort: (sort) => {
    localStorage.setItem(SORT_KEY, sort);
    set({ librarySort: sort });
  },
}));
