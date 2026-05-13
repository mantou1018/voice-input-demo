import type { ReactNode } from 'react';
import listeningStarSvg from '../../assets/listening-star.svg';
import type { ChatMessage } from '../../utils/chatMessages';
import { RECOGNIZING_CHAT_TEXT } from '../../utils/resumeAssistantPrompts';

export function ListeningPrompt({ text = '请说，我在听' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-[2px]">
      <img alt="" className="h-[20px] w-[20px] shrink-0" src={listeningStarSvg} />
      <p className="m-0 text-[18px] font-medium leading-none text-[#222222]">{text}</p>
      <span aria-hidden="true" className="block h-[20px] w-[12px] shrink-0" />
    </div>
  );
}

export function RecordingSpeechBubble({ text }: { text: string }) {
  return (
    <div className="relative inline-flex max-w-[322px] min-w-[198px] rounded-[24px] bg-[linear-gradient(93.86189773488236deg,rgb(128,244,255)_38.2%,rgb(124,248,217)_76.432%)] px-[20px] py-[18px] text-[#1a1f28] shadow-[0_14px_34px_rgba(124,248,217,0.14)]">
      <p className="m-0 whitespace-pre-wrap break-words pr-[40px] text-[17px] leading-[27px]">{text}</p>
      <div className="absolute bottom-[10px] right-[16px] flex h-[22px] items-end gap-[3px]">
        {[10, 18, 13, 22, 15].map((height, index) => (
          <span
            className="recording-bubble-wave-bar block w-[4px] rounded-[999px] bg-[#255153]"
            key={index}
            style={{
              animationDelay: `${index * 0.08}s`,
              height: `${height}px`,
            }}
          />
        ))}
      </div>
      <span
        aria-hidden="true"
        className="absolute bottom-[-10px] left-1/2 h-[20px] w-[28px] -translate-x-1/2 overflow-hidden"
      >
        <span className="absolute left-1/2 top-[-14px] h-[28px] w-[28px] -translate-x-1/2 rotate-45 rounded-[8px] bg-[linear-gradient(93.86189773488236deg,rgb(128,244,255)_38.2%,rgb(124,248,217)_76.432%)]" />
      </span>
    </div>
  );
}

function AssistantBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full items-start gap-[4px]">
      <img alt="" className="h-[20px] w-[20px] shrink-0" src={listeningStarSvg} />
      <div className="max-w-[326px] rounded-bl-[12px] rounded-br-[12px] rounded-tl-[2px] rounded-tr-[12px] bg-[#ffffff] px-[12px] py-[10px] shadow-[0_0_10px_rgba(49,68,82,0.05)]">
        <div className="text-[17px] leading-[1.6] text-[#222222]">{children}</div>
      </div>
    </div>
  );
}

export function AssistantStatusBubble({ text }: { text: string }) {
  return (
    <div className="flex w-full items-start">
      <div className="rounded-bl-[12px] rounded-br-[12px] rounded-tl-[2px] rounded-tr-[12px] bg-white px-[16px] py-[10px] shadow-[0_0_10px_rgba(49,68,82,0.05)]">
        <div className="flex items-center gap-[8px]">
          <img alt="" className="h-[24px] w-[24px] shrink-0" src={listeningStarSvg} />
          <p className="m-0 whitespace-nowrap text-[17px] leading-[27px] text-[#222222]">{text}</p>
        </div>
      </div>
    </div>
  );
}

export function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex w-full justify-end">
      <div
        className="inline-flex max-w-[376px] rounded-bl-[16px] rounded-br-[16px] rounded-tl-[16px] rounded-tr-[2px] px-[16px] py-[12px]"
        style={{ backgroundImage: 'linear-gradient(93.86189773488236deg, rgb(128, 244, 255) 38.2%, rgb(124, 248, 217) 76.432%)' }}
      >
        <p className="m-0 break-words text-[17px] leading-[24px] text-[#1a1f28]">{text}</p>
      </div>
    </div>
  );
}

export function ChatMessageList({
  chatMessages,
  offsetTop = 0,
}: {
  chatMessages: ChatMessage[];
  offsetTop?: number;
}) {
  return (
    <div
      className="flex flex-col gap-[20px] px-[19px]"
      style={offsetTop ? { marginTop: `${offsetTop}px` } : undefined}
    >
      {chatMessages.map((message) => (
        <div
          className={`chat-message ${message.state === 'entering' ? 'chat-message--entering' : ''} ${message.state === 'exiting' ? 'chat-message--exiting' : ''}`}
          key={message.id}
        >
          {message.role === 'assistant' ? (
            message.text === RECOGNIZING_CHAT_TEXT ? (
              <AssistantStatusBubble text="正在识别您的信息" />
            ) : (
            <AssistantBubble>
              <div className="whitespace-pre-line">{message.text}</div>
            </AssistantBubble>
            )
          ) : (
            <UserBubble text={message.text} />
          )}
        </div>
      ))}
    </div>
  );
}
