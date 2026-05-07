export type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  state: 'entering' | 'stable' | 'exiting';
};

export function settleChatMessages(messages: ChatMessage[], limit: number) {
  return messages
    .filter((message) => message.state !== 'exiting')
    .map((message) =>
      message.state === 'entering' ? { ...message, state: 'stable' as const } : message,
    )
    .slice(-limit);
}

export function appendChatMessage(
  messages: ChatMessage[],
  options: {
    role: ChatMessage['role'];
    text: string;
    limit: number;
    id: string;
    removeTexts?: string[];
  },
) {
  const removeTextSet = new Set(options.removeTexts ?? []);
  const scopedMessages = removeTextSet.size
    ? messages.filter((message) => !removeTextSet.has(message.text))
    : messages;

  if (options.role === 'user') {
    const userIndex = scopedMessages.findIndex(
      (message) => message.role === 'user' && message.state !== 'exiting',
    );

    if (userIndex >= 0) {
      const next = [...scopedMessages];
      next[userIndex] = { ...next[userIndex], text: options.text };
      return next;
    }
  }

  const activeMessages = scopedMessages.filter((message) => message.state !== 'exiting');
  const lastMessage = activeMessages[activeMessages.length - 1];

  if (lastMessage?.role === options.role && lastMessage.text === options.text) {
    return scopedMessages;
  }

  return [
    ...activeMessages.slice(-(options.limit - 1)),
    {
      id: options.id,
      role: options.role,
      text: options.text,
      state: 'entering' as const,
    },
  ];
}
