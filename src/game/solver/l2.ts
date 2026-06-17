import * as Lists from '../../utils/lists';
import type { Board } from '../model/Board';
import type { Cell } from '../model/Cell';
import type { SolverConfig, SolverRecommendation, Technique } from './techniques';

function bulbsWouldLightUpSameCells(
  board: Board,
  config: SolverConfig,
): SolverRecommendation | undefined {
  if (config.maxComplexity < 2) {
    return;
  }

  function isRedundancyCandidate(cell: Cell): boolean {
    return cell.isBlank() && !cell.hasAdjacentNumberedWall();
  }

  let cellA: Cell | undefined;
  let cellB: Cell | undefined;
  let lightUpSet: Cell[] | undefined;

  for (const cell of board.cells()) {
    if (!isRedundancyCandidate(cell)) {
      continue;
    }

    const cellsThatWouldLightUp = [...cell.lineOfSight({ includeStart: true, unlitsOnly: true })];

    for (const redundancyCandidate of cellsThatWouldLightUp.filter(
      (c) => isRedundancyCandidate(c) && !cell.index.equals(c.index),
    )) {
      const candidateCellsThatWouldLightUp = [
        ...redundancyCandidate.lineOfSight({ includeStart: true, unlitsOnly: true }),
      ];

      if (Lists.sameCells(cellsThatWouldLightUp, candidateCellsThatWouldLightUp)) {
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
    (c) => !cellA.index.equals(c.index) && !cellB.index.equals(c.index),
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
