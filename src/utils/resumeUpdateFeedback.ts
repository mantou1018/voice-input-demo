import type { ResumeAnalysis, ResumeExtractionItem } from '../types/speech';

const FIELD_LABELS: Record<string, string> = {
  age: '年龄',
  city: '意向城市',
  position: '意向职位',
  phone: '手机号',
};

function getItemValue(items: ResumeExtractionItem[], id: string) {
  return items.find((item) => item.id === id)?.value.trim() ?? '';
}

export function createResumeUpdateFeedback(
  previous: ResumeAnalysis,
  next: ResumeAnalysis,
) {
  const changedLabels = next.extractionItems
    .filter((item) => item.detected)
    .filter((item) => getItemValue(previous.extractionItems, item.id) !== item.value.trim())
    .map((item) => FIELD_LABELS[item.id] ?? item.label);

  if (!changedLabels.length) {
    return '信息已保存';
  }

  if (changedLabels.length === 1) {
    return `${changedLabels[0]}已修改`;
  }

  return `${changedLabels.join('、')}已修改`;
}
