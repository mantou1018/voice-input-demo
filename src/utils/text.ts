const SENTENCE_SPLITTER = /(?<=[。！？!?；;\n])/u;

export function normalizeText(input: string): string {
  return input.replace(/\s+/g, ' ').replace(/\s*([，。！？；,.!?;:：])/g, '$1').trim();
}

export function splitSentences(input: string): string[] {
  return normalizeText(input)
    .split(SENTENCE_SPLITTER)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function truncateText(input: string, maxLength: number): string {
  return input.length <= maxLength ? input : `${input.slice(0, maxLength).trim()}…`;
}

export function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function composeTranscript(chunks: string[], interimText?: string): string {
  return normalizeText([...chunks, interimText ?? ''].filter(Boolean).join(' '));
}
