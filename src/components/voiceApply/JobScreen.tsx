import jobDetailBgPng from '../../assets/job-detail-bg.png';
import micIconPng from '../../assets/mic-icon.png';
import voiceTagPng from '../../assets/voice-tag.png';
import { HomeIndicator } from './PhoneShell';

export function JobScreen({ onApply }: { onApply: () => void }) {
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
        <HomeIndicator className="absolute left-[140.55px] top-[84px]" />
      </div>
    </div>
  );
}
