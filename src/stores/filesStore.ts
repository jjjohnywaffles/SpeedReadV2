import { create } from 'zustand';
import { listFiles } from '../lib/api';
import type { FileRecord } from '../types/api';

interface FilesState {
  files: FileRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  upsert: (file: FileRecord) => void;
  remove: (fileId: string) => void;
  updateProgress: (
    fileId: string,
    progress: { currentWordIndex: number; wpm: number; lastReadAt: number },
  ) => void;
  clear: () => void;
}

export const useFilesStore = create<FilesState>((set, get) => ({
  files: [],
  loading: true,
  error: null,

  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const { files } = await listFiles();
      set({ files, loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Failed to load files' });
    }
  },

  upsert: (file) => {
    const next = [file, ...get().files.filter((f) => f.fileId !== file.fileId)];
    set({ files: next });
  },

  remove: (fileId) => {
    set({ files: get().files.filter((f) => f.fileId !== fileId) });
  },

  updateProgress: (fileId, progress) => {
    set({
      files: get().files.map((f) => (f.fileId === fileId ? { ...f, progress } : f)),
    });
  },

  clear: () => set({ files: [], error: null }),
}));
