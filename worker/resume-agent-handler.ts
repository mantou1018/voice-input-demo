import { resolveResumeAnalysis } from '../src/lib/resumeAgentService.js';

export type ResumeAgentEnv = {
  AI_API_KEY?: string;
  AI_API_BASE_URL?: string;
  AI_MODEL?: string;
};

export async function handleResumeAgentRequest(request: Request, env: ResumeAgentEnv) {
  if (request.method !== 'POST') {
    return Response.json({ error: '只支持 POST 请求。' }, { status: 405 });
  }

  let transcript = '';

  try {
    const body = (await request.json()) as { transcript?: unknown };
    transcript = typeof body.transcript === 'string' ? body.transcript.trim() : '';
  } catch {
    return Response.json({ error: '请求体不是合法 JSON。' }, { status: 400 });
  }

  if (!transcript) {
    return Response.json({ error: '没有收到语音转写文本，请重新说一遍。' }, { status: 400 });
  }

  const result = await resolveResumeAnalysis(transcript, {
    apiKey: env.AI_API_KEY,
    baseUrl: env.AI_API_BASE_URL,
    model: env.AI_MODEL,
  });

  return Response.json(result.body, { status: result.status });
}
