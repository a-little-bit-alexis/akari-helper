import './App.css';

const gridSize = 10;
const cells = Array.from({ length: gridSize * gridSize }, (_, index) => index);

function getCellLabel(cell: number) {
  const row = Math.floor(cell / gridSize) + 1;
  const column = (cell % gridSize) + 1;

  return `Row ${String(row)}, column ${String(column)}`;
}

export function App() {
  return (
    <main className="app-shell">
      <div
        className="akari-board"
        role="grid"
        aria-label="Akari board"
        aria-colcount={gridSize}
        aria-rowcount={gridSize}
      >
        {cells.map((cell) => (
          <div key={cell} className="akari-cell" role="gridcell" aria-label={getCellLabel(cell)} />
        ))}
      </div>
    </main>
  );
}
