import React from 'react';
import './App.css';
import { GameView } from './game/components/GameView';
import { SolverView } from './game/components/SolverView';
import { GameState } from './game/model/GameState';
import { createLibrary } from './puzzles/library';

interface GS {
  gameState: GameState;
  puzzleName: string;
}

export function App() {
  const library = React.useMemo(() => createLibrary(), []);
  const puzzleNames = React.useMemo(() => library.getNames(), [library]);
  const [{ gameState, puzzleName }, setGS] = React.useState<GS>(() => ({
    gameState: new GameState(library.getInitialBoard(puzzleNames[0])),
    puzzleName: puzzleNames[0],
  }));

  return (
    <div className="app-shell">
      <header className="app-header">Akari Helper</header>
      <main className="app-main">
        <section className="app-column">
          <GameView
            gameState={gameState}
            puzzleNames={puzzleNames}
            selectedPuzzleName={puzzleName}
            onSelectPuzzle={(puzzleName) => {
              setGS({
                gameState: new GameState(library.getInitialBoard(puzzleName)),
                puzzleName,
              });
            }}
            updateGameState={() => {
              setGS((state) => ({ ...state, gameState }));
            }}
          />
        </section>
        <section className="app-column">
          <SolverView gameState={gameState} />
        </section>
      </main>
    </div>
  );
}
