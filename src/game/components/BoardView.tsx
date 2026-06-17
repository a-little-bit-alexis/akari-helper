import type { Board } from '../model/Board';
import type { Cell, CellInputValue } from '../model/Cell';
import type { Index } from '../model/CellIndex';
import type { RuleViolation } from '../rules/coreRules';
import type { SolverAnnotation, SolverMove, SolverRecommendation } from '../solver/techniques';
import { CellView } from './CellView';

interface Props {
  board: Board;
  onCellClick: (index: Index) => void;
  ruleViolations: RuleViolation[];
  solverRecommendation: SolverRecommendation | undefined;
  animatingCells: SolverMove[] | undefined;
}

export function BoardView({ board, onCellClick, ruleViolations, solverRecommendation }: Props) {
  return (
    <div className="akari-board-area">
      <div className="akari-board" style={getBoardStyle(board)}>
        {[...board.cells()].map((cell) => renderCell(cell))}
      </div>
      <div className="solver-recommendation-explanation-wrapper">
        {solverRecommendation !== undefined && (
          <div className="solver-recommendation-explanation">
            {solverRecommendation.explanation}
          </div>
        )}
      </div>
    </div>
  );

  function renderCell(cell: Cell): React.ReactNode {
    const solverRecommendedValue: CellInputValue | undefined = solverRecommendation?.moves.find(
      (m) => m.index.equals(cell.index),
    )?.value;

    const solverAnnotation: SolverAnnotation | undefined = solverRecommendation?.annotations?.find(
      (a) => a.index.equals(cell.index),
    );

    const ruleViolation = ruleViolations.find((v) => cell.index.equals(v.index));

    return (
      <CellView
        cell={cell}
        key={cell.index.toString()}
        onClick={() => {
          onCellClick(cell.index);
        }}
        ruleViolation={ruleViolation}
        solverRecommendedValue={solverRecommendedValue}
        solverAnnotation={solverAnnotation}
      />
    );
  }
}

function getBoardStyle(board: Board): React.CSSProperties {
  return {
    gridTemplateRows: `repeat(${board.rows}, 1fr)`,
    gridTemplateColumns: `repeat(${board.cols}, 1fr)`,
  };
}
