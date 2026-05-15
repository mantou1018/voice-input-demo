import type { ResumeAnalysis, ResumeInfoCard } from '../types/speech';
import { CITY_ALIASES, POSITION_KEYWORDS } from '../data/lookupTables';
import { COMMON_COMPOUND_SURNAMES, COMMON_SINGLE_SURNAMES } from '../data/nameTables';
import { normalizeText } from './text';

const DEFAULT_NAME = '张晓明';
const DEFAULT_PHONE = '13566372453';
const DEFAULT_BIRTH_YEAR = '1987(37岁)';
const DEFAULT_CITIES = '北京、上海';
const DEFAULT_POSITION = '滴滴司机、卡车司机';
const MIN_SPARSE_AGE = 16;
const MAX_SPARSE_AGE = 65;
const NAME_TRIGGERS = ['我叫', '我是', '名字叫', '姓名是', '本人叫', '叫我'] as const;
const NAME_CLAUSE_BOUNDARIES = ['我想', '想去', '想在', '想做', '希望去', '希望在', '希望', '应聘', '找工作', '工作', '岗位', '职位', '手机号', '电话', '联系号码', '年龄', '出生年份', '今年', '去', '做'] as const;
const MINORITY_NAME_PATTERN = /^[\u4e00-\u9fa5]{1,6}[·•][\u4e00-\u9fa5]{1,6}(?:[·•][\u4e00-\u9fa5]{1,6})?$/u;
const COMPOUND_SURNAMES = [...COMMON_COMPOUND_SURNAMES].sort((left, right) => right.length - left.length);
const SINGLE_SURNAME_SET = new Set<string>(COMMON_SINGLE_SURNAMES);
const CITY_TOKEN_SET = new Set<string>(CITY_ALIASES.flatMap(([alias, city]) => [alias, city]));
const POSITION_TOKEN_SET = new Set<string>(POSITION_KEYWORDS);

const FILLER_WORDS = /(?:我今年|我想|希望去|希望在|想去|想在|应聘|找工作|找|做|去|在|工作|岗位|职位|上班|手机号是|手机号|电话是|电话|联系号码|年龄|出生年份|今年|我的|想做)/gu;
const NAME_STOP_WORDS = /(?:我想|想去|想在|想做|希望|希望去|希望在|应聘|找工作|工作|岗位|职位|城市|电话|手机号|号码|联系|今年|年龄|出生|保安|保姆|司机|骑手|普工|电工|焊工|保洁|去|做)/u;

function cleanNameCandidate(input: string) {
  return input
    .replace(/^[，。！？；,.!?;:：\s]+|[，。！？；,.!?;:：\s]+$/gu, '')
    .replace(/(?:的号码|的手机号|手机号|电话|号码)$/u, '')
    .replace(/(?:\d{1,2}岁?|\d{4}年?|\d{2}后)$/u, '')
    .replace(/(?:一|二|两|三|四|五|六|七|八|九|十){1,3}岁$/u, '')
    .replace(/(?:十[一二三四五六七八九]?|[二三四五六]十[一二三四五六七八九]?|[一二两三四五六七八九])岁$/u, '')
    .trim();
}

function extractNamePrefixFromTail(input: string) {
  const sanitized = input.replace(/^[，。！？；,.!?;:：\s]+/gu, '');
  const cutoff = NAME_CLAUSE_BOUNDARIES
    .map((marker) => sanitized.indexOf(marker))
    .filter((index) => index > 0)
    .sort((left, right) => left - right)[0];
  const bounded = typeof cutoff === 'number' ? sanitized.slice(0, cutoff) : sanitized;
  const leading = bounded.match(/^[\u4e00-\u9fa5·•]{2,12}/u)?.[0];

  if (!leading) {
    return null;
  }

  for (let length = leading.length; length >= 2; length -= 1) {
    const candidate = cleanNameCandidate(leading.slice(0, length));

    if (candidate && isLikelyHanName(candidate)) {
      return candidate;
    }
  }

  return null;
}

function isLikelyHanName(candidate: string) {
  const normalized = candidate.replace(/[·•]/gu, '·');

  if (!normalized || /\d/u.test(normalized)) {
    return false;
  }

  if (CITY_TOKEN_SET.has(normalized) || POSITION_TOKEN_SET.has(normalized) || NAME_STOP_WORDS.test(normalized)) {
    return false;
  }

  if (MINORITY_NAME_PATTERN.test(normalized)) {
    return true;
  }

  if (!/^[\u4e00-\u9fa5]{2,4}$/u.test(normalized)) {
    return false;
  }

  if (COMPOUND_SURNAMES.some((surname) => normalized.startsWith(surname) && normalized.length - surname.length >= 1 && normalized.length - surname.length <= 2)) {
    return true;
  }

  const [first, second, ...rest] = [...normalized];
  if (!first) {
    return false;
  }

  if (SINGLE_SURNAME_SET.has(first) && normalized.length >= 2 && normalized.length <= 3) {
    return true;
  }

  if (second && SINGLE_SURNAME_SET.has(first) && SINGLE_SURNAME_SET.has(second) && rest.length >= 1 && rest.length <= 2) {
    return true;
  }

  return false;
}

function findNameCandidate(tokens: string[]) {
  return tokens
    .map((token) => cleanNameCandidate(token))
    .filter(Boolean)
    .find((token) => isLikelyHanName(token)) ?? null;
}

function extractName(transcript: string) {
  for (const trigger of NAME_TRIGGERS) {
    const triggerIndex = transcript.indexOf(trigger);
    if (triggerIndex < 0) {
      continue;
    }

    const tail = transcript.slice(triggerIndex + trigger.length);
    const candidate =
      extractNamePrefixFromTail(tail) ??
      cleanNameCandidate(tail.split(/[，。！？；,.!?;:：\s]/u)[0] ?? '');

    if (candidate && isLikelyHanName(candidate)) {
      return {
        value: candidate,
        sourceText: candidate,
      };
    }
  }

  const leadingTokens = transcript
    .replace(/1\d{10}/gu, ' ')
    .replace(/\d{1,2}岁/gu, ' ')
    .replace(/(?:^|[^\d])\d{2}(?=[^\d]|$)/gu, ' ')
    .split(/[\s，。！？；,.!?;:：、]+/u)
    .slice(0, 3);

  const sparseCandidate = findNameCandidate(leadingTokens);

  return {
    value: sparseCandidate ?? DEFAULT_NAME,
    sourceText: sparseCandidate,
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

function isNumericFragment(value: string) {
  return /^\d+$/u.test(value);
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
    .replace(/(?:我叫|我是|名字叫|姓名是|本人叫|叫我)[\u4e00-\u9fa5·•]{2,12}/gu, ' ')
    .replace(FILLER_WORDS, ' ');

  const candidate = stripped
    .split(/[\s，。！？；,.!?;:：、]+/u)
    .map((token) => token.trim())
    .map((token) => cleanPositionValue(token))
    .filter(Boolean)
    .filter((token) => !isNumericFragment(token))
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

    if (value && !isNumericFragment(value)) {
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
    nameSourceText: name.sourceText,
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
