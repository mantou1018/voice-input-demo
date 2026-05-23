import type { ReactNode } from 'react';
import listeningStarSvg from '../../assets/listening-star.svg';
import type { ChatMessage } from '../../utils/chatMessages';
import { RECOGNIZING_CHAT_TEXT } from '../../utils/resumeAssistantPrompts';

const REVIEW_SUCCESS_TEXT = '识别成功，请确认您的报名信息。如需修改，您可点击上方横线手动填写或语音补充';

function ListeningMicIcon() {
  return (
    <span aria-hidden="true" className="listening-mic relative block h-[22px] w-[22px] shrink-0">
      <span className="listening-mic-ripple listening-mic-ripple--back absolute left-1/2 top-1/2 h-[34px] w-[34px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <span className="listening-mic-ripple listening-mic-ripple--front absolute left-1/2 top-1/2 h-[28px] w-[28px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <span className="listening-mic-core absolute inset-0 rounded-full bg-[linear-gradient(180deg,#31ebd8_0%,#26d8d2_100%)]" />
      <svg
        className="absolute left-[3px] top-[3px] h-[16px] w-[16px]"
        fill="none"
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 10.6667C9.47276 10.6667 10.6667 9.47276 10.6667 8V4.66667C10.6667 3.19391 9.47276 2 8 2C6.52724 2 5.33333 3.19391 5.33333 4.66667V8C5.33333 9.47276 6.52724 10.6667 8 10.6667Z"
          fill="white"
        />
        <path
          d="M3.33331 7.33333C3.33331 9.91066 5.42265 12 7.99998 12C10.5773 12 12.6666 9.91066 12.6666 7.33333H11.3333C11.3333 9.17428 9.84093 10.6667 7.99998 10.6667C6.15903 10.6667 4.66665 9.17428 4.66665 7.33333H3.33331Z"
          fill="white"
        />
        <path d="M7.33331 12H8.66665V14H7.33331V12Z" fill="white" />
        <path d="M5.33331 14H10.6666V15.3333H5.33331V14Z" fill="white" />
      </svg>
    </span>
  );
}

export function ListeningPrompt({ text = '请说，我在听' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-[4px]">
      <ListeningMicIcon />
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
    <div className="flex w-full items-start">
      <div className="w-full max-w-[376px] rounded-bl-[12px] rounded-br-[12px] rounded-tl-[2px] rounded-tr-[12px] bg-[#ffffff] px-[16px] py-[10px]">
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
          <img alt="" className="spinning-icon h-[24px] w-[24px] shrink-0" src={listeningStarSvg} />
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
  horizontalPadding = 19,
}: {
  chatMessages: ChatMessage[];
  offsetTop?: number;
  horizontalPadding?: number;
}) {
  return (
    <div
      className="flex flex-col gap-[20px]"
      style={{
        marginTop: offsetTop || undefined,
        paddingLeft: horizontalPadding,
        paddingRight: horizontalPadding,
      }}
    >
      {chatMessages.map((message) => (
        <div
          className={`chat-message ${message.state === 'entering' ? 'chat-message--entering' : ''} ${message.state === 'exiting' ? 'chat-message--exiting' : ''}`}
          key={message.id}
        >
          {message.role === 'assistant' ? (
            message.text === RECOGNIZING_CHAT_TEXT ? (
              <AssistantStatusBubble text="正在识别您的信息" />
            ) : message.text === REVIEW_SUCCESS_TEXT ? (
              <AssistantBubble>
                <div className="whitespace-pre-line">
                  识别成功，请确认您的报名信息。如需修改，您可
                  <span className="font-medium">点击上方横线手动填写</span>
                  或
                  <span className="font-medium">语音补充</span>
                </div>
              </AssistantBubble>
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
