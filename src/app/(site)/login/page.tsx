"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  return (
    <div className="flex flex-col bg-cream">
      <div className="grid w-full grid-cols-1 lg:min-h-[80dvh] lg:grid-cols-2">
      {/* Left — image panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="/images/login.png"
          alt="Warm, softly lit artisanal candles surrounded by dried flowers"
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />
 
<div className="relative flex h-full flex-col justify-between p-8 xl:p-12">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-wide text-white xl:text-4xl">
              WISHSTEAD
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/90 xl:text-[15px]">
              Partner with us to curate thoughtful, meaningful gifts for
              discerning customers.
            </p>
          </div>

          {/* Testimonial card */}
          <div className="max-w-md rounded-2xl bg-[#EFEAE1]/90 p-5 backdrop-blur-sm xl:p-6">
            <p className="font-semibold text-xl leading-snug text-[#4A1620] xl:text-[24px]">
              &ldquo;Wishstead connects our artisanal goods with people
              seeking genuine connection.&rdquo;
            </p>
            <p className="mt-3 text-sm font-medium text-neutral-500">
              — Eleanor &amp; Co. Botanicals
            </p>
          </div>
        </div>
      </div>
 
      {/* Right — form panel */}
      <div className="flex items-center justify-center bg-[#FBF9F4] px-5 py-12 sm:px-8 sm:py-16">
        <div className="w-full max-w-md">
          <h2 className="font-serif text-4xl font-bold text-[#4A1620]">
            Vendor Login
          </h2>
          <p className="mt-3 text-neutral-500">
            Welcome back. Enter your details to manage your boutique.
          </p>
 
          <form className="mt-10 space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#2E2A24]"
              >
                Business Email
              </label>
              <div className="mt-2 flex items-center rounded-xl border border-[#E7C9C9] bg-white px-4 py-3 focus-within:border-[#4A1620]">
                <Mail className="h-4 w-4 text-neutral-400" strokeWidth={1.75} />
                <input
                  id="email"
                  type="email"
                  placeholder="hello@yourboutique.com"
                  className="ml-3 w-full bg-transparent text-sm text-[#2E2A24] placeholder:text-neutral-400 focus:outline-none"
                />
              </div>
            </div>
 
            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#2E2A24]"
                >
                  Password
                </label>
                <a
                  href="#forgot-password"
                  className="text-sm text-[#4A1620] underline underline-offset-2"
                >
                  Forgot password?
                </a>
              </div>
              <div className="mt-2 flex items-center rounded-xl border border-[#E7C9C9] bg-white px-4 py-3 focus-within:border-[#4A1620]">
                <Lock className="h-4 w-4 text-neutral-400" strokeWidth={1.75} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="ml-3 w-full bg-transparent text-sm text-[#2E2A24] placeholder:text-neutral-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>
 
            {/* Remember me */}
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-[#E7C9C9] text-[#4A1620] focus:ring-[#4A1620]"
              />
              <span className="text-sm text-neutral-600">
                Remember me on this device
              </span>
            </label>
 
            {/* Submit */}
            <Link
              href="/signup"
              className="block w-full rounded-xl bg-[#4A1620] py-3 text-center text-sm font-medium text-white transition-colors hover:bg-[#5c1c29]"
            >
              Sign In
            </Link>
          </form>
 
          <p className="mt-6 text-center text-sm text-neutral-600">
            New to Wishstead?{" "}
            <Link href="/vender" className="font-semibold text-[#4A1620]">
              Apply to be a Vendor
            </Link>
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}
