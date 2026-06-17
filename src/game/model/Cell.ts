import type { Board } from './Board';
import type { Index } from './CellIndex';

export type CellInputValue = 'blank' | 'xMark' | 'bulb';

const DIRECTIONS: [number, number][] = [
  [-1, 0], // up
  [1, 0], // down
  [0, -1], // left
  [0, 1], // right
];

export class Cell {
  public inputValue: CellInputValue | undefined;
  public litCount: number = 0;

  public highlight: string | undefined;

  constructor(
    public readonly board: Board,
    public readonly index: Index,
    public readonly isWall: boolean,
    public readonly num: number | undefined,
  ) {
    if (!isWall) {
      this.inputValue = 'blank';
    }
  }

  public hasBulb(): boolean {
    return !this.isWall && this.inputValue === 'bulb';
  }

  public hasXMark(): boolean {
    return !this.isWall && this.inputValue === 'xMark';
  }

  public isBlank(): boolean {
    return !this.isWall && this.inputValue === 'blank' && !this.isLit();
  }

  public isNumberedWall(): boolean {
    return this.isWall && this.num !== undefined;
  }

  public isLit(): boolean {
    return this.litCount > 0;
  }

  public needsToBeLit(): boolean {
    return !this.isWall && !this.hasBulb() && !this.isLit();
  }

  public *adjacentCells(): Generator<Cell> {
    for (const delta of DIRECTIONS) {
      const adjacentIndex = this.index.add(delta);
      if (this.board.inBounds(adjacentIndex)) {
        yield this.board.getCell(adjacentIndex);
      }
    }
  }

  public *adjacentBulbs(): Generator<Cell> {
    for (const cell of this.adjacentCells()) {
      if (cell.hasBulb()) {
        yield cell;
      }
    }
  }

  public adjacentBulbCount(): number {
    let count = 0;
    for (const _ of this.adjacentBulbs()) {
      count++;
    }
    return count;
  }

  public hasAdjacentNumberedWall(): boolean {
    for (const adj of this.adjacentCells()) {
      if (adj.isNumberedWall()) {
        return true;
      }
    }

    return false;
  }

  public *lineOfSight(opts: LineOfSightOptions): Generator<Cell> {
    if (opts.includeStart) {
      if (shouldYield(this, opts)) {
        yield this;
      }
    }
    for (const delta of DIRECTIONS) {
      let index = this.index.add(delta);
      while (this.board.inBounds(index)) {
        const cell = this.board.getCell(index);
        if (cell.isWall) {
          break;
        }

        if (shouldYield(cell, opts)) {
          yield cell;
        }

        index = index.add(delta);
      }
    }
  }

  public numberedWallAnalysis(): NumberedWallAnalysis {
    if (!this.isWall || this.num === undefined) {
      throw new Error('Called numberedWallAnalysis on a cell that is not a numbered wall');
    }

    const neighbors = [...this.adjacentCells()].filter((c) => !c.isWall);

    const alreadyPlacedBulbs = neighbors.filter((n) => n.hasBulb());

    const blankCells = neighbors.filter((n) => n.isBlank());

    return {
      numBulbsRequiredTotal: this.num,
      numBulbsSoFar: alreadyPlacedBulbs.length,
      numBulbsRemaining: this.num - alreadyPlacedBulbs.length,
      numBlankCells: blankCells.length,

      blankCells,
    };
  }
}

export interface NumberedWallAnalysis {
  numBulbsRequiredTotal: number;
  numBulbsSoFar: number;
  numBulbsRemaining: number;
  numBlankCells: number;

  blankCells: Cell[];
}

export interface LineOfSightOptions {
  includeStart?: boolean;
  blanksOnly?: boolean;
  unlitsOnly?: boolean;
}

function shouldYield(cell: Cell, opts: LineOfSightOptions): boolean {
  if (opts.blanksOnly && !cell.isBlank()) {
    return false;
  }

  if (opts.unlitsOnly && cell.isLit()) {
    return false;
  }

  return true;
}
