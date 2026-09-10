"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation'
import {
  Gift,
  LayoutGrid,
  Store,
  Package,
  ClipboardCheck,
  LineChart,
  Users,
  Settings,
  LifeBuoy,
  LogOut,
  X,
} from "lucide-react";

const navItems = [
  { label: "Overview", icon: LayoutGrid, href: "/dashboard", roles: ["customer", "vendor", "admin", "super_admin"] },
  { label: "Businesses", icon: Store, href: "#", roles: ["admin", "super_admin"] },
  { label: "Products", icon: Package, href: "#", roles: ["vendor", "admin", "super_admin"] },
  { label: "Approvals", icon: ClipboardCheck, href: "#", roles: ["admin", "super_admin"] },
  { label: "Analytics", icon: LineChart, href: "#", roles: ["vendor", "admin", "super_admin"] },
  { label: "Users", icon: Users, href: "#", roles: ["admin", "super_admin"] },
  { label: "Settings", icon: Settings, href: "/dashboard/settings", roles: ["customer", "vendor", "admin", "super_admin"] },
];

const baseItem =
  "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[0.84rem] font-medium transition-colors";

const activeItem = `${baseItem} bg-[#F5EBE0] text-burgundy`;
const inactiveItem = `${baseItem} text-[#6F675A] hover:bg-[#F7F1E8] hover:text-burgundy`;

export default function Sidebar({
  open,
  onClose,
  role,
  onLogout,
  logoutPending,
}: {
  open: boolean;
  onClose: () => void;
  role: "customer" | "vendor" | "admin" | "super_admin";
  onLogout: () => void;
  logoutPending: boolean;
}) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => item.roles.includes(role));
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-[#E9E2D6] bg-[#FBF9F4] transition-transform duration-200 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 pb-5 pt-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-burgundy text-cream">
            <Gift className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="font-serif text-lg font-semibold leading-tight text-ink">
              Wishstead
            </p>
            <p className="mt-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[#8A8172]">
              {role.replace("_", " ")} portal
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-[#6F675A] transition-colors hover:bg-[#F5EBE0] hover:text-burgundy lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {visibleItems.map(({ label, icon: Icon, href }) => {
            const isActive = href === pathname;
            return (
              <Link
                key={label}
                href={href ?? "#"}
                onClick={onClose}
                className={isActive ? activeItem : inactiveItem}
              >
                <Icon
                  className="h-[18px] w-[18px] shrink-0"
                  strokeWidth={1.75}
                />
                <span>{label}</span>
                {isActive && (
                  <span className="absolute right-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-burgundy" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom utility */}
        <div className="border-t border-[#E9E2D6] px-3 pb-6 pt-4">
          <div className="mb-3 flex items-center gap-2 rounded-full border border-[#DED5C6] py-2 pl-4 pr-4">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-[0.78rem] font-medium text-[#48453D]">
              System Status
            </span>
          </div>
          <div className="space-y-0.5">
            <Link href="#" onClick={onClose} className={inactiveItem}>
              <LifeBuoy className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
              <span>Support</span>
            </Link>
            <button type="button" onClick={onLogout} disabled={logoutPending} className={`${inactiveItem} w-full disabled:opacity-60`}>
              <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
              <span>{logoutPending ? "Signing out…" : "Logout"}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
