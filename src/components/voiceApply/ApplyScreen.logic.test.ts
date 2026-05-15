import { describe, expect, it } from 'vitest';

function shouldShowReviewHeading(options: {
  hasFormContent: boolean;
  isSupplementing: boolean;
  isRecordingMode: boolean;
  showExtracting: boolean;
  showReview: boolean;
}) {
  const { hasFormContent, isSupplementing, isRecordingMode, showExtracting, showReview } = options;
  return showReview || (hasFormContent && !isSupplementing && !isRecordingMode && !showExtracting);
}

describe('shouldShowReviewHeading', () => {
  it('stays in recording heading while supplementing even if some fields already have values', () => {
    expect(
      shouldShowReviewHeading({
        hasFormContent: true,
        isSupplementing: true,
        isRecordingMode: true,
        showExtracting: false,
        showReview: false,
      }),
    ).toBe(false);
  });

  it('shows review heading once the flow really returns to review', () => {
    expect(
      shouldShowReviewHeading({
        hasFormContent: true,
        isSupplementing: false,
        isRecordingMode: false,
        showExtracting: false,
        showReview: true,
      }),
    ).toBe(true);
  });
});
