import cancelUrl from '../../../assets/cancel.svg';
import checkUrl from '../../../assets/check.svg';
import wandUrl from '../../../assets/wand.svg';
import type { Board } from '../model/Board';
import { getRecommendation, type SolverRecommendation } from '../solver/techniques';
import { ControlButton } from './ControlButton';

interface Props {
  board: Board;
  solverRecommendation: SolverRecommendation | undefined;
  setSolverRecommendation: (rec: SolverRecommendation | undefined) => void;
  applySolverRecommendation: (solverRecommendation: SolverRecommendation) => void;
}

export function SolverControls({
  board,
  solverRecommendation,
  setSolverRecommendation,
  applySolverRecommendation,
}: Props) {
  function generateRecommendation(): void {
    const recommendation = getRecommendation(board, { maxComplexity: 100 });
    setSolverRecommendation(recommendation);
  }

  return (
    <div className="game-controls">
      {solverRecommendation === undefined ? (
        <ControlButton
          iconUrl={wandUrl}
          label="Generate Recommendation"
          onClick={generateRecommendation}
        />
      ) : null}
      {solverRecommendation !== undefined ? (
        <ControlButton
          iconUrl={checkUrl}
          label="Apply Recommendation"
          onClick={() => {
            applySolverRecommendation(solverRecommendation);
          }}
        />
      ) : null}
      <ControlButton
        disabled={solverRecommendation === undefined}
        iconUrl={cancelUrl}
        label="Clear Recommendation"
        onClick={() => {
          setSolverRecommendation(undefined);
        }}
      />
    </div>
  );
}
