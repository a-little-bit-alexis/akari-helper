import type { RuleViolation } from '../rules/coreRules';
import { getRuleViolations } from '../rules/coreRules';
import type { SolverMove, SolverRecommendation } from '../solver/techniques';
import type { Board } from './Board';
import type { Index } from './CellIndex';
import type { Move } from './game';

export class GameState {
  public ruleViolations: RuleViolation[];

  private moveHistory: Move[] = [];
  private redoStack: Move[] = [];

  constructor(
    public board: Board,
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
    const cell = this.board.getCell(index);

    if (cell.isWall) {
      return;
    } else if (cell.hasBulb()) {
      this.doMoveAndAddToHistory({
        type: 'ChangeCellValue',
        index,
        from: 'bulb',
        to: 'blank',
      });
    } else if (cell.hasXMark()) {
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
        from: 'blank',
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
      moves: rec.moves.map(({ index, value }: SolverMove): Move => {
        const cell = this.board.getCell(index);
        if (cell.isWall) {
          throw new Error('Cannot change value of a wall cell');
        }

        const currentValue = cell.inputValue;

        if (currentValue === undefined) {
          throw new Error('Unexpected undefined cell value');
        }

        return {
          type: 'ChangeCellValue',
          index,
          from: currentValue,
          to: value,
        };
      }),
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
    const cell = this.board.getCell(move.index);

    if (cell.isWall) {
      throw new Error('Cannot change value of a wall cell');
    }

    const currentValue = move.from;
    const newValue = move.to;

    if (currentValue !== cell.inputValue) {
      throw new Error(
        `Move specifies incorrect current value: specified ${currentValue}, but cell is ${cell.inputValue}`,
      );
    }

    if (move.from === 'bulb' && move.to !== 'bulb') {
      this.unlightCells(move.index);
    } else if (move.from !== 'bulb' && move.to === 'bulb') {
      this.lightCells(move.index);
    }

    cell.inputValue = newValue;
  }

  private doChangeHighlightMove(move: Extract<Move, { type: 'ChangeHighlight' }>): void {
    const cell = this.board.getCell(move.index);
    if (move.to !== undefined) {
      cell.highlight = move.to;
    } else {
      delete cell.highlight;
    }
  }

  private lightCells(index: Index): void {
    const cell = this.board.getCell(index);
    for (const cellToLight of cell.lineOfSight({ includeStart: true })) {
      cellToLight.litCount++;
    }
  }

  private unlightCells(index: Index): void {
    const cell = this.board.getCell(index);
    for (const cellToLight of cell.lineOfSight({ includeStart: true })) {
      cellToLight.litCount--;
    }
  }
}
