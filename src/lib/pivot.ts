const VOWELS = 'aeiouAEIOU';

export interface Pivot {
  before: string;
  pivot: string;
  after: string;
}

export function getPivot(word: string): Pivot {
  if (!word) return { before: '', pivot: '', after: '' };

  const center = (word.length - 1) / 2;
  const orpIndex = word.length <= 3 ? Math.floor(word.length / 2) : Math.floor(word.length / 3);

  let pivotIndex = orpIndex;
  let bestDist = Infinity;
  for (let i = 0; i < word.length; i++) {
    if (VOWELS.includes(word[i]) && Math.abs(i - center) < bestDist) {
      bestDist = Math.abs(i - center);
      pivotIndex = i;
    }
  }

  return {
    before: word.slice(0, pivotIndex),
    pivot: word[pivotIndex] || '',
    after: word.slice(pivotIndex + 1),
  };
}
