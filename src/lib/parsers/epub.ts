import ePub from 'epubjs';
import { chunkIntoPages, type ParsedDocument } from './types';

interface SpineItem {
  href: string;
  load: (loader: (path: string) => Promise<unknown>) => Promise<Document>;
}

interface BookSpine {
  spineItems?: SpineItem[];
  items?: SpineItem[];
}

export async function parseEpub(file: File): Promise<ParsedDocument> {
  const buffer = await file.arrayBuffer();
  const book = ePub(buffer);
  await book.ready;

  const spine = book.spine as unknown as BookSpine;
  const items = spine.spineItems ?? spine.items ?? [];

  const texts: string[] = [];
  for (const item of items) {
    try {
      const doc = await item.load(book.load.bind(book));
      const text = doc.body?.textContent ?? '';
      if (text.trim()) texts.push(text);
    } catch {
      // skip unreadable spine items
    }
  }

  return chunkIntoPages(texts.join('\n\n'), 'epub');
}
