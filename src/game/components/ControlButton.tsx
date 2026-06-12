interface Props {
  disabled?: boolean;
  iconUrl: string;
  label: string;
  onClick: () => void;
  tooltip?: string;
}

export function ControlButton({ disabled = false, iconUrl, label, onClick, tooltip }: Props) {
  return (
    <div className="game-control">
      <button
        className="game-control-button"
        data-tooltip={tooltip}
        disabled={disabled}
        type="button"
        onClick={onClick}
      >
        <img className="game-control-icon" src={iconUrl} draggable={false} />
      </button>
      <span className="game-control-label">{label}</span>
    </div>
  );
}
