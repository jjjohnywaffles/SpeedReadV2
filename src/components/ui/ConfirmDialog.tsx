import { useEffect, useState } from 'react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

type Pending = ConfirmOptions & { resolve: (value: boolean) => void };

const listeners = new Set<(pending: Pending | null) => void>();
let currentPending: Pending | null = null;

function emit(pending: Pending | null): void {
  currentPending = pending;
  listeners.forEach((fn) => fn(pending));
}

export function requestConfirm(options: ConfirmOptions): Promise<boolean> {
  if (currentPending) currentPending.resolve(false);
  return new Promise((resolve) => {
    emit({ ...options, resolve });
  });
}

export function useConfirm() {
  return requestConfirm;
}

export function ConfirmDialogHost() {
  const [pending, setPending] = useState<Pending | null>(currentPending);

  useEffect(() => {
    const fn = (p: Pending | null) => setPending(p);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        pending.resolve(false);
        emit(null);
      } else if (e.key === 'Enter') {
        pending.resolve(true);
        emit(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pending]);

  if (!pending) return null;

  const resolve = (value: boolean) => {
    pending.resolve(value);
    emit(null);
  };

  const confirmLabel = pending.confirmLabel ?? 'Confirm';
  const cancelLabel = pending.cancelLabel ?? 'Cancel';
  const destructive = pending.destructive ?? false;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
    >
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => resolve(false)}
        className="absolute inset-0 cursor-default bg-black/60"
      />
      <div className="relative w-full max-w-sm rounded-lg border border-border bg-bg-terminal p-5 shadow-xl">
        {pending.title && (
          <h2 className="mb-2 font-mono text-sm font-semibold text-text-primary">
            {pending.title}
          </h2>
        )}
        <p className="font-mono text-xs leading-relaxed text-text-secondary">{pending.message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => resolve(false)}
            className="rounded-md border border-border px-3 py-1.5 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-header hover:text-text-primary"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => resolve(true)}
            className={`rounded-md px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
              destructive
                ? 'bg-error text-bg-primary hover:bg-error/80'
                : 'bg-accent text-bg-primary hover:bg-accent/80'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
