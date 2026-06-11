import React from 'react';
import './App.css';
import { GameView } from './game/components/GameView';
import { SolverView } from './game/components/SolverView';
import { GameState } from './game/model/GameState';
import { createLibrary } from './puzzles/library';

interface GS {
  gameState: GameState;
}

export function App() {
  const library = React.useMemo(() => createLibrary(), []);
  const [{ gameState }, setGS] = React.useState<GS>(() => ({
    gameState: new GameState(library.getInitialBoard(library.getNames()[0])),
  }));

  return (
    <div className="app-shell">
      <header className="app-header">Akari Helper</header>
      <main className="app-main">
        <section className="app-column">
          <GameView
            gameState={gameState}
            updateGameState={() => {
              setGS({ gameState });
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
