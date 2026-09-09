import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  growth: string;
  icon: LucideIcon;
  accent?: boolean;
}

export default function StatCard({
  label,
  value,
  growth,
  icon: Icon,
  accent = false,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[#E9E2D6] bg-white p-5 shadow-[0_1px_2px_rgba(36,28,21,0.04)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="whitespace-pre-line text-[0.66rem] font-semibold uppercase leading-relaxed tracking-[0.14em] text-[#8A8172]">
            {label}
          </p>
          <p className="mt-3 font-serif text-[1.9rem] font-semibold leading-none text-ink sm:text-[2.1rem]">
            {value}
          </p>
          <p className="mt-2.5 text-xs font-semibold text-success">
            &uarr;{growth}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            accent
              ? "bg-burgundy text-cream shadow-[0_2px_10px_rgba(74,22,32,0.25)]"
              : "bg-gradient-to-br from-[#F3E9E0] via-[#F8F2EA] to-[#FCF8F2] text-burgundy"
          }`}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}