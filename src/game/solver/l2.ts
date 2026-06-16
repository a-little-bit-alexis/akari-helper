import type { ReadOnlyCellState } from '../model/board';
import {
  cellLineOfSight,
  cells,
  hasAdjacentNumberedWall,
  indicesEqual,
  needsToBeLit,
  potentialBulb,
  sameCells,
  type ReadOnlyBoardState,
} from '../model/board';
import type { SolverConfig, SolverRecommendation, Technique } from './techniques';

function bulbsWouldLightUpSameCells(
  board: ReadOnlyBoardState,
  config: SolverConfig,
): SolverRecommendation | undefined {
  if (config.maxComplexity < 2) {
    return;
  }

  function isRedundancyCandidate(cell: ReadOnlyCellState): boolean {
    return potentialBulb(cell) && !hasAdjacentNumberedWall(board, cell);
  }

  let cellA: ReadOnlyCellState | undefined;
  let cellB: ReadOnlyCellState | undefined;
  let lightUpSet: ReadOnlyCellState[] | undefined;

  for (const cell of cells(board)) {
    if (!isRedundancyCandidate(cell)) {
      continue;
    }

    const cellsThatWouldLightUp = [...cellLineOfSight(board, cell, { includeStart: true })].filter(
      (c) => needsToBeLit(c),
    );

    for (const redundancyCandidate of cellsThatWouldLightUp.filter(
      (c) => isRedundancyCandidate(c) && !indicesEqual(c.index, cell.index),
    )) {
      const candidateCellsThatWouldLightUp = [
        ...cellLineOfSight(board, redundancyCandidate, { includeStart: true }),
      ].filter(needsToBeLit);

      if (sameCells(cellsThatWouldLightUp, candidateCellsThatWouldLightUp)) {
        cellA = cell;
        cellB = redundancyCandidate;
        lightUpSet = cellsThatWouldLightUp;
        break;
      }
    }

    if (cellA !== undefined) {
      break;
    }
  }

  if (cellA === undefined || cellB === undefined || lightUpSet === undefined) {
    return undefined;
  }

  const setDiff = lightUpSet.filter(
    (c) => !indicesEqual(cellA.index, c.index) && !indicesEqual(cellB.index, c.index),
  );

  return {
    moves: [
      {
        index: cellA.index,
        value: 'xMark',
      },
      {
        index: cellB.index,
        value: 'xMark',
      },
    ],
    annotations: setDiff.map((c) => ({
      index: c.index,
      label: '',
      color: 'orange',
    })),
    explanation: 'These cells have the same effect',
    complexity: 2,
  };
}

export const L2_Techniques: Technique[] = [
  {
    name: 'Bulbs would light up the same set of cells',
    getRecommendation: bulbsWouldLightUpSameCells,
    minComplexity: 2,
  },
];
