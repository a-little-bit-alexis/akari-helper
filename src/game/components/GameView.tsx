import React from 'react';
import { BoardView } from './BoardView';
import { GameControls } from './GameControls';
import { PuzzleSelector } from './PuzzleSelector';
import { SolverControls } from './SolverControls';
import { createLibrary } from '../../puzzles/library';
import { GameState } from '../model/GameState';

export function GameView() {
  const library = React.useMemo(() => createLibrary(), []);
  const [gameState, setGameState] = React.useState<GameState>(
    () => new GameState(library.getInitialBoard(library.getNames()[0])),
  );

  // boardState.cells[10][7].xMark = true;

  // boardState.cells[5][5].bulb = true;
  // boardState.cells[5][3].lit = true;
  // boardState.cells[5][4].lit = true;
  // boardState.cells[5][5].lit = true;

  // for (let i = 5; i < boardState.cells.length; i++) {
  //   boardState.cells[i][5].lit = true;
  // }

  return (
    <div className="game-view">
      <PuzzleSelector />
      <BoardView
        board={gameState.board}
        onCellClick={(rowIndex, columnIndex) => {
          const newGameState = gameState.onCellClick(rowIndex, columnIndex);
          setGameState(newGameState);
        }}
      />
      <GameControls />
      <SolverControls />
    </div>
  );
}
