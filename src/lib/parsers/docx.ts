import mammoth from 'mammoth';
import { chunkIntoPages, type ParsedDocument } from './types';

export async function parseDocx(file: File): Promise<ParsedDocument> {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return chunkIntoPages(result.value, 'docx');
}
