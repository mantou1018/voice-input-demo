import { describe, expect, it } from 'vitest';
import { buildResumeAnalysis, buildResumeInfoCard } from './resumeCard';

describe('buildResumeInfoCard', () => {
  it('extracts core resume fields from spoken text', () => {
    const card = buildResumeInfoCard(
      '我叫张晓明，37岁，希望去北京和上海工作，应聘滴滴司机岗，手机号是13566372453。',
    );

    expect(card.fields[0].value).toBe('张晓明');
    expect(card.fields[1].value).toBe('13566372453');
    expect(card.fields[2].value).toContain('37岁');
    expect(card.fields[3].value).toBe('北京、上海');
    expect(card.fields[4].value).toContain('滴滴司机');
  });

  it('falls back to default mock values when the transcript is sparse', () => {
    const card = buildResumeInfoCard('想找工作');

    expect(card.fields[0].value).toBe('张晓明');
    expect(card.fields[1].value).toBe('13566372453');
    expect(card.fields[3].value).toBe('北京、上海');
  });

  it('returns extraction items for staged recognition feedback', () => {
    const analysis = buildResumeAnalysis(
      '我叫张晓明，37岁，希望去北京和上海工作，应聘滴滴司机岗，手机号是13566372453。',
    );

    expect(analysis.extractionItems[0].sourceText).toBe('37岁');
    expect(analysis.extractionItems[1].sourceText).toContain('北京和上海');
    expect(analysis.extractionItems[2].sourceText).toContain('滴滴司机');
    expect(analysis.extractionItems[3].sourceText).toBe('13566372453');
  });
});
