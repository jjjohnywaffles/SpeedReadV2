function toHex(digest: ArrayBuffer): string {
  const bytes = new Uint8Array(digest);
  let hex = '';
  for (const b of bytes) hex += b.toString(16).padStart(2, '0');
  return hex;
}

export async function sha256(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  return toHex(await crypto.subtle.digest('SHA-256', buf));
}

export async function sha256Text(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  return toHex(await crypto.subtle.digest('SHA-256', buf));
}
