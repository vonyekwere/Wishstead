import { ChevronDown } from "lucide-react";

const gridLines = [44, 88, 132, 176];

export default function ChartPanel() {
  return (
    <div className="rounded-2xl border border-[#E9E2D6] bg-white p-5 shadow-[0_1px_2px_rgba(36,28,21,0.04)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg font-semibold text-ink">
            Outbound Clicks Over Time
          </h3>
          <p className="mt-1 text-sm text-[#8A8172]">
            Platform-wide engagement trends
          </p>
        </div>
        <button
          type="button"
          className="flex shrink-0 items-center gap-2 rounded-lg border border-[#E9E2D6] bg-[#FBF9F4] px-3 py-2 text-xs font-medium text-[#6F675A] transition-colors hover:border-[#D8CDBB] hover:text-burgundy"
        >
          This Month
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>

      <div className="relative mt-6 h-64 overflow-hidden rounded-xl border border-[#EFE9DD] bg-[#FBF9F4] sm:h-72">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 600 220"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C2430" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#7C2430" stopOpacity="0" />
            </linearGradient>
          </defs>

          {gridLines.map((y) => (
            <line
              key={y}
              x1="0"
              x2="600"
              y1={y}
              y2={y}
              stroke="#EFE9DD"
              strokeWidth="1"
            />
          ))}

          <path
            d="M0,180 C60,160 90,150 140,138 C180,128 210,150 250,120 C300,85 320,95 360,80 C420,58 470,70 520,50 C560,38 585,30 600,34 L600,220 L0,220 Z"
            fill="url(#chartFill)"
          />
          <path
            d="M0,180 C60,160 90,150 140,138 C180,128 210,150 250,120 C300,85 320,95 360,80 C420,58 470,70 520,50 C560,38 585,30 600,34"
            fill="none"
            stroke="#7C2430"
            strokeOpacity="0.45"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}