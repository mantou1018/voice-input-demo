import doneCheckSvg from '../../assets/done-check.svg';

type ApplyActionsProps = {
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
  isConfirmEnabled,
  isDoneEnabled,
  showError,
  showExtracting,
  showReview,
  onDone,
  onConfirm,
  onRetry,
}: ApplyActionsProps) {
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
      : showError
        ? true
        : !isDoneEnabled;
  const primaryButtonClick = showReview ? onConfirm : onDone;
  const showPrimaryCheck = showReview
    ? isConfirmEnabled
    : !showExtracting && !showError && isDoneEnabled;

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
