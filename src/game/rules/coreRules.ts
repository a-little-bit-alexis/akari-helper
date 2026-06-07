import {
  adjacentBulbCount,
  adjacentIndices,
  lineOfSight,
  type Index,
  type ReadOnlyBoardState,
} from '../model/board';

export function isSolved(board: ReadOnlyBoardState): boolean {
  for (let i = 0; i < board.cells.length; i++) {
    for (let j = 0; j < board.cells[i].length; j++) {
      const cell = board.cells[i][j];
      if (!cell.wall && !cell.lit) {
        return false;
      }

      if (cell.bulb) {
        for (const [r, c] of lineOfSight(board, [i, j], { includeStart: false })) {
          if (board.cells[r][c].bulb) {
            return false;
          }
        }
      }

      if (cell.wall && cell.number !== undefined) {
        let bulbCount = 0;
        for (const [r, c] of adjacentIndices(board, [i, j])) {
          if (board.cells[r][c].bulb) {
            bulbCount++;
          }
        }
        if (bulbCount !== cell.number) {
          return false;
        }
      }
    }
  }

  return true;
}

export interface RuleViolation {
  index: Index;
  message: string;
}

export function getRuleViolations(board: ReadOnlyBoardState): RuleViolation[] {
  const violations: RuleViolation[] = [];
  for (const rule of RULES) {
    for (let i = 0; i < board.cells.length; i++) {
      for (let j = 0; j < board.cells[i].length; j++) {
        const violation = rule.check(board, [i, j]);
        if (violation !== undefined) {
          violations.push(violation);
        }
      }
    }
  }
  return violations;
}

interface Rule {
  name: string;
  check: (board: ReadOnlyBoardState, index: Index) => RuleViolation | undefined;
}

const RULES: Rule[] = [
  {
    name: 'Too many bulbs next to a number',
    check: (board, [row, col]) => {
      const cell = board.cells[row][col];
      if (cell.wall && cell.number !== undefined) {
        const bulbCount = adjacentBulbCount(board, [row, col]);
        if (bulbCount > cell.number) {
          return {
            index: [row, col],
            message: `Too many bulbs adjacent to this number`,
          };
        }
      }
      return undefined;
    },
  },
  {
    name: 'Bulbs illuminating each other',
    check: (board, [row, col]) => {
      const cell = board.cells[row][col];
      if (cell.bulb) {
        for (const [r, c] of lineOfSight(board, [row, col], { includeStart: false })) {
          if (board.cells[r][c].bulb) {
            return {
              index: [row, col],
              message: 'This bulb illuminates another bulb',
            };
          }
        }
      }
      return undefined;
    },
  },
];
