import { useEffect, useState, type ReactNode } from 'react';
import applyBottomGlowSvg from './assets/apply-bottom-glow.svg';
import applyOverlayCapturePng from './assets/apply-overlay-capture.png';
import applyWhiteLayerSvg from './assets/apply-white-layer.svg';
import closeIconPng from './assets/close-icon.png';
import doneCheckSvg from './assets/done-check.svg';
import jobDetailBgPng from './assets/job-detail-bg.png';
import listeningStarSvg from './assets/listening-star.svg';
import micIconPng from './assets/mic-icon.png';
import statusLeftSuccessSvg from './assets/status-left-success.svg';
import statusRightFailureSvg from './assets/status-right-failure.svg';
import statusRightSuccessSvg from './assets/status-right-success.svg';
import voiceTagPng from './assets/voice-tag.png';
import { useVoiceSession } from './hooks/useVoiceSession';

function PhoneShell({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const horizontalScale = (window.innerWidth - 32) / 414;
      const verticalScale = (window.innerHeight - 32) / 896;
      setScale(Math.min(1, horizontalScale, verticalScale));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center overflow-auto bg-black p-4">
      <div
        className="relative h-[896px] w-[414px] origin-center overflow-hidden rounded-[32px] bg-white shadow-[0_24px_90px_rgba(0,0,0,0.45)]"
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

function HomeIndicator() {
  return <div className="absolute left-[140.55px] top-[84px] h-[5px] w-[134px] rounded-full bg-black" />;
}

function JobScreen({ onApply }: { onApply: () => void }) {
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
            onClick={onApply}
            type="button"
          >
            <img alt="" aria-hidden="true" className="absolute left-[77px] top-[14px] h-[20px] w-[20px]" src={micIconPng} />
            <span className="absolute left-[101px] top-[13.5px] text-[15px] font-medium leading-[21px] text-white">
              说话报名
            </span>
          </button>
        </div>
        <HomeIndicator />
      </div>
    </div>
  );
}

function ApplyScreen({
  activeExtractionIndex,
  ageText,
  cityText,
  isConfirmEnabled,
  isActive,
  isDoneEnabled,
  mode,
  onClose,
  onConfirm,
  onDone,
  onRetry,
  phoneText,
  positionText,
}: {
  activeExtractionIndex: number;
  ageText: string;
  cityText: string;
  isConfirmEnabled: boolean;
  isActive: boolean;
  isDoneEnabled: boolean;
  mode: 'recording' | 'extracting' | 'review';
  onClose: () => void;
  onConfirm: () => void;
  onDone: () => void;
  onRetry: () => void;
  phoneText: string;
  positionText: string;
}) {
  const showExtracting = mode === 'extracting';
  const showReview = mode === 'review';
  const revealedCount = showExtracting ? Math.max(0, activeExtractionIndex + 1) : 4;

  return (
    <div className="absolute inset-0 z-30 overflow-hidden">
      <img
        alt=""
        aria-hidden="true"
        className={`overlay-bg absolute inset-0 h-full w-full ${isActive ? 'overlay-bg--active' : ''}`}
        src={applyOverlayCapturePng}
      />
      <img
        alt=""
        aria-hidden="true"
        className={`overlay-bg absolute left-[-73px] top-[44px] h-[852px] w-[560px] ${isActive ? 'overlay-bg--active' : ''}`}
        src={applyWhiteLayerSvg}
      />
      <div
        className={`overlay-bg absolute left-[-9px] top-[720px] h-[221px] w-[432px] overflow-visible ${isActive ? 'overlay-bg--active' : ''}`}
      >
        <img
          alt=""
          aria-hidden="true"
          className="absolute left-[-100px] top-[-100px] h-[421px] w-[632px] max-w-none"
          src={applyBottomGlowSvg}
        />
      </div>

      <button
        className={`overlay-content absolute left-[351px] top-[136px] h-[44px] w-[44px] ${isActive ? 'overlay-content--active' : ''}`}
        onClick={onClose}
        type="button"
      >
        <img alt="" className="absolute left-[10px] top-[10px] h-[24px] w-[24px]" src={closeIconPng} />
      </button>

      <div className={`overlay-content absolute left-[56px] top-[165px] ${isActive ? 'overlay-content--active' : ''}`}>
        <h1 className="m-0 text-[28px] font-medium leading-[39px] text-[#222222]">
          {showReview ? '请确认您的信息' : '您可以这样对我说'}
        </h1>
        <p className="m-0 mt-1 text-[16px] leading-[22px] text-[#9c9c9c]">
          {showReview ? '点击下方信息可手动修改' : '完善您的简历'}
        </p>
      </div>

      <div className={`overlay-content absolute left-[56px] top-[258px] w-[310px] text-[#666666] ${isActive ? 'overlay-content--active' : ''}`}>
        <div className="relative flex items-end gap-1 text-[20px] leading-7">
          <span>我今年</span>
          <span className="mb-[2px] block h-px w-[35px] bg-[#d9dfe8]" />
          <span>岁，</span>
          {showReview ? <span className="absolute left-[70px] top-0 text-[20px] font-medium leading-7 text-[#07d3a0]">{ageText}</span> : null}
        </div>
        <div className="relative mt-6 flex items-end gap-1 text-[20px] leading-7">
          <span>我的手机号是</span>
          <span className="mb-[2px] block h-px min-w-0 flex-1 bg-[#d9dfe8]" />
          <span>，</span>
          {showReview ? <span className="absolute left-[141px] top-0 text-[20px] font-medium leading-7 text-[#07d3a0]">{phoneText}</span> : null}
        </div>
        <div className="relative mt-6 flex items-end gap-1 text-[20px] leading-7">
          <span>我的意向城市是</span>
          <span className="mb-[2px] block h-px min-w-0 flex-1 bg-[#d9dfe8]" />
          <span>，</span>
          <span className="absolute left-[151px] top-1 text-[14px] leading-5 text-[#c6c6c6]">市/区/县（最多3个）</span>
          {showReview ? <span className="absolute left-[165px] top-0 text-[20px] font-medium leading-7 text-[#07d3a0]">{cityText}</span> : null}
        </div>
        <div className="relative mt-6 flex items-end gap-1 text-[20px] leading-7">
          <span>我的意向职位是</span>
          <span className="mb-[2px] block h-px min-w-0 flex-1 bg-[#d9dfe8]" />
          <span>。</span>
          {showReview ? <span className="absolute left-[151px] top-0 text-[20px] font-medium leading-7 text-[#07d3a0]">{positionText}</span> : null}
        </div>
      </div>

      {showExtracting ? (
        <div className={`overlay-content absolute left-1/2 top-[592px] flex h-[25px] -translate-x-1/2 items-center gap-1 ${isActive ? 'overlay-content--active' : ''}`}>
          <img alt="" className="h-[20px] w-[20px]" src={statusLeftSuccessSvg} />
          <p className="m-0 text-[18px] font-medium leading-[25px] text-[#222222]">识别中</p>
          <img alt="" className="h-[20px] w-[10px]" src={statusRightSuccessSvg} />
        </div>
      ) : null}

      {showReview ? (
        <>
          <div className={`overlay-content absolute left-[56px] top-[454px] text-[16px] leading-[22px] text-[#9c9c9c] ${isActive ? 'overlay-content--active' : ''}`}>
            点击上方信息可手动修改
          </div>
          <div className={`overlay-content absolute left-1/2 top-[592px] flex -translate-x-1/2 items-start gap-1 ${isActive ? 'overlay-content--active' : ''}`}>
            <img alt="" className="mt-[2px] h-[20px] w-[20px]" src={statusLeftSuccessSvg} />
            <div className="text-[18px] font-medium leading-[25px] text-[#222222]">
              <div>您的手机号和意向职位识别失败，</div>
              <div>请重说一次吧</div>
            </div>
            <img alt="" className="mt-[2px] h-[20px] w-[10px]" src={statusRightFailureSvg} />
          </div>
        </>
      ) : null}

      {!showExtracting && !showReview ? (
        <>
          <div className={`overlay-content absolute left-[32px] top-[497px] flex h-[47px] w-[350px] items-start gap-[8px] ${isActive ? 'overlay-content--active' : ''}`}>
            <img alt="" className="h-[24px] w-[24px]" src={listeningStarSvg} />
            <div className="rounded-bl-[12px] rounded-br-[12px] rounded-tl-[2px] rounded-tr-[12px] bg-[#ffffff] px-[12px] py-[10px]">
              <p className="m-0 whitespace-nowrap text-[17px] leading-[27px] text-[#222222]">请说，我在听...</p>
            </div>
          </div>
          <div className={`overlay-content absolute left-1/2 top-[675px] flex h-[15px] w-[118px] -translate-x-1/2 items-center justify-center gap-[2px] ${isActive ? 'overlay-content--active' : ''}`}>
            {[
              11, 11, 7, 15, 7,
              11, 11, 15, 7, 7,
              11, 11, 15, 7, 7,
              11, 11, 15, 7, 7,
              11, 11, 7, 15, 7,
              11, 11, 7, 15, 7,
            ].map((height, index) => (
              <span
                className="wave-bar block w-[2px] rounded-[1.5px] bg-[#255153]"
                key={index}
                style={{ height: `${height}px`, animationDelay: `${index * 0.04}s` }}
              />
            ))}
          </div>
        </>
      ) : null}

      <div className={`overlay-content absolute left-0 top-[802px] h-[64px] w-[414px] ${isActive ? 'overlay-content--active' : ''}`}>
        <div className="absolute left-[19px] top-[8px] flex gap-4">
          <button
            className="h-[48px] w-[122px] rounded-[45px] bg-[#dff9f5] text-[15px] font-medium leading-[21px] text-[#222222]"
            onClick={onRetry}
            type="button"
          >
            重说
          </button>
          <button
            className="relative h-[48px] w-[238px] overflow-hidden rounded-[45px]"
            disabled={showReview ? !isConfirmEnabled : !isDoneEnabled}
            onClick={showReview ? onConfirm : onDone}
            type="button"
          >
            <div className="absolute inset-0 bg-[linear-gradient(343.43deg,#defcff_14.824%,#dbfff6_91.068%)]" />
            <div className="absolute left-[-59px] top-[32px] h-[45px] w-[128px] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0)_72%)]" />
            <div className="absolute left-[186px] top-[-28px] h-[41px] w-[144px] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0)_72%)]" />
            {showExtracting || isDoneEnabled ? (
              <img
                alt=""
                aria-hidden="true"
                className="absolute left-[78px] top-[14px] z-10 h-[20px] w-[20px]"
                src={doneCheckSvg}
              />
            ) : null}
            <span
              className={`absolute top-[13.5px] z-10 text-[15px] font-medium leading-[21px] ${
                showReview
                  ? 'left-[89px] text-[#222222]'
                  : showExtracting || isDoneEnabled
                    ? 'left-[100px] text-[#222222]'
                    : 'left-[89px] text-[#919191]'
              }`}
            >
              {showReview ? '确认并报名' : '我说完了'}
            </span>
            <div className="absolute inset-0 rounded-[45px] shadow-[inset_0_-3px_14.5px_rgba(255,255,255,0.6)]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { actions, activeExtractionIndex, analysis, phase, transcriptText } = useVoiceSession();
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);
  const isDoneEnabled = transcriptText.trim().length > 0;
  const isConfirmEnabled = true;
  const ageText = analysis?.extractionItems.find((item) => item.id === 'age')?.value ?? '36';
  const phoneText = analysis?.extractionItems.find((item) => item.id === 'phone')?.value ?? '13657485968';
  const cityText = analysis?.extractionItems.find((item) => item.id === 'city')?.value ?? '北京、上海';
  const positionText = analysis?.extractionItems.find((item) => item.id === 'position')?.value ?? '普工/操作工...';
  const overlayMode: 'recording' | 'extracting' | 'review' =
    phase === 'extracting' ? 'extracting' : phase === 'review' ? 'review' : 'recording';

  function startApplyFlow() {
    setOverlayVisible(true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setOverlayActive(true));
    });
    window.setTimeout(() => {
      void actions.startHoldToTalk();
    }, 180);
  }

  function closeApplyScreen() {
    actions.closeOverlay();
    setOverlayActive(false);
    window.setTimeout(() => {
      setOverlayVisible(false);
    }, 260);
  }

  function retryRecording() {
    actions.closeOverlay();
    window.setTimeout(() => {
      void actions.startHoldToTalk();
    }, 120);
  }

  function finishRecording() {
    actions.finishHoldToTalk(false);
  }

  function handleConfirm() {
    actions.submitCard();
    setOverlayActive(false);
    window.setTimeout(() => setOverlayVisible(false), 160);
  }

  return (
    <PhoneShell>
      <JobScreen onApply={startApplyFlow} />
      {overlayVisible ? (
        <ApplyScreen
          activeExtractionIndex={activeExtractionIndex}
          ageText={ageText}
          cityText={cityText}
          isConfirmEnabled={isConfirmEnabled}
          isActive={overlayActive}
          isDoneEnabled={isDoneEnabled}
          mode={overlayMode}
          onConfirm={handleConfirm}
          onClose={closeApplyScreen}
          onDone={finishRecording}
          onRetry={retryRecording}
          phoneText={phoneText}
          positionText={positionText}
        />
      ) : null}
    </PhoneShell>
  );
}
