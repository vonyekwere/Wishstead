import { ArrowRight } from "lucide-react";

const categories = [
  { rank: 1, name: "Home & Living", clicks: "9,342", labeled: true },
  { rank: 2, name: "Personalized Gifts", clicks: "6,771", labeled: true },
  { rank: 3, name: "Jewelry", clicks: "3,465", labeled: true },
  { rank: 4, name: "Experiences", clicks: "2,897", labeled: false },
  { rank: 5, name: "Beauty & Wellness", clicks: "2,104", labeled: false },
];

const maxClicks = 9342;

export default function CategoryRanking() {
  return (
    <div className="flex flex-col rounded-2xl border border-[#E9E2D6] bg-white p-5 shadow-[0_1px_2px_rgba(36,28,21,0.04)] sm:p-6">
      <h3 className="font-serif text-lg font-semibold text-ink">
        Top Categories
      </h3>
      <p className="mt-1 text-sm text-[#8A8172]">Ranked by outbound clicks</p>

      <div className="mt-6 space-y-5">
        {categories.map((category) => {
          const isFirst = category.rank === 1;
          const width = Math.round((parseInt(category.clicks) / maxClicks) * 100);
          return (
            <div key={category.name} className="flex items-center gap-3.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.82rem] font-semibold ${
                  isFirst
                    ? "bg-burgundy text-cream"
                    : "bg-[#F1EAE0] text-[#6F675A]"
                }`}
              >
                {category.rank}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-sm font-medium text-[#48453D]">
                    {category.name}
                  </p>
                  <div className="shrink-0 text-right">
                    <p className="font-serif text-base font-semibold leading-none text-ink">
                      {category.clicks}
                    </p>
                    {category.labeled && (
                      <p className="mt-1 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[#8A8172]">
                        Clicks
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F0EADF]">
                  <div
                    className={`h-full rounded-full ${
                      isFirst ? "bg-burgundy" : "bg-[#C9A66B]"
                    }`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto flex justify-end border-t border-[#EFE9DD] pt-4">
        <button
          type="button"
          className="group flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-burgundy transition-colors hover:text-burgundy-dark"
        >
          View Full Report
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
            strokeWidth={1.75}
          />
        </button>
      </div>
    </div>
  );
}