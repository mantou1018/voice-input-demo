import { isCompletePhoneNumber } from '../../utils/phoneInput';

export function PhoneEditorSheet({
  onChangePhoneInput,
  onClose,
  onConfirm,
  phoneInputValue,
}: {
  onChangePhoneInput: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  phoneInputValue: string;
}) {
  const isPhoneConfirmEnabled = isCompletePhoneNumber(phoneInputValue);

  return (
    <div className="absolute inset-0 z-40">
      <button
        aria-label="关闭手机号编辑"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />
      <div className="absolute bottom-0 left-0 h-[306px] w-[414px] overflow-hidden rounded-t-[18px] bg-white">
        <div className="relative flex h-[52px] items-center justify-center border-b border-[#f0f0f0]">
          <h2 className="m-0 text-[16px] font-medium leading-[22px] text-[#222222]">修改手机号</h2>
          <button
            className="absolute right-[16px] top-[14px] text-[24px] leading-[24px] text-[#222222]"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="px-[24px] pt-[28px]">
          <label className="block text-[14px] leading-[20px] text-[#777777]" htmlFor="phone-editor-input">
            手机号码
          </label>
          <input
            autoFocus
            className="mt-[10px] h-[50px] w-full rounded-[10px] border border-[#e1e5eb] bg-[#f8fafc] px-[14px] text-[22px] font-medium leading-[30px] text-[#222222] outline-none focus:border-[#07d3a0]"
            id="phone-editor-input"
            inputMode="numeric"
            maxLength={11}
            onChange={(event) => onChangePhoneInput(event.target.value)}
            placeholder="请输入手机号"
            type="tel"
            value={phoneInputValue}
          />
          <p className="m-0 mt-[8px] text-[13px] leading-[18px] text-[#9c9c9c]">请输入 11 位手机号码</p>
        </div>
        <div className="absolute bottom-[20px] left-[0] flex w-full items-center justify-center gap-[14px]">
          <button
            className="h-[44px] w-[156px] rounded-[22px] border border-[#d8d8d8] bg-white text-[16px] font-medium leading-[22px] text-[#222222]"
            onClick={onClose}
            type="button"
          >
            取消
          </button>
          <button
            className={`h-[44px] w-[156px] rounded-[22px] text-[16px] font-medium leading-[22px] text-white ${
              isPhoneConfirmEnabled ? 'bg-[#ff3b66]' : 'bg-[#d8d8d8]'
            }`}
            disabled={!isPhoneConfirmEnabled}
            onClick={onConfirm}
            type="button"
          >
            确定
          </button>
        </div>
        <div className="absolute bottom-[6px] left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}
