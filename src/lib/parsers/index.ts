import { getSourceTypeFromFile, type DocumentSourceType, type ParsedDocument } from './types';

export { parsePastedText } from './text';
export {
  FORMAT_BADGES,
  SUPPORTED_EXTENSIONS,
  type DocumentSourceType,
  type ParsedDocument,
} from './types';

export class UnsupportedFormatError extends Error {
  constructor(public fileName: string) {
    super(`Unsupported file format: ${fileName}`);
  }
}

export async function parseFile(file: File): Promise<ParsedDocument> {
  const source = getSourceTypeFromFile(file);
  if (!source) throw new UnsupportedFormatError(file.name);

  switch (source) {
    case 'pdf': {
      const { parsePdf } = await import('./pdf');
      return parsePdf(file);
    }
    case 'epub': {
      const { parseEpub } = await import('./epub');
      return parseEpub(file);
    }
    case 'docx': {
      const { parseDocx } = await import('./docx');
      return parseDocx(file);
    }
    case 'html': {
      const { parseHtml } = await import('./html');
      return parseHtml(file);
    }
    case 'txt':
    case 'md': {
      const { parsePlainText } = await import('./text');
      return parsePlainText(file, source);
    }
    case 'paste':
      throw new Error('Pasted text uses parsePastedText, not parseFile');
  }
}

export function getDocumentSourceType(file: File): DocumentSourceType | null {
  return getSourceTypeFromFile(file);
}
