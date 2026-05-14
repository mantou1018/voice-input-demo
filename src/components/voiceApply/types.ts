import type { ChatMessage } from '../../utils/chatMessages';

export type EditableField = 'age' | 'city' | 'phone' | 'position';

export type ManualEdits = {
  age: string | null;
  city: string | null;
  phone: string | null;
  position: string | null;
};

export type CityPickerSelectedItem = {
  key: string;
  provinceId: string;
  provinceLabel: string;
  cityId: string;
  cityLabel: string;
};

export type CityPickerState = {
  initialSelectedItems: CityPickerSelectedItem[];
  selectedProvinceId: string;
  selectedItems: CityPickerSelectedItem[];
};

export type PositionPickerState = {
  initialOption: string | null;
  selectedCategoryId: string;
  selectedOption: string | null;
};

export type ApplyMode = 'prepare' | 'recording' | 'extracting' | 'review' | 'error';

export type ApplyScreenProps = {
  activeExtractionIndex: number;
  ageText: string;
  cityText: string;
  pendingUserMessage: string;
  transcriptText: string;
  isConfirmEnabled: boolean;
  isActive: boolean;
  isDoneEnabled: boolean;
  mode: ApplyMode;
  onClose: () => void;
  onConfirm: () => void;
  onConfirmCityPicker: () => void;
  onCityPickerToastMessage?: string | null;
  onDone: () => void;
  onRetry: () => void;
  cityPickerState: CityPickerState;
  selectedAge: string;
  phoneText: string;
  phoneInputValue: string;
  positionText: string;
  editingField: EditableField | null;
  chatMessages: ChatMessage[];
  onCloseAgePicker: () => void;
  onCloseCityPicker: () => void;
  onChangePhoneInput: (value: string) => void;
  onClosePhoneEditor: () => void;
  onClosePositionPicker: () => void;
  onConfirmAgePicker: () => void;
  onConfirmPhoneEditor: () => void;
  onConfirmPositionPicker: () => void;
  onOpenAgePicker: () => void;
  onOpenCityPicker: () => void;
  onOpenPhoneEditor: () => void;
  onOpenPositionPicker: () => void;
  onResetCityPicker: () => void;
  onResetPositionPicker: () => void;
  onSelectAge: (age: string) => void;
  onRemoveCity: (cityKey: string) => void;
  onToggleCity: (cityId: string) => void;
  onSelectProvince: (provinceId: string) => void;
  onSelectPositionCategory: (categoryId: string) => void;
  onSelectPositionOption: (option: string) => void;
  positionPickerState: PositionPickerState;
};
