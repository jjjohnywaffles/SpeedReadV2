export interface Pivot {
  before: string;
  pivot: string;
  after: string;
}

export function getPivot(word: string): Pivot {
  if (!word) return { before: '', pivot: '', after: '' };

  const pivotIndex = Math.floor((word.length - 1) / 2);

  return {
    before: word.slice(0, pivotIndex),
    pivot: word[pivotIndex],
    after: word.slice(pivotIndex + 1),
  };
}
