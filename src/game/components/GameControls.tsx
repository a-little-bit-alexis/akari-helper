import redoUrl from '../../../assets/redo.svg';
import undoUrl from '../../../assets/undo.svg';

interface Props {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function GameControls({ canUndo, canRedo, onUndo, onRedo }: Props) {
  return (
    <div className="game-controls">
      <button
        className="game-control-button"
        data-tooltip="Undo"
        disabled={!canUndo}
        type="button"
        onClick={onUndo}
      >
        <img className="game-control-icon" src={undoUrl} draggable={false} />
      </button>
      <button
        className="game-control-button"
        data-tooltip="Redo"
        disabled={!canRedo}
        type="button"
        onClick={onRedo}
      >
        <img className="game-control-icon" src={redoUrl} draggable={false} />
      </button>
    </div>
  );
}
