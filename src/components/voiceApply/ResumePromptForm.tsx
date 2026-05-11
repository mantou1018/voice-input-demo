type ResumePromptFormProps = {
  ageText: string;
  cityText: string;
  phoneText: string;
  positionText: string;
  showReview: boolean;
  onOpenAgePicker: () => void;
  onOpenCityPicker: () => void;
  onOpenPhoneEditor: () => void;
  onOpenPositionPicker: () => void;
};

export function ResumePromptForm({
  ageText,
  cityText,
  phoneText,
  positionText,
  showReview,
  onOpenAgePicker,
  onOpenCityPicker,
  onOpenPhoneEditor,
  onOpenPositionPicker,
}: ResumePromptFormProps) {
  return (
    <div className="mt-[28px] shrink-0 text-[#666666]">
      <div className="relative flex items-end gap-1 text-[20px] leading-7">
        <span>我今年</span>
        <button
          aria-label="编辑年龄"
          className="absolute left-[66px] top-0 h-[28px] w-[44px]"
          onClick={onOpenAgePicker}
          type="button"
        />
        <span className="mb-[2px] block h-px w-[35px] bg-[#d9dfe8]" />
        <span>岁，</span>
        {showReview && ageText ? (
          <button
            className="absolute left-[70px] top-0 text-[20px] font-medium leading-7 text-[#07d3a0]"
            onClick={onOpenAgePicker}
            type="button"
          >
            {ageText}
          </button>
        ) : null}
      </div>
      <div className="relative mt-6 flex items-end gap-1 text-[20px] leading-7">
        <span>我的手机号是</span>
        <button
          aria-label="编辑手机号"
          className="absolute left-[138px] top-0 h-[28px] w-[170px]"
          onClick={onOpenPhoneEditor}
          type="button"
        />
        <span className="mb-[2px] block min-w-0 flex-1 border-b border-[#d9dfe8]" />
        <span>，</span>
        {showReview && phoneText ? (
          <button
            className="absolute left-[141px] top-0 text-[20px] font-medium leading-7 text-[#07d3a0]"
            onClick={onOpenPhoneEditor}
            type="button"
          >
            {phoneText}
          </button>
        ) : null}
      </div>
      <div className="relative mt-6 flex items-end gap-1 text-[20px] leading-7">
        <span>我的意向城市是</span>
        <button
          aria-label="编辑意向城市"
          className="absolute left-[152px] top-0 h-[28px] w-[156px]"
          onClick={onOpenCityPicker}
          type="button"
        />
        <span className="mb-[2px] block min-w-0 flex-1 border-b border-[#d9dfe8]" />
        <span>，</span>
        {!showReview ? (
          <span className="absolute left-[151px] top-1 text-[14px] leading-5 text-[#c6c6c6]">市/区/县（最多3个）</span>
        ) : null}
        {showReview && cityText ? (
          <button
            className="absolute left-[165px] top-0 text-[20px] font-medium leading-7 text-[#07d3a0]"
            onClick={onOpenCityPicker}
            type="button"
          >
            {cityText}
          </button>
        ) : null}
      </div>
      <div className="relative mt-6 flex items-end gap-1 text-[20px] leading-7">
        <span>我的意向职位是</span>
        <button
          aria-label="编辑意向职位"
          className="absolute left-[191px] top-0 h-[28px] w-[118px]"
          onClick={onOpenPositionPicker}
          type="button"
        />
        <span className="mb-[2px] block min-w-0 flex-1 border-b border-[#d9dfe8]" />
        <span>。</span>
        {showReview && positionText ? (
          <button
            className="absolute left-[195px] top-0 text-[20px] font-medium leading-7 text-[#07d3a0]"
            onClick={onOpenPositionPicker}
            type="button"
          >
            {positionText}
          </button>
        ) : null}
      </div>
    </div>
  );
}
