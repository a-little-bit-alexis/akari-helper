import cancelUrl from '../../../assets/cancel.svg';
import checkUrl from '../../../assets/check.svg';
import wandUrl from '../../../assets/wand.svg';
import type { ReadOnlyBoardState } from '../model/board';
import { getRecommendation, type SolverRecommendation } from '../solver/techniques';

interface Props {
  board: ReadOnlyBoardState;
  setSolverRecommendation: (rec: SolverRecommendation | undefined) => void;
  canApplyRecommendation: boolean;
  applySolverRecommendation: () => void;
}

export function SolverControls({
  board,
  setSolverRecommendation,
  canApplyRecommendation,
  applySolverRecommendation,
}: Props) {
  function generateRecommendation(): void {
    const recommendation = getRecommendation(board, { maxComplexity: 100 });
    setSolverRecommendation(recommendation);
  }

  return (
    <div className="game-controls">
      <button
        className="game-control-button"
        type="button"
        data-tooltip="Generate Recommendation"
        onClick={generateRecommendation}
      >
        <img className="game-control-icon" src={wandUrl} draggable={false} />
      </button>
      <button
        className="game-control-button"
        type="button"
        data-tooltip="Apply Recommendation"
        disabled={!canApplyRecommendation}
        onClick={applySolverRecommendation}
      >
        <img className="game-control-icon" src={checkUrl} draggable={false} />
      </button>
      <button
        className="game-control-button"
        type="button"
        data-tooltip="Clear Recommendation"
        disabled={!canApplyRecommendation}
        onClick={() => {
          setSolverRecommendation(undefined);
        }}
      >
        <img className="game-control-icon" src={cancelUrl} draggable={false} />
      </button>
    </div>
  );
}
