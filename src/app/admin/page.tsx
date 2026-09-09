import { Users, Store, Package, MousePointerClick } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import ChartPanel from "@/components/admin/ChartPanel";
import CategoryRanking from "@/components/admin/CategoryRanking";

const stats = [
  { label: "TOTAL USERS", value: "2,541", growth: "12%", icon: Users },
  { label: "TOTAL\nBUSINESSES", value: "128", growth: "4%", icon: Store },
  { label: "TOTAL PRODUCTS", value: "1,842", growth: "28%", icon: Package },
  {
    label: "OUTBOUND CLICKS\n(MO)",
    value: "25,642",
    growth: "18%",
    icon: MousePointerClick,
    accent: true,
  },
];

export default function AdminDashboardPage() {
  return (
    <>
      <div>
        <h2 className="font-serif text-[1.9rem] font-semibold leading-tight text-ink sm:text-[2rem]">
          Welcome Back
        </h2>
        <p className="mt-1.5 text-sm text-[#6F675A] sm:text-[0.95rem]">
          Here is a summary of platform activity for Wishstead.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-7 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3 sm:gap-5">
        <div className="lg:col-span-2">
          <ChartPanel />
        </div>
        <CategoryRanking />
      </div>
    </>
  );
}