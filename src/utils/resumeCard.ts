import type { ResumeAnalysis, ResumeInfoCard } from '../types/speech';
import { CITY_ALIASES, POSITION_KEYWORDS } from '../data/lookupTables';
import { normalizeText } from './text';

const DEFAULT_NAME = '张晓明';
const DEFAULT_PHONE = '13566372453';
const DEFAULT_BIRTH_YEAR = '1987(37岁)';
const DEFAULT_CITIES = '北京、上海';
const DEFAULT_POSITION = '滴滴司机、卡车司机';
const MIN_SPARSE_AGE = 16;
const MAX_SPARSE_AGE = 65;

const FILLER_WORDS = /(?:我今年|我想|希望去|希望在|想去|想在|应聘|找工作|找|做|去|在|工作|岗位|职位|上班|手机号是|手机号|电话是|电话|联系号码|年龄|出生年份|今年|我的|想做)/gu;

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
  const explicitMatch = transcript.match(/(\d{2})岁/u);
  if (explicitMatch) {
    return {
      value: Number(explicitMatch[1]),
      sourceText: `${explicitMatch[1]}岁`,
    };
  }

  const sparseMatch = transcript.match(/(?:^|[^\d])(\d{2})(?=[^\d]|$)/u);
  const sparseAge = sparseMatch ? Number(sparseMatch[1]) : null;

  if (sparseAge && sparseAge >= MIN_SPARSE_AGE && sparseAge <= MAX_SPARSE_AGE) {
    return {
      value: sparseAge,
      sourceText: sparseMatch?.[1] ?? null,
    };
  }

  return {
    value: null,
    sourceText: null,
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

function extractCitiesFromFragments(transcript: string) {
  const matches = CITY_ALIASES
    .filter(([alias]) => transcript.includes(alias))
    .map(([, city]) => city);

  const uniqueCities = [...new Set(matches)];

  return {
    value: uniqueCities.join('、'),
    sourceText: uniqueCities.join('、') || null,
  };
}

function extractCities(transcript: string) {
  const match = transcript.match(
    /(?:想去|希望去|希望在|想在|去)(.+?)(?:应聘|找工作|找|做|岗位|职位|工作|上班|发展)/u,
  );

  if (match?.[1]) {
    const cities = normalizeCitySegment(match[1]);
    if (cities) {
      return {
        value: cities,
        sourceText: match[1].trim() || null,
      };
    }
  }

  const fallbackCities = extractCitiesFromFragments(transcript);
  if (fallbackCities.value) {
    return fallbackCities;
  }

  return {
    value: DEFAULT_CITIES,
    sourceText: null,
  };
}

function cleanPositionValue(input: string) {
  return input
    .replace(/[，。,；;！!]/gu, '')
    .replace(/\s+/gu, '')
    .replace(/的/gu, '')
    .replace(/(岗位|职位|工作|岗)$/u, '');
}

function extractPositionFromFragments(
  transcript: string,
  cityValue: string,
  nameValue: string,
  nameSourceText: string | null,
) {
  const keyword = [...POSITION_KEYWORDS]
    .sort((left, right) => right.length - left.length)
    .find((item) => transcript.includes(item));

  if (keyword) {
    return {
      value: keyword,
      sourceText: keyword,
    };
  }

  const stripped = transcript
    .replace(/1\d{10}/gu, ' ')
    .replace(/\d{1,2}岁/gu, ' ')
    .replace(/(?:我叫|我是|名字叫)[\u4e00-\u9fa5·]{2,6}/gu, ' ')
    .replace(FILLER_WORDS, ' ');

  const candidate = stripped
    .split(/[\s，。！？；,.!?;:：、]+/u)
    .map((token) => token.trim())
    .map((token) => cleanPositionValue(token))
    .filter(Boolean)
    .filter((token) => token !== cityValue)
    .filter((token) => token !== nameValue)
    .filter((token) => token !== nameSourceText)
    .filter((token) => !CITY_ALIASES.some(([alias, city]) => token === alias || token === city))
    .find((token) => token.length >= 2 && token.length <= 8);

  if (candidate) {
    return {
      value: candidate,
      sourceText: candidate,
    };
  }

  return {
    value: DEFAULT_POSITION,
    sourceText: null,
  };
}

function extractPosition(
  transcript: string,
  options: { cityValue: string; nameValue: string; nameSourceText: string | null },
) {
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
    ...extractPositionFromFragments(transcript, options.cityValue, options.nameValue, options.nameSourceText),
  };
}

export function buildResumeAnalysis(transcript: string): ResumeAnalysis {
  const normalized = normalizeText(transcript);
  const name = extractName(normalized);
  const phone = extractPhone(normalized);
  const age = extractAge(normalized);
  const cities = extractCities(normalized);
  const position = extractPosition(normalized, {
    cityValue: cities.value,
    nameValue: name.value,
    nameSourceText: name.sourceText,
  });

  const card: ResumeInfoCard = {
    title: '已为您生成简历',
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
      {
        id: 'age',
        label: '年龄',
        value: age.sourceText ?? buildBirthYear(age.value),
        sourceText: age.sourceText,
        detected: Boolean(age.sourceText),
      },
      {
        id: 'city',
        label: '意向城市',
        value: cities.value,
        sourceText: cities.sourceText,
        detected: Boolean(cities.sourceText),
      },
      {
        id: 'position',
        label: '意向岗位',
        value: position.value,
        sourceText: position.sourceText,
        detected: Boolean(position.sourceText),
      },
      {
        id: 'phone',
        label: '手机号',
        value: phone.value,
        sourceText: phone.sourceText,
        detected: Boolean(phone.sourceText),
      },
    ],
  };
}

export function buildResumeInfoCard(transcript: string): ResumeInfoCard {
  return buildResumeAnalysis(transcript).card;
}
