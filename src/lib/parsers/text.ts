import { chunkIntoPages, type DocumentSourceType, type ParsedDocument } from './types';

export async function parsePlainText(
  file: File,
  source: DocumentSourceType,
): Promise<ParsedDocument> {
  const text = await file.text();
  return chunkIntoPages(text, source);
}

export function parsePastedText(text: string): ParsedDocument {
  return chunkIntoPages(text, 'paste');
}
