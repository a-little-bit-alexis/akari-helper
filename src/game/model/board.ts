import { Cell } from './Cell';
import { Index, IndexRange } from './CellIndex';

export type EmptyBoardCellSpec =
  | {
      cell_type: 'wall';
      number: undefined | 0 | 1 | 2 | 3 | 4;
    }
  | {
      cell_type: 'floor';
    };

export class Board {
  private indexRange: IndexRange;

  public readonly rows: number;
  public readonly cols: number;

  private cells_: Cell[][];

  public static createEmptyBoard(specs: EmptyBoardCellSpec[][]): Board {
    return new Board(specs);
  }

  public static createInProgressBoard(): Board {
    throw new Error('Not implemented');
  }

  private constructor(cells: EmptyBoardCellSpec[][]) {
    if (cells.length === 0) {
      throw new Error('Board cannot be initialized with empty cell array');
    }

    this.rows = cells.length;
    this.cols = cells[0].length;

    this.indexRange = new IndexRange(0, this.rows - 1, 0, this.cols - 1);

    this.cells_ = [];

    for (let i = 0; i < cells.length; i++) {
      if (cells[i].length !== this.cols) {
        throw new Error(`CellSpec row ${i} has different length than row 0`);
      }

      const cellsRow: Cell[] = [];

      for (let j = 0; j < cells[i].length; j++) {
        const spec = cells[i][j];
        const index = new Index(i, j);
        const isWall = spec.cell_type === 'wall';
        const num = spec.cell_type === 'wall' ? spec.number : undefined;
        const cell = new Cell(this, index, isWall, num);
        cellsRow.push(cell);
      }

      this.cells_.push(cellsRow);
    }
  }

  public inBounds(index: Index): boolean {
    return this.indexRange.contains(index);
  }

  public getCell(index: Index): Cell {
    if (!this.inBounds(index)) {
      throw new Error(`Index ${index.toString()} is out of bounds`);
    }

    return this.cells_[index.row][index.col];
  }

  public *cells(): Generator<Cell> {
    for (const row of this.cells_) {
      for (const cell of row) {
        yield cell;
      }
    }
  }

  public *numberedWalls(): Generator<Cell> {
    for (const cell of this.cells()) {
      if (cell.isWall && cell.num !== undefined) {
        yield cell;
      }
    }
  }

  public *unlitCells(): Generator<Cell> {
    for (const cell of this.cells()) {
      if (!cell.isWall && !cell.isLit()) {
        yield cell;
      }
    }
  }
}
