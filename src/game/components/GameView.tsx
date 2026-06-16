import { BoardView } from './BoardView';
import { GameControls } from './GameControls';
import { PuzzleSelector } from './PuzzleSelector';
import { SolverControls } from './SolverControls';
import type { GameState } from '../model/GameState';
import type { SolverMove, SolverRecommendation } from '../solver/techniques';
import React from 'react';

interface Props {
  gameState: GameState;
  onSelectPuzzle: (puzzleName: string) => void;
  puzzleNames: string[];
  selectedPuzzleName: string;
  updateGameState: () => void;
}

export function GameView({
  gameState,
  onSelectPuzzle,
  puzzleNames,
  selectedPuzzleName,
  updateGameState,
}: Props) {
  const [solverRecommendation, setSolverRecommendation] = React.useState<
    SolverRecommendation | undefined
  >(undefined);

  const [animatingCells, setAnimatingCells] = React.useState<SolverMove[] | undefined>(undefined);

  return (
    <div className="game-view">
      <PuzzleSelector
        onSelect={(puzzleName) => {
          setAnimatingCells(undefined);
          setSolverRecommendation(undefined);
          onSelectPuzzle(puzzleName);
        }}
        puzzleNames={puzzleNames}
        selectedPuzzleName={selectedPuzzleName}
      />
      <BoardView
        board={gameState.board}
        onCellClick={(index) => {
          gameState.onCellClick(index);
          updateGameState();
        }}
        ruleViolations={gameState.ruleViolations}
        solverRecommendation={solverRecommendation}
        animatingCells={animatingCells}
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
        solverRecommendation={solverRecommendation}
        setSolverRecommendation={setSolverRecommendation}
        applySolverRecommendation={(solverRecommendation: SolverRecommendation) => {
          gameState.onApplySolverRecommendation(solverRecommendation);
          setAnimatingCells(solverRecommendation.moves);
          setSolverRecommendation(undefined);
          updateGameState();
        }}
      />
    </div>
  );
}
