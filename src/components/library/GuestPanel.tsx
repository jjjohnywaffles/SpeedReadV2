import { Link } from '@tanstack/react-router';
import { useDocumentStore } from '../../stores/documentStore';
import { PdfUpload } from '../upload/PdfUpload';

export function GuestPanel() {
  const guestDoc = useDocumentStore((s) => s.doc);
  const guestFileName = useDocumentStore((s) => s.fileName);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <div className="w-full max-w-md">
        <PdfUpload
          disabled={!!guestDoc}
          disabledHint={
            guestDoc ? 'Sign in to upload more — guest can only hold one document' : undefined
          }
        />
      </div>

      {guestDoc && guestFileName && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-bg-terminal p-4 font-mono text-xs">
          <span className="text-text-secondary">Continue with</span>
          <Link
            to="/read/$fileId"
            params={{ fileId: 'guest' }}
            className="text-accent transition-opacity hover:opacity-80"
          >
            {guestFileName} →
          </Link>
        </div>
      )}

      <p className="max-w-sm font-mono text-[11px] text-text-muted">
        Guest mode keeps your document in memory only. Sign in to save it.
      </p>
    </div>
  );
}
