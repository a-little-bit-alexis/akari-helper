import { IndexRange, IndexV2 } from './Index';

type CellInputValue = 'blank' | 'xMark' | 'bulb';

type CellSpec =
  | {
      cell_type: 'wall';
      number: undefined | 0 | 1 | 2 | 3 | 4;
    }
  | {
      cell_type: 'floor';
      inputValue: CellInputValue;
    };

type WallNumber = -1 | 0 | 1 | 2 | 3 | 4;

export class BoardStateV2 {
  // TODO use this
  private indexRange: IndexRange;

  private _isWall: boolean[][];
  private wallNumber: WallNumber[][];
  private isXMark: boolean[][];
  private _isBulb: boolean[][];
  private litCount: number[][];
  private cells: Cell[][];

  constructor(cells: CellSpec[][]) {
    if (cells.length === 0) {
      throw new Error('BoardState cannot be initialized with empty cell array');
    }

    const rows = cells.length;
    const cols = cells[0].length;

    this.indexRange = new IndexRange(0, 0, rows - 1, cols - 1);

    this._isWall = [];
    this.wallNumber = [];
    this.isXMark = [];
    this._isBulb = [];
    this.litCount = [];
    this.cells = [];

    let hasBulbs = false;

    for (let i = 0; i < cells.length; i++) {
      const isWallRow: boolean[] = [];
      const wallNumberRow: WallNumber[] = [];
      const isXMarkRow: boolean[] = [];
      const isBulbRow: boolean[] = [];
      const litCountRow: number[] = [];
      const cellsRow: Cell[] = [];

      if (cells[i].length !== cols) {
        throw new Error(`CellSpec row ${i} has different length than row 0`);
      }

      for (let j = 0; j < cells[i].length; j++) {
        const spec = cells[i][j];

        isWallRow.push(spec.cell_type === 'wall');
        wallNumberRow.push(
          spec.cell_type === 'wall' && spec.number !== undefined ? spec.number : -1,
        );
        isXMarkRow.push(spec.cell_type === 'floor' && spec.inputValue === 'xMark');

        const isBulb = spec.cell_type === 'floor' && spec.inputValue === 'bulb';
        isBulbRow.push(isBulb);
        hasBulbs = hasBulbs || isBulb;

        litCountRow.push(0);

        cellsRow.push(new Cell(this, new IndexV2(i, j)));
      }

      this._isWall.push(isWallRow);
      this.wallNumber.push(wallNumberRow);
      this.isXMark.push(isXMarkRow);
      this._isBulb.push(isBulbRow);
      this.litCount.push(litCountRow);
      this.cells.push(cellsRow);
    }

    if (hasBulbs) {
      this.recomputeLighting();
    }

    this.checkIntegrity();
  }

  private recomputeLighting(): void {
    // TODO implement
  }

  private checkIntegrity(): void {
    // TODO implement
  }

  public inBounds(index: IndexV2): boolean {
    return this.indexRange.contains(index);
  }

  public getCell(index: IndexV2): Cell {
    return this.cells[index.row][index.col];
  }

  public isWall(index: IndexV2): boolean {
    return this._isWall[index.row][index.col];
  }

  public isBulb(index: IndexV2): boolean {
    return this._isBulb[index.row][index.col];
  }

  public isLit(index: IndexV2): boolean {
    return this.litCount[index.row][index.col] > 0;
  }

  public needsToBeLit(index: IndexV2): boolean {
    return !this.isWall(index) && !this.isBulb(index) && !this.isLit(index);
  }
}

const DIRECTIONS: [number, number][] = [
  [-1, 0], // up
  [1, 0], // down
  [0, -1], // left
  [0, 1], // right
];

export class Cell {
  constructor(
    private readonly board: BoardStateV2,
    public readonly index: IndexV2,
  ) {}

  isBulb(): boolean {
    return this.board.isBulb(this.index);
  }

  needsToBeLit(): boolean {
    return this.board.needsToBeLit(this.index);
  }

  *adjacentCells(): Generator<Cell> {
    for (const delta of DIRECTIONS) {
      const adjacentIndex = this.index.add(delta);
      if (this.board.inBounds(adjacentIndex)) {
        yield this.board.getCell(adjacentIndex);
      }
    }
  }

  *lineOfSight({ includeStart }: { includeStart: boolean }): Generator<Cell> {
    if (includeStart) {
      yield this;
    }
    for (const delta of DIRECTIONS) {
      let index = this.index.add(delta);
      while (this.board.inBounds(index) && !this.board.isWall(index)) {
        yield this.board.getCell(index);
        index = index.add(delta);
      }
    }
  }

  *adjacentBulbs(): Generator<Cell> {
    for (const cell of this.adjacentCells()) {
      if (cell.isBulb()) {
        yield cell;
      }
    }
  }
}
