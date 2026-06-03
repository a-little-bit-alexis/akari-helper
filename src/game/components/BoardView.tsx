import type { BoardState } from '../model/BoardState';
import { CellView } from './CellView';

interface Props {
  board: BoardState;
}

export function BoardView({ board }: Props) {
  return (
    <div className="akari-board" style={getBoardStyle(board)}>
      {board.cells.flatMap((row, rowIndex) =>
        row.map((cell, columnIndex) => <CellView cell={cell} key={`${rowIndex}-${columnIndex}`} />),
      )}
    </div>
  );
}

function getBoardStyle(board: BoardState): React.CSSProperties {
  return {
    gridTemplateRows: `repeat(${board.cells.length}, 1fr)`,
    gridTemplateColumns: `repeat(${board.cells[0].length}, 1fr)`,
  };
}
