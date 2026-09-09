"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col bg-cream">
      <div className="grid w-full grid-cols-1 lg:min-h-[80dvh] lg:grid-cols-2">
        {/* Left — image panel */}
        <div className="relative hidden overflow-hidden lg:block">
          <Image
            src="/images/login-page.png"
            alt="Warm, softly lit artisanal candles surrounded by dried flowers"
            fill
            priority
            className="object-cover"
            sizes="50vw"
          />
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
              Welcome Back
            </h2>
            <p className="mt-3 text-neutral-500">
              Unlock your ledger of curiosities and heartfelt gifts.
            </p>

            <form className="mt-10 space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#2E2A24]"
                >
                  Email Address
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
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#2E2A24]"
                >
                  Password
                </label>
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

              {/* Submit */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4A1620] py-3 text-sm font-medium text-white transition-colors hover:bg-[#5c1c29]"
              >
                Enter Ledger
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <span className="h-px flex-1 bg-[#E7C9C9]" />
                <span className="text-sm text-neutral-400">or</span>
                <span className="h-px flex-1 bg-[#E7C9C9]" />
              </div>

              {/* Google */}
              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#E7C9C9] bg-white py-3 text-sm font-medium text-[#2E2A24] transition-colors hover:border-[#4A1620]"
              >
                <GoogleLogo />
                Continue with Google
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-500">
              By entering, you agree to our{" "}
              <a
                href="#terms"
                className="font-medium text-[#4A1620] underline underline-offset-2"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#privacy"
                className="font-medium text-[#4A1620] underline underline-offset-2"
              >
                Privacy Policy
              </a>
              .
            </p>

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