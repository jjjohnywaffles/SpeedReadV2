import { useEffect, useRef } from 'react';

interface Props {
  words: string[];
  pageStartIndex: number;
  currentGlobalIndex: number;
  onWordClick: (globalIndex: number) => void;
}

export function PageTextPane({ words, pageStartIndex, currentGlobalIndex, onWordClick }: Props) {
  const localActiveIndex = currentGlobalIndex - pageStartIndex;
  const activeWordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    activeWordRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [localActiveIndex]);

  return (
    <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-4">
      <p className="mx-auto max-w-3xl font-mono text-sm leading-relaxed text-text-secondary">
        {words.map((word, i) => {
          const globalIndex = pageStartIndex + i;
          const isActive = i === localActiveIndex;
          const isPast = i < localActiveIndex;
          return (
            <span key={i}>
              <span
                ref={isActive ? activeWordRef : undefined}
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
    </div>
  );
}
