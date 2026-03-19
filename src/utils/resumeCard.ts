import type { ResumeAnalysis, ResumeInfoCard } from '../types/speech';
import { normalizeText } from './text';

const DEFAULT_NAME = '张晓明';
const DEFAULT_PHONE = '13566372453';
const DEFAULT_BIRTH_YEAR = '1987(37岁)';
const DEFAULT_CITIES = '北京、上海';
const DEFAULT_POSITION = '滴滴司机、卡车司机';

function extractName(transcript: string) {
  const match = transcript.match(/(?:我叫|我是|名字叫)([\u4e00-\u9fa5·]{2,6})/u);
  return {
    value: match?.[1] ?? DEFAULT_NAME,
    sourceText: match?.[1] ?? null,
  };
}

function extractPhone(transcript: string) {
  const match = transcript.match(/1\d{10}/u);
  return {
    value: match?.[0] ?? DEFAULT_PHONE,
    sourceText: match?.[0] ?? null,
  };
}

function extractAge(transcript: string) {
  const match = transcript.match(/(\d{2})岁/u);
  return {
    value: match ? Number(match[1]) : null,
    sourceText: match ? `${match[1]}岁` : null,
  };
}

function buildBirthYear(age: number | null) {
  if (!age) {
    return DEFAULT_BIRTH_YEAR;
  }

  const currentYear = new Date().getFullYear();
  return `${currentYear - age}(${age}岁)`;
}

function normalizeCitySegment(segment: string) {
  return segment
    .replace(/以及|还有|和|及/u, '、')
    .replace(/[，,]/gu, '、')
    .replace(/\s+/gu, '')
    .replace(/找工作|工作|上班|发展/gu, '')
    .replace(/、+/gu, '、')
    .replace(/^、|、$/gu, '');
}

function extractCities(transcript: string) {
  const match = transcript.match(
    /(?:想去|希望去|希望在|想在|去)(.+?)(?:工作|上班|找工作|发展)/u,
  );

  if (!match?.[1]) {
    return {
      value: DEFAULT_CITIES,
      sourceText: null,
    };
  }

  const cities = normalizeCitySegment(match[1]);
  return {
    value: cities || DEFAULT_CITIES,
    sourceText: match[1].trim() || null,
  };
}

function extractPosition(transcript: string) {
  const patterns = [
    /(?:应聘|想做|想找|找)(.+?)(?:岗位|职位|工作|岗)/u,
    /(?:做|从事)(.+?)(?:工作|岗位)/u,
  ];

  for (const pattern of patterns) {
    const match = transcript.match(pattern);

    if (!match?.[1]) {
      continue;
    }

    const value = match[1]
      .replace(/[，。,；;！!]/gu, '')
      .replace(/\s+/gu, '')
      .replace(/的/gu, '');

    if (value) {
      return {
        value: value.endsWith('岗') || value.endsWith('职位') ? value : `${value}`,
        sourceText: match[1].trim() || null,
      };
    }
  }

  return {
    value: DEFAULT_POSITION,
    sourceText: null,
  };
}

export function buildResumeAnalysis(transcript: string): ResumeAnalysis {
  const normalized = normalizeText(transcript);
  const name = extractName(normalized);
  const phone = extractPhone(normalized);
  const age = extractAge(normalized);
  const cities = extractCities(normalized);
  const position = extractPosition(normalized);

  const card: ResumeInfoCard = {
    title: '好的，已收到你的信息',
    fields: [
      { label: '姓名', value: name.value },
      { label: '手机号', value: phone.value },
      { label: '出生年份', value: buildBirthYear(age.value) },
      { label: '期望工作城市', value: cities.value },
      { label: '期望职位', value: position.value },
    ],
    ctaLabel: '没问题，去报名',
    footnote: '请核对一下以上信息是否准确？如果需要修改，直接告诉我修改哪一项就行。',
    rawTranscript: normalized,
  };

  return {
    card,
    extractionItems: [
      { id: 'age', label: '年龄', value: age.sourceText ?? buildBirthYear(age.value), sourceText: age.sourceText },
      { id: 'city', label: '意向城市', value: cities.value, sourceText: cities.sourceText },
      { id: 'position', label: '意向岗位', value: position.value, sourceText: position.sourceText },
      { id: 'phone', label: '手机号', value: phone.value, sourceText: phone.sourceText },
    ],
  };
}

export function buildResumeInfoCard(transcript: string): ResumeInfoCard {
  return buildResumeAnalysis(transcript).card;
}
