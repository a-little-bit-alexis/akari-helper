import type { BoardState } from './BoardState';

const DIRECTIONS = [
  [-1, 0], // up
  [1, 0], // down
  [0, -1], // left
  [0, 1], // right
];

export class GameState {
  constructor(public board: BoardState) {}

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
    for (const [r, c] of this.bulbAffectedCells(rowIndex, columnIndex)) {
      const cell = this.board.cells[r][c];
      cell.lit = (cell.lit ?? 0) + 1;
    }
  }

  private unlightCells(rowIndex: number, columnIndex: number) {
    for (const [r, c] of this.bulbAffectedCells(rowIndex, columnIndex)) {
      const cell = this.board.cells[r][c];
      cell.lit = (cell.lit ?? 0) - 1;
      if (cell.lit <= 0) {
        delete cell.lit;
      }
    }
  }

  private *bulbAffectedCells(rowIndex: number, columnIndex: number): Generator<[number, number]> {
    yield [rowIndex, columnIndex];
    const cells = this.board.cells;
    for (const [dRow, dColumn] of DIRECTIONS) {
      let r = rowIndex + dRow;
      let c = columnIndex + dColumn;
      while (r >= 0 && r < cells.length && c >= 0 && c < cells[0].length) {
        if (this.board.cells[r][c].wall) {
          break;
        }
        yield [r, c];
        r += dRow;
        c += dColumn;
      }
    }
  }
}
