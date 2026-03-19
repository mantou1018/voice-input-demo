import type { RecordingSessionState } from '../types/speech';

const STATUS_LABELS: Record<
  RecordingSessionState,
  { title: string; tone: 'idle' | 'active' | 'busy' | 'danger' }
> = {
  idle: { title: '待命中', tone: 'idle' },
  requestingPermission: { title: '请求权限', tone: 'busy' },
  recording: { title: '录音中', tone: 'active' },
  recognizing: { title: '整理识别', tone: 'busy' },
  summarizing: { title: '生成卡片', tone: 'busy' },
  result: { title: '结果就绪', tone: 'idle' },
  error: { title: '需重试', tone: 'danger' },
};

interface StatusBadgeProps {
  state: RecordingSessionState;
}

export function StatusBadge({ state }: StatusBadgeProps) {
  const descriptor = STATUS_LABELS[state];

  return (
    <div className={`status-badge status-badge--${descriptor.tone}`}>
      <span className="status-badge__dot" />
      <span>{descriptor.title}</span>
    </div>
  );
}
