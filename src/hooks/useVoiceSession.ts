import { useEffect, useMemo, useRef, useState } from 'react';
import { createSpeechRecognizerAdapter } from '../lib/speech/createSpeechRecognizerAdapter';
import { analyzeResumeWithAgent } from '../lib/resumeAgentClient';
import type {
  RecordingSessionState,
  ResumeAnalysis,
  ResumeExtractionItem,
  ResumeInfoCard,
  SpeechRecognizerError,
  TranscriptChunk,
} from '../types/speech';

export type VoiceApplyPhase =
  | 'job'
  | 'intro'
  | 'recording'
  | 'extracting'
  | 'review';

function composeTranscript(chunks: TranscriptChunk[], interimText: string) {
  return [...chunks.map((chunk) => chunk.text), interimText].filter(Boolean).join(' ').trim();
}

function createUnsupportedError(): SpeechRecognizerError {
  return {
    code: 'unsupported',
    message: '当前浏览器暂不支持语音识别，请切换到支持的手机浏览器。',
    recoverable: true,
  };
}

function createEmptyTranscriptError(): SpeechRecognizerError {
  return {
    code: 'no-speech',
    message: '没有识别到有效语音，请按住按钮后再说一遍。',
    recoverable: true,
  };
}

const STOP_GRACE_PERIOD_MS = 380;

function mergeResumeAnalysis(previous: ResumeAnalysis, next: ResumeAnalysis): ResumeAnalysis {
  const previousItems = new Map(previous.extractionItems.map((item) => [item.id, item]));
  const mergedItems = next.extractionItems.map((item) => {
    const prev = previousItems.get(item.id);
    return item.detected ? item : prev ?? item;
  });

  return {
    card: next.card,
    nameSourceText: next.nameSourceText ?? previous.nameSourceText,
    extractionItems: mergedItems,
  };
}

export function useVoiceSession() {
  const adapterRef = useRef(createSpeechRecognizerAdapter());
  const ignoreAbortErrorRef = useRef(false);
  const finalizeOnStopRef = useRef(false);
  const pendingStartTokenRef = useRef(0);
  const releasedBeforeStartRef = useRef(false);
  const microphoneGrantedRef = useRef(false);
  const transcriptChunksRef = useRef<TranscriptChunk[]>([]);
  const interimTextRef = useRef('');
  const startTimeRef = useRef<number | null>(null);
  const pendingTimeoutsRef = useRef<number[]>([]);
  const analysisRef = useRef<ResumeAnalysis | null>(null);
  const preserveExistingRef = useRef(false);
  const recognitionRunTokenRef = useRef(0);
  const successToastTimeoutRef = useRef<number | null>(null);
  const stopGraceTimeoutRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<VoiceApplyPhase>('job');
  const [recordingState, setRecordingState] = useState<RecordingSessionState>('idle');
  const [transcriptChunks, setTranscriptChunks] = useState<TranscriptChunk[]>([]);
  const [interimText, setInterimText] = useState('');
  const [card, setCard] = useState<ResumeInfoCard | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<SpeechRecognizerError | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeExtractionIndex, setActiveExtractionIndex] = useState(-1);
  const [hasApplied, setHasApplied] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const isSupported = useMemo(() => adapterRef.current.isSupported(), []);
  const transcriptText = composeTranscript(transcriptChunks, interimText);

  useEffect(() => {
    analysisRef.current = analysis;
  }, [analysis]);

  useEffect(() => {
    return () => {
      clearPendingTransitions();
      clearStopGraceTimeout();
      if (successToastTimeoutRef.current) {
        window.clearTimeout(successToastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    transcriptChunksRef.current = transcriptChunks;
  }, [transcriptChunks]);

  useEffect(() => {
    interimTextRef.current = interimText;
  }, [interimText]);

  useEffect(() => {
    if (phase !== 'recording') {
      setElapsedSeconds(0);
      startTimeRef.current = null;
      return;
    }

    startTimeRef.current = Date.now();
    const timer = window.setInterval(() => {
      if (!startTimeRef.current) {
        return;
      }

      setElapsedSeconds(Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000)));
    }, 250);

    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    const adapter = adapterRef.current;

    const teardownResult = adapter.onResult((snapshot) => {
      setTranscriptChunks(snapshot.chunks);
      setInterimText(snapshot.interimText);
    });

    const teardownError = adapter.onError((nextError) => {
      if (ignoreAbortErrorRef.current && nextError.code === 'aborted') {
        ignoreAbortErrorRef.current = false;
        return;
      }

      const resolvedError =
        nextError.code === 'permission-denied' && microphoneGrantedRef.current
          ? {
              code: 'unsupported' as const,
              message:
                '麦克风权限已经开启，但当前手机浏览器/内嵌环境不支持语音识别。请改用系统浏览器打开。',
              recoverable: true,
            }
          : nextError;

      clearStopGraceTimeout();
      finalizeOnStopRef.current = false;
      setError(resolvedError);
      setRecordingState('error');
      setPhase('intro');
    });

    const teardownState = adapter.onStateChange((state) => {
      if (state === 'listening') {
        setRecordingState('recording');
        return;
      }

      if (!finalizeOnStopRef.current) {
        return;
      }

      finalizeOnStopRef.current = false;
      finalizeTranscript();
    });

    return () => {
      teardownResult();
      teardownError();
      teardownState();
    };
  }, []);

  async function ensureMicrophoneAccess() {
    if (microphoneGrantedRef.current) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    microphoneGrantedRef.current = true;
    stream.getTracks().forEach((track) => track.stop());
  }

  function resetTranscript() {
    transcriptChunksRef.current = [];
    interimTextRef.current = '';
    setTranscriptChunks([]);
    setInterimText('');
  }

  function clearPendingTransitions() {
    pendingTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    pendingTimeoutsRef.current = [];
  }

  function clearStopGraceTimeout() {
    if (!stopGraceTimeoutRef.current) {
      return;
    }

    window.clearTimeout(stopGraceTimeoutRef.current);
    stopGraceTimeoutRef.current = null;
  }

  function scheduleTransition(delayMs: number, callback: () => void) {
    const timeoutId = window.setTimeout(callback, delayMs);
    pendingTimeoutsRef.current.push(timeoutId);
  }

  function resetAnalysisState() {
    clearPendingTransitions();
    analysisRef.current = null;
    setAnalysis(null);
    setActiveExtractionIndex(-1);
  }

  function openApply() {
    if (hasApplied) {
      return;
    }

    setError(null);
    setCard(null);
    resetTranscript();
    resetAnalysisState();
    setPhase('intro');
    setRecordingState('idle');
  }

  function closeOverlay() {
    recognitionRunTokenRef.current += 1;
    ignoreAbortErrorRef.current = true;
    finalizeOnStopRef.current = false;
    clearStopGraceTimeout();
    adapterRef.current.abort();
    resetTranscript();
    setCard(null);
    resetAnalysisState();
    setError(null);
    setPhase('job');
    setRecordingState('idle');
  }

  async function startHoldToTalk(options?: { preserveExisting?: boolean }) {
    if (!isSupported) {
      setError(createUnsupportedError());
      return;
    }

    const preserveExisting = options?.preserveExisting ?? false;
    preserveExistingRef.current = preserveExisting;
    recognitionRunTokenRef.current += 1;
    const runToken = recognitionRunTokenRef.current;
    const startToken = Date.now();
    pendingStartTokenRef.current = startToken;
    releasedBeforeStartRef.current = false;
    ignoreAbortErrorRef.current = false;
    finalizeOnStopRef.current = false;
    resetTranscript();
    if (!preserveExisting) {
      setCard(null);
      resetAnalysisState();
    } else {
      clearPendingTransitions();
      setActiveExtractionIndex(-1);
    }
    setError(null);
    setRecordingState('requestingPermission');

    try {
      await ensureMicrophoneAccess();

      if (
        recognitionRunTokenRef.current !== runToken ||
        pendingStartTokenRef.current !== startToken ||
        releasedBeforeStartRef.current
      ) {
        clearStopGraceTimeout();
        setRecordingState('idle');
        setPhase('intro');
        return;
      }

      setPhase('recording');
      adapterRef.current.start();
    } catch (permissionError) {
      setError({
        code: 'permission-denied',
        message: microphoneGrantedRef.current
          ? '当前浏览器环境限制了语音识别，请改用系统浏览器打开后继续补充。'
          : '麦克风权限申请失败，请允许麦克风访问后继续补充。',
        recoverable: true,
      });
      setRecordingState('error');
      setPhase('intro');
    }
  }

  function cancelHoldToTalk() {
    recognitionRunTokenRef.current += 1;
    ignoreAbortErrorRef.current = true;
    finalizeOnStopRef.current = false;
    clearStopGraceTimeout();
    adapterRef.current.abort();
    resetTranscript();
    if (!preserveExistingRef.current) {
      resetAnalysisState();
    } else {
      clearPendingTransitions();
      setActiveExtractionIndex(-1);
    }
    setRecordingState('idle');
    setPhase('intro');
  }

  function finishHoldToTalk(cancelled: boolean) {
    if (recordingState === 'requestingPermission') {
      releasedBeforeStartRef.current = true;
      pendingStartTokenRef.current = 0;
      setRecordingState('idle');
      setPhase('intro');
      return;
    }

    if (phase !== 'recording') {
      return;
    }

    if (cancelled) {
      cancelHoldToTalk();
      return;
    }

    finalizeOnStopRef.current = true;
    setRecordingState('recognizing');
    clearStopGraceTimeout();
    stopGraceTimeoutRef.current = window.setTimeout(() => {
      stopGraceTimeoutRef.current = null;
      adapterRef.current.stop();
    }, STOP_GRACE_PERIOD_MS);
  }

  async function finalizeTranscript() {
    const runToken = recognitionRunTokenRef.current;
    const transcript = composeTranscript(
      transcriptChunksRef.current,
      interimTextRef.current,
    );

    if (!transcript) {
      setError(createEmptyTranscriptError());
      setRecordingState('error');
      setPhase('intro');
      return;
    }

    setRecordingState('summarizing');
    setPhase('extracting');
    setActiveExtractionIndex(-1);
    clearPendingTransitions();

    let nextAnalysis: ResumeAnalysis;

    try {
      nextAnalysis = await analyzeResumeWithAgent(transcript);
    } catch (agentError) {
      if (recognitionRunTokenRef.current !== runToken) {
        return;
      }
      setError({
        code: 'recognition-failed',
        message:
          agentError instanceof Error
            ? agentError.message
            : 'AI 报名助手调用失败，请稍后重试。',
        recoverable: true,
      });
      setRecordingState('error');
      setPhase('intro');
      return;
    }

    if (recognitionRunTokenRef.current !== runToken) {
      return;
    }

    const mergedAnalysis =
      preserveExistingRef.current && analysisRef.current
        ? mergeResumeAnalysis(analysisRef.current, nextAnalysis)
        : nextAnalysis;

    analysisRef.current = mergedAnalysis;
    setAnalysis(mergedAnalysis);
    setCard(mergedAnalysis.card);

    const extractionItems = mergedAnalysis.extractionItems.filter(
      (item) => item.detected && item.sourceText,
    );

    extractionItems.forEach((_: ResumeExtractionItem, index: number) => {
      scheduleTransition(index * 360 + 120, () => {
        setActiveExtractionIndex(index);
      });
    });

    const extractionDuration = Math.max(extractionItems.length, 1) * 360;

    scheduleTransition(extractionDuration + 420, () => {
      setRecordingState('result');
      setPhase('review');
    });
  }

  function submitCard() {
    if (successToastTimeoutRef.current) {
      window.clearTimeout(successToastTimeoutRef.current);
    }

    clearStopGraceTimeout();
    setHasApplied(true);
    setShowSuccessToast(true);
    setPhase('job');
    setRecordingState('idle');
    resetTranscript();
    resetAnalysisState();

    successToastTimeoutRef.current = window.setTimeout(() => {
      setShowSuccessToast(false);
      successToastTimeoutRef.current = null;
    }, 2200);
  }

  return {
    hasApplied,
    card,
    elapsedSeconds,
    error,
    interimText,
    isSupported,
    phase,
    recordingState,
    showSuccessToast,
    transcriptText,
    analysis,
    activeExtractionIndex,
    actions: {
      closeOverlay,
      finishHoldToTalk,
      openApply,
      startHoldToTalk,
      submitCard,
    },
  };
}
