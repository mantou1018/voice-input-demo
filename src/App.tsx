import { useEffect, useRef, useState } from 'react';
import { ApplyScreen } from './components/voiceApply/ApplyScreen';
import { JobScreen } from './components/voiceApply/JobScreen';
import { PhoneShell } from './components/voiceApply/PhoneShell';
import { SuccessScreen } from './components/voiceApply/SuccessScreen';
import type {
  ApplyMode,
  CityPickerState,
  EditableField,
  ManualEdits,
  PositionPickerState,
} from './components/voiceApply/types';
import {
  DEFAULT_CITY_PICKER_PROVINCE_ID,
  findCityPickerSelection,
  formatCityPickerValue,
  getCityPickerCity,
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
  createManualEditFeedback,
  createRecordingPrompt,
  createReviewPrompt,
  RECOGNIZING_CHAT_TEXT,
} from './utils/resumeAssistantPrompts';

const CHAT_LIMIT = 2;
const CHAT_TRANSITION_MS = 220;

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
  const selection = findCityPickerSelection(city) ?? {
    provinceId: DEFAULT_CITY_PICKER_PROVINCE_ID,
    cityId: getCityPickerProvince(DEFAULT_CITY_PICKER_PROVINCE_ID).cities[0]?.id ?? '',
    districtId: null,
  };

  return {
    initialSelection: selection,
    selectedProvinceId: selection.provinceId,
    selectedCityId: selection.cityId,
    selectedDistrictId: selection.districtId,
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
    updateFeedback,
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
  const chatTimeoutRef = useRef<number | null>(null);
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
    };
  }, []);

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
      if (updateFeedback) {
        pushChatMessage('assistant', updateFeedback, { removeTexts: [RECOGNIZING_CHAT_TEXT] });
        return;
      }

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
    updateFeedback,
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

  function handleConfirm() {
    actions.submitCard();
    setOverlayActive(false);
    setEditingField(null);
    window.setTimeout(() => setOverlayVisible(false), 160);
  }

  function closeSuccessScreen() {
    actions.closeOverlay();
  }

  function openAgePicker() {
    setSelectedAge(normalizeAgeValue(ageText));
    setEditingField('age');
  }

  function confirmAgePicker() {
    if (!selectedAge) {
      return;
    }

    const feedbackText = createManualEditFeedback('年龄', `${selectedAge}岁`, ageText ? `${ageText}岁` : '');

    setManualEdits((current) => ({
      ...current,
      age: selectedAge,
    }));
    setEditingField(null);
    pushChatMessage('assistant', feedbackText);
  }

  function openCityPicker() {
    setCityPickerState(resolveCityPickerState(cityText));
    setEditingField('city');
  }

  function selectProvince(provinceId: string) {
    const province = getCityPickerProvince(provinceId);
    const firstCity = province.cities[0];
    setCityPickerState((current) => ({
      ...current,
      selectedProvinceId: provinceId,
      selectedCityId: firstCity?.id ?? '',
      selectedDistrictId: firstCity?.districts[0]?.id ?? null,
    }));
  }

  function selectCity(cityId: string) {
    const city = getCityPickerCity(cityPickerState.selectedProvinceId, cityId);
    setCityPickerState((current) => ({
      ...current,
      selectedCityId: cityId,
      selectedDistrictId:
        current.selectedDistrictId && city.districts.some((district) => district.id === current.selectedDistrictId)
          ? current.selectedDistrictId
          : city.districts[0]?.id ?? null,
    }));
  }

  function resetCityPicker() {
    setCityPickerState((current) => ({
      initialSelection: current.initialSelection,
      selectedProvinceId: current.initialSelection.provinceId,
      selectedCityId: current.initialSelection.cityId,
      selectedDistrictId: current.initialSelection.districtId,
    }));
  }

  function confirmCityPicker() {
    const nextValue = formatCityPickerValue(
      cityPickerState.selectedProvinceId,
      cityPickerState.selectedCityId,
      cityPickerState.selectedDistrictId,
    );
    const feedbackText = createManualEditFeedback('工作地点', nextValue, cityText);

    setManualEdits((current) => ({
      ...current,
      city: nextValue,
    }));
    setEditingField(null);
    pushChatMessage('assistant', feedbackText);
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

    const feedbackText = createManualEditFeedback('手机号', phoneInputValue, phoneText);

    setManualEdits((current) => ({
      ...current,
      phone: phoneInputValue,
    }));
    setEditingField(null);
    pushChatMessage('assistant', feedbackText);
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
    const feedbackText = createManualEditFeedback('意向职位', selectedPosition, positionText);

    setManualEdits((current) => ({
      ...current,
      position: selectedPosition,
    }));
    setEditingField(null);
    pushChatMessage('assistant', feedbackText);
  }

  return (
    <PhoneShell>
      <JobScreen onApply={startApplyFlow} />
      {hasApplied ? <SuccessScreen onClose={closeSuccessScreen} /> : null}
      {overlayVisible ? (
        <ApplyScreen
          activeExtractionIndex={activeExtractionIndex}
          ageText={ageText}
          chatMessages={chatMessages}
          cityPickerState={cityPickerState}
          cityText={cityText}
          editingField={editingField}
          isActive={overlayActive}
          isConfirmEnabled={isConfirmEnabled}
          isDoneEnabled={isDoneEnabled}
          mode={overlayMode}
          onChangePhoneInput={changePhoneInput}
          onClose={closeApplyScreen}
          onCloseAgePicker={() => setEditingField(null)}
          onCloseCityPicker={() => setEditingField(null)}
          onClosePhoneEditor={() => setEditingField(null)}
          onClosePositionPicker={() => setEditingField(null)}
          onConfirm={handleConfirm}
          onConfirmAgePicker={confirmAgePicker}
          onConfirmCityPicker={confirmCityPicker}
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
          onSelectCity={selectCity}
          onSelectDistrict={(districtId) =>
            setCityPickerState((current) => ({
              ...current,
              selectedDistrictId: districtId,
            }))
          }
          onSelectPositionCategory={selectPositionCategory}
          onSelectPositionOption={(option) =>
            setPositionPickerState((current) => ({
              ...current,
              selectedOption: option,
            }))
          }
          onSelectProvince={selectProvince}
          phoneInputValue={phoneInputValue}
          phoneText={phoneText}
          pendingUserMessage={submittedTranscript}
          positionPickerState={positionPickerState}
          positionText={positionText}
          selectedAge={selectedAge}
          transcriptText={transcriptText}
        />
      ) : null}
    </PhoneShell>
  );
}
