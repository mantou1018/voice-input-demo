import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useVoiceSession } from './hooks/useVoiceSession';
import type { ResumeExtractionItem } from './types/speech';
import './styles.css';

const JOB_DETAIL_IMAGE =
  'https://www.figma.com/api/mcp/asset/108b7e8f-dc49-49ce-9775-18b9719ae5e6';
const BACK_ICON_IMAGE =
  'https://www.figma.com/api/mcp/asset/b87d8e3e-907a-496b-9bbe-0558ac305fe8';
const INTRO_BLANK_IMAGE =
  'https://www.figma.com/api/mcp/asset/473f1ec1-776d-416d-8a4b-bdcc90f00711';
const INTRO_PHONE_LINE_IMAGE =
  'https://www.figma.com/api/mcp/asset/e514439e-e201-4ab6-b424-a42c3e65e3f9';

function VoiceGuide({ mode }: { mode: 'intro' | 'recording' }) {
  return (
    <div className={`voice-guide voice-guide--${mode}`}>
      <div className="voice-guide__copy">
        <p className="voice-guide__eyebrow">为了帮你快速报名</p>
        <p className="voice-guide__title">你可以这样对我说：</p>
      </div>

      <div className="voice-guide__card">
        <div className="voice-guide__row">
          <span>我叫</span>
          <img alt="" aria-hidden="true" className="voice-guide__blank-image voice-guide__blank-image--short" src={INTRO_BLANK_IMAGE} />
          <span>，今年</span>
          <img alt="" aria-hidden="true" className="voice-guide__blank-image voice-guide__blank-image--short" src={INTRO_BLANK_IMAGE} />
          <span>岁</span>
        </div>

        <div className="voice-guide__row">
          <span>希望去</span>
          <img alt="" aria-hidden="true" className="voice-guide__blank-image voice-guide__blank-image--short" src={INTRO_BLANK_IMAGE} />
          <span>市(县/区)，</span>
          <div className="voice-guide__row-group">
            <span>应聘</span>
            <img alt="" aria-hidden="true" className="voice-guide__blank-image voice-guide__blank-image--short" src={INTRO_BLANK_IMAGE} />
            <span>工作</span>
          </div>
        </div>

        <div className="voice-guide__row voice-guide__row--full">
          <span>我的手机号是</span>
          <span className="voice-guide__phone-line-wrap">
            <img alt="" aria-hidden="true" className="voice-guide__phone-line" src={INTRO_PHONE_LINE_IMAGE} />
          </span>
        </div>
      </div>
    </div>
  );
}

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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function HighlightedTranscript({
  activeExtractionIndex,
  items,
  nameSourceText,
  transcript,
}: {
  activeExtractionIndex: number;
  items: ResumeExtractionItem[];
  nameSourceText: string | null;
  transcript: string;
}) {
  const activeTokens = [
    ...(activeExtractionIndex >= 0 && nameSourceText ? [nameSourceText.trim()] : []),
    ...items
    .filter((item) => item.detected)
    .slice(0, activeExtractionIndex + 1)
    .map((item) => item.sourceText?.trim())
    .filter((value): value is string => Boolean(value)),
  ]
    .filter(Boolean)
    .filter((token, index, tokens) => tokens.indexOf(token) === index)
    .sort((left, right) => right.length - left.length);

  if (activeTokens.length === 0) {
    return <>{transcript}</>;
  }

  const pattern = new RegExp(`(${activeTokens.map((token) => escapeRegExp(token)).join('|')})`, 'gu');
  const parts = transcript.split(pattern);

  return (
    <>
      {parts.map((part, index) => {
        const isHighlight = activeTokens.some((token) => token === part);
        return isHighlight ? (
          <mark className="transcript-highlight" key={`${part}-${index}`}>
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        );
      })}
    </>
  );
}

export default function App() {
  const {
    activeExtractionIndex,
    analysis,
    card,
    elapsedSeconds,
    error,
    hasApplied,
    isSupported,
    phase,
    showSuccessToast,
    transcriptText,
    actions,
  } =
    useVoiceSession();
  const startYRef = useRef(0);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const cancelIntentRef = useRef(false);
  const [isPointerHolding, setIsPointerHolding] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!isPointerHolding) {
      return;
    }

    const handleMove = (event: globalThis.PointerEvent) => {
      const cancelRect = cancelButtonRef.current?.getBoundingClientRect();
      const isOverCancelButton = cancelRect
        ? event.clientX >= cancelRect.left - 10 &&
          event.clientX <= cancelRect.right + 10 &&
          event.clientY >= cancelRect.top - 12 &&
          event.clientY <= cancelRect.bottom + 12
        : false;
      const nextCancel = isOverCancelButton || startYRef.current - event.clientY > 88;
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
  const currentBackgroundImage = JOB_DETAIL_IMAGE;
  const isAnalysisPhase = phase === 'extracting';
  let detectedChipIndex = -1;

  return (
    <div className="voice-page">
      <main className="phone-shell">
        <img
          alt="职位详情"
          className="job-image"
          src={currentBackgroundImage}
        />

        {phase === 'job' ? (
          <section className="job-footer" aria-label="底部操作区">
            <button className="job-footer__chat" type="button">
              在线聊
            </button>
            <button
              aria-label="免费报名"
              className={`job-footer__apply ${hasApplied ? 'job-footer__apply--submitted' : ''}`}
              disabled={hasApplied}
              onClick={actions.openApply}
              type="button"
            >
              {hasApplied ? '已报名' : '免费报名'}
            </button>
            <span aria-hidden="true" className="job-footer__home-indicator" />
          </section>
        ) : null}

        {phase === 'job' && showSuccessToast ? (
          <div className="success-toast" role="status" aria-live="polite">
            报名成功
          </div>
        ) : null}

        {showDimmedOverlay ? (
          <div
            className={`dimmed-layer ${
              phase === 'intro'
                ? 'dimmed-layer--intro'
                : ''
            }`}
          />
        ) : null}

        {showDimmedOverlay ? (
          <button
            aria-label="返回"
            className="back-button"
            onClick={actions.closeOverlay}
            type="button"
          >
            <img alt="" aria-hidden="true" className="back-button__icon" src={BACK_ICON_IMAGE} />
          </button>
        ) : null}

        {phase === 'intro' ? (
          <section className="intro-overlay">
            <VoiceGuide mode="intro" />

            <div className="intro-actions">
              <button
                aria-label="按住说话"
                className="hold-button hold-button--intro"
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
            <span aria-hidden="true" className="intro-home-indicator" />
          </section>
        ) : null}

        {phase === 'recording' ? (
          <section className="recording-overlay">
            <button
              aria-label="关闭"
              className="recording-close-button"
              onClick={actions.closeOverlay}
              type="button"
            >
              ×
            </button>
            <VoiceGuide mode="recording" />

            <div
              className={`speech-bubble ${bubbleHasText ? 'speech-bubble--with-text' : 'speech-bubble--idle'} ${isCancelling ? 'speech-bubble--cancel' : ''}`}
            >
              {bubbleHasText ? (
                <>
                  <p className="speech-bubble__text">{transcriptText}</p>
                  <Waveform compact />
                </>
              ) : (
                <Waveform />
              )}
              <span aria-hidden="true" className="speech-bubble__tail" />
            </div>

            <button
              aria-label="取消录音"
              ref={cancelButtonRef}
              className={`cancel-button ${isCancelling ? 'cancel-button--active' : ''}`}
              onClick={() => actions.finishHoldToTalk(true)}
              type="button"
            >
              取消
            </button>

            {!isCancelling ? (
              <div className="record-bottom-hint">
                <span>松手发送，上滑取消</span>
                <span className="record-bottom-hint__seconds">
                  {elapsedSeconds}
                  <span className="record-bottom-hint__seconds-mark">”</span>
                </span>
              </div>
            ) : null}

            <div className={`record-bottom-sheet ${isCancelling ? 'record-bottom-sheet--cancel' : ''}`}>
              <p className={isCancelling ? 'record-bottom-sheet__label record-bottom-sheet__label--cancel' : 'record-bottom-sheet__label'}>
                松开 发送
              </p>
            </div>
          </section>
        ) : null}

        {isAnalysisPhase && analysis && card ? (
          <section className="analysis-overlay">
            <div className="analysis-transcript">
              <p className="analysis-transcript__label">正在识别关键信息...</p>
              <p className="analysis-transcript__text">
                <HighlightedTranscript
                  activeExtractionIndex={activeExtractionIndex}
                  items={analysis.extractionItems}
                  nameSourceText={analysis.nameSourceText}
                  transcript={card.rawTranscript}
                />
              </p>
            </div>

            <div className="analysis-chip-list">
              {analysis.extractionItems.map((item) => {
                const activeRank = item.detected ? ++detectedChipIndex : -1;
                const isActive = item.detected && activeRank <= activeExtractionIndex;

                return (
                  <span
                    className={`analysis-chip ${isActive ? 'analysis-chip--active' : ''}`}
                    key={item.id}
                  >
                    {item.label}
                  </span>
                );
              })}
            </div>
          </section>
        ) : null}

        {phase === 'review' && card ? (
          <section className="review-overlay review-overlay--resume">
            <div className="review-card review-card--resume">
              <p className="review-card__title review-card__title--resume">{card.title}</p>

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
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
