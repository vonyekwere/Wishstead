"use client";

import { useState } from "react";
import Link from "next/link";
import ArrowRight from "@/components/ArrowRight";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-widest2 text-maroon"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-tan-line bg-cream px-4 py-3 text-sm text-ink placeholder:text-body/60 focus:border-maroon focus:outline-none"
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-[0.7rem] font-semibold uppercase tracking-widest2 text-maroon"
          >
            Password
          </label>
          <Link
            href="#"
            className="text-xs text-body underline-offset-2 hover:text-maroon hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border border-tan-line bg-cream px-4 py-3 text-sm text-ink placeholder:text-body/60 focus:border-maroon focus:outline-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-body">
        <input type="checkbox" className="h-4 w-4 accent-maroon" />
        Remember me
      </label>

      <button
        type="submit"
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-maroon px-6 py-3.5 text-[0.72rem] font-semibold uppercase tracking-widest2 text-cream transition-colors hover:bg-maroon-dark"
      >
        Sign In
        <ArrowRight />
      </button>
    </form>
  );
}
