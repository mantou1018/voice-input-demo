import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { Plugin } from 'vite';
import {
  buildAnalysisFromAgentFields,
  buildFallbackAnalysis,
  type AgentFieldPayload,
} from './src/lib/resumeAgentResponse';
import { normalizePositionSpeechText } from './src/lib/positionSpeechCorrection';

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

function readRequestBody(request: NodeJS.ReadableStream) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];

    request.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

function sendJson(response: NodeJS.WritableStream & { statusCode?: number; setHeader?: (name: string, value: string) => void }, statusCode: number, body: unknown) {
  response.statusCode = statusCode;
  response.setHeader?.('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

function extractJsonObject(content: string) {
  const trimmed = content.trim();

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  const match = trimmed.match(/\{[\s\S]*\}/u);
  return match?.[0] ?? null;
}

function createResumeAgentPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'resume-agent-api',
    configureServer(server) {
      server.middlewares.use('/api/resume-agent', async (request, response) => {
        if (request.method !== 'POST') {
          sendJson(response, 405, { error: '只支持 POST 请求。' });
          return;
        }

        const apiKey = env.AI_API_KEY;
        const baseUrl = env.AI_API_BASE_URL ?? 'https://api.openai.com/v1';
        const model = env.AI_MODEL ?? 'gpt-4.1-mini';

        if (!apiKey) {
          sendJson(response, 500, { error: '缺少 AI_API_KEY，请检查 .env.local。' });
          return;
        }

        let transcript = '';

        try {
          const body = JSON.parse(await readRequestBody(request)) as { transcript?: unknown };
          transcript = typeof body.transcript === 'string' ? body.transcript.trim() : '';
        } catch {
          sendJson(response, 400, { error: '请求体不是合法 JSON。' });
          return;
        }

        if (!transcript) {
          sendJson(response, 400, { error: '没有收到语音转写文本，请重新说一遍。' });
          return;
        }

        const correctedTranscript = normalizePositionSpeechText(transcript);

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
            sendJson(response, 200, buildFallbackAnalysis(correctedTranscript));
            return;
          }

          const upstreamPayload = await upstreamResponse.json() as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const content = upstreamPayload.choices?.[0]?.message?.content;

          if (!content) {
            sendJson(response, 200, buildFallbackAnalysis(correctedTranscript));
            return;
          }

          const jsonText = extractJsonObject(content);

          if (!jsonText) {
            console.error('[resume-agent] non-json content', content);
            sendJson(response, 200, buildFallbackAnalysis(correctedTranscript));
            return;
          }

          try {
            const fields = JSON.parse(jsonText) as AgentFieldPayload;
            sendJson(response, 200, buildAnalysisFromAgentFields(correctedTranscript, fields));
          } catch (error) {
            console.error('[resume-agent] invalid json content', error);
            sendJson(response, 200, buildFallbackAnalysis(correctedTranscript));
          }
        } catch (error) {
          console.error('[resume-agent] request failed', error);
          sendJson(response, 200, buildFallbackAnalysis(correctedTranscript));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'AI_');

  return {
    plugins: [react(), tailwindcss(), createResumeAgentPlugin(env)],
    server: {
      allowedHosts: true,
      host: '0.0.0.0',
      port: 5173,
    },
  };
});
