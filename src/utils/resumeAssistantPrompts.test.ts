import { describe, expect, it } from 'vitest';
import {
  createErrorPrompt,
  createRecordingPrompt,
  createReviewPrompt,
} from './resumeAssistantPrompts';

describe('createReviewPrompt', () => {
  it('lists multiple missing fields and then gives a focused next step', () => {
    expect(
      createReviewPrompt({
        ageText: '',
        cityText: '',
        phoneText: '',
        positionText: '',
      }),
    ).toBe('刚才没整理出有效报名信息。你可以重新说一遍，或直接手动填写。');

    expect(
      createReviewPrompt({
        ageText: '',
        cityText: '',
        phoneText: '13800138000',
        positionText: '',
      }),
    ).toBe('还需要补充意向职位、工作地点、年龄。可以一句话说完，也可以点击上方逐项填写。');
  });

  it('uses short copy when only one field is missing', () => {
    expect(
      createReviewPrompt({
        ageText: '',
        cityText: '北京',
        phoneText: '13800138000',
        positionText: '包装工',
      }),
    ).toBe('年龄也可以补一下，比如“我32岁”。');
  });

  it('confirms complete information', () => {
    expect(
      createReviewPrompt({
        ageText: '32',
        cityText: '北京朝阳',
        phoneText: '13800138000',
        positionText: '包装工',
      }),
    ).toBe('信息整理好了，确认无误后就可以报名。');
  });
});

describe('createRecordingPrompt', () => {
  it('stays quiet while setup is pending, then guides empty listening, supplemental listening, and recording completion', () => {
    expect(
      createRecordingPrompt({
        hasExistingInfo: false,
        recordingState: 'requestingPermission',
        transcriptText: '',
      }),
    ).toBeNull();

    expect(
      createRecordingPrompt({
        hasExistingInfo: false,
        recordingState: 'recording',
        transcriptText: '',
      }),
    ).toBe('我在听。可以说年龄、手机号、想去哪里、想做什么工作。');

    expect(
      createRecordingPrompt({
        hasExistingInfo: true,
        recordingState: 'recording',
        transcriptText: '',
      }),
    ).toBe('请补充没听清的信息，前面已识别的内容会保留。');

    expect(
      createRecordingPrompt({
        hasExistingInfo: true,
        recordingState: 'recognizing',
        transcriptText: '我的手机号是13800138000',
      }),
    ).toBe('听到了，正在结束录音并整理信息。');
  });

  it('stays quiet when user transcript is already shown', () => {
    expect(
      createRecordingPrompt({
        hasExistingInfo: false,
        recordingState: 'recording',
        transcriptText: '我想找包装工',
      }),
    ).toBeNull();
  });
});

describe('createErrorPrompt', () => {
  it('turns technical errors into action guidance', () => {
    expect(
      createErrorPrompt({
        code: 'unsupported',
        message: '当前浏览器暂不支持语音识别，请切换到支持的手机浏览器。',
        recoverable: true,
      }),
    ).toBe('你可以手动填写报名信息，也能继续报名。');

    expect(
      createErrorPrompt({
        code: 'permission-denied',
        message: '暂时不可用。你可以再试一次。',
        recoverable: true,
      }),
    ).toBe('你可以手动填写报名信息，也能继续报名。');
  });
});
