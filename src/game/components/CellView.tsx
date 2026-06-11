import lightbulbUrl from '../../../assets/lightbulb.svg';
import {
  adjacentBulbCount,
  adjacentIndices,
  type CellState,
  type ReadOnlyBoardState,
  type ReadOnlyCellState,
} from '../model/board';
import type { CellValue } from '../model/game';
import type { RuleViolation } from '../rules/coreRules';
import type { SolverAnnotation } from '../solver/techniques';

interface Props {
  cell: ReadOnlyCellState;
  board: ReadOnlyBoardState;
  onClick: () => void;
  ruleViolation: RuleViolation | undefined;
  solverRecommendedValue: CellValue | undefined;
  solverAnnotation: SolverAnnotation | undefined;
}

export function CellView({
  cell,
  board,
  onClick,
  ruleViolation,
  solverRecommendedValue,
  solverAnnotation,
}: Props) {
  const className = getClassName(cell, ruleViolation, solverRecommendedValue, solverAnnotation);
  const numberView = getNumberView(cell, board);
  const bulbView = getBulbView(cell, solverRecommendedValue);
  const markView = getMarkView(cell, solverRecommendedValue);
  const annotationView = getAnnotationView(solverAnnotation);

  return (
    <div
      className={className}
      data-rule-violation={ruleViolation?.message}
      onClick={onClick}
      style={getCellStyle(solverAnnotation)}
    >
      {numberView}
      {bulbView}
      {markView}
      {annotationView}
    </div>
  );
}

function getClassName(
  cell: CellState,
  ruleViolation: RuleViolation | undefined,
  solverRecommendedValue: CellValue | undefined,
  solverAnnotation: SolverAnnotation | undefined,
): string {
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

  if (solverRecommendedValue !== undefined) {
    classes.push('solver-recommended');
  }

  if (solverAnnotation !== undefined) {
    classes.push('solver-annotation');
  }

  return classes.join(' ');
}

function getCellStyle(solverAnnotation: SolverAnnotation | undefined): React.CSSProperties {
  if (solverAnnotation === undefined) {
    return {};
  }

  return {
    '--solver-annotation-color': solverAnnotation.color,
  } as React.CSSProperties;
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

function getBulbView(
  cell: CellState,
  solverRecommendedValue: CellValue | undefined,
): React.ReactNode {
  const value = solverRecommendedValue ?? getCurrentCellValue(cell);
  if (value !== 'bulb') {
    return null;
  }
  return (
    <img
      className={getValueClassName('akari-bulb-icon', solverRecommendedValue)}
      src={lightbulbUrl}
      draggable={false}
    />
  );
}

function getMarkView(
  cell: CellState,
  solverRecommendedValue: CellValue | undefined,
): React.ReactNode {
  const value = solverRecommendedValue ?? getCurrentCellValue(cell);
  if (value !== 'xMark') {
    return null;
  }
  return <span className={getValueClassName('akari-x-mark', solverRecommendedValue)}>✕</span>;
}

function getValueClassName(
  baseClassName: string,
  solverRecommendedValue: CellValue | undefined,
): string {
  if (solverRecommendedValue === undefined) {
    return baseClassName;
  }
  return `${baseClassName} solver-recommended-value`;
}

function getCurrentCellValue(cell: CellState): CellValue {
  if (cell.bulb) {
    return 'bulb';
  }
  if (cell.xMark) {
    return 'xMark';
  }
  return 'empty';
}

function getAnnotationView(solverAnnotation: SolverAnnotation | undefined): React.ReactNode {
  if (solverAnnotation === undefined) {
    return null;
  }

  return (
    <span className="akari-cell-annotation-labels">
      <span
        className="akari-cell-annotation-label"
        key={`${solverAnnotation.label}-${solverAnnotation.color}`}
        style={{ color: solverAnnotation.color }}
      >
        {solverAnnotation.label}
      </span>
    </span>
  );
}
