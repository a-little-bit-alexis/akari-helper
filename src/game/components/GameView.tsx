import { BoardView } from './BoardView';
import { GameControls } from './GameControls';
import { PuzzleSelector } from './PuzzleSelector';
import { SolverControls } from './SolverControls';
import type { GameState } from '../model/GameState';
import type { SolverRecommendation } from '../solver/techniques';
import React from 'react';

interface Props {
  gameState: GameState;
  updateGameState: () => void;
}

export function GameView({ gameState, updateGameState }: Props) {
  const [solverRecommendation, setSolverRecommendation] = React.useState<
    SolverRecommendation | undefined
  >(undefined);

  return (
    <div className="game-view">
      <PuzzleSelector />
      <BoardView
        board={gameState.board}
        onCellClick={(index) => {
          gameState.onCellClick(index);
          updateGameState();
        }}
        ruleViolations={gameState.ruleViolations}
        solverRecommendation={solverRecommendation}
      />
      <GameControls
        canRedo={gameState.canRedo()}
        canUndo={gameState.canUndo()}
        onUndo={() => {
          gameState.onUndo();
          updateGameState();
        }}
        onRedo={() => {
          gameState.onRedo();
          updateGameState();
        }}
      />
      <SolverControls
        board={gameState.board}
        setSolverRecommendation={setSolverRecommendation}
        canApplyRecommendation={solverRecommendation !== undefined}
        applySolverRecommendation={() => {
          gameState.onApplySolverRecommendation(solverRecommendation);
          setSolverRecommendation(undefined);
          updateGameState();
        }}
      />
    </div>
  );
}
