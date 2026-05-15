import { describe, expect, it } from 'vitest';
import { shouldShowConfirmActions } from './ApplyActions';

describe('shouldShowConfirmActions', () => {
  it('keeps review mode in confirm state', () => {
    expect(
      shouldShowConfirmActions({
        isConfirmEnabled: false,
        showError: false,
        showExtracting: false,
        showReview: true,
      }),
    ).toBe(true);
  });

  it('prevents confirm actions while extracting', () => {
    expect(
      shouldShowConfirmActions({
        isConfirmEnabled: true,
        showError: false,
        showExtracting: true,
        showReview: false,
      }),
    ).toBe(false);
  });

  it('allows manual submit after an error when all fields are complete', () => {
    expect(
      shouldShowConfirmActions({
        isConfirmEnabled: true,
        showError: true,
        showExtracting: false,
        showReview: false,
      }),
    ).toBe(false);
  });

  it('does not show confirm actions during supplement mode before new transcript is captured', () => {
    expect(
      shouldShowConfirmActions({
        isConfirmEnabled: false,
        showError: false,
        showExtracting: false,
        showReview: false,
      }),
    ).toBe(false);
  });
});
