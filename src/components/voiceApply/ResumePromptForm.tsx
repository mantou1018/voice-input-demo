type ResumePromptFormProps = {
  ageText: string;
  cityText: string;
  phoneText: string;
  positionText: string;
  recordingStyle: boolean;
  showReview: boolean;
  onOpenAgePicker: () => void;
  onOpenCityPicker: () => void;
  onOpenPhoneEditor: () => void;
  onOpenPositionPicker: () => void;
};

function formatCityDisplay(value: string) {
  const parts = value
    .split('、')
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length <= 2) {
    return value;
  }

  return `${parts.slice(0, 2).join('、')}…`;
}

function formatPositionDisplay(value: string) {
  const parts = value
    .split('、')
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length <= 2) {
    return value;
  }

  return `${parts.slice(0, 2).join('、')}…`;
}

export function ResumePromptForm({
  ageText,
  cityText,
  phoneText,
  positionText,
  recordingStyle,
  showReview,
  onOpenAgePicker,
  onOpenCityPicker,
  onOpenPhoneEditor,
  onOpenPositionPicker,
}: ResumePromptFormProps) {
  const hasAgeText = ageText.trim().length > 0;
  const hasPhoneText = phoneText.trim().length > 0;
  const hasCityText = cityText.trim().length > 0;
  const hasPositionText = positionText.trim().length > 0;
  const fieldTextClass = recordingStyle
    ? 'text-[20px] leading-[normal] text-[#666666]'
    : 'text-[20px] leading-7 text-[#666666]';
  const valueTextClass = recordingStyle
    ? 'text-[20px] font-medium leading-[normal] text-[#07d3a0]'
    : 'text-[20px] font-medium leading-7 text-[#07d3a0]';
  const placeholderTextClass = recordingStyle
    ? 'text-[14px] leading-5 text-[rgba(156,156,156,0.8)]'
    : 'text-[14px] leading-5 text-[#c6c6c6]';
  const lineClass = recordingStyle
    ? 'bg-[#d7d9de]'
    : 'bg-[#d9dfe8]';
  const cityDisplayText = hasCityText ? formatCityDisplay(cityText) : '';
  const positionDisplayText = hasPositionText ? formatPositionDisplay(positionText) : '';
  const alignedFieldBoxClass = 'left-[144px] w-[144px]';

  return (
    <div
      className={`shrink-0 text-[#666666] ${recordingStyle ? 'mt-[28px] flex w-[310px] flex-col gap-[24px]' : 'mt-[28px]'}`}
    >
      <div className={`relative flex h-[28px] items-end gap-1 ${fieldTextClass}`}>
        <span>我今年</span>
        <button
          aria-label="编辑年龄"
          className={`absolute top-0 ${recordingStyle ? 'left-[64px] h-[28px] w-[40px]' : 'left-[66px] h-[28px] w-[44px]'}`}
          onClick={onOpenAgePicker}
          type="button"
        />
        <span className={`mb-[2px] block h-px w-[35px] ${lineClass}`} />
        <span>岁，</span>
        {hasAgeText ? (
          <button
            className={`absolute left-[70px] top-0 w-[35px] overflow-hidden text-ellipsis whitespace-nowrap text-left ${valueTextClass}`}
            onClick={onOpenAgePicker}
            type="button"
          >
            {ageText}
          </button>
        ) : null}
      </div>
      <div className={`relative flex h-[28px] items-end gap-1 ${fieldTextClass} ${recordingStyle ? '' : 'mt-6'}`}>
        <span>我的手机号是</span>
        <button
          aria-label="编辑手机号"
          className={`absolute top-0 ${recordingStyle ? 'left-[124px] h-[28px] w-[164px]' : 'left-[138px] h-[28px] w-[170px]'}`}
          onClick={onOpenPhoneEditor}
          type="button"
        />
        <span className={`mb-[2px] block min-w-0 flex-1 border-b ${recordingStyle ? 'border-[#d7d9de]' : 'border-[#d9dfe8]'}`} />
        <span>，</span>
        {hasPhoneText ? (
          <button
            className={`absolute top-0 ${recordingStyle ? 'left-[128px] w-[160px]' : 'left-[141px] w-[166px]'} overflow-hidden text-ellipsis whitespace-nowrap text-left ${valueTextClass}`}
            onClick={onOpenPhoneEditor}
            type="button"
          >
            {phoneText}
          </button>
        ) : null}
      </div>
      <div className={`relative flex h-[28px] items-end gap-1 ${fieldTextClass} ${recordingStyle ? '' : 'mt-6'}`}>
        <span>我的意向城市是</span>
        <button
          aria-label="编辑意向城市"
          className={`absolute top-0 h-[28px] ${alignedFieldBoxClass}`}
          onClick={onOpenCityPicker}
          type="button"
        />
        <span className={`mb-[2px] block min-w-0 flex-1 border-b ${recordingStyle ? 'border-[#d7d9de]' : 'border-[#d9dfe8]'}`} />
        <span>，</span>
        {!hasCityText ? (
          <span className={`pointer-events-none absolute ${recordingStyle ? 'left-[151px] top-[4px]' : 'left-[151px] top-1'} ${placeholderTextClass}`}>市/区/县（最多3个）</span>
        ) : null}
        {hasCityText ? (
          <button
            className={`absolute top-0 overflow-hidden text-ellipsis whitespace-nowrap text-center ${alignedFieldBoxClass} ${valueTextClass}`}
            onClick={onOpenCityPicker}
            type="button"
          >
            {cityDisplayText}
          </button>
        ) : null}
      </div>
      <div className={`relative flex h-[28px] items-end gap-1 ${fieldTextClass} ${recordingStyle ? '' : 'mt-6'}`}>
        <span>我的意向职位是</span>
        <button
          aria-label="编辑意向职位"
          className={`absolute top-0 h-[28px] ${alignedFieldBoxClass}`}
          onClick={onOpenPositionPicker}
          type="button"
        />
        <span className={`mb-[2px] block min-w-0 flex-1 border-b ${recordingStyle ? 'border-[#d7d9de]' : 'border-[#d9dfe8]'}`} />
        <span>。</span>
        {!hasPositionText && recordingStyle ? (
          <span className="pointer-events-none absolute left-[175px] top-[4px] text-[14px] leading-5 text-[rgba(156,156,156,0.8)]">（最多3个）</span>
        ) : null}
        {hasPositionText ? (
          <button
            className={`absolute top-0 overflow-hidden text-ellipsis whitespace-nowrap text-center ${alignedFieldBoxClass} ${valueTextClass}`}
            onClick={onOpenPositionPicker}
            type="button"
          >
            {positionDisplayText}
          </button>
        ) : null}
      </div>
    </div>
  );
}
