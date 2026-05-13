import closeIconPng from '../../assets/close-icon.png';
import { ApplyActions } from './ApplyActions';
import { AgePickerSheet } from './AgePickerSheet';
import {
  AssistantStatusBubble,
  ChatMessageList,
  ListeningPrompt,
  RecordingSpeechBubble,
  UserBubble,
} from './ChatBubbles';
import { CityPickerSheet } from './CityPickerSheet';
import { PhoneEditorSheet } from './PhoneEditorSheet';
import { PositionPickerSheet } from './PositionPickerSheet';
import { ResumePromptForm } from './ResumePromptForm';
import type { ApplyScreenProps } from './types';

export function ApplyScreen({
  activeExtractionIndex: _activeExtractionIndex,
  ageText,
  cityText,
  pendingUserMessage,
  isConfirmEnabled,
  isActive,
  isDoneEnabled,
  mode,
  onClose,
  onConfirm,
  onConfirmCityPicker,
  onDone,
  onRetry,
  cityPickerState,
  selectedAge,
  phoneText,
  phoneInputValue,
  positionText,
  transcriptText,
  editingField,
  chatMessages,
  onCloseAgePicker,
  onCloseCityPicker,
  onChangePhoneInput,
  onClosePhoneEditor,
  onClosePositionPicker,
  onConfirmAgePicker,
  onConfirmPhoneEditor,
  onConfirmPositionPicker,
  onOpenAgePicker,
  onOpenCityPicker,
  onOpenPhoneEditor,
  onOpenPositionPicker,
  onResetCityPicker,
  onResetPositionPicker,
  onSelectAge,
  onSelectCity,
  onSelectDistrict,
  onSelectProvince,
  onSelectPositionCategory,
  onSelectPositionOption,
  positionPickerState,
}: ApplyScreenProps) {
  const isPrepareMode = mode === 'prepare';
  const isRecordingMode = mode === 'recording';
  const showExtracting = mode === 'extracting';
  const showReview = mode === 'review';
  const showError = mode === 'error';
  const usesInputShell = mode !== 'review';
  const usesBackButton = usesInputShell || showReview;
  const topContentLayoutClass =
    'px-[56px] pb-[max(18px,calc(env(safe-area-inset-bottom)+12px))] pt-[max(88px,calc(env(safe-area-inset-top)+44px))]';
  const hasTranscriptText = transcriptText.trim().length > 0;
  const hasFormContent =
    ageText.trim().length > 0 ||
    phoneText.trim().length > 0 ||
    cityText.trim().length > 0 ||
    positionText.trim().length > 0;
  const headingTitle = showReview
    ? '请确认信息'
    : hasFormContent
      ? '请确认信息'
      : '您可以这样对我说';
  const headingSubtitle = showReview
    ? '完善您的简历'
    : hasFormContent
      ? '点击上方信息可手动修改'
      : '完善您的简历';
  const isAgePickerOpen = editingField === 'age';
  const isCityPickerOpen = editingField === 'city';
  const isPhoneEditorOpen = editingField === 'phone';
  const isPositionPickerOpen = editingField === 'position';

  return (
    <div className="absolute inset-0 z-30 overflow-hidden">
      <div
        className={`${showReview ? 'apply-input-surface' : usesInputShell ? 'apply-input-surface' : 'apply-dialog-surface'} overlay-bg absolute inset-0 ${isActive ? 'overlay-bg--active' : ''}`}
      />

      <button
        aria-label={usesBackButton ? '返回' : '关闭'}
        className={`overlay-content absolute z-20 h-[44px] w-[44px] ${usesBackButton ? 'left-[11px] top-[max(44px,env(safe-area-inset-top))]' : 'right-[20px] top-[max(44px,calc(env(safe-area-inset-top)+20px))]'} ${isActive ? 'overlay-content--active' : ''}`}
        onClick={onClose}
        type="button"
      >
        {usesBackButton ? (
          <span
            aria-hidden="true"
            className="absolute left-[18px] top-[12px] block h-[18px] w-[18px] rotate-45 border-b-[2.5px] border-l-[2.5px] border-[#2a2d33]"
          />
        ) : (
          <img alt="" className="absolute left-[10px] top-[10px] h-[24px] w-[24px]" src={closeIconPng} />
        )}
      </button>

      <div
        className={`overlay-content relative z-10 flex h-full flex-col ${topContentLayoutClass} ${isActive ? 'overlay-content--active' : ''}`}
      >
        <div className="shrink-0">
          <p className={`m-0 ${usesInputShell ? 'text-[16px] leading-[22px] text-[#9c9c9c]' : 'text-[16px] leading-[22px] text-[#9c9c9c]'}`}>
            {headingSubtitle}
          </p>
          <h1 className={`m-0 ${usesInputShell ? 'mt-[4px] text-[28px] font-medium leading-[39px] text-[#222222]' : 'mt-[4px] text-[28px] font-medium leading-[39px] text-[#222222]'}`}>
            {headingTitle}
          </h1>
        </div>

        <ResumePromptForm
          ageText={ageText}
          cityText={cityText}
          onOpenAgePicker={onOpenAgePicker}
          onOpenCityPicker={onOpenCityPicker}
          onOpenPhoneEditor={onOpenPhoneEditor}
          onOpenPositionPicker={onOpenPositionPicker}
          phoneText={phoneText}
          positionText={positionText}
          recordingStyle={usesInputShell}
          showReview={showReview}
        />

        <div className={`flex min-h-0 flex-1 flex-col ${usesInputShell ? 'mt-[36px] justify-end' : 'mt-[34px]'}`}>
          {showExtracting ? null : usesInputShell ? (
            <div
              className={`flex min-h-0 shrink items-end justify-center ${
                isRecordingMode && hasTranscriptText
                  ? 'pb-[112px]'
                  : 'pb-[130px]'
              }`}
            >
              {isRecordingMode && hasTranscriptText ? (
                <RecordingSpeechBubble text={transcriptText} />
              ) : (
              <ListeningPrompt />
              )}
            </div>
          ) : (
            <div className="-ml-[56px] relative h-[270px] w-[414px] shrink-0 overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[8px] bg-[linear-gradient(180deg,#f1f4f6_0%,#f1f4f6_49.615%,rgba(241,244,246,0)_100%)]" />
              <div className="flex h-full flex-col justify-end pb-[74px]">
                <ChatMessageList chatMessages={chatMessages} horizontalPadding={19} />
              </div>
            </div>
          )}
        </div>
      </div>

      {showExtracting ? (
        <div
          className={`overlay-content absolute left-0 top-[462px] z-10 h-[270px] w-full ${isActive ? 'overlay-content--active' : ''}`}
        >
          <div className="absolute inset-x-0 top-0 h-[8px] bg-[linear-gradient(180deg,#f1f4f6_0%,#f1f4f6_49.615%,rgba(241,244,246,0)_100%)]" />
          <div className="absolute left-[19px] top-[-34px] flex w-[376px] flex-col gap-[20px]">
            {pendingUserMessage ? <UserBubble text={pendingUserMessage} /> : null}
            <AssistantStatusBubble text="正在识别您的信息" />
          </div>
        </div>
      ) : null}

      <div
        className={`overlay-content absolute bottom-[max(18px,calc(env(safe-area-inset-bottom)+12px))] left-[19px] right-[19px] z-20 ${isActive ? 'overlay-content--active' : ''}`}
      >
        <ApplyActions
          hasTranscriptText={hasTranscriptText}
          mode={mode}
          isConfirmEnabled={isConfirmEnabled}
          isDoneEnabled={isDoneEnabled}
          onConfirm={onConfirm}
          onDone={onDone}
          onRetry={onRetry}
          showError={showError}
          showExtracting={showExtracting}
          showReview={showReview}
        />
      </div>

      {isPositionPickerOpen ? (
        <PositionPickerSheet
          onClose={onClosePositionPicker}
          onConfirm={onConfirmPositionPicker}
          onReset={onResetPositionPicker}
          onSelectCategory={onSelectPositionCategory}
          onSelectOption={onSelectPositionOption}
          positionPickerState={positionPickerState}
        />
      ) : null}

      {isAgePickerOpen ? (
        <AgePickerSheet
          onClose={onCloseAgePicker}
          onConfirm={onConfirmAgePicker}
          onSelectAge={onSelectAge}
          selectedAge={selectedAge}
        />
      ) : null}

      {isCityPickerOpen ? (
        <CityPickerSheet
          cityPickerState={cityPickerState}
          onClose={onCloseCityPicker}
          onConfirm={onConfirmCityPicker}
          onReset={onResetCityPicker}
          onSelectCity={onSelectCity}
          onSelectDistrict={onSelectDistrict}
          onSelectProvince={onSelectProvince}
        />
      ) : null}

      {isPhoneEditorOpen ? (
        <PhoneEditorSheet
          onChangePhoneInput={onChangePhoneInput}
          onClose={onClosePhoneEditor}
          onConfirm={onConfirmPhoneEditor}
          phoneInputValue={phoneInputValue}
        />
      ) : null}
    </div>
  );
}
