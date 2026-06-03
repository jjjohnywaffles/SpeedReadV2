import type { UseReader } from '../../hooks/useReader';

interface Props {
  reader: UseReader;
}

export function ProgressBar({ reader }: Props) {
  const { progress, totalWords } = reader;

  return (
    <div className="px-4">
      <div
        className="h-1 w-full cursor-pointer rounded-full bg-bg-terminal"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          reader.seekTo(Math.round(pct * (totalWords - 1)));
        }}
      >
        <div
          className="h-full rounded-full bg-accent transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
