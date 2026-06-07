import type { Index } from '../game/model/board';
import {
  createMutableBoardState,
  type BoardState,
  type ReadOnlyBoardState,
  type ReadOnlyCellState,
} from '../game/model/board';
import type { PlaintextPuzzle } from './plaintext';
import { PLAINTEXT_PUZZLES } from './plaintext';

export type PlaintextCell = ' ' | 'X' | '0' | '1' | '2' | '3' | '4';

export interface Library {
  getNames(): string[];
  getInitialBoard(name: string): BoardState;
}

export function createLibrary(): Library {
  const puzzles = loadPuzzles(PLAINTEXT_PUZZLES);
  const puzzlesByName = new Map(puzzles.map((puzzle) => [puzzle.name, puzzle]));

  return {
    getNames() {
      return puzzles.map((puzzle) => puzzle.name);
    },
    getInitialBoard(name: string) {
      const puzzle = puzzlesByName.get(name);
      if (puzzle === undefined) {
        throw new Error(`Unknown puzzle: ${name}`);
      }
      return createMutableBoardState(puzzle.board);
    },
  };
}

export interface Puzzle {
  name: string;
  board: ReadOnlyBoardState;
}

export function loadPuzzles(plaintextPuzzles: PlaintextPuzzle[]): Puzzle[] {
  const puzzles: Puzzle[] = [];
  for (const plaintextPuzzle of plaintextPuzzles) {
    const board = parseBoard(plaintextPuzzle.board);
    puzzles.push({ name: plaintextPuzzle.name, board });
  }
  return puzzles;
}

export function parseBoard(plaintext: string): ReadOnlyBoardState {
  const cells = plaintext
    .split('\n')
    .filter((line) => line.trim().length > 0 && line.includes('|'))
    .map(parseRow);

  return { cells };
}

function parseRow(line: string, rowIndex: number): readonly ReadOnlyCellState[] {
  const firstBarIndex = line.indexOf('|');
  const secondBarIndex = line.indexOf('|', firstBarIndex + 1);

  if (firstBarIndex === -1 || secondBarIndex === -1) {
    throw new Error(`Invalid puzzle row, expected two bars: ${line}`);
  }

  const row: ReadOnlyCellState[] = [];
  for (let index = firstBarIndex + 1; index < secondBarIndex; index++) {
    const cellIndex = index - (firstBarIndex + 1);
    row.push(parsePlaintextCell(line.charAt(index), [rowIndex, cellIndex]));
  }
  return row;
}

function parsePlaintextCell(char: string, index: Index): ReadOnlyCellState {
  if (!isPlaintextCell(char)) {
    throw new Error(`Invalid cell character: ${char}`);
  }
  return parseCell(char, index);
}

function parseCell(char: PlaintextCell, index: Index): ReadOnlyCellState {
  switch (char) {
    case ' ':
      return { index };
    case 'X':
      return { index, wall: true };
    case '0':
      return { index, wall: true, number: 0 };
    case '1':
      return { index, wall: true, number: 1 };
    case '2':
      return { index, wall: true, number: 2 };
    case '3':
      return { index, wall: true, number: 3 };
    case '4':
      return { index, wall: true, number: 4 };
  }
}

function isPlaintextCell(char: string): char is PlaintextCell {
  return (
    char === ' ' ||
    char === 'X' ||
    char === '0' ||
    char === '1' ||
    char === '2' ||
    char === '3' ||
    char === '4'
  );
}
