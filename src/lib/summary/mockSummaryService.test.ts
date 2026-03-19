import { describe, expect, it } from 'vitest';
import { createMockSummaryService } from './mockSummaryService';

describe('createMockSummaryService', () => {
  const service = createMockSummaryService();

  it('builds a rich summary for a longer meeting transcript', async () => {
    const result = await service.generate(
      '今天和客户开了产品方案会，确认第一阶段先上线语音转文字和信息卡片。下周二之前我要把交互稿过一遍，设计那边要补动画细节。',
    );

    expect(result.summaryText).toContain('这段语音主要围绕');
    expect(result.sections).toHaveLength(3);
    expect(result.sections[1].items.length).toBeGreaterThan(0);
  });

  it('keeps short transcripts readable', async () => {
    const result = await service.generate(
      '明天下午三点记得去医院拿体检报告。',
    );

    expect(result.summaryText).toContain('已整理为一条精简记录');
    expect(result.sections[2].items).toContain('待办提醒');
  });

  it('returns fallback guidance for empty-like text', async () => {
    const result = await service.generate('  ');

    expect(result.summaryText).toContain('内容较少');
    expect(result.sections[0].items[0]).toContain('建议补充');
  });
});
