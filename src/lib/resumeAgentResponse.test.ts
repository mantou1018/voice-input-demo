import { describe, expect, it } from 'vitest';
import { buildAnalysisFromAgentFields, buildFallbackAnalysis } from './resumeAgentResponse';

describe('buildAnalysisFromAgentFields', () => {
  it('maps agent field JSON into the resume analysis contract', () => {
    const analysis = buildAnalysisFromAgentFields('25岁 北京 保安 13800138000', {
      age: { value: '25', detected: true, sourceText: '25岁' },
      city: { value: '北京', detected: true, sourceText: '北京' },
      position: { value: '保安', detected: true, sourceText: '保安' },
      phone: { value: '13800138000', detected: true, sourceText: '13800138000' },
    });

    expect(analysis.card.fields[1].value).toBe('13800138000');
    expect(analysis.card.fields[2].value).toContain('25岁');
    expect(analysis.card.fields[3].value).toBe('北京');
    expect(analysis.card.fields[4].value).toBe('保安');
    expect(analysis.extractionItems.map((item) => item.id)).toEqual([
      'age',
      'city',
      'position',
      'phone',
    ]);
    expect(analysis.extractionItems.every((item) => item.detected)).toBe(true);
  });

  it('normalizes misheard position values into canonical job titles', () => {
    const analysis = buildAnalysisFromAgentFields('我想做宝杰，手机号13800138000', {
      age: { value: '', detected: false, sourceText: null },
      city: { value: '', detected: false, sourceText: null },
      position: { value: '宝杰', detected: true, sourceText: '宝杰' },
      phone: { value: '13800138000', detected: true, sourceText: '13800138000' },
    });

    expect(analysis.card.fields[4].value).toBe('保洁');
  });
});

describe('buildFallbackAnalysis', () => {
  it('returns a usable local analysis when the upstream agent is unavailable', () => {
    const analysis = buildFallbackAnalysis('我25岁，想去北京做保安，手机号是13800138000');

    expect(analysis.card.fields[1].value).toBe('13800138000');
    expect(analysis.card.fields[2].value).toContain('25岁');
    expect(analysis.card.fields[3].value).toBe('北京');
    expect(analysis.card.fields[4].value).toBe('保安');
  });
});
