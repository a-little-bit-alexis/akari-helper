import type { GameState } from '../model/GameState';

interface Props {
  gameState: GameState;
}

export function SolverAnalysis({ gameState }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  gameState;

  return <div className="placeholder-component placeholder-component-fill">SolverAnalysis</div>;
}
