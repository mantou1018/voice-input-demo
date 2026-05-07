import { describe, expect, it } from 'vitest';
import { isCompletePhoneNumber, normalizePhoneInput } from './phoneInput';

describe('normalizePhoneInput', () => {
  it('keeps only the first eleven digits', () => {
    expect(normalizePhoneInput('138-0013 8000 ext 9')).toBe('13800138000');
  });
});

describe('isCompletePhoneNumber', () => {
  it('requires an eleven digit mobile number', () => {
    expect(isCompletePhoneNumber('13800138000')).toBe(true);
    expect(isCompletePhoneNumber('1380013800')).toBe(false);
  });
});
