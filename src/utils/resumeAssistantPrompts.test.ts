import { describe, expect, it } from 'vitest';
import {
  createErrorPrompt,
  createManualEditFeedback,
  createRecordingPrompt,
  createReviewPrompt,
} from './resumeAssistantPrompts';

describe('createReviewPrompt', () => {
  it('asks for the highest-priority missing field first', () => {
    expect(
      createReviewPrompt({
        ageText: '',
        cityText: '',
        phoneText: '',
        positionText: '',
      }),
    ).toBe('这次还没整理出报名信息。还差手机号。请只说11位手机号，方便招聘方联系你。');

    expect(
      createReviewPrompt({
        ageText: '',
        cityText: '',
        phoneText: '13800138000',
        positionText: '',
      }),
    ).toBe('我先听到了手机号。还差意向职位。想找什么工作？比如普工、包装工、保安、司机。');
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
  it('guides permission, empty listening, supplemental listening, and recording completion', () => {
    expect(
      createRecordingPrompt({
        hasExistingInfo: false,
        recordingState: 'requestingPermission',
        transcriptText: '',
      }),
    ).toBe('正在准备语音输入，稍后直接说报名信息就行。');

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
    ).toBe('这个页面暂时听不了语音。你可以手动填写，也能继续报名。');

    expect(
      createErrorPrompt({
        code: 'permission-denied',
        message: '暂时不能语音输入。你可以再试一次。',
        recoverable: true,
      }),
    ).toBe('暂时不能语音输入。你可以再试一次，或直接手动填写。');
  });
});

describe('createManualEditFeedback', () => {
  it('confirms exact edited values', () => {
    expect(createManualEditFeedback('手机号', '13800138000', '')).toBe('手机号已改为13800138000。');
    expect(createManualEditFeedback('手机号', '13800138000', '13800138000')).toBe('手机号已确认。');
  });
});
