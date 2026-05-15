import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { Plugin } from 'vite';
import { resolveResumeAnalysis } from './src/lib/resumeAgentService';

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

        const result = await resolveResumeAnalysis(transcript, {
          apiKey,
          baseUrl,
          model,
        });

        sendJson(response, result.status, result.body);
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
