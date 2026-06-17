import type { Board } from '../model/Board';
import type { Index } from '../model/CellIndex';
import type { SolverConfig, SolverRecommendation, Technique } from './techniques';

function putXsNextToAllZeroes(
  board: Board,
  config: SolverConfig,
): SolverRecommendation | undefined {
  if (config.maxComplexity < 0) {
    return undefined;
  }
  const indicesToAddXs: Index[] = [];

  for (const wall of board.numberedWalls()) {
    if (wall.num === 0) {
      for (const adj of wall.adjacentCells()) {
        if (!adj.isWall && adj.inputValue !== 'xMark' && !adj.isLit()) {
          indicesToAddXs.push(adj.index);
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
  board: Board,
  config: SolverConfig,
): SolverRecommendation | undefined {
  if (config.maxComplexity < 0) {
    return undefined;
  }

  for (const wall of board.numberedWalls()) {
    if (wall.num === undefined || wall.num === 0) {
      continue;
    }

    const { numBulbsRequiredTotal, numBulbsRemaining, blankCells } = wall.numberedWallAnalysis();

    if (numBulbsRemaining <= 0) {
      continue;
    }

    if (blankCells.length !== numBulbsRemaining) {
      continue;
    }

    const plural = numBulbsRemaining > 1;
    const more = numBulbsRemaining < numBulbsRequiredTotal ? ' more' : '';
    const s = plural ? 's' : '';

    return {
      moves: blankCells.map((cell) => ({
        index: cell.index,
        value: 'bulb',
      })),
      annotations: [
        {
          index: wall.index,
          label: '',
          color: 'green',
        },
      ],
      explanation:
        `This wall needs ${numBulbsRemaining}${more} light bulb${s} adjacent to it. ` +
        `It only has ${numBulbsRemaining} adjacent blank tile${s}, so there must be a bulb in ` +
        (plural ? 'each of these tiles.' : 'this tile.'),
      complexity: 0,
    };
  }

  return undefined;
}

function putXsNextToNumberedWalls(
  board: Board,
  config: SolverConfig,
): SolverRecommendation | undefined {
  if (config.maxComplexity < 1) {
    return;
  }
  for (const wall of board.numberedWalls()) {
    const { numBulbsRequiredTotal, numBulbsRemaining, blankCells } = wall.numberedWallAnalysis();

    if (numBulbsRemaining > 0) {
      continue;
    }

    if (blankCells.length < 1) {
      continue;
    }

    return {
      moves: blankCells.map((cell) => ({
        index: cell.index,
        value: 'xMark',
      })),
      annotations: [
        {
          index: wall.index,
          color: 'green',
        },
      ],
      explanation: `This ${numBulbsRequiredTotal} has all its bulbs.`,
      complexity: 0,
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
  {
    name: "Put X's next to numbered walls with enough bulbs",
    getRecommendation: putXsNextToNumberedWalls,
    minComplexity: 0,
  },
  {
    name: 'Numbered Wall Only has N Neighboring Floor Tiles',
    getRecommendation: numberedWallOnlyHasNNeighboringFloorTiles,
    minComplexity: 0,
  },
];
