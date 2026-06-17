import type { Board } from '../model/Board';
import type { Cell } from '../model/Cell';
import type { Index } from '../model/CellIndex';

export function isSolved(board: Board): boolean {
  for (const cell of board.cells()) {
    if (cell.needsToBeLit()) {
      return false;
    }

    if (cell.hasBulb()) {
      for (const other of cell.lineOfSight({ includeStart: false })) {
        if (other.hasBulb()) {
          return false;
        }
      }
    }

    if (cell.isWall && cell.num !== undefined) {
      const { numBulbsRemaining } = cell.numberedWallAnalysis();
      if (numBulbsRemaining !== 0) {
        return false;
      }
    }
  }

  return true;
}

export interface RuleViolation {
  index: Index;
  message: string;
}

export function getRuleViolations(board: Board): RuleViolation[] {
  const violations: RuleViolation[] = [];
  for (const rule of RULES) {
    for (const cell of board.cells()) {
      const violation = rule.check(cell);
      if (violation !== undefined) {
        violations.push(violation);
      }
    }
  }
  return violations;
}

interface Rule {
  name: string;
  check: (cell: Cell) => RuleViolation | undefined;
}

const RULES: Rule[] = [
  {
    name: 'Too many bulbs next to a number',
    check: (cell: Cell): RuleViolation | undefined => {
      const num = cell.num;
      if (num === undefined) {
        return undefined;
      }

      const adjBulbCount = cell.adjacentBulbCount();
      if (adjBulbCount > num) {
        return {
          index: cell.index,
          message: `Too many bulbs adjacent to this number`,
        };
      }

      return undefined;
    },
  },
  {
    name: 'Bulbs illuminating each other',
    check: (cell: Cell): RuleViolation | undefined => {
      if (!cell.hasBulb()) {
        return undefined;
      }

      for (const other of cell.lineOfSight({ includeStart: false })) {
        if (other.hasBulb()) {
          return {
            index: cell.index,
            message: 'This bulb illuminates another bulb',
          };
        }
      }

      return undefined;
    },
  },
];
