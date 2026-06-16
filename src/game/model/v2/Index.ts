export class IndexV2 {
  constructor(
    public readonly row: number,
    public readonly col: number,
  ) {}

  toString(): string {
    return this.row.toString() + ',' + this.col.toString();
  }

  equals(other: IndexV2): boolean {
    return this.row === other.row && this.col === other.col;
  }

  add(delta: [number, number]): IndexV2 {
    return new IndexV2(this.row + delta[0], this.col + delta[1]);
  }
}

export class IndexRange {
  constructor(
    public readonly minRow: number,
    public readonly maxRow: number,
    public readonly minCol: number,
    public readonly maxCol: number,
  ) {}

  *indices(): Generator<IndexV2> {
    for (let row = this.minRow; row <= this.maxRow; row++) {
      for (let col = this.minCol; col <= this.maxCol; col++) {
        yield new IndexV2(row, col);
      }
    }
  }

  contains(index: IndexV2): boolean {
    return (
      index.row >= this.minRow &&
      index.row <= this.maxRow &&
      index.col >= this.minCol &&
      index.col <= this.maxCol
    );
  }
}
