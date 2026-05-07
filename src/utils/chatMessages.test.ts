import { describe, expect, it } from 'vitest';
import { appendChatMessage, settleChatMessages, type ChatMessage } from './chatMessages';

function message(id: string, text: string): ChatMessage {
  return {
    id,
    role: 'assistant',
    text,
    state: 'stable',
  };
}

describe('appendChatMessage', () => {
  it('always appends the new message below older messages', () => {
    const messages = [message('old-1', '旧消息')];
    const next = appendChatMessage(messages, {
      role: 'assistant',
      text: '新消息',
      limit: 2,
      id: 'new-1',
    });

    expect(next.map((item) => item.text)).toEqual(['旧消息', '新消息']);
  });

  it('removes transitional messages before appending the final feedback', () => {
    const messages = [
      message('user-1', '我想改职位'),
      message('loading-1', '正在识别您的信息...'),
    ];
    const next = appendChatMessage(messages, {
      role: 'assistant',
      text: '点击下方信息可手动修改',
      limit: 2,
      id: 'review-1',
      removeTexts: ['正在识别您的信息...'],
    });

    expect(next.map((item) => item.text)).toEqual([
      '我想改职位',
      '点击下方信息可手动修改',
    ]);
  });
});

describe('settleChatMessages', () => {
  it('keeps chronological order while trimming to the limit', () => {
    const next = settleChatMessages(
      [
        message('old-1', '第一条'),
        message('old-2', '第二条'),
        message('old-3', '第三条'),
      ],
      2,
    );

    expect(next.map((item) => item.text)).toEqual(['第二条', '第三条']);
  });
});
