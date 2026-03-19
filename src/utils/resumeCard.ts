import type { ResumeAnalysis, ResumeInfoCard } from '../types/speech';
import { normalizeText } from './text';

const DEFAULT_NAME = '张晓明';
const DEFAULT_PHONE = '13566372453';
const DEFAULT_BIRTH_YEAR = '1987(37岁)';
const DEFAULT_CITIES = '北京、上海';
const DEFAULT_POSITION = '滴滴司机、卡车司机';

const CITY_ALIASES = [
  ['北京市', '北京'],
  ['北京', '北京'],
  ['上海市', '上海'],
  ['上海', '上海'],
  ['广州市', '广州'],
  ['广州', '广州'],
  ['深圳市', '深圳'],
  ['深圳', '深圳'],
  ['杭州市', '杭州'],
  ['杭州', '杭州'],
  ['苏州市', '苏州'],
  ['苏州', '苏州'],
  ['南京市', '南京'],
  ['南京', '南京'],
  ['天津市', '天津'],
  ['天津', '天津'],
  ['重庆市', '重庆'],
  ['重庆', '重庆'],
  ['成都市', '成都'],
  ['成都', '成都'],
  ['武汉市', '武汉'],
  ['武汉', '武汉'],
  ['西安市', '西安'],
  ['西安', '西安'],
  ['郑州市', '郑州'],
  ['郑州', '郑州'],
  ['长沙市', '长沙'],
  ['长沙', '长沙'],
  ['合肥市', '合肥'],
  ['合肥', '合肥'],
  ['青岛市', '青岛'],
  ['青岛', '青岛'],
  ['宁波市', '宁波'],
  ['宁波', '宁波'],
  ['无锡市', '无锡'],
  ['无锡', '无锡'],
  ['厦门市', '厦门'],
  ['厦门', '厦门'],
] as const;

const POSITION_KEYWORDS = [
  '滴滴司机',
  '卡车司机',
  '货运司机',
  '网约车司机',
  '叉车司机',
  '保安',
  '保洁',
  '电工',
  '焊工',
  '普工',
  '骑手',
  '配送员',
  '送餐员',
  '快递员',
  '分拣员',
  '装卸工',
  '搬运工',
  '叉车工',
  '操作工',
  '质检员',
  '仓管',
  '仓库管理员',
  '服务员',
  '收银员',
  '导购',
  '客服',
  '文员',
  '前台',
  '家政',
  '月嫂',
  '育儿嫂',
  '护工',
  '厨师',
  '配菜',
  '切配',
  '洗碗工',
  '木工',
  '瓦工',
  '钢筋工',
  '油漆工',
  '缝纫工',
  '包装工',
  '学徒',
] as const;

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

function extractPositionFromFragments(transcript: string, cityValue: string) {
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
    .replace(FILLER_WORDS, ' ');

  const candidate = stripped
    .split(/[\s，。！？；,.!?;:：、]+/u)
    .map((token) => token.trim())
    .map((token) => cleanPositionValue(token))
    .filter(Boolean)
    .filter((token) => token !== cityValue)
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
    ...extractPositionFromFragments(transcript, extractCities(transcript).value),
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
