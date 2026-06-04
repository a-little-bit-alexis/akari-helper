export interface CellState {
  wall?: true;
  bulb?: true;
  lit?: number; // number of bulbs lighting this cell
  number?: 0 | 1 | 2 | 3 | 4;
  xMark?: true;
  highlight?: string; // color, based on user input
  error?: string; // error message, based on game rules
}

export interface BoardState {
  cells: CellState[][];
}

export type ReadOnlyCellState = Readonly<CellState>;

export type ReadOnlyBoardState = Readonly<{
  cells: readonly (readonly ReadOnlyCellState[])[];
}>;

export function createMutableBoardState(readOnlyBoardState: ReadOnlyBoardState): BoardState {
  const cells: CellState[][] = [];
  for (const row of readOnlyBoardState.cells) {
    const mutableRow: CellState[] = [];
    for (const cell of row) {
      mutableRow.push({ ...cell });
    }
    cells.push(mutableRow);
  }
  return { cells };
}
