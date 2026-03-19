import type { SummaryResult, SummarySection, SummaryService } from '../../types/speech';
import { normalizeText, splitSentences, truncateText, unique } from '../../utils/text';

const SUMMARY_LATENCY_MS = 900;

const TAG_RULES: Array<{ tag: string; matcher: RegExp }> = [
  { tag: '会议纪要', matcher: /(会议|讨论|同步|评审|客户|方案|排期)/u },
  { tag: '待办提醒', matcher: /(记得|需要|待|跟进|安排|准备|处理|提交|联系)/u },
  { tag: '时间信息', matcher: /(明天|今天|下午|上午|周[一二三四五六日天]|下周|月底|\d+[点号时日月])/u },
  { tag: '出行安排', matcher: /(机场|车站|打车|地铁|酒店|出发|到达)/u },
  { tag: '生活记录', matcher: /(买|带|做饭|孩子|家里|超市|医院|快递)/u },
];

const ACTION_RULE = /(记得|需要|待|安排|跟进|确认|联系|提交|准备|买|带|处理|更新)/u;

function delay(duration: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, duration);
  });
}

function formatClock(timestamp: number): string {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function extractTags(text: string): string[] {
  const tags = TAG_RULES.filter((rule) => rule.matcher.test(text)).map((rule) => rule.tag);
  return unique(tags).slice(0, 4);
}

function buildHighlights(sentences: string[]): string[] {
  if (sentences.length === 0) {
    return ['这段语音内容较短，建议补充更明确的背景或动作。'];
  }

  return sentences.slice(0, 3).map((sentence) => truncateText(sentence, 34));
}

function buildActions(sentences: string[]): string[] {
  const actions = sentences
    .filter((sentence) => ACTION_RULE.test(sentence))
    .map((sentence) => truncateText(sentence, 28));

  if (actions.length > 0) {
    return unique(actions).slice(0, 3);
  }

  if (sentences.length > 1) {
    return [
      '确认语音中的关键时间点与责任人。',
      '将摘要同步到后续卡片或任务系统。',
    ];
  }

  return ['补充一段更完整的语音，系统可以生成更清晰的待办建议。'];
}

function buildSections(
  highlights: string[],
  actions: string[],
  tags: string[],
): SummarySection[] {
  return [
    { id: 'highlights', title: '重点信息', items: highlights },
    { id: 'actions', title: '建议跟进', items: actions },
    {
      id: 'tags',
      title: '信息标签',
      items: tags.length > 0 ? tags : ['语音记录', '待确认'],
    },
  ];
}

function buildSummary(sentences: string[], tags: string[]): string {
  if (sentences.length === 0) {
    return '本次录音内容较少，建议重新录制以获得更完整的信息卡片。';
  }

  if (sentences.length === 1) {
    return `${truncateText(sentences[0], 42)}。已整理为一条精简记录，可继续补充细节。`;
  }

  const lead = truncateText(sentences[0], 28);
  const follow = truncateText(sentences[1], 26);
  const tagHint = tags.length > 0 ? `，主题偏向${tags.join(' / ')}` : '';
  return `这段语音主要围绕“${lead}”展开，补充信息提到“${follow}”${tagHint}。`;
}

export function createMockSummaryService(): SummaryService {
  return {
    async generate(transcript: string) {
      const normalized = normalizeText(transcript);
      const sentences = splitSentences(normalized);
      const tags = extractTags(normalized);
      const highlights = buildHighlights(sentences);
      const actions = buildActions(sentences);

      await delay(SUMMARY_LATENCY_MS);

      return {
        rawTranscript: normalized,
        summaryText: buildSummary(sentences, tags),
        meta: [
          { label: '文本长度', value: `${normalized.length} 字` },
          { label: '语句数量', value: `${Math.max(sentences.length, 1)} 段` },
          { label: '生成时间', value: formatClock(Date.now()) },
        ],
        sections: buildSections(highlights, actions, tags),
        generatedAt: new Date().toISOString(),
      };
    },
  };
}
