import type { Index, ReadOnlyCellState } from '../model/board';
import {
  analyzeNumberedWall,
  cellAtIndex,
  cellLineOfSight,
  cells,
  indicesEqual,
  intersections,
  needsToBeLit,
  numberedWalls,
  pairs,
  potentialBulb,
  type ReadOnlyBoardState,
} from '../model/board';
import type { SolverConfig, SolverRecommendation, Technique } from './techniques';

function floorCanOnlyBeLitByOneTile(
  board: ReadOnlyBoardState,
  config: SolverConfig,
): SolverRecommendation | undefined {
  if (config.maxComplexity < 1) {
    return;
  }

  for (const cell of cells(board)) {
    if (!needsToBeLit(cell)) {
      continue;
    }

    const potentialLights: ReadOnlyCellState[] = [];
    for (const otherCell of cellLineOfSight(board, cell, { includeStart: true })) {
      if (potentialBulb(otherCell)) {
        potentialLights.push(otherCell);
      }

      if (potentialLights.length > 1) {
        break;
      }
    }

    if (potentialLights.length !== 1) {
      continue;
    }

    const bulbMustGoAt = potentialLights[0].index;

    const lightsItself = indicesEqual(bulbMustGoAt, cell.index);

    let explanation = '';
    if (lightsItself) {
      explanation = 'This cell can only be illuminated by itself.';
    } else {
      explanation = 'This cell only has one possible cell that can illuminate it.';
    }

    return {
      moves: [
        {
          index: bulbMustGoAt,
          value: 'bulb',
        },
      ],
      annotations: lightsItself
        ? []
        : [
            {
              index: cell.index,
              label: 'Unlit cell',
              color: 'green',
            },
          ],
      explanation,
      complexity: 1,
    };
  }

  return undefined;
}

function bulbCannotGoOnCornerOfNumber(
  board: ReadOnlyBoardState,
  config: SolverConfig,
): SolverRecommendation | undefined {
  if (config.maxComplexity < 1) {
    return;
  }

  for (const wall of numberedWalls(board)) {
    const { numBulbsRequiredTotal, numBulbsRemaining, potentialBulbCells } = analyzeNumberedWall(
      board,
      wall,
    );

    if (numBulbsRemaining < 1) {
      continue;
    }

    // e.g., this rule applies if a wall needs 2 more bulbs
    // and there are 3 potential spots for them
    if (!(numBulbsRemaining + 1 === potentialBulbCells.length)) {
      continue;
    }

    const corners: Index[] = [];

    for (const [potA, potB] of pairs(potentialBulbCells)) {
      const intersectingIndices = intersections(board, potA.index, potB.index);

      for (const cornerIndex of intersectingIndices) {
        if (cellAtIndex(board, cornerIndex).xMark === true) {
          continue;
        }

        if (!corners.some((c) => indicesEqual(c, cornerIndex))) {
          corners.push(cornerIndex);
        }
      }
    }

    if (corners.length === 0) {
      continue;
    }

    const pluralBulbsRemaining = numBulbsRemaining > 1;

    const more = numBulbsRemaining < numBulbsRequiredTotal ? ' more' : '';
    const s = pluralBulbsRemaining ? 's' : '';

    const pluralCornersToMark = corners.length > 1;
    const cornerTiles = pluralCornersToMark ? 'corner tiles' : 'corner tile';

    return {
      moves: corners.map((index) => ({
        index,
        value: 'xMark',
      })),
      annotations: [
        {
          index: wall.index,
          label: '',
          color: 'orange',
        },
        ...potentialBulbCells.map((cell) => ({
          index: cell.index,
          label: '',
          color: '#ff5af1',
        })),
      ],
      explanation:
        `The wall (orange) needs ${numBulbsRemaining}${more} light bulb${s} ` +
        `out of the ${potentialBulbCells.length} adjacent empty tiles (pink). ` +
        `The marked ${cornerTiles} (green) would illuminate ` +
        (potentialBulbCells.length === 2
          ? 'both of the empty tiles.'
          : '2 of these empty tiles, leaving too few remaining.'),
      complexity: 1,
    };
  }

  return undefined;
}

export const L1_Techniques: Technique[] = [
  {
    name: 'Cell can only be lit by one other cell',
    getRecommendation: floorCanOnlyBeLitByOneTile,
    minComplexity: 1,
  },
  {
    name: 'Bulb cannot go on corner of number',
    getRecommendation: bulbCannotGoOnCornerOfNumber,
    minComplexity: 1,
  },
];
