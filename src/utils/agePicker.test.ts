import { describe, expect, it } from 'vitest';
import { AGE_OPTIONS, normalizeAgeValue } from './agePicker';

describe('AGE_OPTIONS', () => {
  it('covers working-age values from 16 to 65', () => {
    expect(AGE_OPTIONS[0]).toBe('16');
    expect(AGE_OPTIONS[AGE_OPTIONS.length - 1]).toBe('65');
  });
});

describe('normalizeAgeValue', () => {
  it('extracts a valid age from display text', () => {
    expect(normalizeAgeValue('25岁')).toBe('25');
    expect(normalizeAgeValue('2001(25岁)')).toBe('25');
  });
});
