import { useEffect, useRef, useState, type ReactNode } from 'react';
import closeIconPng from './assets/close-icon.png';
import doneCheckSvg from './assets/done-check.svg';
import jobDetailBgPng from './assets/job-detail-bg.png';
import listeningStarSvg from './assets/listening-star.svg';
import micIconPng from './assets/mic-icon.png';
import statusLeftSuccessSvg from './assets/status-left-success.svg';
import statusRightFailureSvg from './assets/status-right-failure.svg';
import statusRightSuccessSvg from './assets/status-right-success.svg';
import voiceTagPng from './assets/voice-tag.png';
import {
  DEFAULT_POSITION_PICKER_CATEGORY_ID,
  POSITION_PICKER_CATEGORIES,
  findPositionPickerSelection,
  getPositionPickerCategory,
} from './data/positionPicker';
import { useVoiceSession } from './hooks/useVoiceSession';
import {
  appendChatMessage,
  settleChatMessages as settleChatMessageList,
  type ChatMessage,
} from './utils/chatMessages';
import type { ResumeExtractionItem } from './types/speech';

type EditableField = 'position';

type ManualEdits = {
  position: string | null;
};

type PositionPickerState = {
  initialOption: string | null;
  selectedCategoryId: string;
  selectedOption: string | null;
};

const CHAT_LIMIT = 2;
const CHAT_TRANSITION_MS = 220;
const RECOGNIZING_CHAT_TEXT = '正在识别您的信息...';

function PhoneShell({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const horizontalScale = (window.innerWidth - 32) / 414;
      const verticalScale = (window.innerHeight - 32) / 896;
      setScale(Math.min(1, horizontalScale, verticalScale));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center overflow-auto bg-black p-4">
      <div
        className="relative h-[896px] w-[414px] origin-center overflow-hidden rounded-[32px] bg-white shadow-[0_24px_90px_rgba(0,0,0,0.45)]"
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

function HomeIndicator() {
  return <div className="absolute left-[140.55px] top-[84px] h-[5px] w-[134px] rounded-full bg-black" />;
}

function AssistantBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-[8px]">
      <img alt="" className="h-[24px] w-[24px]" src={listeningStarSvg} />
      <div className="max-w-[326px] rounded-bl-[12px] rounded-br-[12px] rounded-tl-[2px] rounded-tr-[12px] bg-[#ffffff] px-[12px] py-[10px]">
        <div className="text-[17px] leading-[27px] text-[#222222]">{children}</div>
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex w-full justify-end">
      <div
        className="inline-flex max-w-[350px] rounded-bl-[16px] rounded-br-[16px] rounded-tl-[16px] rounded-tr-[2px] px-[16px] py-[12px]"
        style={{ backgroundImage: 'linear-gradient(93.86189773488236deg, rgb(128, 244, 255) 38.2%, rgb(124, 248, 217) 76.432%)' }}
      >
        <p className="m-0 break-words text-[17px] leading-[24px] text-[#1a1f28]">{text}</p>
      </div>
    </div>
  );
}

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

function JobScreen({ onApply }: { onApply: () => void }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      <img alt="" className="absolute inset-0 h-full w-full" src={jobDetailBgPng} />

      <img
        alt="语音简历"
        className="pointer-events-none absolute left-[343px] top-[796px] z-20 h-[20px] w-[52px]"
        src={voiceTagPng}
      />

      <div className="absolute bottom-0 left-0 h-[98px] w-[414px]">
        <div className="absolute inset-0 bg-white" />
        <div className="absolute left-0 top-[64px] h-[34px] w-[414px] bg-white" />
        <div className="absolute left-0 top-0 h-px w-[414px] bg-[#eaeaea]" />
        <div className="absolute left-[19px] top-[8px] flex gap-4">
          <button
            className="h-[48px] w-[122px] rounded-[45px] bg-[#ffeff4] text-[15px] font-medium leading-[21px] text-[#fe3666]"
            type="button"
          >
            在线聊
          </button>
          <button
            className="relative h-[48px] w-[238px] rounded-[45px] bg-[#fe3666]"
            data-testid="apply-voice-button"
            onClick={onApply}
            type="button"
          >
            <img alt="" aria-hidden="true" className="absolute left-[77px] top-[14px] h-[20px] w-[20px]" src={micIconPng} />
            <span className="absolute left-[101px] top-[13.5px] text-[15px] font-medium leading-[21px] text-white">
              说话报名
            </span>
          </button>
        </div>
        <HomeIndicator />
      </div>
    </div>
  );
}

function ApplyScreen({
  activeExtractionIndex,
  ageText,
  cityText,
  isConfirmEnabled,
  isActive,
  isDoneEnabled,
  mode,
  onClose,
  onConfirm,
  onDone,
  onRetry,
  phoneText,
  positionText,
  editingField,
  chatMessages,
  onClosePositionPicker,
  onConfirmPositionPicker,
  onOpenPositionPicker,
  onResetPositionPicker,
  onSelectPositionCategory,
  onSelectPositionOption,
  positionPickerState,
}: {
  activeExtractionIndex: number;
  ageText: string;
  cityText: string;
  isConfirmEnabled: boolean;
  isActive: boolean;
  isDoneEnabled: boolean;
  mode: 'recording' | 'extracting' | 'review' | 'error';
  onClose: () => void;
  onConfirm: () => void;
  onDone: () => void;
  onRetry: () => void;
  phoneText: string;
  positionText: string;
  editingField: EditableField | null;
  chatMessages: ChatMessage[];
  onClosePositionPicker: () => void;
  onConfirmPositionPicker: () => void;
  onOpenPositionPicker: () => void;
  onResetPositionPicker: () => void;
  onSelectPositionCategory: (categoryId: string) => void;
  onSelectPositionOption: (option: string) => void;
  positionPickerState: PositionPickerState;
}) {
  const showExtracting = mode === 'extracting';
  const showReview = mode === 'review';
  const showError = mode === 'error';
  const hasFormContent =
    ageText.trim().length > 0 ||
    phoneText.trim().length > 0 ||
    cityText.trim().length > 0 ||
    positionText.trim().length > 0;
  const headingTitle = hasFormContent ? '请确认您的信息' : '您可以这样对我说';
  const headingSubtitle = hasFormContent
    ? '点击上方信息可手动修改'
    : '完善您的简历';
  const secondaryButtonLabel = '重说';
  const secondaryButtonClick = onRetry;
  const primaryButtonLabel = showReview
    ? '确认并报名'
    : showExtracting
      ? '识别中...'
      : '我说完了';
  const primaryButtonDisabled = showReview
    ? !isConfirmEnabled
    : showExtracting
      ? true
      : showError
        ? true
        : !isDoneEnabled;
  const primaryButtonClick = showReview ? onConfirm : onDone;
  const showPrimaryCheck = showReview
    ? isConfirmEnabled
    : !showExtracting && !showError && isDoneEnabled;
  const revealedCount = showExtracting ? Math.max(0, activeExtractionIndex + 1) : 4;
  const missingFieldLabels = [
    !phoneText ? '手机号' : '',
    !positionText ? '意向职位' : '',
    !cityText ? '意向城市' : '',
    !ageText ? '年龄' : '',
  ].filter(Boolean);
  const isPositionPickerOpen = editingField === 'position';
  const selectedCategory = getPositionPickerCategory(positionPickerState.selectedCategoryId);

  return (
    <div className="absolute inset-0 z-30 overflow-hidden">
      <div className={`apply-dialog-surface overlay-bg absolute inset-0 ${isActive ? 'overlay-bg--active' : ''}`} />

      <button
        className={`overlay-content absolute left-[351px] top-[136px] h-[44px] w-[44px] ${isActive ? 'overlay-content--active' : ''}`}
        onClick={onClose}
        type="button"
      >
        <img alt="" className="absolute left-[10px] top-[10px] h-[24px] w-[24px]" src={closeIconPng} />
      </button>

      <div className={`overlay-content absolute left-[56px] top-[165px] h-[65px] w-[224px] ${isActive ? 'overlay-content--active' : ''}`}>
        <p className="m-0 text-[16px] leading-[22px] text-[#9c9c9c]">
          {headingSubtitle}
        </p>
        <h1 className="m-0 mt-[4px] text-[28px] font-medium leading-[39px] text-[#222222]">
          {headingTitle}
        </h1>
      </div>

      <div className={`overlay-content absolute left-[56px] top-[258px] w-[310px] text-[#666666] ${isActive ? 'overlay-content--active' : ''}`}>
        <div className="relative flex items-end gap-1 text-[20px] leading-7">
          <span>我今年</span>
          <span className="mb-[2px] block h-px w-[35px] bg-[#d9dfe8]" />
          <span>岁，</span>
          {showReview && ageText ? <span className="absolute left-[70px] top-0 text-[20px] font-medium leading-7 text-[#07d3a0]">{ageText}</span> : null}
        </div>
        <div className="relative mt-6 flex items-end gap-1 text-[20px] leading-7">
          <span>我的手机号是</span>
          <span className="mb-[2px] block h-px min-w-0 flex-1 bg-[#d9dfe8]" />
          <span>，</span>
          {showReview && phoneText ? <span className="absolute left-[141px] top-0 text-[20px] font-medium leading-7 text-[#07d3a0]">{phoneText}</span> : null}
        </div>
        <div className="relative mt-6 flex items-end gap-1 text-[20px] leading-7">
          <span>我的意向城市是</span>
          <span className="mb-[2px] block h-px min-w-0 flex-1 bg-[#d9dfe8]" />
          <span>，</span>
          {!showReview ? (
            <span className="absolute left-[151px] top-1 text-[14px] leading-5 text-[#c6c6c6]">市/区/县（最多3个）</span>
          ) : null}
          {showReview && cityText ? <span className="absolute left-[165px] top-0 text-[20px] font-medium leading-7 text-[#07d3a0]">{cityText}</span> : null}
        </div>
        <div className="relative mt-6 flex items-end gap-1 text-[20px] leading-7">
          <span>我的意向职位是</span>
          <span className="mb-[2px] block h-px min-w-0 flex-1 bg-[#d9dfe8]" />
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

      <div className={`overlay-content absolute left-[32px] top-[497px] h-[233px] w-[350px] overflow-hidden ${isActive ? 'overlay-content--active' : ''}`}>
        <div className="flex flex-col gap-[20px]">
          {chatMessages.map((message) => (
            <div
              className={`chat-message ${message.state === 'entering' ? 'chat-message--entering' : ''} ${message.state === 'exiting' ? 'chat-message--exiting' : ''}`}
              key={message.id}
            >
              {message.role === 'assistant' ? (
                <AssistantBubble>
                  <div className="whitespace-pre-line">{message.text}</div>
                </AssistantBubble>
              ) : (
                <UserBubble text={message.text} />
              )}
            </div>
          ))}
        </div>
      </div>

      {!showExtracting && !showReview ? (
        <div className={`overlay-content absolute left-[130.3px] top-[747px] flex h-[19.5px] w-[153.4px] items-center gap-[2.6px] ${isActive ? 'overlay-content--active' : ''}`}>
          {[
            [14.3, 14.3, 9.1, 19.5, 9.1],
            [14.3, 14.3, 19.5, 9.1, 9.1],
            [14.3, 14.3, 19.5, 9.1, 9.1],
            [14.3, 14.3, 19.5, 9.1, 9.1],
            [14.3, 14.3, 9.1, 19.5, 9.1],
            [14.3, 14.3, 9.1, 19.5, 9.1],
          ].map((groupHeights, groupIndex) => (
            <div className="flex items-center gap-[2.6px]" key={groupIndex}>
              {groupHeights.map((height, index) => (
                <span
                  className="wave-bar block w-[2.6px] rounded-[1.95px] bg-[#255153]"
                  key={`${groupIndex}-${index}`}
                  style={{ height: `${height}px`, animationDelay: `${(groupIndex * 5 + index) * 0.04}s` }}
                />
              ))}
            </div>
          ))}
        </div>
      ) : null}

      <div className={`overlay-content absolute left-0 top-[802px] h-[64px] w-[414px] ${isActive ? 'overlay-content--active' : ''}`}>
        <div className="absolute left-[19px] top-[8px] flex gap-4">
          <button
            className="h-[48px] w-[122px] rounded-[45px] bg-[#dff9f5] text-[15px] font-medium leading-[21px] text-[#222222]"
            onClick={secondaryButtonClick}
            type="button"
          >
            {secondaryButtonLabel}
          </button>
          <button
            className="relative h-[48px] w-[238px] overflow-hidden rounded-[45px]"
            disabled={primaryButtonDisabled}
            onClick={primaryButtonClick}
            type="button"
          >
            <div className="absolute inset-0 bg-[linear-gradient(343.43deg,#defcff_14.824%,#dbfff6_91.068%)]" />
            <div className="absolute left-[-59px] top-[32px] h-[45px] w-[128px] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0)_72%)]" />
            <div className="absolute left-[186px] top-[-28px] h-[41px] w-[144px] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0)_72%)]" />
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="flex items-center gap-[6px]">
                {showPrimaryCheck ? (
                  <img
                    alt=""
                    aria-hidden="true"
                    className="h-[20px] w-[20px] shrink-0"
                    src={doneCheckSvg}
                  />
                ) : null}
                <span
                  className={`text-[15px] font-medium leading-[21px] ${
                    showReview
                      ? isConfirmEnabled
                        ? 'text-[#222222]'
                        : 'text-[#919191]'
                      : showExtracting
                        ? 'text-[#919191]'
                        : showError
                          ? 'text-[#919191]'
                          : isDoneEnabled
                        ? 'text-[#222222]'
                        : 'text-[#919191]'
                  }`}
                >
                  {primaryButtonLabel}
                </span>
              </div>
            </div>
            <div className="absolute inset-0 rounded-[45px] shadow-[inset_0_-3px_14.5px_rgba(255,255,255,0.6)]" />
          </button>
        </div>
      </div>

      {isPositionPickerOpen ? (
        <div className="absolute inset-0 z-40">
          <button
            aria-label="关闭意向职位选择"
            className="absolute inset-0"
            onClick={onClosePositionPicker}
            type="button"
          />
          <div className="absolute bottom-0 left-0 h-[586px] w-[414px] overflow-hidden rounded-t-[18px] bg-white">
            <div className="relative flex h-[52px] items-center justify-center border-b border-[#f0f0f0]">
              <h2 className="m-0 text-[16px] font-medium leading-[22px] text-[#222222]">选择意向职位</h2>
              <button
                className="absolute right-[16px] top-[14px] text-[24px] leading-[24px] text-[#222222]"
                onClick={onClosePositionPicker}
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
                      onClick={() => onSelectPositionCategory(category.id)}
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
                      onClick={() => onSelectPositionOption(option)}
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
                onClick={onResetPositionPicker}
                type="button"
              >
                重置
              </button>
              <button
                className="h-[44px] w-[156px] rounded-[22px] bg-[#ff3b66] text-[16px] font-medium leading-[22px] text-white"
                disabled={!positionPickerState.selectedOption}
                onClick={onConfirmPositionPicker}
                type="button"
              >
                确定
              </button>
            </div>
            <div className="absolute bottom-[6px] left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-black" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function App() {
  const { actions, activeExtractionIndex, analysis, error, phase, transcriptText, updateFeedback } = useVoiceSession();
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [manualEdits, setManualEdits] = useState<ManualEdits>({ position: null });
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [positionPickerState, setPositionPickerState] = useState<PositionPickerState>(() =>
    resolvePositionPickerState(''),
  );
  const chatTimeoutRef = useRef<number | null>(null);
  const isDoneEnabled = transcriptText.trim().length > 0;
  const extractionItems = analysis?.extractionItems;
  const ageText = normalizeAgeDisplay(getDetectedValue(extractionItems, 'age'));
  const phoneText = getDetectedValue(extractionItems, 'phone');
  const cityText = getDetectedValue(extractionItems, 'city');
  const detectedPositionText = getDetectedValue(extractionItems, 'position');
  const positionText = manualEdits.position ?? detectedPositionText;
  const missingFieldLabels = [
    !phoneText ? '手机号' : '',
    !positionText ? '意向职位' : '',
    !cityText ? '意向城市' : '',
    !ageText ? '年龄' : '',
  ].filter(Boolean);
  const isConfirmEnabled =
    ageText.trim().length > 0 &&
    phoneText.trim().length > 0 &&
    cityText.trim().length > 0 &&
    positionText.trim().length > 0;
  const overlayMode: 'recording' | 'extracting' | 'review' | 'error' = error
    ? 'error'
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
    setChatMessages([
      {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: '请说，我在听...',
        state: 'stable',
      },
    ]);
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
      pushChatMessage(
        'assistant',
        error?.message ?? '识别失败，请重说或点击上方信息填写吧',
      );
      return;
    }

    if (overlayMode === 'recording') {
      if (transcriptText.trim()) {
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

      const reviewText =
        missingFieldLabels.length > 0
          ? `您的${missingFieldLabels.join('、')}识别失败，请重说或点击上方信息填写吧`
          : '点击下方信息可手动修改';
      pushChatMessage('assistant', reviewText, { removeTexts: [RECOGNIZING_CHAT_TEXT] });
    }
  }, [error?.message, missingFieldLabels, overlayMode, overlayVisible, transcriptText, updateFeedback]);

  function startApplyFlow() {
    setOverlayVisible(true);
    setManualEdits({ position: null });
    setEditingField(null);
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
      setManualEdits({ position: null });
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

  function openPositionPicker() {
    const nextState = resolvePositionPickerState(positionText);
    setPositionPickerState(nextState);
    setEditingField('position');
  }

  function closePositionPicker() {
    setEditingField(null);
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

  function selectPositionOption(option: string) {
    setPositionPickerState((current) => ({
      ...current,
      selectedOption: option,
    }));
  }

  function confirmPositionPicker() {
    if (!positionPickerState.selectedOption) {
      return;
    }

    const selectedPosition = positionPickerState.selectedOption;
    const feedbackText =
      selectedPosition === positionText ? '信息已保存' : '意向职位修改成功';

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
      {overlayVisible ? (
        <ApplyScreen
          activeExtractionIndex={activeExtractionIndex}
          ageText={ageText}
          cityText={cityText}
          isConfirmEnabled={isConfirmEnabled}
          isActive={overlayActive}
          isDoneEnabled={isDoneEnabled}
          mode={overlayMode}
          onConfirm={handleConfirm}
          onClose={closeApplyScreen}
          onDone={finishRecording}
          editingField={editingField}
          onRetry={retryRecording}
          onClosePositionPicker={closePositionPicker}
          onConfirmPositionPicker={confirmPositionPicker}
          onOpenPositionPicker={openPositionPicker}
          onResetPositionPicker={resetPositionPicker}
          onSelectPositionCategory={selectPositionCategory}
          onSelectPositionOption={selectPositionOption}
          phoneText={phoneText}
          positionText={positionText}
          positionPickerState={positionPickerState}
          chatMessages={chatMessages}
        />
      ) : null}
    </PhoneShell>
  );
}
