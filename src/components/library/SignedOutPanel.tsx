import { Link } from '@tanstack/react-router';
import { useDocumentStore } from '../../stores/documentStore';
import { SignInButton } from '../auth/SignInButton';
import { PdfUpload } from '../upload/PdfUpload';

export function SignedOutPanel() {
  const guestDoc = useDocumentStore((s) => s.numPages > 0);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-6 py-12 text-center">
      <div className="flex max-w-md flex-col items-center gap-4">
        <h2 className="font-mono text-xl text-text-primary">Sign in to see your library</h2>
        <p className="font-mono text-xs text-text-secondary">
          Save documents, sync reading progress across sessions, and pick up where you left off.
        </p>
        <SignInButton />
      </div>

      <div className="flex w-full max-w-md flex-col items-center gap-3">
        <div className="flex w-full items-center gap-3 font-mono text-xs text-text-muted">
          <div className="h-px flex-1 bg-border" />
          <span>or upload to try without signing in</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <PdfUpload
          disabled={!!guestDoc}
          disabledHint={
            guestDoc ? 'Sign in to upload more — guest can only hold one document' : undefined
          }
        />
        <Link
          to="/paste"
          className="font-mono text-xs text-text-secondary underline decoration-text-muted underline-offset-4 transition-colors hover:text-text-primary hover:decoration-text-secondary"
        >
          or paste text instead
        </Link>
        <p className="font-mono text-[11px] text-text-muted">
          Guest uploads are kept in memory only.
        </p>
      </div>
    </div>
  );
}
