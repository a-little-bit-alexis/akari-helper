import * as Lists from '../../utils/lists';
import * as Scanner from '../../utils/scanner';
import type { Board } from '../model/Board';
import type { Cell } from '../model/Cell';
import type { Index } from '../model/CellIndex';
import type { SolverConfig, SolverRecommendation, Technique } from './techniques';

function floorCanOnlyBeLitByOneTile(
  board: Board,
  config: SolverConfig,
): SolverRecommendation | undefined {
  if (config.maxComplexity < 1) {
    return;
  }

  for (const cell of board.unlitCells()) {
    const blanks: Cell[] = [];
    for (const blank of cell.lineOfSight({ includeStart: true, blanksOnly: true })) {
      blanks.push(blank);

      if (blanks.length > 1) {
        break;
      }
    }

    if (blanks.length !== 1) {
      continue;
    }

    const blank: Cell = blanks[0];

    const lightsItself = cell.index.equals(blank.index);

    let explanation = '';
    if (lightsItself) {
      explanation = 'This cell can only be illuminated by itself.';
    } else {
      explanation = 'This cell only has one possible cell that can illuminate it.';
    }

    return {
      moves: [
        {
          index: blank.index,
          value: 'bulb',
        },
      ],
      annotations: lightsItself
        ? []
        : [
            {
              index: cell.index,
              label: '',
              color: 'cyan',
            },
          ],
      explanation,
      complexity: 1,
    };
  }

  return undefined;
}

function bulbCannotGoOnCornerOfNumber(
  board: Board,
  config: SolverConfig,
): SolverRecommendation | undefined {
  if (config.maxComplexity < 1) {
    return;
  }

  for (const wall of board.numberedWalls()) {
    const { numBulbsRequiredTotal, numBulbsRemaining, blankCells } = wall.numberedWallAnalysis();

    if (numBulbsRemaining < 1) {
      continue;
    }

    // e.g., this rule applies if a wall needs 2 more bulbs
    // and there are 3 potential spots for them
    if (!(numBulbsRemaining + 1 === blankCells.length)) {
      continue;
    }

    const cornersThatNeedXMarks: Index[] = [];

    for (const [blankA, blankB] of Lists.pairs(blankCells)) {
      const intersectingCells = Scanner.intersections(blankA, blankB);

      for (const corner of intersectingCells) {
        if (!corner.isBlank()) {
          continue;
        }

        if (!cornersThatNeedXMarks.some((c) => c.equals(corner.index))) {
          cornersThatNeedXMarks.push(corner.index);
        }
      }
    }

    if (cornersThatNeedXMarks.length === 0) {
      continue;
    }

    const pluralBulbsRemaining = numBulbsRemaining > 1;

    const more = numBulbsRemaining < numBulbsRequiredTotal ? ' more' : '';
    const s = pluralBulbsRemaining ? 's' : '';

    const pluralCornersToMark = cornersThatNeedXMarks.length > 1;
    const cornerTiles = pluralCornersToMark ? 'corner tiles' : 'corner tile';

    return {
      moves: cornersThatNeedXMarks.map((index) => ({
        index,
        value: 'xMark',
      })),
      annotations: [
        {
          index: wall.index,
          label: '',
          color: '#18a3df',
        },
        ...blankCells.map((cell) => ({
          index: cell.index,
          label: '',
          color: '#7bd0f5',
        })),
      ],
      explanation:
        `This wall needs ${numBulbsRemaining}${more} light bulb${s} ` +
        `out of the ${blankCells.length} adjacent blank tiles (blue). ` +
        `The marked ${cornerTiles} (green) would illuminate ` +
        (blankCells.length === 2
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
