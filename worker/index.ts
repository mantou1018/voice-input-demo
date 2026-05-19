import { handleResumeAgentRequest, type ResumeAgentEnv } from './resume-agent-handler.js';

type Env = ResumeAgentEnv & {
  ASSETS: { fetch(input: Request | string | URL, init?: RequestInit): Promise<Response> };
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/resume-agent') {
      return handleResumeAgentRequest(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
