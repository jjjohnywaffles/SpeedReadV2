import { getPageText, loadPdf } from '../pdf';
import type { ParsedDocument } from './types';

export async function parsePdf(file: File | ArrayBuffer): Promise<ParsedDocument> {
  const doc = await loadPdf(file);
  const pages = await Promise.all(
    Array.from({ length: doc.numPages }, (_, i) => getPageText(doc, i + 1).then((p) => p.words)),
  );
  const totalWords = pages.reduce((n, p) => n + p.length, 0);
  return {
    source: 'pdf',
    pages,
    numPages: doc.numPages,
    totalWords,
  };
}
