import lightbulbUrl from '../../../assets/lightbulb.svg';
import {
  adjacentBulbCount,
  adjacentIndices,
  type CellState,
  type ReadOnlyBoardState,
  type ReadOnlyCellState,
} from '../model/board';
import type { RuleViolation } from '../rules/coreRules';

interface Props {
  cell: ReadOnlyCellState;
  board: ReadOnlyBoardState;
  onClick: () => void;
  ruleViolation: RuleViolation | undefined;
}

export function CellView({ cell, board, onClick, ruleViolation }: Props) {
  const className = getClassName(cell, ruleViolation);
  const numberView = getNumberView(cell, board);
  const bulbView = getBulbView(cell);
  const markView = getMarkView(cell);

  return (
    <div className={className} data-rule-violation={ruleViolation?.message} onClick={onClick}>
      {numberView}
      {bulbView}
      {markView}
    </div>
  );
}

function getClassName(cell: CellState, ruleViolation: RuleViolation | undefined): string {
  const classes = ['akari-cell'];

  if (cell.wall) {
    classes.push('wall');
  }

  if (cell.lit) {
    classes.push('lit');
  }

  if (cell.wall && cell.lit) {
    throw new Error('Invalid cell state: a cell cannot be both a wall and lit');
  }

  if (ruleViolation !== undefined) {
    classes.push('rule-violation');
    if (cell.number !== undefined) {
      classes.push('number-rule-violation');
    }
  }

  return classes.join(' ');
}

function getNumberView(cell: CellState, board: ReadOnlyBoardState): React.ReactNode {
  if (cell.number === undefined) {
    return null;
  }

  const classes = ['akari-wall-number'];

  if (cell.number > 0 && cell.number === adjacentBulbCount(board, cell.index)) {
    classes.push('satisfied');
  }

  if (cell.number === 0) {
    let hasUnmarkedEmptyAdjacentCell = false;
    for (const [r, c] of adjacentIndices(board, cell.index)) {
      const adjacentCell = board.cells[r][c];
      if (!adjacentCell.wall && !adjacentCell.bulb && !adjacentCell.xMark && !adjacentCell.lit) {
        hasUnmarkedEmptyAdjacentCell = true;
        break;
      }
    }
    if (!hasUnmarkedEmptyAdjacentCell) {
      classes.push('satisfied');
    }
  }

  return <span className={classes.join(' ')}>{cell.number}</span>;
}

function getBulbView(cell: CellState): React.ReactNode {
  if (!cell.bulb) {
    return null;
  }
  return <img className="akari-bulb-icon" src={lightbulbUrl} draggable={false} />;
}

function getMarkView(cell: CellState): React.ReactNode {
  if (!cell.xMark) {
    return null;
  }
  return <span className="akari-x-mark">✕</span>;
}
