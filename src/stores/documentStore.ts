import { create } from 'zustand';
import { getPageText, loadPdf, type PdfDocument } from '../lib/pdf';

interface DocumentState {
  fileName: string | null;
  doc: PdfDocument | null;
  numPages: number;
  pageWordsCache: Map<number, string[]>;
  loadFile: (file: File) => Promise<void>;
  getPageWords: (pageNumber: number) => Promise<string[]>;
  clear: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  fileName: null,
  doc: null,
  numPages: 0,
  pageWordsCache: new Map(),

  loadFile: async (file) => {
    const doc = await loadPdf(file);
    set({
      fileName: file.name,
      doc,
      numPages: doc.numPages,
      pageWordsCache: new Map(),
    });
  },

  getPageWords: async (pageNumber) => {
    const { doc, pageWordsCache } = get();
    if (!doc) throw new Error('No document loaded');
    const cached = pageWordsCache.get(pageNumber);
    if (cached) return cached;

    const { words } = await getPageText(doc, pageNumber);
    const nextCache = new Map(pageWordsCache);
    nextCache.set(pageNumber, words);
    set({ pageWordsCache: nextCache });
    return words;
  },

  clear: () => {
    set({ fileName: null, doc: null, numPages: 0, pageWordsCache: new Map() });
  },
}));
