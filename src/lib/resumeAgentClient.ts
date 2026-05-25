import type { ResumeAnalysis } from '../types/speech';
import { buildFallbackAnalysis } from './resumeAgentResponse';
import { normalizePositionSpeechText } from './positionSpeechCorrection';

export async function analyzeResumeWithAgent(transcript: string): Promise<ResumeAnalysis> {
  if (import.meta.env.VITE_FORCE_LOCAL_RESUME_ANALYSIS === 'true') {
    return buildFallbackAnalysis(normalizePositionSpeechText(transcript));
  }

  const response = await fetch('/api/resume-agent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transcript }),
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    const message =
      typeof detail?.error === 'string' ? detail.error : 'AI 报名助手调用失败，请稍后重试。';
    throw new Error(message);
  }

  return response.json();
}
