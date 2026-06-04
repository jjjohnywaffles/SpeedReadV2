import { useEffect, useRef } from 'react';

interface Props {
  words: string[];
  activeIndex: number;
  baseIndex?: number;
  onWordClick: (globalIndex: number) => void;
}

export function ClickableWordList({ words, activeIndex, baseIndex = 0, onWordClick }: Props) {
  const localActive = activeIndex - baseIndex;
  const activeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [localActive]);

  return (
    <p className="mx-auto max-w-3xl font-mono text-sm leading-relaxed text-text-secondary">
      {words.map((word, i) => {
        const globalIndex = baseIndex + i;
        const isActive = i === localActive;
        const isPast = i < localActive;
        return (
          <span key={i}>
            <span
              ref={isActive ? activeRef : undefined}
              onClick={() => onWordClick(globalIndex)}
              className={`cursor-pointer rounded px-0.5 transition-colors ${
                isActive
                  ? 'bg-accent text-bg-primary'
                  : isPast
                    ? 'text-text-primary hover:bg-bg-terminal'
                    : 'hover:bg-bg-terminal hover:text-text-primary'
              }`}
            >
              {word}
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </p>
  );
}
