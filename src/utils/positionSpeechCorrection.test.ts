import { describe, expect, it } from 'vitest';
import {
  normalizePositionFieldValue,
  normalizePositionSpeechText,
} from '../lib/positionSpeechCorrection';

describe('normalizePositionSpeechText', () => {
  it('replaces common speech-recognition aliases with canonical job titles', () => {
    expect(normalizePositionSpeechText('我想做蒲公，朋友做宝安')).toBe('我想做普工，朋友做保安');
    expect(normalizePositionSpeechText('之前干过宝杰和分检员')).toBe('之前干过保洁和分拣员');
  });
});

describe('normalizePositionFieldValue', () => {
  it('normalizes aliased position values into canonical labels', () => {
    expect(normalizePositionFieldValue('蒲公')).toBe('普工');
    expect(normalizePositionFieldValue('宝安、分检员')).toBe('保安、分拣员');
  });

  it('keeps unknown values unchanged', () => {
    expect(normalizePositionFieldValue('算法工程师')).toBe('算法工程师');
  });
});
