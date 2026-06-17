import type { Cell } from '../game/model/Cell';
import { Index } from '../game/model/CellIndex';

/**
 * Find the intersections, if any, of the lines of sight of cells A and B.
 */
export function intersections(cellA: Cell, cellB: Cell): Cell[] {
  if (cellA.index.equals(cellB.index)) {
    return [];
  }

  if (cellA.index.row === cellB.index.row) {
    return [];
  }

  if (cellA.index.col === cellB.index.col) {
    return [];
  }

  // We could be naive about it and iterate over the line of sight of each cell, but
  // really there are only two possible intersection points, and two lines we need to
  // check for walls for each.

  // . . . . . . . . . . . . . . .
  // . . . A . . . . . . c . . . .
  // . . . . . . . . . X . . . . .
  // . . X X X . . . . X . . . . .
  // . . . . . . . . . . . X . . .
  // . . . d . . . . . . B . . . .

  // In this example, `c` and `d` are the possible intersection points
  // of the lines of sight of A and B. Since there is a wall on the path
  // between A and d, d is not a valid intersection point. Since there are
  // no walls on either the path between A and c or that between B and c,
  // c is a valid intersection point.

  const intersections: Cell[] = [];
  const board = cellA.board;

  // Define A as the index with the lower row index.
  // In the example above, B has a greater col index, but we also
  // need to check the case where B has a lower col index.

  const a = cellA.index.row < cellB.index.row ? cellA.index : cellB.index;
  const b = cellA.index.row < cellB.index.row ? cellB.index : cellA.index;
  const c = new Index(a.row, b.col);
  const d = new Index(b.row, a.col);

  // dCol is 1 if B has a greater col index than A, and -1 otherwise.
  const dCol = b.col > a.col ? 1 : -1;

  // Check if `c` is a valid intersection point.
  let foundWall = false;

  // First check C itself
  if (board.getCell(c).isWall) {
    foundWall = true;
  }

  if (!foundWall) {
    // Then check the line of sight from A to C
    for (let col = a.col; col !== b.col; col += dCol) {
      if (board.getCell(new Index(a.row, col)).isWall) {
        foundWall = true;
        break;
      }
    }
  }

  if (!foundWall) {
    // Then check the line of sight from B to C
    for (let row = b.row; row !== a.row; row--) {
      if (board.getCell(new Index(row, c.col)).isWall) {
        foundWall = true;
        break;
      }
    }
  }

  if (!foundWall) {
    intersections.push(board.getCell(c));
  }

  // Next check if `d` is a valid intersection point.
  foundWall = false;

  // First check D itself
  if (board.getCell(d).isWall) {
    foundWall = true;
  }

  if (!foundWall) {
    // Then check the line of sight from A to D
    for (let row = a.row; row !== d.row; row++) {
      if (board.getCell(new Index(row, a.col)).isWall) {
        foundWall = true;
        break;
      }
    }
  }

  if (!foundWall) {
    // Then check the line of sight from B to D
    for (let col = b.col; col !== d.col; col -= dCol) {
      if (board.getCell(new Index(b.row, col)).isWall) {
        foundWall = true;
        break;
      }
    }
  }

  if (!foundWall) {
    intersections.push(board.getCell(d));
  }

  return intersections;
}
