import { useEffect, useState, type ReactNode } from 'react';

export function PhoneShell({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const updateScale = () => {
      const mobileViewport = window.innerWidth <= 480;
      setIsMobileViewport(mobileViewport);

      if (mobileViewport) {
        setScale(1);
        return;
      }

      const horizontalScale = (window.innerWidth - 32) / 414;
      const verticalScale = (window.innerHeight - 32) / 896;
      setScale(Math.min(1, horizontalScale, verticalScale));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  if (isMobileViewport) {
    return (
      <div className="h-[100dvh] w-screen overflow-hidden bg-white">
        <div className="relative h-full w-full overflow-hidden bg-white">
          {children}
        </div>
      </div>
    );
  }

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

export function HomeIndicator({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-[5px] w-[134px] rounded-full bg-black ${className}`}
    />
  );
}
