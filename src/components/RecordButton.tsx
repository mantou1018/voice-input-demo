import type { RecordingSessionState } from '../types/speech';

interface RecordButtonProps {
  disabled: boolean;
  onClick: () => void;
  state: RecordingSessionState;
}

export function RecordButton({ disabled, onClick, state }: RecordButtonProps) {
  const isLive = state === 'recording';
  const isBusy =
    state === 'requestingPermission' ||
    state === 'recognizing' ||
    state === 'summarizing';

  const label = isLive ? '结束录音' : '开始录音';
  const subLabel = isBusy ? '处理中' : isLive ? '实时转写' : '点击开始';

  return (
    <button
      aria-label={label}
      className={`record-button ${isLive ? 'record-button--live' : ''}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span className="record-button__halo record-button__halo--outer" />
      <span className="record-button__halo record-button__halo--inner" />
      <span className="record-button__core">
        <span className="record-button__icon" />
        <span className="record-button__label">{label}</span>
        <span className="record-button__sub-label">{subLabel}</span>
      </span>
    </button>
  );
}
