import type { EmptyBoardCellSpec } from '../game/model/Board';
import { Board } from '../game/model/Board';
import { PLAINTEXT_PUZZLES } from './generatedPlaintext';
import type { PlaintextPuzzle } from './plaintext';
import { HARDCODED_PLAINTEXT_PUZZLES } from './plaintext';

export type PlaintextCell = ' ' | 'X' | '0' | '1' | '2' | '3' | '4';

export interface Library {
  getNames(): string[];
  getInitialBoard(name: string): Board;
}

export function createLibrary(): Library {
  const hardcoded = loadPuzzles(HARDCODED_PLAINTEXT_PUZZLES);
  const generated = loadPuzzles(PLAINTEXT_PUZZLES);
  const puzzles = [...generated, ...hardcoded];

  const puzzlesByName = new Map(puzzles.map((puzzle) => [puzzle.name, puzzle]));

  return {
    getNames() {
      return puzzles.map((puzzle) => puzzle.name);
    },
    getInitialBoard(name: string): Board {
      const puzzle = puzzlesByName.get(name);
      if (puzzle === undefined) {
        throw new Error(`Unknown puzzle: ${name}`);
      }
      return Board.createEmptyBoard(puzzle.board);
    },
  };
}

export interface Puzzle {
  name: string;
  board: EmptyBoardCellSpec[][];
}

export function loadPuzzles(plaintextPuzzles: PlaintextPuzzle[]): Puzzle[] {
  const puzzles: Puzzle[] = [];
  for (const plaintextPuzzle of plaintextPuzzles) {
    const board = parseBoard(plaintextPuzzle.board);
    puzzles.push({ name: plaintextPuzzle.name, board });
  }
  return puzzles;
}

export function parseBoard(plaintext: string): EmptyBoardCellSpec[][] {
  const cells = plaintext
    .split('\n')
    .filter((line) => line.trim().length > 0 && line.includes('|'))
    .map(parseRow);

  return cells;
}

function parseRow(line: string): EmptyBoardCellSpec[] {
  const firstBarIndex = line.indexOf('|');
  const secondBarIndex = line.indexOf('|', firstBarIndex + 1);

  if (firstBarIndex === -1 || secondBarIndex === -1) {
    throw new Error(`Invalid puzzle row, expected two bars: ${line}`);
  }

  const row: EmptyBoardCellSpec[] = [];
  for (let index = firstBarIndex + 1; index < secondBarIndex; index++) {
    row.push(parsePlaintextCell(line.charAt(index)));
  }
  return row;
}

function parsePlaintextCell(char: string): EmptyBoardCellSpec {
  if (!isPlaintextCell(char)) {
    throw new Error(`Invalid cell character: ${char}`);
  }
  return parseCell(char);
}

function parseCell(char: PlaintextCell): EmptyBoardCellSpec {
  switch (char) {
    case ' ':
      return { cell_type: 'floor' };
    case 'X':
      return { cell_type: 'wall', number: undefined };
    case '0':
      return { cell_type: 'wall', number: 0 };
    case '1':
      return { cell_type: 'wall', number: 1 };
    case '2':
      return { cell_type: 'wall', number: 2 };
    case '3':
      return { cell_type: 'wall', number: 3 };
    case '4':
      return { cell_type: 'wall', number: 4 };
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
