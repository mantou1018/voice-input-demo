import doneCheckSvg from '../../assets/done-check.svg';
import micIconPng from '../../assets/mic-icon.png';
import type { ApplyMode } from './types';

type ApplyActionsProps = {
  mode: ApplyMode;
  hasTranscriptText?: boolean;
  isConfirmEnabled: boolean;
  isDoneEnabled: boolean;
  isSupplementing?: boolean;
  showError: boolean;
  showExtracting: boolean;
  showReview: boolean;
  onCancelSupplement: () => void;
  onDone: () => void;
  onConfirm: () => void;
  onRetry: () => void;
  onStartSupplement: () => void;
};

export function shouldShowConfirmActions({
  isConfirmEnabled,
  showError,
  showExtracting,
  showReview,
}: Pick<ApplyActionsProps, 'isConfirmEnabled' | 'showError' | 'showExtracting' | 'showReview'>) {
  if (showExtracting) {
    return false;
  }

  if (showReview) {
    return true;
  }

  // When speech recognition fails, the user should still be able to submit after
  // filling all required fields manually.
  return isConfirmEnabled && !showError;
}

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

function ReviewMicIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[16px] w-[16px]"
      fill="none"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 10.6667C9.47276 10.6667 10.6667 9.47276 10.6667 8V4.66667C10.6667 3.19391 9.47276 2 8 2C6.52724 2 5.33333 3.19391 5.33333 4.66667V8C5.33333 9.47276 6.52724 10.6667 8 10.6667Z" fill="#222222" />
      <path d="M3.33333 7.33333C3.33333 9.91066 5.42267 12 8 12C10.5773 12 12.6667 9.91066 12.6667 7.33333H11.3333C11.3333 9.17428 9.84095 10.6667 8 10.6667C6.15905 10.6667 4.66667 9.17428 4.66667 7.33333H3.33333Z" fill="#222222" />
      <path d="M7.33333 12H8.66667V14H7.33333V12Z" fill="#222222" />
      <path d="M5.33333 14H10.6667V15.3333H5.33333V14Z" fill="#222222" />
    </svg>
  );
}

export function ApplyActions({
  mode,
  hasTranscriptText = false,
  isConfirmEnabled,
  isDoneEnabled,
  isSupplementing = false,
  showError,
  showExtracting,
  showReview,
  onCancelSupplement,
  onDone,
  onConfirm,
  onRetry,
  onStartSupplement,
}: ApplyActionsProps) {
  const isPrepareMode = mode === 'prepare';
  const isRecordingMode = mode === 'recording';
  const isErrorMode = mode === 'error';
  const isExtractingMode = mode === 'extracting';
  const showConfirmActions = shouldShowConfirmActions({
    isConfirmEnabled,
    showError,
    showExtracting,
    showReview,
  });
  const primaryButtonLabel = showConfirmActions
    ? '确认并报名'
    : showExtracting
      ? '识别中...'
      : '我说完了';
  const secondaryButtonLabel = showConfirmActions ? '补充信息' : '重说';
  const primaryButtonDisabled = showConfirmActions
    ? !isConfirmEnabled
    : showExtracting
      ? true
      : isPrepareMode
        ? true
      : showError
        ? true
        : !isDoneEnabled;
  const primaryButtonClick = showConfirmActions ? onConfirm : onDone;
  const showPrimaryCheck = showConfirmActions
    ? isConfirmEnabled
    : !showExtracting && !showError && isDoneEnabled;

  if (isSupplementing) {
    return (
      <div className="shrink-0 pt-[6px]">
        <div className="flex gap-4">
          <button
            className="h-[48px] w-[102px] shrink-0 rounded-[24px] bg-white px-[20px] py-[13.5px] text-[15px] font-medium leading-[21px] text-[#222222] shadow-[0_0_0_1px_rgba(255,255,255,0.88)]"
            onClick={onCancelSupplement}
            type="button"
          >
            取消补充
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

  if (showConfirmActions) {
    return (
      <div className="shrink-0 pt-[6px]">
        <div className="flex gap-4">
          <button
            className="relative h-[48px] w-[102px] shrink-0 rounded-[24px] bg-white text-[15px] font-medium leading-[21px] text-[#222222] shadow-[0_0_0_1px_rgba(255,255,255,0.88)]"
            onClick={onStartSupplement}
            type="button"
          >
            <span className="absolute left-[12px] top-[16px]">
              <ReviewMicIcon />
            </span>
            <span className="absolute left-[30px] top-[14px] w-[60px] text-left">继续补充</span>
          </button>
          <button
            className={`h-[48px] min-w-0 flex-1 rounded-[24px] px-[24px] py-[13.5px] text-[15px] font-medium leading-[21px] ${
              isConfirmEnabled
                ? 'bg-[linear-gradient(347deg,#5ff1ff_18.034%,#31f8c6_78.723%)] text-[#222222] shadow-[0_10px_24px_rgba(49,248,198,0.16)]'
                : 'bg-[rgba(255,255,255,0.6)] text-[#919191]'
            }`}
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
