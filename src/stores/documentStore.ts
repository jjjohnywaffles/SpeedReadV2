import { create } from 'zustand';
import { getPageText, loadPdf, type PdfDocument } from '../lib/pdf';

export type DocumentSource = { type: 'guest' } | { type: 'stored'; fileId: string };

interface DocumentState {
  fileName: string | null;
  doc: PdfDocument | null;
  numPages: number;
  source: DocumentSource | null;
  pageWordsCache: Map<number, string[]>;
  loadFile: (file: File, source: DocumentSource) => Promise<void>;
  loadFromBuffer: (bytes: ArrayBuffer, fileName: string, source: DocumentSource) => Promise<void>;
  getPageWords: (pageNumber: number) => Promise<string[]>;
  clear: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  fileName: null,
  doc: null,
  numPages: 0,
  source: null,
  pageWordsCache: new Map(),

  loadFile: async (file, source) => {
    const doc = await loadPdf(file);
    set({
      fileName: file.name,
      doc,
      numPages: doc.numPages,
      source,
      pageWordsCache: new Map(),
    });
  },

  loadFromBuffer: async (bytes, fileName, source) => {
    const doc = await loadPdf(bytes);
    set({
      fileName,
      doc,
      numPages: doc.numPages,
      source,
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
    set({ fileName: null, doc: null, numPages: 0, source: null, pageWordsCache: new Map() });
  },
}));
