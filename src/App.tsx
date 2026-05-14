import { useEffect, useRef, useState } from 'react';
import { ApplyScreen } from './components/voiceApply/ApplyScreen';
import { JobScreen } from './components/voiceApply/JobScreen';
import { PhoneShell } from './components/voiceApply/PhoneShell';
import { SuccessScreen } from './components/voiceApply/SuccessScreen';
import type {
  ApplyMode,
  CityPickerState,
  CityPickerSelectedItem,
  EditableField,
  ManualEdits,
  PositionPickerState,
} from './components/voiceApply/types';
import {
  DEFAULT_CITY_PICKER_PROVINCE_ID,
  findCityPickerSelection,
  formatCityPickerValue,
  getCityPickerProvince,
} from './data/cityPicker';
import {
  DEFAULT_POSITION_PICKER_CATEGORY_ID,
  findPositionPickerSelection,
  getPositionPickerCategory,
} from './data/positionPicker';
import { useVoiceSession } from './hooks/useVoiceSession';
import type { ResumeExtractionItem } from './types/speech';
import { normalizeAgeValue } from './utils/agePicker';
import {
  appendChatMessage,
  settleChatMessages as settleChatMessageList,
  type ChatMessage,
} from './utils/chatMessages';
import { isCompletePhoneNumber, normalizePhoneInput } from './utils/phoneInput';
import {
  createErrorPrompt,
  createRecordingPrompt,
  createReviewPrompt,
  RECOGNIZING_CHAT_TEXT,
} from './utils/resumeAssistantPrompts';

const CHAT_LIMIT = 2;
const CHAT_TRANSITION_MS = 220;
const CITY_SELECTION_LIMIT = 3;

function getDetectedValue(items: ResumeExtractionItem[] | null | undefined, id: string) {
  const item = items?.find((entry) => entry.id === id);
  return item?.detected ? item.value : '';
}

function normalizeAgeDisplay(value: string) {
  const match = value.match(/\d+/);
  return match?.[0] ?? '';
}

function resolvePositionPickerState(position: string): PositionPickerState {
  const selection = findPositionPickerSelection(position);
  return {
    initialOption: selection?.option ?? null,
    selectedCategoryId: selection?.categoryId ?? DEFAULT_POSITION_PICKER_CATEGORY_ID,
    selectedOption: selection?.option ?? null,
  };
}

function resolveCityPickerState(city: string): CityPickerState {
  const selections = findCityPickerSelection(city);
  const selectedItems: CityPickerSelectedItem[] = selections.map(({ provinceId, cityId }) => {
    const province = getCityPickerProvince(provinceId);
    const cityItem = province.cities.find((cityOption) => cityOption.id === cityId) ?? province.cities[0];

    return {
      key: `${provinceId}-${cityItem.id}`,
      provinceId,
      provinceLabel: province.label,
      cityId: cityItem.id,
      cityLabel: cityItem.label,
    };
  });

  return {
    initialSelectedItems: selectedItems,
    selectedProvinceId: selectedItems[0]?.provinceId ?? DEFAULT_CITY_PICKER_PROVINCE_ID,
    selectedItems,
  };
}

export default function App() {
  const {
    actions,
    activeExtractionIndex,
    analysis,
    error,
    hasApplied,
    phase,
    recordingState,
    submittedTranscript,
    transcriptText,
  } = useVoiceSession();
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [manualEdits, setManualEdits] = useState<ManualEdits>({
    age: null,
    city: null,
    phone: null,
    position: null,
  });
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [cityPickerState, setCityPickerState] = useState<CityPickerState>(() =>
    resolveCityPickerState(''),
  );
  const [selectedAge, setSelectedAge] = useState('');
  const [phoneInputValue, setPhoneInputValue] = useState('');
  const [positionPickerState, setPositionPickerState] = useState<PositionPickerState>(() =>
    resolvePositionPickerState(''),
  );
  const [cityPickerToast, setCityPickerToast] = useState<string | null>(null);
  const chatTimeoutRef = useRef<number | null>(null);
  const cityPickerToastTimeoutRef = useRef<number | null>(null);
  const previewMode =
    typeof window !== 'undefined' && import.meta.env.DEV
      ? new URLSearchParams(window.location.search).get('preview')
      : null;
  const isReviewPreview = previewMode === 'review';
  const isDoneEnabled = transcriptText.trim().length > 0;
  const extractionItems = analysis?.extractionItems;
  const detectedAgeText = normalizeAgeDisplay(getDetectedValue(extractionItems, 'age'));
  const ageText = manualEdits.age ?? detectedAgeText;
  const detectedPhoneText = getDetectedValue(extractionItems, 'phone');
  const phoneText = manualEdits.phone ?? detectedPhoneText;
  const detectedCityText = getDetectedValue(extractionItems, 'city');
  const cityText = manualEdits.city ?? detectedCityText;
  const detectedPositionText = getDetectedValue(extractionItems, 'position');
  const positionText = manualEdits.position ?? detectedPositionText;
  const isConfirmEnabled =
    ageText.trim().length > 0 &&
    phoneText.trim().length > 0 &&
    cityText.trim().length > 0 &&
    positionText.trim().length > 0;
  const overlayMode: ApplyMode = error
    ? 'error'
    : phase === 'intro'
      ? 'prepare'
    : phase === 'extracting'
      ? 'extracting'
      : phase === 'review'
        ? 'review'
        : 'recording';
  const previewChatMessages: ChatMessage[] = isReviewPreview
    ? [
      {
        id: 'preview-review-user',
        role: 'user',
        text: '北京',
        state: 'stable',
      },
      {
        id: 'preview-review-assistant',
        role: 'assistant',
        text: '识别成功，请确认您的报名信息。如需修改，您可点击上方横线手动填写或语音补充',
        state: 'stable',
      },
      ]
    : chatMessages;
  const resolvedAgeText = isReviewPreview ? '36' : ageText;
  const resolvedPhoneText = isReviewPreview ? '' : phoneText;
  const resolvedCityText = isReviewPreview ? '北京、上海' : cityText;
  const resolvedPositionText = isReviewPreview ? '' : positionText;
  const resolvedOverlayVisible = isReviewPreview || overlayVisible;
  const resolvedOverlayActive = isReviewPreview || overlayActive;
  const resolvedOverlayMode: ApplyMode = isReviewPreview ? 'review' : overlayMode;
  const resolvedIsConfirmEnabled = isReviewPreview ? true : isConfirmEnabled;
  const resolvedIsDoneEnabled = isReviewPreview ? true : isDoneEnabled;

  function settleChatMessages() {
    if (chatTimeoutRef.current) {
      window.clearTimeout(chatTimeoutRef.current);
    }

    chatTimeoutRef.current = window.setTimeout(() => {
      setChatMessages((current) => settleChatMessageList(current, CHAT_LIMIT));
      chatTimeoutRef.current = null;
    }, CHAT_TRANSITION_MS);
  }

  function pushChatMessage(
    role: ChatMessage['role'],
    text: string,
    options?: { removeTexts?: string[] },
  ) {
    setChatMessages((current) => {
      return appendChatMessage(current, {
        id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role,
        text,
        limit: CHAT_LIMIT,
        removeTexts: options?.removeTexts,
      });
    });

    settleChatMessages();
  }

  function resetChatMessages() {
    if (chatTimeoutRef.current) {
      window.clearTimeout(chatTimeoutRef.current);
      chatTimeoutRef.current = null;
    }
    setChatMessages([]);
  }

  useEffect(() => {
    return () => {
      if (chatTimeoutRef.current) {
        window.clearTimeout(chatTimeoutRef.current);
      }
      if (cityPickerToastTimeoutRef.current) {
        window.clearTimeout(cityPickerToastTimeoutRef.current);
      }
    };
  }, []);

  function showCityPickerToast(message: string) {
    if (cityPickerToastTimeoutRef.current) {
      window.clearTimeout(cityPickerToastTimeoutRef.current);
    }

    setCityPickerToast(message);
    cityPickerToastTimeoutRef.current = window.setTimeout(() => {
      setCityPickerToast(null);
      cityPickerToastTimeoutRef.current = null;
    }, 1800);
  }

  useEffect(() => {
    if (!overlayVisible) {
      return;
    }

    if (overlayMode === 'error') {
      pushChatMessage('assistant', createErrorPrompt(error));
      return;
    }

    if (overlayMode === 'recording') {
      if (recordingState === 'recognizing' && transcriptText.trim()) {
        pushChatMessage('user', transcriptText.trim());
      }
      return;
    }

    if (overlayMode === 'extracting') {
      pushChatMessage('assistant', RECOGNIZING_CHAT_TEXT);
      return;
    }

    if (overlayMode === 'review') {
      pushChatMessage(
        'assistant',
        createReviewPrompt({ ageText, cityText, phoneText, positionText }),
        { removeTexts: [RECOGNIZING_CHAT_TEXT] },
      );
    }
  }, [
    ageText,
    cityText,
    error,
    overlayMode,
    overlayVisible,
    phoneText,
    positionText,
    recordingState,
    transcriptText,
  ]);

  function startApplyFlow() {
    setOverlayVisible(true);
    setManualEdits({ age: null, city: null, phone: null, position: null });
    setEditingField(null);
    setCityPickerState(resolveCityPickerState(''));
    setSelectedAge('');
    setPhoneInputValue('');
    setPositionPickerState(resolvePositionPickerState(''));
    resetChatMessages();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setOverlayActive(true));
    });
    window.setTimeout(() => {
      void actions.startHoldToTalk();
    }, 180);
  }

  function closeApplyScreen() {
    if (isReviewPreview) {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete('preview');
      window.location.href = nextUrl.toString();
      return;
    }

    actions.closeOverlay();
    setOverlayActive(false);
    setEditingField(null);
    window.setTimeout(() => {
      setOverlayVisible(false);
      setChatMessages([]);
      setManualEdits({ age: null, city: null, phone: null, position: null });
      setCityPickerState(resolveCityPickerState(''));
      setSelectedAge('');
      setPhoneInputValue('');
      setPositionPickerState(resolvePositionPickerState(''));
    }, 260);
  }

  function retryRecording() {
    resetChatMessages();
    void actions.startHoldToTalk({ preserveExisting: true });
  }

  function finishRecording() {
    actions.finishHoldToTalk(false);
  }

  function pushReviewPrompt(nextValues?: Partial<ManualEdits>) {
    const nextAgeText = nextValues?.age ?? ageText;
    const nextCityText = nextValues?.city ?? cityText;
    const nextPhoneText = nextValues?.phone ?? phoneText;
    const nextPositionText = nextValues?.position ?? positionText;

    pushChatMessage(
      'assistant',
      createReviewPrompt({
        ageText: nextAgeText ?? '',
        cityText: nextCityText ?? '',
        phoneText: nextPhoneText ?? '',
        positionText: nextPositionText ?? '',
      }),
      { removeTexts: [RECOGNIZING_CHAT_TEXT] },
    );
  }

  function handleConfirm() {
    actions.submitCard();
    setOverlayActive(false);
    setEditingField(null);
    window.setTimeout(() => setOverlayVisible(false), 160);
  }

  function closeSuccessScreen() {
    actions.resetApplyState();
    setOverlayVisible(false);
    setOverlayActive(false);
    setEditingField(null);
    setChatMessages([]);
    setManualEdits({ age: null, city: null, phone: null, position: null });
    setCityPickerState(resolveCityPickerState(''));
    setSelectedAge('');
    setPhoneInputValue('');
    setPositionPickerState(resolvePositionPickerState(''));
  }

  function openAgePicker() {
    setSelectedAge(normalizeAgeValue(ageText));
    setEditingField('age');
  }

  function confirmAgePicker() {
    if (!selectedAge) {
      return;
    }

    setManualEdits((current) => ({
      ...current,
      age: selectedAge,
    }));
    setEditingField(null);
    pushReviewPrompt({ age: selectedAge });
  }

  function openCityPicker() {
    setCityPickerState(resolveCityPickerState(cityText));
    setCityPickerToast(null);
    setEditingField('city');
  }

  function selectProvince(provinceId: string) {
    setCityPickerState((current) => ({
      ...current,
      selectedProvinceId: provinceId,
    }));
  }

  function toggleCity(cityId: string) {
    const province = getCityPickerProvince(cityPickerState.selectedProvinceId);
    const city = province.cities.find((item) => item.id === cityId);
    if (!city) {
      return;
    }

    const nextItem: CityPickerSelectedItem = {
      key: `${province.id}-${city.id}`,
      provinceId: province.id,
      provinceLabel: province.label,
      cityId: city.id,
      cityLabel: city.label,
    };

    setCityPickerState((current) => {
      if (current.selectedItems.some((item) => item.key === nextItem.key)) {
        return {
          ...current,
          selectedItems: current.selectedItems.filter((item) => item.key !== nextItem.key),
        };
      }

      if (current.selectedItems.length >= CITY_SELECTION_LIMIT) {
        showCityPickerToast('只能选3个城市');
        return current;
      }

      return {
        ...current,
        selectedItems: [...current.selectedItems, nextItem],
      };
    });
  }

  function removeCity(cityKey: string) {
    setCityPickerToast(null);
    setCityPickerState((current) => ({
      ...current,
      selectedItems: current.selectedItems.filter((item) => item.key !== cityKey),
    }));
  }

  function resetCityPicker() {
    setCityPickerToast(null);
    setCityPickerState((current) => ({
      initialSelectedItems: current.initialSelectedItems,
      selectedProvinceId: current.initialSelectedItems[0]?.provinceId ?? DEFAULT_CITY_PICKER_PROVINCE_ID,
      selectedItems: current.initialSelectedItems,
    }));
  }

  function confirmCityPicker() {
    const nextValue = formatCityPickerValue(cityPickerState.selectedItems);
    setManualEdits((current) => ({
      ...current,
      city: nextValue,
    }));
    setEditingField(null);
    pushReviewPrompt({ city: nextValue });
  }

  function openPhoneEditor() {
    setPhoneInputValue(phoneText);
    setEditingField('phone');
  }

  function changePhoneInput(value: string) {
    setPhoneInputValue(normalizePhoneInput(value));
  }

  function confirmPhoneEditor() {
    if (!isCompletePhoneNumber(phoneInputValue)) {
      return;
    }

    setManualEdits((current) => ({
      ...current,
      phone: phoneInputValue,
    }));
    setEditingField(null);
    pushReviewPrompt({ phone: phoneInputValue });
  }

  function openPositionPicker() {
    setPositionPickerState(resolvePositionPickerState(positionText));
    setEditingField('position');
  }

  function resetPositionPicker() {
    setPositionPickerState((current) => {
      if (!current.initialOption) {
        return {
          ...current,
          selectedCategoryId: DEFAULT_POSITION_PICKER_CATEGORY_ID,
          selectedOption: null,
        };
      }

      const selection = findPositionPickerSelection(current.initialOption);
      return {
        initialOption: current.initialOption,
        selectedCategoryId: selection?.categoryId ?? DEFAULT_POSITION_PICKER_CATEGORY_ID,
        selectedOption: current.initialOption,
      };
    });
  }

  function selectPositionCategory(categoryId: string) {
    setPositionPickerState((current) => {
      const category = getPositionPickerCategory(categoryId);
      const selectedOption =
        current.selectedOption && category.options.includes(current.selectedOption)
          ? current.selectedOption
          : null;

      return {
        ...current,
        selectedCategoryId: categoryId,
        selectedOption,
      };
    });
  }

  function confirmPositionPicker() {
    if (!positionPickerState.selectedOption) {
      return;
    }

    const selectedPosition = positionPickerState.selectedOption;

    setManualEdits((current) => ({
      ...current,
      position: selectedPosition,
    }));
    setEditingField(null);
    pushReviewPrompt({ position: selectedPosition });
  }

  return (
    <PhoneShell>
      <JobScreen onApply={startApplyFlow} />
      {hasApplied ? <SuccessScreen onClose={closeSuccessScreen} /> : null}
      {resolvedOverlayVisible ? (
        <ApplyScreen
          activeExtractionIndex={activeExtractionIndex}
          ageText={resolvedAgeText}
          chatMessages={previewChatMessages}
          cityPickerState={cityPickerState}
          cityText={resolvedCityText}
          editingField={editingField}
          isActive={resolvedOverlayActive}
          isConfirmEnabled={resolvedIsConfirmEnabled}
          isDoneEnabled={resolvedIsDoneEnabled}
          mode={resolvedOverlayMode}
          onChangePhoneInput={changePhoneInput}
          onClose={closeApplyScreen}
          onCloseAgePicker={() => setEditingField(null)}
          onCloseCityPicker={() => setEditingField(null)}
          onClosePhoneEditor={() => setEditingField(null)}
          onClosePositionPicker={() => setEditingField(null)}
          onConfirm={handleConfirm}
          onConfirmAgePicker={confirmAgePicker}
          onConfirmCityPicker={confirmCityPicker}
          onCityPickerToastMessage={cityPickerToast}
          onConfirmPhoneEditor={confirmPhoneEditor}
          onConfirmPositionPicker={confirmPositionPicker}
          onDone={finishRecording}
          onOpenAgePicker={openAgePicker}
          onOpenCityPicker={openCityPicker}
          onOpenPhoneEditor={openPhoneEditor}
          onOpenPositionPicker={openPositionPicker}
          onResetCityPicker={resetCityPicker}
          onResetPositionPicker={resetPositionPicker}
          onRetry={retryRecording}
          onSelectAge={setSelectedAge}
          onRemoveCity={removeCity}
          onSelectPositionCategory={selectPositionCategory}
          onSelectPositionOption={(option) =>
            setPositionPickerState((current) => ({
              ...current,
              selectedOption: option,
            }))
          }
          onToggleCity={toggleCity}
          onSelectProvince={selectProvince}
          phoneInputValue={phoneInputValue}
          phoneText={resolvedPhoneText}
          pendingUserMessage={submittedTranscript}
          positionPickerState={positionPickerState}
          positionText={resolvedPositionText}
          selectedAge={selectedAge}
          transcriptText={transcriptText}
        />
      ) : null}
    </PhoneShell>
  );
}
