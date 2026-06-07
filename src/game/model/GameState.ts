import type { RuleViolation } from '../rules/coreRules';
import { getRuleViolations } from '../rules/coreRules';
import { lineOfSight, type BoardState } from './board';

export class GameState {
  public ruleViolations: RuleViolation[];

  constructor(public board: BoardState) {
    this.ruleViolations = getRuleViolations(board);
  }

  onCellClick(rowIndex: number, columnIndex: number): GameState {
    const cell = this.board.cells[rowIndex][columnIndex];
    if (cell.wall) {
      return this;
    } else if (cell.bulb) {
      delete cell.bulb;
      this.unlightCells(rowIndex, columnIndex);
    } else if (cell.xMark) {
      delete cell.xMark;
      cell.bulb = true;
      this.lightCells(rowIndex, columnIndex);
    } else {
      cell.xMark = true;
    }

    return new GameState({ ...this.board });
  }

  private lightCells(rowIndex: number, columnIndex: number) {
    for (const [r, c] of lineOfSight(this.board, [rowIndex, columnIndex], { includeStart: true })) {
      const cell = this.board.cells[r][c];
      cell.lit = (cell.lit ?? 0) + 1;
    }
  }

  private unlightCells(rowIndex: number, columnIndex: number) {
    for (const [r, c] of lineOfSight(this.board, [rowIndex, columnIndex], { includeStart: true })) {
      const cell = this.board.cells[r][c];
      cell.lit = (cell.lit ?? 0) - 1;
      if (cell.lit <= 0) {
        delete cell.lit;
      }
    }
  }
}
