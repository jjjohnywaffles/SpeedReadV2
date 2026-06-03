import { getPivot } from '../../lib/pivot';

interface Props {
  word: string;
}

export function RsvpFlasher({ word }: Props) {
  const { before, pivot, after } = getPivot(word);

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="mb-1 h-1.5 w-0.5 bg-accent/60" />
      <div className="flex w-full items-baseline font-mono text-4xl font-bold sm:text-5xl">
        <span className="flex-1 overflow-hidden whitespace-nowrap text-right text-text-secondary">
          {before}
        </span>
        <span className="shrink-0 text-accent">{pivot}</span>
        <span className="flex-1 overflow-hidden whitespace-nowrap text-left text-text-secondary">
          {after}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-0.5 bg-accent/60" />
    </div>
  );
}
