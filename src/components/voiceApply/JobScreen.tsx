import jobDetailBgPng from '../../assets/job-detail-bg.png';
import micIconPng from '../../assets/mic-icon.png';
import { HomeIndicator } from './PhoneShell';

export function JobScreen({ onApply }: { onApply: () => void }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f5f5f5]">
      <img
        alt=""
        className="absolute left-0 top-0 block w-full select-none"
        draggable="false"
        src={jobDetailBgPng}
      />

      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-[#eaeaea] bg-white">
        <div className="relative px-[19px] pb-[max(8px,calc(env(safe-area-inset-bottom)+4px))] pt-[8px]">
          <div
            className="absolute right-[19px] top-[-2px] flex h-[20px] items-center justify-center rounded-[4px] rounded-bl-[2px] px-[6px] text-[11px] font-medium leading-[15px] text-black"
            style={{
              backgroundImage:
                'linear-gradient(336deg, rgb(95 241 255) 28.42%, rgb(49 248 198) 52.516%)',
            }}
          >
            语音简历
          </div>

          <div className="flex items-center gap-4">
            <button
              className="h-[48px] min-w-0 flex-1 rounded-[45px] bg-[#ffeff4] text-[15px] font-medium leading-[21px] text-[#fe3666] transition-opacity active:opacity-85"
              type="button"
            >
              在线聊
            </button>
            <button
              className="flex h-[48px] min-w-0 flex-[1.9508] items-center justify-center gap-[4px] rounded-[45px] bg-[#fe3666] px-[24px] text-white transition-transform active:scale-[0.985]"
              data-testid="apply-voice-button"
              onClick={onApply}
              type="button"
            >
              <img alt="" aria-hidden="true" className="h-[20px] w-[20px] shrink-0" src={micIconPng} />
              <span className="text-[15px] font-medium leading-[21px]">说话报名</span>
            </button>
          </div>

          <HomeIndicator className="mx-auto mt-[12px] max-[480px]:hidden" />
        </div>
      </div>
    </div>
  );
}
