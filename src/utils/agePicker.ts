export const AGE_OPTIONS = Array.from({ length: 50 }, (_, index) => String(index + 16));

export function normalizeAgeValue(value: string) {
  const match = value.match(/(\d{1,2})岁/u)?.[1] ?? value.match(/\d{1,2}/u)?.[0] ?? '';
  return AGE_OPTIONS.includes(match) ? match : '';
}
