import type { GameState } from '../model/GameState';
import { SolverAnalysis } from './SolverAnalysis';
import { SolverHistory } from './SolverHistory';

interface Props {
  gameState: GameState;
}

export function SolverView({ gameState }: Props) {
  return (
    <div className="solver-view">
      <div className="solver-view-section">
        <SolverAnalysis gameState={gameState} />
      </div>
      <div className="solver-view-section">
        <SolverHistory />
      </div>
    </div>
  );
}
