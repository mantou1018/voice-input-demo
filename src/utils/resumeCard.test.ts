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

  it('stops city extraction before the position phrase begins', () => {
    const analysis = buildResumeAnalysis('希望去北京应聘保安工作，手机号是13566372453。');

    expect(analysis.extractionItems[1].value).toBe('北京');
    expect(analysis.card.fields[3].value).toBe('北京');
  });

  it('extracts age city and position from short fragment input', () => {
    const analysis = buildResumeAnalysis('25岁 北京 保安');

    expect(analysis.extractionItems[0].sourceText).toBe('25岁');
    expect(analysis.extractionItems[1].value).toBe('北京');
    expect(analysis.extractionItems[2].value).toBe('保安');
    expect(analysis.card.fields[3].value).toBe('北京');
    expect(analysis.card.fields[4].value).toBe('保安');
  });

  it('extracts sparse phone and position fragments without a full sentence', () => {
    const analysis = buildResumeAnalysis('上海 骑手 13800138000');

    expect(analysis.extractionItems[1].value).toBe('上海');
    expect(analysis.extractionItems[2].value).toBe('骑手');
    expect(analysis.extractionItems[3].value).toBe('13800138000');
  });

  it('extracts age from sparse fragments without the 岁 suffix', () => {
    const analysis = buildResumeAnalysis('25 北京 保安');

    expect(analysis.extractionItems[0].value).toBe('25');
    expect(analysis.extractionItems[0].detected).toBe(true);
    expect(analysis.card.fields[2].value).toContain('25岁');
  });

  it('keeps default fallback fields out of the detected extraction state', () => {
    const analysis = buildResumeAnalysis('北京');

    expect(analysis.extractionItems[1].detected).toBe(true);
    expect(analysis.extractionItems[0].detected).toBe(false);
    expect(analysis.extractionItems[2].detected).toBe(false);
    expect(analysis.extractionItems[3].detected).toBe(false);
  });

  it('recognizes expanded city and position vocab such as 昆明 and 保姆', () => {
    const analysis = buildResumeAnalysis('昆明 保姆');

    expect(analysis.card.fields[3].value).toBe('昆明');
    expect(analysis.card.fields[4].value).toBe('保姆');
    expect(analysis.extractionItems[1].detected).toBe(true);
    expect(analysis.extractionItems[2].detected).toBe(true);
  });
});
