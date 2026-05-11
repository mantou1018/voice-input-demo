import type { RecordingSessionState, SpeechRecognizerError, SpeechRecognizerErrorCode } from '../types/speech';

export const RECOGNIZING_CHAT_TEXT = '正在整理报名信息...';

type FieldId = 'phone' | 'position' | 'city' | 'age';
type FieldTexts = Record<FieldId, string>;

const FIELD_LABELS: Record<FieldId, string> = {
  phone: '手机号',
  position: '意向职位',
  city: '工作地点',
  age: '年龄',
};

const FIELD_PROMPTS: Record<FieldId, string> = {
  phone: '还差手机号。请只说11位手机号，方便招聘方联系你。',
  position: '还差意向职位。想找什么工作？比如普工、包装工、保安、司机。',
  city: '还差工作地点。想在哪工作？说城市或区县都可以。',
  age: '还差年龄。可以说“我32岁”。',
};

const ERROR_PROMPTS: Record<SpeechRecognizerErrorCode, string> = {
  unsupported: '这个页面暂时听不了语音。你可以手动填写，也能继续报名。',
  'permission-denied': '暂时不能语音输入。你可以再试一次，或直接手动填写。',
  'no-speech': '刚才没听清。请靠近手机再说一次，或手动填写。',
  aborted: '刚才录音已结束。你可以再说一次，或手动填写报名信息。',
  network: '网络不太稳定，刚才没有整理成功。你可以再试一次，或手动填写。',
  'audio-capture': '暂时没有听到声音。你可以再试一次，或直接手动填写。',
  'recognition-failed': '刚才没有整理成功。你可以再试一次，或手动填写报名信息。',
};

function getPresentFieldLabels(fields: FieldTexts) {
  return (['phone', 'position', 'city', 'age'] as const)
    .filter((fieldId) => fields[fieldId].trim().length > 0)
    .map((fieldId) => FIELD_LABELS[fieldId]);
}

function getNextMissingField(fields: FieldTexts): FieldId | null {
  if (!fields.phone) {
    return 'phone';
  }

  if (!fields.position) {
    return 'position';
  }

  if (!fields.city) {
    return 'city';
  }

  if (!fields.age) {
    return 'age';
  }

  return null;
}

export function createRecordingPrompt({
  hasExistingInfo,
  recordingState,
  transcriptText,
}: {
  hasExistingInfo: boolean;
  recordingState: RecordingSessionState;
  transcriptText: string;
}) {
  if (recordingState === 'requestingPermission') {
    return '正在准备语音输入，稍后直接说报名信息就行。';
  }

  if (recordingState === 'recognizing') {
    return transcriptText.trim()
      ? '听到了，正在结束录音并整理信息。'
      : '这次还没听到内容，正在为你确认一下。';
  }

  if (recordingState === 'recording' && !transcriptText.trim()) {
    return hasExistingInfo
      ? '请补充没听清的信息，前面已识别的内容会保留。'
      : '我在听。可以说年龄、手机号、想去哪里、想做什么工作。';
  }

  return null;
}

export function createReviewPrompt({
  ageText,
  cityText,
  phoneText,
  positionText,
}: {
  ageText: string;
  cityText: string;
  phoneText: string;
  positionText: string;
}) {
  const fields: FieldTexts = {
    age: ageText,
    city: cityText,
    phone: phoneText,
    position: positionText,
  };
  const presentLabels = getPresentFieldLabels(fields);
  const nextMissingField = getNextMissingField(fields);

  if (!nextMissingField) {
    return '信息整理好了，确认无误后就可以报名。';
  }

  if (!presentLabels.length) {
    return `这次还没整理出报名信息。${FIELD_PROMPTS[nextMissingField]}`;
  }

  return `我先听到了${presentLabels.join('、')}。${FIELD_PROMPTS[nextMissingField]}`;
}

export function createErrorPrompt(error: SpeechRecognizerError | null) {
  if (!error) {
    return '刚才没听清。请靠近手机再说一次，或手动填写。';
  }

  return ERROR_PROMPTS[error.code] ?? error.message;
}

export function createManualEditFeedback(label: string, nextValue: string, previousValue: string) {
  if (nextValue === previousValue) {
    return `${label}已确认。`;
  }

  return `${label}已改为${nextValue}。`;
}
