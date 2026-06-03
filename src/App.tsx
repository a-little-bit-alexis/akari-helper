import './App.css';
import { GameView } from './game/components/GameView';
import { SolverView } from './game/components/SolverView';

export function App() {
  return (
    <div className="app-shell">
      <header className="app-header">Akari Helper</header>
      <main className="app-main">
        <section className="app-column">
          <GameView />
        </section>
        <section className="app-column">
          <SolverView />
        </section>
      </main>
    </div>
  );
}
