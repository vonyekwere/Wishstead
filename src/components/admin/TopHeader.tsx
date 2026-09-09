"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Moon,
  ChevronDown,
  Menu,
  User,
  Settings,
  History,
  LogOut,
} from "lucide-react";

const accountMenu = [
  { label: "Profile", icon: User },
  { label: "Account Settings", icon: Settings },
  { label: "Activity Log", icon: History },
];

export default function TopHeader({
  onMenuToggle,
}: {
  onMenuToggle: () => void;
}) {
  const [accountOpen, setAccountOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountOpen) return;

    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false);
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAccountOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [accountOpen]);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#E9E2D6] bg-[#FBF9F4] px-5 py-4 sm:px-8 lg:px-10">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#5C5548] transition-colors hover:bg-[#F5EBE0] hover:text-burgundy lg:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <h1 className="font-serif text-xl font-semibold tracking-tight text-burgundy sm:text-2xl">
          Platform Overview
        </h1>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#5C5548] transition-colors hover:bg-[#F5EBE0] hover:text-burgundy"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
          <span className="absolute right-[7px] top-[7px] h-1.5 w-1.5 rounded-full bg-burgundy ring-2 ring-[#FBF9F4]" />
        </button>

        <button
          type="button"
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#5C5548] transition-colors hover:bg-[#F5EBE0] hover:text-burgundy"
        >
          <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>

        <div className="hidden h-6 w-px bg-[#E9E2D6] sm:block" />

        {/* Account dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setAccountOpen((v) => !v)}
            aria-expanded={accountOpen}
            aria-haspopup="true"
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1.5 transition-colors hover:bg-[#F5EBE0] sm:pr-2.5"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-burgundy to-burgundy-dark text-[0.72rem] font-semibold text-cream">
              A
            </span>
            <span className="hidden text-sm font-medium text-[#48453D] md:block">
              Admin User
            </span>
            <ChevronDown
              className={`h-4 w-4 text-[#6F675A] transition-transform ${
                accountOpen ? "rotate-180" : ""
              }`}
              strokeWidth={1.75}
            />
          </button>

          {accountOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-3 w-60 overflow-hidden rounded-xl border border-[#E9E2D6] bg-white shadow-xl shadow-black/5"
              style={{ animation: "headerMenuIn 0.18s ease-out" }}
            >
              <div className="border-b border-[#EFE9DD] px-4 py-3.5">
                <p className="text-sm font-semibold text-[#48453D]">
                  Admin User
                </p>
                <p className="mt-0.5 text-xs text-[#8A8172]">
                  admin@wishstead.com
                </p>
              </div>

              <nav className="p-1.5">
                {accountMenu.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setAccountOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[#48453D] transition-colors hover:bg-[#F5EBE0] hover:text-burgundy"
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    {label}
                  </button>
                ))}
              </nav>

              <div className="border-t border-[#EFE9DD] p-1.5">
                <button
                  type="button"
                  onClick={() => setAccountOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-burgundy transition-colors hover:bg-[#F5EBE0]"
                >
                  <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}