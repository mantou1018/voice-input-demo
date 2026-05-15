import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveResumeAnalysis } from '../src/lib/resumeAgentService';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: '只支持 POST 请求。' });
    return;
  }

  const transcript =
    typeof request.body?.transcript === 'string' ? request.body.transcript.trim() : '';

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
