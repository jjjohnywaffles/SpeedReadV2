import { create } from 'zustand';
import type { DocumentSourceType } from '../types/api';

export type DocumentLocation = { type: 'guest' } | { type: 'stored'; fileId: string };

interface DocumentState {
  fileName: string | null;
  source: DocumentSourceType | null;
  location: DocumentLocation | null;
  pages: string[][];
  numPages: number;
  setParsed: (args: {
    fileName: string;
    source: DocumentSourceType;
    pages: string[][];
    location: DocumentLocation;
  }) => void;
  clear: () => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  fileName: null,
  source: null,
  location: null,
  pages: [],
  numPages: 0,

  setParsed: ({ fileName, source, pages, location }) => {
    set({
      fileName,
      source,
      location,
      pages,
      numPages: pages.length,
    });
  },

  clear: () => {
    set({ fileName: null, source: null, location: null, pages: [], numPages: 0 });
  },
}));
