import redoUrl from '../../../assets/redo.svg';
import undoUrl from '../../../assets/undo.svg';
import { ControlButton } from './ControlButton';

interface Props {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function GameControls({ canUndo, canRedo, onUndo, onRedo }: Props) {
  return (
    <div className="game-controls">
      <ControlButton disabled={!canUndo} iconUrl={undoUrl} label="Undo" onClick={onUndo} />
      <ControlButton disabled={!canRedo} iconUrl={redoUrl} label="Redo" onClick={onRedo} />
    </div>
  );
}
