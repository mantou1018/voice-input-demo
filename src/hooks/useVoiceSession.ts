import { useEffect, useMemo, useRef, useState } from 'react';
import { createSpeechRecognizerAdapter } from '../lib/speech/createSpeechRecognizerAdapter';
import type {
  RecordingSessionState,
  ResumeInfoCard,
  SpeechRecognizerError,
  TranscriptChunk,
} from '../types/speech';
import { buildResumeInfoCard } from '../utils/resumeCard';

export type VoiceApplyPhase = 'job' | 'intro' | 'recording' | 'review';

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

export function useVoiceSession() {
  const adapterRef = useRef(createSpeechRecognizerAdapter());
  const ignoreAbortErrorRef = useRef(false);
  const finalizeOnStopRef = useRef(false);
  const pendingStartTokenRef = useRef(0);
  const releasedBeforeStartRef = useRef(false);
  const transcriptChunksRef = useRef<TranscriptChunk[]>([]);
  const interimTextRef = useRef('');
  const startTimeRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<VoiceApplyPhase>('job');
  const [recordingState, setRecordingState] = useState<RecordingSessionState>('idle');
  const [transcriptChunks, setTranscriptChunks] = useState<TranscriptChunk[]>([]);
  const [interimText, setInterimText] = useState('');
  const [card, setCard] = useState<ResumeInfoCard | null>(null);
  const [error, setError] = useState<SpeechRecognizerError | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const isSupported = useMemo(() => adapterRef.current.isSupported(), []);
  const transcriptText = composeTranscript(transcriptChunks, interimText);

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

      setError(nextError);
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
    if (!navigator.mediaDevices?.getUserMedia) {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
  }

  function resetTranscript() {
    transcriptChunksRef.current = [];
    interimTextRef.current = '';
    setTranscriptChunks([]);
    setInterimText('');
  }

  function openApply() {
    setError(null);
    setCard(null);
    resetTranscript();
    setPhase('intro');
    setRecordingState('idle');
  }

  function closeOverlay() {
    ignoreAbortErrorRef.current = true;
    finalizeOnStopRef.current = false;
    adapterRef.current.abort();
    resetTranscript();
    setCard(null);
    setError(null);
    setPhase('job');
    setRecordingState('idle');
  }

  async function startHoldToTalk() {
    if (!isSupported) {
      setError(createUnsupportedError());
      return;
    }

    const startToken = Date.now();
    pendingStartTokenRef.current = startToken;
    releasedBeforeStartRef.current = false;
    ignoreAbortErrorRef.current = false;
    finalizeOnStopRef.current = false;
    resetTranscript();
    setCard(null);
    setError(null);
    setRecordingState('requestingPermission');

    try {
      await ensureMicrophoneAccess();

      if (
        pendingStartTokenRef.current !== startToken ||
        releasedBeforeStartRef.current
      ) {
        setRecordingState('idle');
        setPhase('intro');
        return;
      }

      setPhase('recording');
      adapterRef.current.start();
    } catch (permissionError) {
      setError({
        code: 'permission-denied',
        message:
          permissionError instanceof Error
            ? permissionError.message
            : '麦克风权限申请失败，请检查手机浏览器设置。',
        recoverable: true,
      });
      setRecordingState('error');
      setPhase('intro');
    }
  }

  function cancelHoldToTalk() {
    ignoreAbortErrorRef.current = true;
    finalizeOnStopRef.current = false;
    adapterRef.current.abort();
    resetTranscript();
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
    adapterRef.current.stop();
  }

  function finalizeTranscript() {
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

    setCard(buildResumeInfoCard(transcript));
    setRecordingState('result');
    setPhase('review');
  }

  function submitCard() {
    setPhase('job');
    setRecordingState('idle');
  }

  return {
    card,
    elapsedSeconds,
    error,
    interimText,
    isSupported,
    phase,
    recordingState,
    transcriptText,
    actions: {
      closeOverlay,
      finishHoldToTalk,
      openApply,
      startHoldToTalk,
      submitCard,
    },
  };
}
