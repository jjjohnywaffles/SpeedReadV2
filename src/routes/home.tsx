import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/home')({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex w-full max-w-xl flex-col items-center gap-10">
        <h1 className="font-mono text-3xl font-bold text-text-primary sm:text-4xl">
          Welcome to <span className="text-accent">SpeedRead</span>
        </h1>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/example"
            className="rounded-lg bg-accent px-6 py-3 font-mono text-sm font-semibold text-bg-primary transition-colors hover:bg-accent/80"
          >
            Try sample
          </Link>
          <button
            type="button"
            disabled
            title="Coming soon"
            className="cursor-not-allowed rounded-lg border border-border px-6 py-3 font-mono text-sm text-text-muted"
          >
            Upload documents or text
          </button>
        </div>

        <p className="font-mono text-xs text-text-muted">
          Document upload coming soon — for now, try the sample.
        </p>
      </div>
    </main>
  );
}
