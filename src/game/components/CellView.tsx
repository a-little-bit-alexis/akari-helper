import lightbulbUrl from '../../../assets/lightbulb.svg';
import type { Cell, CellInputValue } from '../model/Cell';
import type { RuleViolation } from '../rules/coreRules';
import type { SolverAnnotation } from '../solver/techniques';
import { XMark } from './XMark';

interface Props {
  cell: Cell;
  onClick: () => void;
  ruleViolation: RuleViolation | undefined;
  solverRecommendedValue: CellInputValue | undefined;
  solverAnnotation: SolverAnnotation | undefined;
}

export function CellView({
  cell,
  onClick,
  ruleViolation,
  solverRecommendedValue,
  solverAnnotation,
}: Props) {
  const className = getClassName(cell, ruleViolation, solverRecommendedValue, solverAnnotation);
  const numberView = getNumberView(cell);
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
  cell: Cell,
  ruleViolation: RuleViolation | undefined,
  solverRecommendedValue: CellInputValue | undefined,
  solverAnnotation: SolverAnnotation | undefined,
): string {
  const classes = ['akari-cell'];

  if (cell.isWall) {
    classes.push('wall');
  }

  if (cell.isLit()) {
    classes.push('lit');
  }

  if (cell.isWall && cell.isLit()) {
    throw new Error('Invalid cell state: a cell cannot be both a wall and lit');
  }

  if (ruleViolation !== undefined) {
    classes.push('rule-violation');
    if (cell.num !== undefined) {
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

function getNumberView(cell: Cell): React.ReactNode {
  if (cell.num === undefined) {
    return null;
  }

  const classes = ['akari-wall-number'];

  const { numBulbsRemaining, numBlankCells } = cell.numberedWallAnalysis();

  if (cell.num > 0 && numBulbsRemaining === 0) {
    classes.push('satisfied');
  }

  if (cell.num === 0 && numBlankCells === 0) {
    classes.push('satisfied');
  }

  return <span className={classes.join(' ')}>{cell.num}</span>;
}

function getBulbView(
  cell: Cell,
  solverRecommendedValue: CellInputValue | undefined,
): React.ReactNode {
  const value = solverRecommendedValue ?? cell.inputValue;
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
  cell: Cell,
  solverRecommendedValue: CellInputValue | undefined,
): React.ReactNode {
  const value = solverRecommendedValue ?? cell.inputValue;
  if (value !== 'xMark') {
    return null;
  }
  return <XMark isRecommendationPreview={solverRecommendedValue !== undefined} />;
}

function getValueClassName(
  baseClassName: string,
  solverRecommendedValue: CellInputValue | undefined,
): string {
  if (solverRecommendedValue === undefined) {
    return baseClassName;
  }
  return `${baseClassName} solver-recommended-value`;
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
