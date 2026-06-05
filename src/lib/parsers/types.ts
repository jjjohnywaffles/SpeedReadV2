export type DocumentSourceType = 'pdf' | 'epub' | 'docx' | 'html' | 'txt' | 'md' | 'paste';

export interface ParsedDocument {
  source: DocumentSourceType;
  pages: string[][];
  numPages: number;
  totalWords: number;
}

export const SUPPORTED_EXTENSIONS = ['pdf', 'epub', 'docx', 'html', 'htm', 'txt', 'md'] as const;

export const FORMAT_BADGES: Record<DocumentSourceType, string> = {
  pdf: 'PDF',
  epub: 'EPUB',
  docx: 'DOCX',
  html: 'HTML',
  txt: 'TXT',
  md: 'MD',
  paste: 'TEXT',
};

export function getSourceTypeFromFile(file: File): DocumentSourceType | null {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.epub')) return 'epub';
  if (name.endsWith('.docx')) return 'docx';
  if (name.endsWith('.html') || name.endsWith('.htm')) return 'html';
  if (name.endsWith('.txt')) return 'txt';
  if (name.endsWith('.md') || name.endsWith('.markdown')) return 'md';
  return null;
}

const WORDS_PER_PAGE = 300;

export function chunkIntoPages(text: string, source: DocumentSourceType): ParsedDocument {
  const words = text.split(/\s+/).filter(Boolean);
  const pages: string[][] = [];
  for (let i = 0; i < words.length; i += WORDS_PER_PAGE) {
    pages.push(words.slice(i, i + WORDS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);
  return {
    source,
    pages,
    numPages: pages.length,
    totalWords: words.length,
  };
}
