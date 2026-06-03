import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFileSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');

const data = readFileSync('/Users/johnyhu/Downloads/six-kinds-of-article.pdf');
const doc = await getDocument({ data: new Uint8Array(data) }).promise;

console.log('numPages:', doc.numPages);

for (let p = 1; p <= Math.min(2, doc.numPages); p++) {
  const page = await doc.getPage(p);
  const viewport = page.getViewport({ scale: 1.0 });
  console.log(`\n=== PAGE ${p} (size: ${viewport.width.toFixed(0)} x ${viewport.height.toFixed(0)}) ===`);
  const content = await page.getTextContent();

  // Group by Y, show x/y positions
  const items = content.items
    .filter((i) => 'str' in i && i.str.trim())
    .map((i) => ({
      x: i.transform[4],
      y: i.transform[5],
      w: i.width,
      h: i.height,
      font: i.fontName,
      str: i.str,
    }))
    .sort((a, b) => b.y - a.y || a.x - b.x);

  console.log(`items: ${items.length}`);
  // Print first 40 items with positions
  for (const it of items.slice(0, 50)) {
    console.log(`  y=${it.y.toFixed(1).padStart(6)} x=${it.x.toFixed(1).padStart(6)} w=${it.w.toFixed(0).padStart(4)} h=${it.h.toFixed(0).padStart(3)} | "${it.str.slice(0, 70)}"`);
  }
  if (items.length > 50) console.log(`  ... ${items.length - 50} more`);
}

process.exit(0);
