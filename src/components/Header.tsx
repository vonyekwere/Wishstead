import Link from "next/link";

export default function Header() {
  return (
    <header className="relative z-20 bg-cream">
      <div className="container flex items-center justify-between py-5">
        <Link href="#" className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-maroon" />
          <span className="font-serif text-[1.4rem] font-semibold tracking-tight text-ink">
            Wishstead
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          <Link
            href="#"
            className="text-[0.72rem] font-semibold uppercase tracking-widest2 text-ink/80 transition-colors hover:text-maroon"
          >
            How It Works
          </Link>
          <Link
            href="#"
            className="text-[0.72rem] font-semibold uppercase tracking-widest2 text-ink/80 transition-colors hover:text-maroon"
          >
            For You
          </Link>
          <Link
            href="#"
            className="text-[0.72rem] font-semibold uppercase tracking-widest2 text-ink/80 transition-colors hover:text-maroon"
          >
            For Businesses
          </Link>
          <Link
            href="#"
            className="text-[0.72rem] font-semibold uppercase tracking-widest2 text-ink/80 transition-colors hover:text-maroon"
          >
            About
          </Link>
        </nav>

        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="hidden text-[0.72rem] font-semibold uppercase tracking-widest2 text-ink/80 transition-colors hover:text-maroon sm:block"
          >
            Log In
          </Link>
          <Link
            href="#"
            className="rounded-full bg-maroon px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-widest2 text-cream transition-colors hover:bg-maroon-dark"
          >
            Get Started
          </Link>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-maroon text-cream">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
        </div>
      </div>
    </header>
  );
}
