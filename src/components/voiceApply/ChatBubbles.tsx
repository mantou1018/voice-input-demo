import type { ReactNode } from 'react';
import listeningStarSvg from '../../assets/listening-star.svg';
import type { ChatMessage } from '../../utils/chatMessages';

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

export function ChatMessageList({ chatMessages }: { chatMessages: ChatMessage[] }) {
  return (
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
  );
}
