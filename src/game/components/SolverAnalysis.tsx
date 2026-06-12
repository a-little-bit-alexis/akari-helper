import type { GameState } from '../model/GameState';
import { XMark } from './XMark';

interface Props {
  gameState: GameState;
}

export function SolverAnalysis({ gameState }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  gameState;

  return (
    <div className="solver-analysis-animation-stage">
      <XMark isRecommendationPreview={false} />
    </div>
  );
}
