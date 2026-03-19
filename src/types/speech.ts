export type RecordingSessionState =
  | 'idle'
  | 'requestingPermission'
  | 'recording'
  | 'recognizing'
  | 'summarizing'
  | 'result'
  | 'error';

export interface TranscriptChunk {
  id: string;
  text: string;
  final: boolean;
  timestamp: number;
}

export interface SummaryMetaItem {
  label: string;
  value: string;
}

export interface SummarySection {
  id: string;
  title: string;
  items: string[];
}

export interface SummaryResult {
  rawTranscript: string;
  summaryText: string;
  meta: SummaryMetaItem[];
  sections: SummarySection[];
  generatedAt: string;
}

export interface SummaryService {
  generate(transcript: string): Promise<SummaryResult>;
}

export interface ResumeCardField {
  label: string;
  value: string;
}

export interface ResumeExtractionItem {
  id: string;
  label: string;
  value: string;
  sourceText: string | null;
  detected: boolean;
}

export interface ResumeInfoCard {
  title: string;
  fields: ResumeCardField[];
  ctaLabel: string;
  footnote: string;
  rawTranscript: string;
}

export interface ResumeAnalysis {
  card: ResumeInfoCard;
  extractionItems: ResumeExtractionItem[];
}

export interface RecognitionSnapshot {
  chunks: TranscriptChunk[];
  interimText: string;
  fullText: string;
}

export type SpeechRecognizerLifecycle = 'idle' | 'listening' | 'stopped';

export type SpeechRecognizerErrorCode =
  | 'unsupported'
  | 'permission-denied'
  | 'no-speech'
  | 'aborted'
  | 'network'
  | 'audio-capture'
  | 'recognition-failed';

export interface SpeechRecognizerError {
  code: SpeechRecognizerErrorCode;
  message: string;
  recoverable: boolean;
}

export interface SpeechRecognizerAdapter {
  isSupported(): boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onResult(callback: (snapshot: RecognitionSnapshot) => void): () => void;
  onError(callback: (error: SpeechRecognizerError) => void): () => void;
  onStateChange(
    callback: (state: SpeechRecognizerLifecycle) => void,
  ): () => void;
}
