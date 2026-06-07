import React from 'react';
import './App.css';
import { GameView } from './game/components/GameView';
import { SolverView } from './game/components/SolverView';
import { GameState } from './game/model/GameState';
import { createLibrary } from './puzzles/library';

export function App() {
  const library = React.useMemo(() => createLibrary(), []);
  const [gameState, setGameState] = React.useState<GameState>(
    () => new GameState(library.getInitialBoard(library.getNames()[0])),
  );

  return (
    <div className="app-shell">
      <header className="app-header">Akari Helper</header>
      <main className="app-main">
        <section className="app-column">
          <GameView gameState={gameState} setGameState={setGameState} />
        </section>
        <section className="app-column">
          <SolverView gameState={gameState} />
        </section>
      </main>
    </div>
  );
}
