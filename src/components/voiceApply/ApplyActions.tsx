import doneCheckSvg from '../../assets/done-check.svg';
import micIconPng from '../../assets/mic-icon.png';
import micIconReviewSvg from '../../assets/mic-icon-review.svg';
import type { ApplyMode } from './types';

type ApplyActionsProps = {
  mode: ApplyMode;
  hasTranscriptText?: boolean;
  isConfirmEnabled: boolean;
  isDoneEnabled: boolean;
  showError: boolean;
  showExtracting: boolean;
  showReview: boolean;
  onDone: () => void;
  onConfirm: () => void;
  onRetry: () => void;
};

export function VoiceWave() {
  return (
    <div className="flex h-[19.5px] w-[153.4px] items-center gap-[2.6px]">
      {[
        [14.3, 14.3, 9.1, 19.5, 9.1],
        [14.3, 14.3, 19.5, 9.1, 9.1],
        [14.3, 14.3, 19.5, 9.1, 9.1],
        [14.3, 14.3, 19.5, 9.1, 9.1],
        [14.3, 14.3, 9.1, 19.5, 9.1],
        [14.3, 14.3, 9.1, 19.5, 9.1],
      ].map((groupHeights, groupIndex) => (
        <div className="flex items-center gap-[2.6px]" key={groupIndex}>
          {groupHeights.map((height, index) => (
            <span
              className="wave-bar block w-[2.6px] rounded-[1.95px] bg-[#255153]"
              key={`${groupIndex}-${index}`}
              style={{ height: `${height}px`, animationDelay: `${(groupIndex * 5 + index) * 0.04}s` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ApplyActions({
  mode,
  hasTranscriptText = false,
  isConfirmEnabled,
  isDoneEnabled,
  showError,
  showExtracting,
  showReview,
  onDone,
  onConfirm,
  onRetry,
}: ApplyActionsProps) {
  const isPrepareMode = mode === 'prepare';
  const isRecordingMode = mode === 'recording';
  const isErrorMode = mode === 'error';
  const isExtractingMode = mode === 'extracting';
  const primaryButtonLabel = showReview
    ? '确认并报名'
    : showExtracting
      ? '识别中...'
      : '我说完了';
  const secondaryButtonLabel = showReview ? '补充信息' : '重说';
  const primaryButtonDisabled = showReview
    ? !isConfirmEnabled
    : showExtracting
      ? true
      : isPrepareMode
        ? true
      : showError
        ? true
        : !isDoneEnabled;
  const primaryButtonClick = showReview ? onConfirm : onDone;
  const showPrimaryCheck = showReview
    ? isConfirmEnabled
    : !showExtracting && !showError && isDoneEnabled;

  if (isPrepareMode) {
    return (
      <div className="shrink-0 pt-[6px]">
        <div className="flex gap-4">
          <button
            className="h-[48px] w-[102px] shrink-0 rounded-[24px] bg-white px-[24px] py-[13.5px] text-[15px] font-medium leading-[21px] text-[#222222] shadow-[0_0_0_1px_rgba(255,255,255,0.88)]"
            onClick={onRetry}
            type="button"
          >
            继续补充
          </button>
          <button
            className="h-[48px] min-w-0 flex-1 rounded-[24px] bg-[linear-gradient(347deg,#5ff1ff_18.034%,#31f8c6_78.723%)] px-[24px] py-[13.5px] text-[15px] font-medium leading-[21px] text-[#222222] shadow-[0_10px_24px_rgba(49,248,198,0.16)]"
            onClick={onConfirm}
            type="button"
          >
            确认并报名
          </button>
        </div>
      </div>
    );
  }

  if (isRecordingMode || isErrorMode) {
    return (
      <div className="shrink-0 pt-[6px]">
        <div className="flex gap-4">
          <button
            className="h-[48px] w-[102px] shrink-0 rounded-[24px] bg-white px-[24px] py-[13.5px] text-[15px] font-medium leading-[21px] text-[#222222] shadow-[0_0_0_1px_rgba(255,255,255,0.88)]"
            onClick={onRetry}
            type="button"
          >
            重说
          </button>
          <button
            className={`h-[48px] min-w-0 flex-1 rounded-[24px] px-[24px] py-[13.5px] text-[15px] font-medium leading-[21px] ${
              hasTranscriptText
                ? 'bg-[linear-gradient(347deg,#5ff1ff_18.034%,#31f8c6_78.723%)] text-[#222222] shadow-[0_10px_24px_rgba(49,248,198,0.16)]'
                : 'bg-[rgba(255,255,255,0.6)] text-[#919191]'
            }`}
            disabled={!hasTranscriptText}
            onClick={onDone}
            type="button"
          >
            发送
          </button>
        </div>
      </div>
    );
  }

  if (isExtractingMode) {
    return (
      <div className="shrink-0 pt-[6px]">
        <div className="flex gap-4">
          <button
            className="h-[48px] w-[102px] shrink-0 rounded-[24px] bg-white px-[24px] py-[13.5px] text-[15px] font-medium leading-[21px] text-[#222222] shadow-[0_0_0_1px_rgba(255,255,255,0.88)]"
            onClick={onRetry}
            type="button"
          >
            重说
          </button>
          <button
            className="h-[48px] min-w-0 flex-1 rounded-[24px] bg-[linear-gradient(347deg,#5ff1ff_18.034%,#31f8c6_78.723%)] px-[24px] py-[13.5px] text-[15px] font-medium leading-[21px] text-[#222222] shadow-[0_10px_24px_rgba(49,248,198,0.16)]"
            onClick={onDone}
            type="button"
          >
            发送
          </button>
        </div>
      </div>
    );
  }

  if (showReview) {
    return (
      <div className="shrink-0 pt-[6px]">
        <div className="flex gap-4">
          <button
            className="relative h-[48px] w-[102px] shrink-0 rounded-[24px] bg-white text-[15px] font-medium leading-[21px] text-[#222222] shadow-[0_0_0_1px_rgba(255,255,255,0.88)]"
            onClick={onRetry}
            type="button"
          >
            <img
              alt=""
              aria-hidden="true"
              className="absolute left-[12px] top-[16px] h-[16px] w-[16px]"
              src={micIconReviewSvg}
            />
            <span className="absolute left-[30px] top-[14px] w-[60px] text-left">继续补充</span>
          </button>
          <button
            className="h-[48px] min-w-0 flex-1 rounded-[24px] bg-[linear-gradient(347deg,#5ff1ff_18.034%,#31f8c6_78.723%)] px-[24px] py-[13.5px] text-[15px] font-medium leading-[21px] text-[#222222] shadow-[0_10px_24px_rgba(49,248,198,0.16)]"
            disabled={!isConfirmEnabled}
            onClick={onConfirm}
            type="button"
          >
            确认并报名
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shrink-0 pt-[6px]">
      <div className="flex gap-4">
        <button
          className="h-[48px] min-w-0 flex-[122] rounded-[45px] bg-[#dff9f5] text-[15px] font-medium leading-[21px] text-[#222222]"
          onClick={onRetry}
          type="button"
        >
          {secondaryButtonLabel}
        </button>
        <button
          className="relative h-[48px] min-w-0 flex-[238] overflow-hidden rounded-[45px]"
          disabled={primaryButtonDisabled}
          onClick={primaryButtonClick}
          type="button"
        >
          <div className="absolute inset-0 bg-[linear-gradient(343.43deg,#defcff_14.824%,#dbfff6_91.068%)]" />
          <div className="absolute left-[-59px] top-[32px] h-[45px] w-[128px] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0)_72%)]" />
          <div className="absolute left-[186px] top-[-28px] h-[41px] w-[144px] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0)_72%)]" />
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="flex items-center gap-[6px]">
              {showPrimaryCheck ? (
                <img
                  alt=""
                  aria-hidden="true"
                  className="h-[20px] w-[20px] shrink-0"
                  src={doneCheckSvg}
                />
              ) : null}
              <span
                className={`text-[15px] font-medium leading-[21px] ${
                  showReview
                    ? isConfirmEnabled
                      ? 'text-[#222222]'
                      : 'text-[#919191]'
                    : showExtracting
                      ? 'text-[#919191]'
                      : showError
                        ? 'text-[#919191]'
                        : isDoneEnabled
                          ? 'text-[#222222]'
                          : 'text-[#919191]'
                }`}
              >
                {primaryButtonLabel}
              </span>
            </div>
          </div>
          <div className="absolute inset-0 rounded-[45px] shadow-[inset_0_-3px_14.5px_rgba(255,255,255,0.6)]" />
        </button>
      </div>
    </div>
  );
}
