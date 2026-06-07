import React from 'react';
import { BoardView } from './BoardView';
import { GameControls } from './GameControls';
import { PuzzleSelector } from './PuzzleSelector';
import { SolverControls } from './SolverControls';
import type { GameState } from '../model/GameState';

interface Props {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export function GameView({ gameState, setGameState }: Props) {
  return (
    <div className="game-view">
      <PuzzleSelector />
      <BoardView
        board={gameState.board}
        onCellClick={(rowIndex, columnIndex) => {
          const newGameState = gameState.onCellClick(rowIndex, columnIndex);
          setGameState(newGameState);
        }}
        ruleViolations={gameState.ruleViolations}
      />
      <GameControls />
      <SolverControls />
    </div>
  );
}
