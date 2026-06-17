import type { Cell } from '../game/model/Cell';

export function* pairs<T>(arr: T[]): Generator<[T, T]> {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      yield [arr[i], arr[j]];
    }
  }
}

export function sortCells(cells: Cell[]): Cell[] {
  return cells.sort((a, b) => a.index.compare(b.index));
}

export function sameCells(a: Cell[], b: Cell[]): boolean {
  const sortedA = sortCells(a);
  const sortedB = sortCells(b);
  for (let i = 0; i < sortedA.length; i++) {
    if (!sortedA[i].index.equals(sortedB[i].index)) {
      return false;
    }
  }
  return true;
}
