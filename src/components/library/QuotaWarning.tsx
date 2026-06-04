import { formatBytes } from '../../lib/format';

const QUOTA_BYTES = 100 * 1024 * 1024;
const WARN_THRESHOLD = 0.9;

interface Props {
  usedBytes: number;
}

export function QuotaWarning({ usedBytes }: Props) {
  if (usedBytes / QUOTA_BYTES < WARN_THRESHOLD) return null;

  return (
    <div className="flex items-center gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 font-mono text-xs text-warning">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <span>
        Almost full — {formatBytes(usedBytes)} of {formatBytes(QUOTA_BYTES)} used. Delete some files
        to upload more.
      </span>
    </div>
  );
}
