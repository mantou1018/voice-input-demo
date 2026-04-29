import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { CITY_ALIASES, POSITION_KEYWORDS } from './src/data/lookupTables';

interface AgentField {
  value?: string;
  detected?: boolean;
  sourceText?: string | null;
}

interface AgentExtraction {
  phone?: AgentField;
  age?: AgentField;
  city?: AgentField;
  position?: AgentField;
}

type AgentSkillId = keyof AgentExtraction;

interface AgentSkill {
  id: AgentSkillId;
  label: string;
  description: string;
  required: boolean;
}

const AGENT_SKILLS: AgentSkill[] = [
  { id: 'phone', label: '手机号', description: '中国大陆手机号', required: true },
  { id: 'age', label: '年龄', description: '用户年龄，只保留年龄数字或原文年龄表达', required: true },
  { id: 'city', label: '意向城市', description: '用户想工作的城市、区县或地点，最多保留最后 3 个', required: true },
  { id: 'position', label: '意向职位', description: '用户想应聘或从事的岗位，最多保留最后 5 个', required: true },
];

const REQUIRED_EXTRACTION_IDS: AgentSkillId[] = ['age', 'city', 'position', 'phone'];
const LIST_LIMITS: Partial<Record<AgentSkillId, number>> = {
  city: 3,
  position: 5,
};

function readBody(request: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
    });

    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

function parseJsonObject(content: string): AgentExtraction {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/u);
  const jsonText = fencedMatch?.[1]?.trim() ?? trimmed;
  const parsed = JSON.parse(jsonText);

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Agent returned an invalid JSON object.');
  }

  return parsed as AgentExtraction;
}

function fieldValue(field: AgentField | undefined) {
  return typeof field?.value === 'string' ? field.value.trim() : '';
}

function fieldSource(field: AgentField | undefined) {
  if (typeof field?.sourceText !== 'string') {
    return null;
  }

  const sourceText = field.sourceText.trim();
  return sourceText || null;
}

function fieldDetected(field: AgentField | undefined) {
  return Boolean(field?.detected && fieldValue(field));
}

function splitListValue(value: string) {
  return value
    .replace(/以及|还有|或者|和|及/gu, '、')
    .split(/[、，,；;\/\s]+/u)
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractKnownItems(value: string, id: AgentSkillId) {
  const keywords =
    id === 'city'
      ? CITY_ALIASES.map(([, city]) => city)
      : id === 'position'
        ? [...POSITION_KEYWORDS]
        : [];

  const matches = keywords
    .map((keyword) => ({
      keyword,
      index: value.indexOf(keyword),
      end: value.indexOf(keyword) + keyword.length,
    }))
    .filter((match) => match.index >= 0)
    .sort((left, right) => left.index - right.index || right.keyword.length - left.keyword.length);

  const items: string[] = [];
  const acceptedRanges: Array<{ start: number; end: number }> = [];

  matches.forEach((match) => {
    const isContained = acceptedRanges.some(
      (range) => match.index >= range.start && match.end <= range.end,
    );

    if (isContained) {
      return;
    }

    if (!items.includes(match.keyword)) {
      items.push(match.keyword);
      acceptedRanges.push({ start: match.index, end: match.end });
    }
  });

  return items;
}

function getListItems(value: string, id: AgentSkillId) {
  const knownItems = extractKnownItems(value, id);
  if (knownItems.length > 1) {
    return knownItems;
  }

  return splitListValue(value);
}

function normalizeSkillValue(id: AgentSkillId, field: AgentField | undefined) {
  const value = fieldValue(field);
  const limit = LIST_LIMITS[id];

  if (!limit || !value) {
    return value;
  }

  const sourceText = fieldSource(field);
  const valueItems = getListItems(value, id);
  const sourceItems = sourceText ? getListItems(sourceText, id) : [];
  const items = sourceItems.length > valueItems.length ? sourceItems : valueItems;

  if (items.length <= 1) {
    return value;
  }

  return items.slice(-limit).join('、');
}

function buildBirthYear(ageText: string) {
  const age = Number(ageText.match(/\d+/u)?.[0]);

  if (!Number.isFinite(age) || age <= 0) {
    return '';
  }

  return `${new Date().getFullYear() - age}(${age}岁)`;
}

function getSkillField(extraction: AgentExtraction, id: AgentSkillId) {
  return extraction[id];
}

function buildAgentSystemPrompt() {
  const skillLines = AGENT_SKILLS.map((skill) => {
    const requiredHint = skill.required ? '必填基础信息' : '可选扩展信息';
    return `- ${skill.id}（${skill.label}）：${skill.description}，${requiredHint}`;
  }).join('\n');

  const jsonExample = AGENT_SKILLS.reduce<Record<string, AgentField>>((example, skill) => {
    example[skill.id] = {
      value: '',
      detected: false,
      sourceText: null,
    };
    return example;
  }, {});

  return [
    '你是一个语音报名 agent，只负责识别并判断用户自然语言中的四个报名信息。',
    '你只能使用以下 skills：',
    skillLines,
    '执行规则：',
    '- 只识别年龄、手机号、意向城市、意向职位。',
    '- 不要识别姓名、工作经验、薪资、证书、到岗时间或其他信息。',
    '- 反馈和判断也只能围绕这四个字段。',
    '- 对同一字段做二次判断：如果用户前后说法冲突、否定、改口或补充，以最后明确表达的信息为准。',
    '- 城市可以收录多个，但只保留用户最后提到的 3 个城市或地点，并用顿号连接。',
    '- 职位可以收录多个，但只保留用户最后提到的 5 个职位，并用顿号连接。',
    '- 不要编造，原文没有明确提到就返回空字符串。',
    '- detected 只有在原文明确提到时才为 true。',
    '- sourceText 填原文依据，没有依据就填 null。',
    '- 只返回 JSON 对象，不要解释，不要 Markdown。',
    `输出格式必须包含这些 key：${JSON.stringify(jsonExample)}`,
  ].join('\n');
}

function buildAnalysis(transcript: string, extraction: AgentExtraction) {
  const phone = fieldValue(extraction.phone);
  const age = fieldValue(extraction.age);
  const city = normalizeSkillValue('city', extraction.city);
  const position = normalizeSkillValue('position', extraction.position);
  const birthYear = buildBirthYear(age);

  return {
    card: {
      title: '已为您生成简历',
      fields: [
        { label: '手机号', value: phone },
        { label: '出生年份', value: birthYear },
        { label: '期望工作城市', value: city },
        { label: '期望职位', value: position },
      ],
      ctaLabel: '没问题，去报名',
      footnote: '请核对一下以上信息是否准确？如果需要修改，直接告诉我修改哪一项就行。',
      rawTranscript: transcript,
    },
    nameSourceText: null,
    extractionItems: REQUIRED_EXTRACTION_IDS.map((id) => {
      const skill = AGENT_SKILLS.find((item) => item.id === id);
      const field = getSkillField(extraction, id);

      return {
        id,
        label: skill?.label ?? id,
        value: normalizeSkillValue(id, field),
        sourceText: fieldSource(field),
        detected: fieldDetected(field),
      };
    }),
  };
}

function resumeAgentPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'resume-agent-api',
    configureServer(server) {
      server.middlewares.use('/api/resume-agent', async (request, response) => {
        if (request.method !== 'POST') {
          sendJson(response, 405, { error: 'Method not allowed.' });
          return;
        }

        const apiKey = env.AI_API_KEY;
        const baseUrl = env.AI_API_BASE_URL || 'https://api.openai.com/v1';
        const model = env.AI_MODEL || 'gpt-4.1-mini';

        if (!apiKey) {
          sendJson(response, 500, { error: '缺少 AI_API_KEY，请在 .env.local 中配置。' });
          return;
        }

        try {
          const body = JSON.parse(await readBody(request)) as { transcript?: unknown };
          const transcript = typeof body.transcript === 'string' ? body.transcript.trim() : '';

          if (!transcript) {
            sendJson(response, 400, { error: '缺少语音转写文本。' });
            return;
          }

          const aiResponse = await fetch(`${baseUrl.replace(/\/$/u, '')}/chat/completions`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              temperature: 0,
              response_format: { type: 'json_object' },
              messages: [
                {
                  role: 'system',
                  content: buildAgentSystemPrompt(),
                },
                {
                  role: 'user',
                  content: transcript,
                },
              ],
            }),
          });

          if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            sendJson(response, 502, {
              error: `AI 接口调用失败：${aiResponse.status} ${errorText.slice(0, 180)}`,
            });
            return;
          }

          const result = await aiResponse.json();
          const content = result?.choices?.[0]?.message?.content;

          if (typeof content !== 'string') {
            sendJson(response, 502, { error: 'AI 接口没有返回有效内容。' });
            return;
          }

          sendJson(response, 200, buildAnalysis(transcript, parseJsonObject(content)));
        } catch (error) {
          sendJson(response, 500, {
            error: error instanceof Error ? error.message : 'AI 报名助手处理失败。',
          });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [resumeAgentPlugin(env), react(), tailwindcss()],
    server: {
      allowedHosts: true,
      host: '0.0.0.0',
      port: 5173,
    },
  };
});
