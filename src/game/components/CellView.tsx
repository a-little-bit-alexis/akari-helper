import lightbulbUrl from '../../../assets/lightbulb.svg';
import type { CellState } from '../model/BoardState';

interface Props {
  cell: CellState;
}

export function CellView({ cell }: Props) {
  const className = getClassName(cell);
  const numberView = getNumberView(cell);
  const bulbView = getBulbView(cell);
  const markView = getMarkView(cell);

  return (
    <div className={className}>
      {numberView}
      {bulbView}
      {markView}
    </div>
  );
}

function getClassName(cell: CellState): string {
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

  return classes.join(' ');
}

function getNumberView(cell: CellState): React.ReactNode {
  if (cell.number === undefined) {
    return null;
  }
  return <span className="akari-wall-number">{cell.number}</span>;
}

function getBulbView(cell: CellState): React.ReactNode {
  if (!cell.bulb) {
    return null;
  }
  return <img className="akari-bulb-icon" src={lightbulbUrl} />;
}

function getMarkView(cell: CellState): React.ReactNode {
  if (!cell.xMark) {
    return null;
  }
  return <span className="akari-x-mark">✕</span>;
}
