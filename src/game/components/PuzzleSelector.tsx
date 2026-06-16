import React from 'react';

interface Props {
  onSelect: (puzzleName: string) => void;
  puzzleNames: string[];
  selectedPuzzleName: string;
}

export function PuzzleSelector({ onSelect, puzzleNames, selectedPuzzleName }: Props) {
  const [pendingPuzzleName, setPendingPuzzleName] = React.useState(selectedPuzzleName);

  return (
    <div className="puzzle-selector">
      <select
        className="puzzle-selector-select"
        value={pendingPuzzleName}
        onChange={(event) => {
          setPendingPuzzleName(event.target.value);
        }}
      >
        {puzzleNames.map((puzzleName) => (
          <option key={puzzleName} value={puzzleName}>
            {puzzleName}
          </option>
        ))}
      </select>
      <button
        className="puzzle-selector-button"
        disabled={pendingPuzzleName.length === 0}
        type="button"
        onClick={() => {
          onSelect(pendingPuzzleName);
        }}
      >
        Play
      </button>
    </div>
  );
}
