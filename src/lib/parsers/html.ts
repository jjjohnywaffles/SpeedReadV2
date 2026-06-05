import { Readability } from '@mozilla/readability';
import DOMPurify from 'dompurify';
import { chunkIntoPages, type ParsedDocument } from './types';

export async function parseHtml(file: File): Promise<ParsedDocument> {
  const raw = await file.text();
  const clean = DOMPurify.sanitize(raw, { WHOLE_DOCUMENT: true });
  const doc = new DOMParser().parseFromString(clean, 'text/html');
  const article = new Readability(doc).parse();
  const text = article?.textContent?.trim() ?? doc.body.textContent?.trim() ?? '';
  return chunkIntoPages(text, 'html');
}
