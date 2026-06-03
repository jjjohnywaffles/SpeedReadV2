import { useState } from 'react';

interface Props {
  currentPage: number;
  numPages: number;
  onGoToPage: (pageNumber: number) => void;
}

export function PageNavigator(props: Props) {
  return <PageNavigatorInner key={props.currentPage} {...props} />;
}

function PageNavigatorInner({ currentPage, numPages, onGoToPage }: Props) {
  const [draft, setDraft] = useState(String(currentPage));

  const commit = () => {
    const n = Number(draft);
    if (Number.isFinite(n)) {
      const clamped = Math.max(1, Math.min(Math.round(n), numPages));
      onGoToPage(clamped);
      setDraft(String(clamped));
    } else {
      setDraft(String(currentPage));
    }
  };

  return (
    <div className="flex items-center justify-center gap-3 border-t border-border px-4 py-2 font-mono text-xs text-text-secondary">
      <button
        type="button"
        onClick={() => onGoToPage(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        className="rounded-md px-2 py-1 transition-colors hover:bg-bg-terminal hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
      >
        ← Prev
      </button>
      <div className="flex items-center gap-1">
        <span>Page</span>
        <input
          type="text"
          inputMode="numeric"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          className="w-12 rounded border border-border bg-bg-terminal px-1.5 py-0.5 text-center text-accent focus:border-accent focus:outline-none"
        />
        <span>of {numPages}</span>
      </div>
      <button
        type="button"
        onClick={() => onGoToPage(Math.min(numPages, currentPage + 1))}
        disabled={currentPage >= numPages}
        className="rounded-md px-2 py-1 transition-colors hover:bg-bg-terminal hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
      >
        Next →
      </button>
    </div>
  );
}
