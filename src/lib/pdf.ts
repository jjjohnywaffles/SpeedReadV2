import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export type PdfDocument = pdfjs.PDFDocumentProxy;

export async function loadPdf(source: File | ArrayBuffer): Promise<PdfDocument> {
  const data = source instanceof File ? await source.arrayBuffer() : source;
  const task = pdfjs.getDocument({ data });
  return task.promise;
}

export interface PageText {
  words: string[];
}

export async function getPageText(doc: PdfDocument, pageNumber: number): Promise<PageText> {
  const page = await doc.getPage(pageNumber);
  const content = await page.getTextContent();

  const lines = new Map<number, { x: number; str: string }[]>();
  for (const item of content.items) {
    if (!('str' in item) || !item.str) continue;
    const transform = item.transform as number[];
    const x = transform[4];
    const y = Math.round(transform[5]);
    if (!lines.has(y)) lines.set(y, []);
    lines.get(y)!.push({ x, str: item.str });
  }

  const orderedYs = [...lines.keys()].sort((a, b) => b - a);
  const text = orderedYs
    .map((y) =>
      lines
        .get(y)!
        .sort((a, b) => a.x - b.x)
        .map((s) => s.str)
        .join(' '),
    )
    .join('\n');

  const words = text.split(/\s+/).filter(Boolean);
  return { words };
}
