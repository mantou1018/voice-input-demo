import type { ResumeAnalysis, ResumeExtractionItem, ResumeInfoCard } from '../types/speech';
import { buildResumeAnalysis } from '../utils/resumeCard';
import { normalizeText } from '../utils/text';

export interface AgentField {
  value: string;
  detected: boolean;
  sourceText: string | null;
}

export interface AgentFieldPayload {
  age?: Partial<AgentField> | null;
  city?: Partial<AgentField> | null;
  position?: Partial<AgentField> | null;
  phone?: Partial<AgentField> | null;
}

const FIELD_LABELS = {
  age: '年龄',
  city: '意向城市',
  position: '意向岗位',
  phone: '手机号',
} as const;

function cleanString(value: unknown) {
  return typeof value === 'string' ? normalizeText(value) : '';
}

function cleanSourceText(value: unknown) {
  const text = cleanString(value);
  return text || null;
}

function limitJoinedValues(value: string, maxCount: number) {
  const parts = value
    .split(/[、,，\s]+/u)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return '';
  }

  return [...new Set(parts)].slice(-maxCount).join('、');
}

function normalizeField(
  payload: Partial<AgentField> | null | undefined,
  fallback: ResumeExtractionItem,
  options: { maxCount?: number } = {},
): ResumeExtractionItem {
  const rawValue = cleanString(payload?.value);
  const value = options.maxCount ? limitJoinedValues(rawValue, options.maxCount) : rawValue;
  const sourceText = cleanSourceText(payload?.sourceText);
  const detected = Boolean(payload?.detected && value && sourceText);

  return {
    ...fallback,
    value: value || fallback.value,
    sourceText: detected ? sourceText : null,
    detected,
  };
}

function getFallbackItem(fallback: ResumeAnalysis, id: ResumeExtractionItem['id']) {
  const item = fallback.extractionItems.find((entry) => entry.id === id);

  if (!item) {
    return {
      id,
      label: FIELD_LABELS[id as keyof typeof FIELD_LABELS],
      value: '',
      sourceText: null,
      detected: false,
    };
  }

  return item;
}

function buildBirthYear(ageText: string) {
  const age = Number(ageText.match(/\d{1,2}/u)?.[0]);

  if (!age) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  return `${currentYear - age}(${age}岁)`;
}

export function buildAnalysisFromAgentFields(
  transcript: string,
  fields: AgentFieldPayload,
): ResumeAnalysis {
  const fallback = buildResumeAnalysis(transcript);
  const age = normalizeField(fields.age, getFallbackItem(fallback, 'age'));
  const city = normalizeField(fields.city, getFallbackItem(fallback, 'city'), { maxCount: 3 });
  const position = normalizeField(fields.position, getFallbackItem(fallback, 'position'), {
    maxCount: 5,
  });
  const phone = normalizeField(fields.phone, getFallbackItem(fallback, 'phone'));
  const fallbackFields = fallback.card.fields;

  const card: ResumeInfoCard = {
    ...fallback.card,
    fields: [
      fallbackFields[0],
      { label: '手机号', value: phone.value },
      { label: '出生年份', value: buildBirthYear(age.value) ?? fallbackFields[2].value },
      { label: '期望工作城市', value: city.value },
      { label: '期望职位', value: position.value },
    ],
  };

  return {
    ...fallback,
    card,
    extractionItems: [age, city, position, phone],
  };
}

export function buildFallbackAnalysis(transcript: string): ResumeAnalysis {
  return buildResumeAnalysis(transcript);
}
