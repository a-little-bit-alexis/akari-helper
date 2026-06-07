import type { ReadOnlyBoardState } from '../model/board';
import type { RuleViolation } from '../rules/coreRules';
import { CellView } from './CellView';

interface Props {
  board: ReadOnlyBoardState;
  onCellClick: (rowIndex: number, columnIndex: number) => void;
  ruleViolations: RuleViolation[];
}

export function BoardView({ board, onCellClick, ruleViolations }: Props) {
  return (
    <div className="akari-board" style={getBoardStyle(board)}>
      {board.cells.flatMap((row, rowIndex) =>
        row.map((cell, columnIndex) => (
          <CellView
            cell={cell}
            board={board}
            key={`${rowIndex}-${columnIndex}`}
            onClick={() => {
              onCellClick(rowIndex, columnIndex);
            }}
            ruleViolation={ruleViolations.find(
              (v) => v.index[0] === rowIndex && v.index[1] === columnIndex,
            )}
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
