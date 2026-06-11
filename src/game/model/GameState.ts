import type { RuleViolation } from '../rules/coreRules';
import { getRuleViolations } from '../rules/coreRules';
import type { SolverRecommendation } from '../solver/techniques';
import type { Index } from './board';
import { cellAtIndex, cellValAtIndex, lineOfSight, type BoardState } from './board';
import type { Move } from './game';

export class GameState {
  public ruleViolations: RuleViolation[];

  private moveHistory: Move[] = [];
  private redoStack: Move[] = [];

  constructor(
    public board: BoardState,
    moveHistory?: Move[],
    redoStack?: Move[],
  ) {
    this.ruleViolations = getRuleViolations(board);
    this.moveHistory = moveHistory ?? [];
    this.redoStack = redoStack ?? [];
  }

  canUndo(): boolean {
    return this.moveHistory.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  onUndo(): void {
    const moveToUndo = this.moveHistory.pop();
    if (moveToUndo === undefined) {
      return;
    }

    this.redoStack.push(moveToUndo);
    this.undoMove(moveToUndo);
  }

  onRedo(): void {
    const moveToRedo = this.redoStack.pop();
    if (moveToRedo === undefined) {
      return;
    }

    this.moveHistory.push(moveToRedo);
    this.doMove(moveToRedo);
  }

  onCellClick(index: Index): void {
    const [rowIndex, columnIndex] = index;
    const cell = this.board.cells[rowIndex][columnIndex];
    if (cell.wall) {
      return;
    } else if (cell.bulb) {
      this.doMoveAndAddToHistory({
        type: 'ChangeCellValue',
        index,
        from: 'bulb',
        to: 'empty',
      });
    } else if (cell.xMark) {
      this.doMoveAndAddToHistory({
        type: 'ChangeCellValue',
        index,
        from: 'xMark',
        to: 'bulb',
      });
    } else {
      this.doMoveAndAddToHistory({
        type: 'ChangeCellValue',
        index,
        from: 'empty',
        to: 'xMark',
      });
    }
  }

  onApplySolverRecommendation(rec: SolverRecommendation | undefined): void {
    if (rec === undefined) {
      return;
    }

    this.doMoveAndAddToHistory({
      type: 'CompoundMove',
      moves: rec.moves.map(({ index, value }) => ({
        type: 'ChangeCellValue',
        index,
        from: cellValAtIndex(this.board, index),
        to: value,
      })),
    });
  }

  private doMoveAndAddToHistory(move: Move): void {
    this.doMove(move);
    this.moveHistory.push(move);

    // Clear the redo stack
    this.redoStack.splice(0, this.redoStack.length);
  }

  private doMove(move: Move): void {
    switch (move.type) {
      case 'ChangeCellValue': {
        this.doChangeCellValueMove(move);
        return;
      }
      case 'ChangeHighlight': {
        this.doChangeHighlightMove(move);
        return;
      }
      case 'CompoundMove': {
        move.moves.forEach((m) => {
          this.doMove(m);
        });
      }
    }
  }

  private undoMove(move: Move): void {
    switch (move.type) {
      case 'ChangeCellValue': {
        this.doChangeCellValueMove({
          ...move,
          from: move.to,
          to: move.from,
        });
        return;
      }
      case 'ChangeHighlight': {
        this.doChangeHighlightMove({
          ...move,
          from: move.to,
          to: move.from,
        });
        return;
      }
      case 'CompoundMove': {
        const moves = move.moves;
        for (let i = moves.length - 1; i >= 0; i--) {
          this.undoMove(moves[i]);
        }
        return;
      }
    }
  }

  private doChangeCellValueMove(move: Extract<Move, { type: 'ChangeCellValue' }>): void {
    const cell = cellAtIndex(this.board, move.index);
    if (cell.wall) {
      throw new Error('Cannot change value of a wall cell');
    }

    if (move.from === 'xMark' && move.to !== 'xMark') {
      delete cell.xMark;
    } else if (move.from !== 'xMark' && move.to === 'xMark') {
      cell.xMark = true;
    }

    if (move.from === 'bulb' && move.to !== 'bulb') {
      delete cell.bulb;
      this.unlightCells(move.index);
    } else if (move.from !== 'bulb' && move.to === 'bulb') {
      cell.bulb = true;
      this.lightCells(move.index);
    }
  }

  private doChangeHighlightMove(move: Extract<Move, { type: 'ChangeHighlight' }>): void {
    const cell = cellAtIndex(this.board, move.index);
    if (move.to !== undefined) {
      cell.highlight = move.to;
    } else {
      delete cell.highlight;
    }
  }

  private lightCells(index: Index): void {
    for (const otherIndex of lineOfSight(this.board, index, { includeStart: true })) {
      const cell = cellAtIndex(this.board, otherIndex);
      cell.lit = (cell.lit ?? 0) + 1;
    }
  }

  private unlightCells(index: Index): void {
    for (const otherIndex of lineOfSight(this.board, index, { includeStart: true })) {
      const cell = cellAtIndex(this.board, otherIndex);
      cell.lit = (cell.lit ?? 0) - 1;
      if (cell.lit <= 0) {
        delete cell.lit;
      }
    }
  }
}
