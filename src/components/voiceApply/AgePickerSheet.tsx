import { useEffect, useRef } from 'react';
import { AGE_OPTIONS } from '../../utils/agePicker';

function AgeWheelPicker({
  onSelectAge,
  selectedAge,
}: {
  onSelectAge: (age: string) => void;
  selectedAge: string;
}) {
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const selectedItem = itemRefs.current[selectedAge];
    selectedItem?.scrollIntoView({ block: 'center' });
  }, [selectedAge]);

  return (
    <div className="relative h-[214px] overflow-hidden bg-white">
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-[64px] bg-[linear-gradient(180deg,#ffffff_0%,rgba(255,255,255,0)_100%)]" />
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 z-10 h-[64px] -translate-y-1/2 border-y border-[#e0e0e0]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-[64px] bg-[linear-gradient(0deg,#ffffff_0%,rgba(255,255,255,0)_100%)]" />
      <div className="h-full snap-y snap-mandatory overflow-y-auto py-[75px] [-webkit-overflow-scrolling:touch]">
        {AGE_OPTIONS.map((age) => {
          const isSelected = age === selectedAge;
          return (
            <button
              className={`relative z-20 flex h-[64px] w-full snap-center items-center justify-center transition-colors ${
                isSelected
                  ? 'text-[20px] font-medium leading-[28px] text-black'
                  : 'text-[16px] font-normal leading-[22px] text-[#666666]'
              }`}
              key={age}
              onClick={() => onSelectAge(age)}
              ref={(node) => {
                itemRefs.current[age] = node;
              }}
              type="button"
            >
              {age}岁
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AgePickerSheet({
  onClose,
  onConfirm,
  onSelectAge,
  selectedAge,
}: {
  onClose: () => void;
  onConfirm: () => void;
  onSelectAge: (age: string) => void;
  selectedAge: string;
}) {
  return (
    <div className="absolute inset-0 z-40">
      <button
        aria-label="关闭年龄选择"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />
      <div className="absolute bottom-0 left-0 h-[422px] w-[414px] overflow-hidden rounded-t-[16px] bg-white">
        <div className="relative flex h-[56px] items-center justify-center border-b border-[#f0f0f0]">
          <h2 className="m-0 text-[18px] font-medium leading-[24px] text-black">选择年龄</h2>
          <button
            className="absolute right-[8px] top-[8px] flex h-[40px] w-[40px] items-center justify-center text-[28px] leading-[28px] text-[#222222]"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <AgeWheelPicker onSelectAge={onSelectAge} selectedAge={selectedAge} />
        <div className="absolute bottom-[34px] left-[0] flex w-full items-center justify-center">
          <button
            className="h-[48px] w-[256px] rounded-[24px] bg-[#fe3666] text-[15px] font-medium leading-[21px] text-white"
            disabled={!selectedAge}
            onClick={onConfirm}
            type="button"
          >
            确定
          </button>
        </div>
        <div className="absolute bottom-[8px] left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-[100px] bg-black" />
      </div>
    </div>
  );
}
