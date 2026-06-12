import { indicesEqual, type Index, type ReadOnlyBoardState } from '../model/board';
import type { CellValue } from '../model/game';
import type { RuleViolation } from '../rules/coreRules';
import type { SolverAnnotation, SolverMove, SolverRecommendation } from '../solver/techniques';
import { CellView } from './CellView';

interface Props {
  board: ReadOnlyBoardState;
  onCellClick: (index: Index) => void;
  ruleViolations: RuleViolation[];
  solverRecommendation: SolverRecommendation | undefined;
  animatingCells: SolverMove[] | undefined;
}

export function BoardView({
  board,
  onCellClick,
  ruleViolations,
  solverRecommendation,
  animatingCells,
}: Props) {
  return (
    <div className="akari-board-area">
      <div className="akari-board" style={getBoardStyle(board)}>
        {board.cells.flatMap((row, rowIndex) =>
          row.map((cell, columnIndex) => {
            const solverRecommendedValue: CellValue | undefined = solverRecommendation?.moves.find(
              (m) => indicesEqual(m.index, cell.index),
            )?.value;
            const solverAnnotation: SolverAnnotation | undefined =
              solverRecommendation?.annotations?.find((annotation) =>
                indicesEqual(annotation.index, cell.index),
              );
            const animateToValue: CellValue | undefined = animatingCells?.find((c) =>
              indicesEqual(c.index, cell.index),
            )?.value;

            return (
              <CellView
                cell={cell}
                board={board}
                key={`${rowIndex}-${columnIndex}`}
                onClick={() => {
                  onCellClick(cell.index);
                }}
                ruleViolation={ruleViolations.find((v) => indicesEqual(v.index, cell.index))}
                solverRecommendedValue={solverRecommendedValue}
                solverAnnotation={solverAnnotation}
                animateToValue={animateToValue}
              />
            );
          }),
        )}
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
}

function getBoardStyle(board: ReadOnlyBoardState): React.CSSProperties {
  return {
    gridTemplateRows: `repeat(${board.cells.length}, 1fr)`,
    gridTemplateColumns: `repeat(${board.cells[0].length}, 1fr)`,
  };
}
