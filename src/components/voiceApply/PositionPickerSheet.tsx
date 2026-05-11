import {
  POSITION_PICKER_CATEGORIES,
  getPositionPickerCategory,
} from '../../data/positionPicker';
import type { PositionPickerState } from './types';

export function PositionPickerSheet({
  onClose,
  onConfirm,
  onReset,
  onSelectCategory,
  onSelectOption,
  positionPickerState,
}: {
  onClose: () => void;
  onConfirm: () => void;
  onReset: () => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectOption: (option: string) => void;
  positionPickerState: PositionPickerState;
}) {
  const selectedCategory = getPositionPickerCategory(positionPickerState.selectedCategoryId);

  return (
    <div className="absolute inset-0 z-40">
      <button
        aria-label="关闭意向职位选择"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />
      <div className="absolute bottom-0 left-0 h-[586px] w-[414px] overflow-hidden rounded-t-[18px] bg-white">
        <div className="relative flex h-[52px] items-center justify-center border-b border-[#f0f0f0]">
          <h2 className="m-0 text-[16px] font-medium leading-[22px] text-[#222222]">选择意向职位</h2>
          <button
            className="absolute right-[16px] top-[14px] text-[24px] leading-[24px] text-[#222222]"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="flex h-[446px]">
          <div className="w-[190px] overflow-y-auto bg-[#ffffff]">
            {POSITION_PICKER_CATEGORIES.map((category) => {
              const isSelected = category.id === selectedCategory.id;
              return (
                <button
                  className={`flex h-[44px] w-full items-center px-[18px] text-left text-[15px] leading-[21px] ${
                    isSelected ? 'bg-[#f7f7f7] text-[#ff3b66]' : 'text-[#222222]'
                  }`}
                  key={category.id}
                  onClick={() => onSelectCategory(category.id)}
                  type="button"
                >
                  {category.label}
                </button>
              );
            })}
          </div>
          <div className="flex-1 overflow-y-auto bg-[#f7f7f7]">
            {selectedCategory.options.map((option) => {
              const isSelected = option === positionPickerState.selectedOption;
              return (
                <button
                  className="flex h-[44px] w-full items-center justify-between px-[18px] text-left text-[15px] leading-[21px] text-[#222222]"
                  key={option}
                  onClick={() => onSelectOption(option)}
                  type="button"
                >
                  <span>{option}</span>
                  <span
                    className={`h-[16px] w-[16px] rounded-full border ${
                      isSelected ? 'border-[#ff3b66] bg-[#ff3b66]' : 'border-[#d0d0d0] bg-white'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
        <div className="absolute bottom-[14px] left-[0] flex w-full items-center justify-center gap-[14px]">
          <button
            className="h-[44px] w-[156px] rounded-[22px] border border-[#d8d8d8] bg-white text-[16px] font-medium leading-[22px] text-[#222222]"
            onClick={onReset}
            type="button"
          >
            重置
          </button>
          <button
            className="h-[44px] w-[156px] rounded-[22px] bg-[#ff3b66] text-[16px] font-medium leading-[22px] text-white"
            disabled={!positionPickerState.selectedOption}
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
