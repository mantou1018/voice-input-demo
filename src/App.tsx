import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useVoiceSession } from './hooks/useVoiceSession';
import './styles.css';

const JOB_DETAIL_IMAGE =
  'https://www.figma.com/api/mcp/asset/108b7e8f-dc49-49ce-9775-18b9719ae5e6';

const PROMPT_ITEMS = [
  '1.你的姓名              2.年龄',
  '3.期望工作的城市    4. 期望岗位',
];

const EXAMPLE_SPEECH = '“我叫张三，25岁，希望去北京工作，应聘Java开发岗。”';

function Waveform({ compact = false }: { compact?: boolean }) {
  const bars = compact ? 12 : 18;

  return (
    <div className={`waveform ${compact ? 'waveform--compact' : ''}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, index) => (
        <span
          className="waveform__bar"
          key={index}
          style={{ animationDelay: `${index * 0.08}s` }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const { card, elapsedSeconds, error, isSupported, phase, transcriptText, actions } =
    useVoiceSession();
  const startYRef = useRef(0);
  const cancelIntentRef = useRef(false);
  const [isPointerHolding, setIsPointerHolding] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!isPointerHolding) {
      return;
    }

    const handleMove = (event: globalThis.PointerEvent) => {
      const nextCancel = startYRef.current - event.clientY > 88;
      cancelIntentRef.current = nextCancel;
      setIsCancelling(nextCancel);
    };

    const handleFinish = () => {
      setIsPointerHolding(false);
      setIsCancelling(false);
      actions.finishHoldToTalk(cancelIntentRef.current);
      cancelIntentRef.current = false;
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleFinish);
    window.addEventListener('pointercancel', handleFinish);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleFinish);
      window.removeEventListener('pointercancel', handleFinish);
    };
  }, [actions, isPointerHolding]);

  function beginHold(event: ReactPointerEvent<HTMLButtonElement>) {
    startYRef.current = event.clientY;
    cancelIntentRef.current = false;
    setIsCancelling(false);
    setIsPointerHolding(true);
    void actions.startHoldToTalk();
  }

  const showDimmedOverlay = phase !== 'job';
  const bubbleHasText = transcriptText.length > 0;
  const secondsLabel = `${Math.max(elapsedSeconds || 0, 12)}''`;

  return (
    <div className="voice-page">
      <main className="phone-shell">
        <img
          alt="职位详情"
          className="job-image"
          src={JOB_DETAIL_IMAGE}
        />

        {phase === 'job' ? (
          <section className="job-footer" aria-label="底部操作区">
            <button className="job-footer__chat" type="button">
              在线聊
            </button>
            <button
              aria-label="免费报名"
              className="job-footer__apply"
              onClick={actions.openApply}
              type="button"
            >
              免费报名
            </button>
          </section>
        ) : null}

        {showDimmedOverlay ? <div className="dimmed-layer" /> : null}

        {showDimmedOverlay ? (
          <button
            aria-label="关闭"
            className="close-hitbox"
            onClick={actions.closeOverlay}
            type="button"
          />
        ) : null}

        {phase === 'intro' ? (
          <section className="intro-overlay">
            <div className="intro-copy">
              <p className="intro-copy__lead">为了帮你快速报名，请你告诉我以下信息：</p>
              <div className="intro-copy__list">
                {PROMPT_ITEMS.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <div className="intro-copy__example">
                <p>你可以这样对我说：</p>
                <p>{EXAMPLE_SPEECH}</p>
              </div>
            </div>

            <div className="intro-actions">
              <button
                aria-label="按住说话"
                className="hold-button"
                disabled={!isSupported}
                onPointerDown={beginHold}
                type="button"
              >
                按住说话
              </button>
              {error ? <p className="overlay-error">{error.message}</p> : null}
              {!isSupported ? (
                <p className="overlay-error">当前手机浏览器不支持语音识别。</p>
              ) : null}
            </div>
          </section>
        ) : null}

        {phase === 'recording' ? (
          <section className="recording-overlay">
            <div className={`speech-bubble ${isCancelling ? 'speech-bubble--cancel' : ''}`}>
              {bubbleHasText ? (
                <>
                  <p className="speech-bubble__text">{transcriptText}</p>
                  <Waveform compact />
                </>
              ) : (
                <Waveform />
              )}
              <span className="speech-bubble__tail" />
            </div>

            <button
              aria-label="取消录音"
              className={`cancel-button ${isCancelling ? 'cancel-button--active' : ''}`}
              onClick={() => actions.finishHoldToTalk(true)}
              type="button"
            >
              ×
            </button>

            <div className="record-bottom-sheet">
              <p>
                松手发送，上滑取消 <span>{secondsLabel}</span>
              </p>
            </div>
          </section>
        ) : null}

        {phase === 'review' && card ? (
          <section className="review-overlay">
            <div className="review-card">
              <p className="review-card__title">{card.title}</p>

              <div className="review-card__fields">
                {card.fields.map((field) => (
                  <div className="review-card__row" key={field.label}>
                    <span>{field.label}</span>
                    <strong>{field.value}</strong>
                  </div>
                ))}
              </div>

              <button className="review-card__cta" onClick={actions.submitCard} type="button">
                {card.ctaLabel}
              </button>

              <p className="review-card__footnote">{card.footnote}</p>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
