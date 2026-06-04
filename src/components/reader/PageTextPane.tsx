import { ClickableWordList } from './ClickableWordList';

interface Props {
  words: string[];
  pageStartIndex: number;
  currentGlobalIndex: number;
  onWordClick: (globalIndex: number) => void;
}

export function PageTextPane({ words, pageStartIndex, currentGlobalIndex, onWordClick }: Props) {
  return (
    <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-4">
      <ClickableWordList
        words={words}
        baseIndex={pageStartIndex}
        activeIndex={currentGlobalIndex}
        onWordClick={onWordClick}
      />
    </div>
  );
}
