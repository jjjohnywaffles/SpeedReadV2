import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="flex max-w-xl flex-col items-center gap-8">
        <h1 className="font-mono text-5xl font-bold tracking-tight text-text-primary sm:text-6xl">
          Speed<span className="text-accent">Read</span>
        </h1>
        <p className="font-mono text-base leading-relaxed text-text-secondary">
          Read faster using <span className="text-accent">RSVP</span> — Rapid Serial Visual
          Presentation. Words flash one at a time at your chosen speed, eliminating eye movement and
          letting your brain focus on recognition.
        </p>
        <Link
          to="/home"
          className="rounded-lg bg-accent px-8 py-3 font-mono text-sm font-semibold text-bg-primary transition-colors hover:bg-accent/80"
        >
          Begin
        </Link>
      </div>
    </main>
  );
}
