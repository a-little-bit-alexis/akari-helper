export class Index {
  constructor(
    public readonly row: number,
    public readonly col: number,
  ) {}

  toString(): string {
    return '<' + this.row.toString() + ',' + this.col.toString() + '>';
  }

  equals(other: Index): boolean {
    return this.row === other.row && this.col === other.col;
  }

  add(delta: [number, number]): Index {
    return new Index(this.row + delta[0], this.col + delta[1]);
  }

  compare(other: Index): number {
    return this.row === other.row ? this.col - other.col : this.row - other.row;
  }
}

export class IndexRange {
  constructor(
    public readonly minRow: number,
    public readonly maxRow: number,
    public readonly minCol: number,
    public readonly maxCol: number,
  ) {}

  *indices(): Generator<Index> {
    for (let row = this.minRow; row <= this.maxRow; row++) {
      for (let col = this.minCol; col <= this.maxCol; col++) {
        yield new Index(row, col);
      }
    }
  }

  contains(index: Index): boolean {
    return (
      index.row >= this.minRow &&
      index.row <= this.maxRow &&
      index.col >= this.minCol &&
      index.col <= this.maxCol
    );
  }
}
