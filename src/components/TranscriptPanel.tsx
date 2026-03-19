import { useDeferredValue } from 'react';
import type { RecordingSessionState, TranscriptChunk } from '../types/speech';

interface TranscriptPanelProps {
  chunks: TranscriptChunk[];
  interimText: string;
  state: RecordingSessionState;
}

function resolvePlaceholder(state: RecordingSessionState) {
  switch (state) {
    case 'recording':
      return '正在听你说话，识别内容会实时出现在这里。';
    case 'recognizing':
      return '语音已经结束，正在整理最后的识别结果。';
    case 'summarizing':
      return '文本已冻结，正在生成摘要卡片。';
    case 'error':
      return '这次识别没有顺利完成，可以重试或切换示例数据。';
    case 'result':
      return '本次转写已完成，下面是生成后的信息卡片。';
    default:
      return '点击下方录音按钮，说出你的想法、会议纪要或待办事项。';
  }
}

export function TranscriptPanel({
  chunks,
  interimText,
  state,
}: TranscriptPanelProps) {
  const deferredChunks = useDeferredValue(chunks);
  const deferredInterim = useDeferredValue(interimText);
  const hasContent = deferredChunks.length > 0 || Boolean(deferredInterim);

  return (
    <section className="panel transcript-panel">
      <div className="panel__header">
        <p className="panel__eyebrow">Live Transcript</p>
        <h2>实时转写</h2>
      </div>

      <div className={`transcript-body ${hasContent ? 'transcript-body--filled' : ''}`}>
        {hasContent ? (
          <>
            {deferredChunks.map((chunk) => (
              <p className="transcript-line transcript-line--final" key={chunk.id}>
                {chunk.text}
              </p>
            ))}
            {deferredInterim ? (
              <p className="transcript-line transcript-line--interim">{deferredInterim}</p>
            ) : null}
          </>
        ) : (
          <p className="transcript-placeholder">{resolvePlaceholder(state)}</p>
        )}
      </div>
    </section>
  );
}
