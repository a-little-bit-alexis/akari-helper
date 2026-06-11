import {
  adjacentCells,
  adjacentIndices,
  analyzeNumberedWall,
  cellAtIndex,
  numberedWalls,
  type Index,
  type ReadOnlyBoardState,
} from '../model/board';
import type { SolverConfig, SolverRecommendation, Technique } from './techniques';

function putXsNextToAllZeroes(
  board: ReadOnlyBoardState,
  config: SolverConfig,
): SolverRecommendation | undefined {
  if (config.maxComplexity < 0) {
    return undefined;
  }
  const indicesToAddXs: Index[] = [];
  for (const wall of numberedWalls(board)) {
    if (wall.number === 0) {
      for (const index of adjacentIndices(board, wall.index)) {
        const adjacentCell = cellAtIndex(board, index);
        if (!adjacentCell.wall && !adjacentCell.xMark && !adjacentCell.lit) {
          indicesToAddXs.push(index);
        }
      }
    }
  }

  if (indicesToAddXs.length === 0) {
    return undefined;
  }

  return {
    moves: indicesToAddXs.map((index) => ({
      index,
      value: 'xMark',
    })),
    explanation: 'All tiles next to a wall with a 0 must not have a bulb',
    complexity: 0,
  };
}

function numberedWallOnlyHasNNeighboringFloorTiles(
  board: ReadOnlyBoardState,
  config: SolverConfig,
): SolverRecommendation | undefined {
  if (config.maxComplexity < 0) {
    return undefined;
  }

  for (const wall of numberedWalls(board)) {
    if (wall.number === undefined || wall.number === 0) {
      continue;
    }

    const { numBulbsRequiredTotal, numBulbsRemaining, potentialBulbCells } = analyzeNumberedWall(
      board,
      wall,
    );

    const neighbors = [...adjacentCells(board, wall.index)].filter((c) => !c.wall);

    const alreadyPlacedBulbs = neighbors.filter((n) => n.bulb === true);

    if (numBulbsRequiredTotal <= alreadyPlacedBulbs.length) {
      continue;
    }

    if (potentialBulbCells.length !== numBulbsRemaining) {
      continue;
    }

    const neighborsToAddBulbsTo = potentialBulbCells;

    if (neighborsToAddBulbsTo.length === 0) {
      continue;
    }

    const litNeighbors = neighbors.filter((n) => !n.bulb && n.lit);
    const litNeighborsCount = litNeighbors.length;

    const markedNeighbors = neighbors.filter((n) => !n.bulb && !n.lit && n.xMark === true);
    const markedNeighborsCount = markedNeighbors.length;

    const complexity = litNeighborsCount * 0.1 + markedNeighborsCount * 0.2;

    const plural = numBulbsRemaining > 1;

    const are = plural ? 'are' : 'is';
    const doNot = plural ? 'do not' : 'does not';

    let predicate = '';
    if (markedNeighborsCount > 0 && litNeighborsCount === 0) {
      predicate = ` that do not have an X`;
    } else if (markedNeighborsCount === 0 && litNeighborsCount > 0) {
      predicate = ` that ${are} not illuminated`;
    } else if (markedNeighborsCount > 0 && litNeighborsCount > 0) {
      predicate = ` that ${are} not illuminated and ${doNot} have an X`;
    }

    const more = numBulbsRemaining < numBulbsRequiredTotal ? ' more' : '';
    const s = plural ? 's' : '';

    return {
      moves: neighborsToAddBulbsTo.map((cell) => ({
        index: cell.index,
        value: 'bulb',
      })),
      annotations: [
        {
          index: wall.index,
          label: 'Wall',
          color: 'green',
        },
      ],
      explanation:
        `This wall needs ${numBulbsRemaining}${more} light bulb${s} adjacent to it. ` +
        `It only has ${numBulbsRemaining} adjacent floor tile${s}${predicate}, so there must be a bulb in ` +
        (plural ? 'each of these tiles.' : 'this tile.'),
      complexity,
    };
  }

  return undefined;
}

export const L0_Techniques: Technique[] = [
  {
    name: "Put X's next to all 0's",
    getRecommendation: putXsNextToAllZeroes,
    minComplexity: 0,
  },
  // TODO: Put X's next to walls that already have all the bulbs they need
  {
    name: 'Numbered Wall Only has N Neighboring Floor Tiles',
    getRecommendation: numberedWallOnlyHasNNeighboringFloorTiles,
    minComplexity: 0,
  },
];
