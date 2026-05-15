import {
  buildAnalysisFromAgentFields,
  buildFallbackAnalysis,
  type AgentFieldPayload,
} from './resumeAgentResponse';
import { normalizePositionSpeechText } from './positionSpeechCorrection';

const AGENT_SYSTEM_PROMPT = `
你是招聘报名信息抽取助手。只从用户语音转写文本中抽取四个字段：年龄、手机号、意向城市、意向职位。
必须只返回 JSON，不要 Markdown，不要解释。
JSON 结构：
{
  "age": { "value": string, "detected": boolean, "sourceText": string | null },
  "phone": { "value": string, "detected": boolean, "sourceText": string | null },
  "city": { "value": string, "detected": boolean, "sourceText": string | null },
  "position": { "value": string, "detected": boolean, "sourceText": string | null }
}
规则：
- detected 只有原文明确提到时才为 true。
- sourceText 必须是原文依据，没有依据填 null。
- 缺失字段 value 为空字符串，detected 为 false。
- 城市最多保留最后 3 个，职位最多保留最后 5 个，用顿号连接。
- 同一字段前后冲突、否定、改口或补充时，以最后明确表达为准。
`;

function extractJsonObject(content: string) {
  const trimmed = content.trim();

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  const match = trimmed.match(/\{[\s\S]*\}/u);
  return match?.[0] ?? null;
}

export async function resolveResumeAnalysis(
  transcript: string,
  env: { apiKey?: string; baseUrl?: string; model?: string },
) {
  const correctedTranscript = normalizePositionSpeechText(transcript);
  const apiKey = env.apiKey;
  const baseUrl = env.baseUrl ?? 'https://api.openai.com/v1';
  const model = env.model ?? 'gpt-4.1-mini';

  if (!apiKey) {
    return {
      status: 500,
      body: { error: '缺少 AI_API_KEY，请检查环境变量配置。' },
    };
  }

  try {
    const upstreamResponse = await fetch(`${baseUrl.replace(/\/$/u, '')}/chat/completions`, {
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
          { role: 'system', content: AGENT_SYSTEM_PROMPT },
          { role: 'user', content: correctedTranscript },
        ],
      }),
    });

    if (!upstreamResponse.ok) {
      const upstreamText = await upstreamResponse.text();
      console.error('[resume-agent] upstream failed', upstreamResponse.status, upstreamText);
      return {
        status: 200,
        body: buildFallbackAnalysis(correctedTranscript),
      };
    }

    const upstreamPayload = (await upstreamResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = upstreamPayload.choices?.[0]?.message?.content;

    if (!content) {
      return {
        status: 200,
        body: buildFallbackAnalysis(correctedTranscript),
      };
    }

    const jsonText = extractJsonObject(content);

    if (!jsonText) {
      console.error('[resume-agent] non-json content', content);
      return {
        status: 200,
        body: buildFallbackAnalysis(correctedTranscript),
      };
    }

    try {
      const fields = JSON.parse(jsonText) as AgentFieldPayload;
      return {
        status: 200,
        body: buildAnalysisFromAgentFields(correctedTranscript, fields),
      };
    } catch (error) {
      console.error('[resume-agent] invalid json content', error);
      return {
        status: 200,
        body: buildFallbackAnalysis(correctedTranscript),
      };
    }
  } catch (error) {
    console.error('[resume-agent] request failed', error);
    return {
      status: 200,
      body: buildFallbackAnalysis(correctedTranscript),
    };
  }
}
