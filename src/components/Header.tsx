"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "For You", href: "#" },
  { label: "For Businesses", href: "#" },
  { label: "About", href: "#" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm border-b border-[#f1ebe2]">
      <div className="container flex items-center justify-between py-4 sm:py-5">
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-maroon font-serif text-[0.6rem] font-semibold text-cream">
            W
          </span>
          <span className="whitespace-nowrap font-serif text-[1.2rem] font-semibold tracking-tight text-ink xs:text-[1.35rem] sm:text-[1.4rem]">
            Wishstead
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 xl:gap-10 desktop:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[0.72rem] font-semibold uppercase tracking-widest2 text-ink/80 transition-colors hover:text-maroon"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
          <Link
            href="/auth/login"
            className="hidden text-[0.72rem] font-semibold uppercase tracking-widest2 text-ink/80 transition-colors hover:text-maroon desktop:block"
          >
            Log In
          </Link>

          <Link
            href="/auth/signup"
            className="hidden rounded-full bg-maroon px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-widest2 text-cream transition-colors hover:bg-maroon-dark sm:inline-flex sm:px-5"
          >
            Get Started
          </Link>

          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-tan-line text-ink transition-colors hover:border-maroon hover:text-maroon desktop:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-menu"
          className="border-t border-tan-line bg-cream desktop:hidden"
          style={{ animation: "headerMenuIn 0.2s ease-out" }}
        >
          <nav className="container flex flex-col py-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-tan-line/60 py-4 text-base font-semibold text-ink transition-colors hover:text-maroon"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-5 flex flex-col gap-3">
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="rounded-full border border-maroon px-4 py-3.5 text-center text-sm font-semibold uppercase tracking-widest2 text-maroon transition-colors hover:bg-maroon hover:text-cream"
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setOpen(false)}
                className="rounded-full bg-maroon px-4 py-3.5 text-center text-sm font-semibold uppercase tracking-widest2 text-cream transition-colors hover:bg-maroon-dark"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
