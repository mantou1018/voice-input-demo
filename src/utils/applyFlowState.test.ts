import { describe, expect, it } from 'vitest';

function shouldExitSupplementMode(
  isSupplementing: boolean,
  overlayMode: 'prepare' | 'recording' | 'extracting' | 'review' | 'error',
) {
  if (!isSupplementing) {
    return false;
  }

  return overlayMode === 'review' || overlayMode === 'error';
}

describe('shouldExitSupplementMode', () => {
  it('exits supplement mode when returning to review', () => {
    expect(shouldExitSupplementMode(true, 'review')).toBe(true);
  });

  it('exits supplement mode when supplementing fails into error', () => {
    expect(shouldExitSupplementMode(true, 'error')).toBe(true);
  });

  it('keeps supplement mode while still recording or extracting', () => {
    expect(shouldExitSupplementMode(true, 'recording')).toBe(false);
    expect(shouldExitSupplementMode(true, 'extracting')).toBe(false);
  });
});
