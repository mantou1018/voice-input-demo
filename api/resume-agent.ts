import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveResumeAnalysis } from '../src/lib/resumeAgentService';

function readRequestBody(request: VercelRequest) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];

    request.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: '只支持 POST 请求。' });
    return;
  }

  let transcript = '';

  try {
    const rawBody =
      typeof request.body === 'string'
        ? request.body
        : request.body && typeof request.body === 'object'
          ? JSON.stringify(request.body)
          : await readRequestBody(request);
    const parsed = JSON.parse(rawBody) as { transcript?: unknown };
    transcript = typeof parsed.transcript === 'string' ? parsed.transcript.trim() : '';
  } catch {
    response.status(400).json({ error: '请求体不是合法 JSON。' });
    return;
  }

  if (!transcript) {
    response.status(400).json({ error: '没有收到语音转写文本，请重新说一遍。' });
    return;
  }

  const result = await resolveResumeAnalysis(transcript, {
    apiKey: process.env.AI_API_KEY,
    baseUrl: process.env.AI_API_BASE_URL,
    model: process.env.AI_MODEL,
  });

  response.status(result.status).json(result.body);
}
