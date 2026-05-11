import { describe, expect, it } from 'vitest';
import type { ResumeAnalysis } from '../types/speech';
import { createResumeUpdateFeedback } from './resumeUpdateFeedback';

function createAnalysis(values: Record<string, string>): ResumeAnalysis {
  return {
    nameSourceText: null,
    card: {
      title: '已为您生成简历',
      ctaLabel: '没问题，去报名',
      footnote: '',
      rawTranscript: '',
      fields: [],
    },
    extractionItems: ['age', 'city', 'position', 'phone'].map((id) => ({
      id,
      label: id,
      value: values[id] ?? '',
      sourceText: values[id] ? values[id] : null,
      detected: Boolean(values[id]),
    })),
  };
}

describe('createResumeUpdateFeedback', () => {
  it('reports changed detected fields after a supplemental recognition pass', () => {
    const previous = createAnalysis({ age: '25', city: '北京', position: '保安', phone: '13800138000' });
    const next = createAnalysis({ age: '25', city: '上海', position: '保安', phone: '13800138000' });

    expect(createResumeUpdateFeedback(previous, next)).toBe('意向城市已更新为上海。');
  });

  it('reports saved when supplemental recognition keeps the existing information', () => {
    const previous = createAnalysis({ age: '25', city: '北京', position: '保安', phone: '13800138000' });
    const next = createAnalysis({ age: '25', city: '北京', position: '保安', phone: '13800138000' });

    expect(createResumeUpdateFeedback(previous, next)).toBe('已听到的信息会保留，你只需要补充没听清的内容。');
  });
});
