import type { CellValue } from './game';

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

export function cellAtIndex(board: ReadOnlyBoardState, index: Index): CellState {
  return board.cells[index[0]][index[1]];
}

export function cellValAtIndex(board: ReadOnlyBoardState, index: Index): CellValue {
  const cell = cellAtIndex(board, index);
  return cell.bulb ? 'bulb' : cell.xMark ? 'xMark' : 'empty';
}

export function indicesEqual(index1: Index, index2: Index): boolean {
  return index1[0] === index2[0] && index1[1] === index2[1];
}

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

export function* adjacentCells(
  board: ReadOnlyBoardState,
  index: Index,
): Generator<ReadOnlyCellState> {
  for (const adjacentIndex of adjacentIndices(board, index)) {
    yield cellAtIndex(board, adjacentIndex);
  }
}

export function* pairs<T>(arr: T[]): Generator<[T, T]> {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      yield [arr[i], arr[j]];
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

function naiveIntersections(board: ReadOnlyBoardState, a: Index, b: Index): Index[] {
  if (a[0] === b[0] || a[1] === b[1]) {
    return [];
  }

  const aLOS = [...lineOfSight(board, a)];
  const bLOS = [...lineOfSight(board, b)];

  const intersections = [];
  for (const aIdx of aLOS) {
    if (bLOS.some((bIdx) => indicesEqual(aIdx, bIdx))) {
      intersections.push(aIdx);
    }
  }

  intersections.sort((a, b) => (a[0] === b[0] ? b[1] - a[1] : b[0] - a[0]));
  return intersections;
}

/**
 * Returns an empty array if the two indices are on either the same row
 * or same column as each other.
 *
 * Otherwise, returns point(s) where A's line of sight intersect's B's line of sight.
 */
export function intersections(board: ReadOnlyBoardState, a: Index, b: Index): Index[] {
  if (a[0] === b[0] || a[1] === b[1]) {
    return [];
  }

  // We could be naive about it and iterate over the line of sight of each cell, but
  // really there are only two possible intersection points, and two lines we need to
  // check for walls for each.

  const intersections: Index[] = [];

  // Ensure a has the lower row index
  if (a[0] > b[0]) {
    [a, b] = [b, a];
  }

  const dCol = b[1] > a[1] ? 1 : -1;

  const [a0, a1] = a;
  const [b0, b1] = b;

  // See if there are walls in the way of reaching <a0, b1>
  let foundWall = false;
  // <a0, a1> to <a0, b1>
  for (let c = a1; c !== b1; c += dCol) {
    if (board.cells[a0][c].wall) {
      foundWall = true;
      break;
    }
  }

  for (let r = a0; r !== b0; r++) {
    if (board.cells[r][b1].wall) {
      foundWall = true;
      break;
    }
  }

  if (board.cells[a0][b1].wall) {
    foundWall = true;
  }

  if (!foundWall) {
    intersections.push([a0, b1]);
  }

  // See if there are walls in the way of reaching <b0, a1>
  foundWall = false;
  // <b0, b1> to <b0, a1>
  for (let c = b1; c !== a1; c -= dCol) {
    if (board.cells[b0][c].wall) {
      foundWall = true;
      break;
    }
  }

  // <a0, a1> to <b0, a1>
  for (let r = a0; r !== b0; r++) {
    if (board.cells[r][a1].wall) {
      foundWall = true;
      break;
    }
  }

  if (board.cells[b0][a1].wall) {
    foundWall = true;
  }

  if (!foundWall) {
    intersections.push([b0, a1]);
  }

  intersections.sort((a, b) => (a[0] === b[0] ? b[1] - a[1] : b[0] - a[0]));

  const naive = naiveIntersections(board, a, b);
  if (!equalIndices(intersections, naive)) {
    // eslint-disable-next-line no-debugger
    debugger;
  }

  return intersections;
}

function equalIndices(a: Index[], b: Index[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (!indicesEqual(a[i], b[i])) {
      return false;
    }
  }

  return true;
}

export function* cellLineOfSight(
  board: ReadOnlyBoardState,
  start: ReadOnlyCellState,
  options?: { includeStart?: boolean },
): Generator<ReadOnlyCellState> {
  for (const index of lineOfSight(board, start.index, options)) {
    yield cellAtIndex(board, index);
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

export function* cells(board: ReadOnlyBoardState): Generator<ReadOnlyCellState> {
  for (const row of board.cells) {
    for (const cell of row) {
      yield cell;
    }
  }
}

export function* numberedWalls(board: ReadOnlyBoardState): Generator<ReadOnlyCellState> {
  for (const cell of cells(board)) {
    if (cell.number !== undefined) {
      yield cell;
    }
  }
}

export function needsToBeLit(cell: ReadOnlyCellState): boolean {
  return !cell.wall && !cell.bulb && !cell.lit;
}

export function potentialBulb(cell: ReadOnlyCellState): boolean {
  return !cell.wall && !cell.bulb && !cell.lit && !cell.xMark;
}

export interface NumberedWallAnalysis {
  numBulbsRequiredTotal: number;
  numBulbsRemaining: number;
  potentialBulbCells: ReadOnlyCellState[];
}

export function analyzeNumberedWall(
  board: ReadOnlyBoardState,
  wall: ReadOnlyCellState,
): NumberedWallAnalysis {
  const numBulbsRequiredTotal = wall.number;
  if (numBulbsRequiredTotal === undefined) {
    throw new Error('Called analyzeNumberedWall on a cell that is not a numbered wall');
  }

  const neighbors = [...adjacentCells(board, wall.index)].filter((c) => !c.wall);
  const alreadyPlacedBulbs = neighbors.filter((n) => n.bulb === true);
  const potentialBulbCells = neighbors.filter((n) => potentialBulb(n));

  return {
    numBulbsRequiredTotal,
    numBulbsRemaining: numBulbsRequiredTotal - alreadyPlacedBulbs.length,
    potentialBulbCells,
  };
}
