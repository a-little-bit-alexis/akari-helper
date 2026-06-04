import type { ReadOnlyBoardState } from '../model/BoardState';
import { CellView } from './CellView';

interface Props {
  board: ReadOnlyBoardState;
  onCellClick: (rowIndex: number, columnIndex: number) => void;
}

export function BoardView({ board, onCellClick }: Props) {
  return (
    <div className="akari-board" style={getBoardStyle(board)}>
      {board.cells.flatMap((row, rowIndex) =>
        row.map((cell, columnIndex) => (
          <CellView
            cell={cell}
            key={`${rowIndex}-${columnIndex}`}
            onClick={() => {
              onCellClick(rowIndex, columnIndex);
            }}
          />
        )),
      )}
    </div>
  );
}

function getBoardStyle(board: ReadOnlyBoardState): React.CSSProperties {
  return {
    gridTemplateRows: `repeat(${board.cells.length}, 1fr)`,
    gridTemplateColumns: `repeat(${board.cells[0].length}, 1fr)`,
  };
}
