import { useRef, useEffect, useState } from "react";

const TICKER_ITEMS = [
  "TALENT CONSULTING",
  "STRATEGIC PLANNING",
  "ENTERPRISE SOLUTIONS",
  "DATA ANALYTICS",
  "AI INTEGRATION",
  "AI PRODUCTS",
  "INTELLIGENT AUTOMATION",
];

export default function ScrollingTicker() {
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div
      data-testid="scrolling-ticker"
      className="relative w-full overflow-hidden border-y border-white/[0.04] bg-[#071020]/80 backdrop-blur-sm py-3.5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={trackRef}
        className="ticker-track flex items-center whitespace-nowrap"
        style={{ animationPlayState: isPaused ? "paused" : "running" }}
      >
        {/* Duplicate content 3x for seamless loop */}
        {[0, 1, 2].map((set) => (
          <div key={set} className="flex items-center shrink-0">
            {TICKER_ITEMS.map((item, i) => (
              <div key={`${set}-${i}`} className="flex items-center shrink-0">
                <span className="text-xs font-medium tracking-[0.2em] text-[#B9C7D6]/70 uppercase px-6">
                  {item}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A2A] shrink-0" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
