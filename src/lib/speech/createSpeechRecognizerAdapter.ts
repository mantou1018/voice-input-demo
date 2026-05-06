import type {
  RecognitionSnapshot,
  SpeechRecognizerAdapter,
  SpeechRecognizerError,
  SpeechRecognizerLifecycle,
  TranscriptChunk,
} from '../../types/speech';
import { composeTranscript } from '../../utils/text';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function mapNativeError(error: string): SpeechRecognizerError {
  switch (error) {
    case 'not-allowed':
      return {
        code: 'permission-denied',
        message: '语音识别未被允许，请检查麦克风权限或切换到系统浏览器后重试。',
        recoverable: true,
      };
    case 'service-not-allowed':
      return {
        code: 'unsupported',
        message: '当前浏览器环境限制了语音识别服务，请改用系统浏览器打开。',
        recoverable: true,
      };
    case 'no-speech':
      return {
        code: 'no-speech',
        message: '没有识别到有效语音，请靠近麦克风后重新录制。',
        recoverable: true,
      };
    case 'audio-capture':
      return {
        code: 'audio-capture',
        message: '未检测到可用麦克风，请检查系统录音设备。',
        recoverable: true,
      };
    case 'network':
      return {
        code: 'network',
        message: '语音识别网络异常，请稍后再试。',
        recoverable: true,
      };
    case 'aborted':
      return {
        code: 'aborted',
        message: '录音已停止。',
        recoverable: true,
      };
    default:
      return {
        code: 'recognition-failed',
        message: '语音识别中断，请稍后重试。',
        recoverable: true,
      };
  }
}

function mapStartException(error: unknown): SpeechRecognizerError {
  const message = error instanceof Error ? error.message : String(error);

  if (/already started/i.test(message)) {
    return {
      code: 'recognition-failed',
      message: '语音识别已经在进行中，请稍等一下再继续操作。',
      recoverable: true,
    };
  }

  return {
    code: 'recognition-failed',
    message: '语音识别启动失败，请重试一次。',
    recoverable: true,
  };
}

export function createSpeechRecognizerAdapter(
  language = 'zh-CN',
): SpeechRecognizerAdapter {
  const stateListeners = new Set<(state: SpeechRecognizerLifecycle) => void>();
  const resultListeners = new Set<(snapshot: RecognitionSnapshot) => void>();
  const errorListeners = new Set<(error: SpeechRecognizerError) => void>();

  let recognition: SpeechRecognitionLike | null = null;
  let chunkMap = new Map<number, TranscriptChunk>();
  let interimText = '';

  const emitState = (state: SpeechRecognizerLifecycle) => {
    stateListeners.forEach((listener) => listener(state));
  };

  const emitResult = () => {
    const chunks = [...chunkMap.entries()]
      .sort(([left], [right]) => left - right)
      .map(([, chunk]) => chunk);

    resultListeners.forEach((listener) =>
      listener({
        chunks,
        interimText,
        fullText: composeTranscript(
          chunks.map((chunk) => chunk.text),
          interimText,
        ),
      }),
    );
  };

  const emitError = (error: SpeechRecognizerError) => {
    errorListeners.forEach((listener) => listener(error));
  };

  const ensureRecognition = () => {
    if (recognition) {
      return recognition;
    }

    const Recognition = getSpeechRecognitionConstructor();

    if (!Recognition) {
      return null;
    }

    recognition = new Recognition();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => emitState('listening');
    recognition.onend = () => emitState('stopped');
    recognition.onerror = (event) => emitError(mapNativeError(event.error));
    recognition.onresult = (event) => {
      interimText = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript?.trim();

        if (!transcript) {
          continue;
        }

        if (result.isFinal) {
          chunkMap.set(index, {
            id: `chunk-${index}`,
            text: transcript,
            final: true,
            timestamp: Date.now(),
          });
          continue;
        }

        interimText = [interimText, transcript].filter(Boolean).join(' ');
      }

      emitResult();
    };

    return recognition;
  };

  return {
    isSupported() {
      return Boolean(getSpeechRecognitionConstructor());
    },
    start() {
      const instance = ensureRecognition();

      if (!instance) {
        emitError({
          code: 'unsupported',
          message: '当前浏览器不支持语音识别，请使用示例数据预览卡片。',
          recoverable: true,
        });
        return;
      }

      chunkMap = new Map();
      interimText = '';
      emitResult();
      try {
        instance.start();
      } catch (error) {
        emitError(mapStartException(error));
      }
    },
    stop() {
      recognition?.stop();
    },
    abort() {
      recognition?.abort();
    },
    onResult(callback) {
      resultListeners.add(callback);
      return () => resultListeners.delete(callback);
    },
    onError(callback) {
      errorListeners.add(callback);
      return () => errorListeners.delete(callback);
    },
    onStateChange(callback) {
      stateListeners.add(callback);
      return () => stateListeners.delete(callback);
    },
  };
}
