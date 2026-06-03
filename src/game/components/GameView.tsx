/* eslint-disable react-hooks/immutability */
import React from 'react';
import { BoardView } from './BoardView';
import { GameControls } from './GameControls';
import { PuzzleSelector } from './PuzzleSelector';
import { SolverControls } from './SolverControls';
import { createLibrary } from '../../puzzles/library';
import type { BoardState } from '../model/BoardState';

export function GameView() {
  const library = React.useMemo(() => createLibrary(), []);
  const [boardState] = React.useState<BoardState>(() =>
    library.getInitialBoard(library.getNames()[0]),
  );

  boardState.cells[10][7].xMark = true;

  boardState.cells[5][5].bulb = true;
  boardState.cells[5][3].lit = true;
  boardState.cells[5][4].lit = true;
  boardState.cells[5][5].lit = true;

  for (let i = 5; i < boardState.cells.length; i++) {
    boardState.cells[i][5].lit = true;
  }

  return (
    <div className="game-view">
      <PuzzleSelector />
      <BoardView board={boardState} />
      <GameControls />
      <SolverControls />
    </div>
  );
}
