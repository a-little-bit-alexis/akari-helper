export interface CellState {
  index: Index;
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

export type Index = Readonly<[number, number]>;

export const DIRECTIONS: [number, number][] = [
  [-1, 0], // up
  [1, 0], // down
  [0, -1], // left
  [0, 1], // right
];

export function* adjacentIndices(board: ReadOnlyBoardState, index: Index): Generator<Index> {
  const [row, column] = index;
  for (const [dRow, dColumn] of DIRECTIONS) {
    const newRow = row + dRow;
    const newColumn = column + dColumn;
    if (
      newRow >= 0 &&
      newRow < board.cells.length &&
      newColumn >= 0 &&
      newColumn < board.cells[0].length
    ) {
      yield [newRow, newColumn];
    }
  }
}

export function* lineOfSight(
  board: ReadOnlyBoardState,
  start: Index,
  options?: { includeStart?: boolean },
): Generator<Index> {
  if (options?.includeStart) {
    yield start;
  }
  const cells = board.cells;
  for (const [dRow, dColumn] of DIRECTIONS) {
    let r = start[0] + dRow;
    let c = start[1] + dColumn;
    while (r >= 0 && r < cells.length && c >= 0 && c < cells[0].length) {
      if (board.cells[r][c].wall) {
        break;
      }
      yield [r, c];
      r += dRow;
      c += dColumn;
    }
  }
}

export function adjacentBulbCount(board: ReadOnlyBoardState, index: Index): number {
  if (board.cells[index[0]][index[1]].number === undefined) {
    throw new Error(`Cell at index [${index[0]}, ${index[1]}] does not contain a number`);
  }

  let count = 0;
  for (const [r, c] of adjacentIndices(board, index)) {
    if (board.cells[r][c].bulb) {
      count++;
    }
  }
  return count;
}
