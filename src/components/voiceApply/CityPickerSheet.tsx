import { CITY_PICKER_PROVINCES, getCityPickerProvince } from '../../data/cityPicker';
import type { CityPickerState } from './types';

export function CityPickerSheet({
  cityPickerState,
  onClose,
  onConfirm,
  toastMessage,
  onRemoveCity,
  onReset,
  onSelectProvince,
  onToggleCity,
}: {
  cityPickerState: CityPickerState;
  onClose: () => void;
  onConfirm: () => void;
  toastMessage?: string | null;
  onRemoveCity: (cityKey: string) => void;
  onReset: () => void;
  onSelectProvince: (provinceId: string) => void;
  onToggleCity: (cityId: string) => void;
}) {
  const selectedProvince = getCityPickerProvince(cityPickerState.selectedProvinceId);
  const selectedCount = cityPickerState.selectedItems.length;

  return (
    <div className="absolute inset-0 z-40">
      <button
        aria-label="关闭城市选择"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />
      <div className="absolute bottom-0 left-0 flex h-[586px] w-[414px] flex-col overflow-hidden rounded-t-[18px] bg-white">
        <div className="relative flex h-[52px] items-center justify-center border-b border-[#f0f0f0]">
          <h2 className="m-0 text-[16px] font-medium leading-[22px] text-[#222222]">选择意向城市</h2>
          <button
            className="absolute right-[16px] top-[14px] text-[24px] leading-[24px] text-[#222222]"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        {toastMessage ? (
          <div className="pointer-events-none absolute left-1/2 top-[60px] z-10 -translate-x-1/2 rounded-[18px] bg-[rgba(34,34,34,0.88)] px-[14px] py-[8px] text-[13px] leading-[18px] text-white">
            {toastMessage}
          </div>
        ) : null}
        <div className="flex min-h-0 flex-1">
          <div className="w-[138px] overflow-y-auto bg-[#ffffff]">
            {CITY_PICKER_PROVINCES.map((province) => {
              const isSelected = province.id === selectedProvince.id;
              return (
                <button
                  className={`flex h-[44px] w-full items-center px-[18px] text-left text-[15px] leading-[21px] ${
                    isSelected ? 'bg-[#f7f7f7] text-[#ff3b66]' : 'text-[#222222]'
                  }`}
                  key={province.id}
                  onClick={() => onSelectProvince(province.id)}
                  type="button"
                >
                  {province.label}
                </button>
              );
            })}
          </div>
          <div className="flex-1 overflow-y-auto bg-[#f7f7f7]">
            {selectedProvince.cities.map((city) => {
              const isSelected = cityPickerState.selectedItems.some((item) => item.cityId === city.id);
              return (
                <button
                  className="flex h-[44px] w-full items-center justify-between px-[18px] text-left text-[15px] leading-[21px] text-[#222222]"
                  key={city.id}
                  onClick={() => onToggleCity(city.id)}
                  type="button"
                >
                  <span className={isSelected ? 'text-[#ff3b66]' : ''}>{city.label}</span>
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
        <div className="shrink-0 border-t border-[#f4f4f4] bg-white">
          <div className="flex h-[74px] items-start gap-[12px] overflow-x-auto px-[18px] pt-[16px]">
            {cityPickerState.selectedItems.map((item) => (
              <button
                className="shrink-0 rounded-[10px] border border-[#ff3b66] px-[14px] py-[10px] text-[15px] leading-[21px] text-[#ff3b66]"
                key={item.key}
                onClick={() => onRemoveCity(item.key)}
                type="button"
              >
                {item.cityLabel} ×
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-[14px] px-[18px] pb-[8px]">
            <button
              className="h-[44px] w-[156px] rounded-[22px] border border-[#d8d8d8] bg-white text-[16px] font-medium leading-[22px] text-[#222222]"
              onClick={onReset}
              type="button"
            >
              重置
            </button>
            <button
              className="h-[44px] w-[156px] rounded-[22px] bg-[#ff3b66] text-[16px] font-medium leading-[22px] text-white disabled:opacity-50"
              disabled={selectedCount === 0}
              onClick={onConfirm}
              type="button"
            >
              {selectedCount > 0 ? `确定（${selectedCount}）` : '确定'}
            </button>
          </div>
          <div className="flex justify-center pb-[6px]">
            <div className="h-[5px] w-[134px] rounded-full bg-black" />
          </div>
        </div>
      </div>
    </div>
  );
}
