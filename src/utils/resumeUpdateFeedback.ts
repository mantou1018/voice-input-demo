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

function formatItemUpdate(item: ResumeExtractionItem) {
  const label = FIELD_LABELS[item.id] ?? item.label;
  const value = item.value.trim();
  return value ? `${label}已更新为${value}` : `${label}已更新`;
}

export function createResumeUpdateFeedback(
  previous: ResumeAnalysis,
  next: ResumeAnalysis,
) {
  const changedItems = next.extractionItems
    .filter((item) => item.detected)
    .filter((item) => getItemValue(previous.extractionItems, item.id) !== item.value.trim());

  if (!changedItems.length) {
    return '已听到的信息会保留，你只需要补充没听清的内容。';
  }

  if (changedItems.length === 1) {
    return `${formatItemUpdate(changedItems[0])}。`;
  }

  return `${changedItems.map(formatItemUpdate).join('，')}。`;
}
