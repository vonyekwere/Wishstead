"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Upload, Building2, FileText, Globe, Layers } from "lucide-react";

export default function VendorApplyPage() {
  const [showPassword, setShowPassword] = useState(false);

  const inputClasses =
    "mt-2 flex items-center rounded-[12px] border border-[#DAC0C1] bg-white px-4 py-3 focus-within:border-[#4A1620]";
  const fieldClasses =
    "ml-3 w-full bg-transparent text-sm text-[#2E2A24] placeholder:text-neutral-400 focus:outline-none";

  return (
    <main className="flex flex-col bg-cream">
      <div className="mx-auto w-full max-w-5xl rounded-[12px] border border-[#DAC0C1] bg-white px-5 py-14 sm:px-8 sm:py-20">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold text-[#4A1620] sm:text-5xl">
            Partner with Us
          </h1>
          <p className="mt-4 text-neutral-500">
            Join Wishstead&apos;s curated collection of fine boutiques.
          </p>
        </div>

        <form className="mt-12 space-y-10">
          {/* Account Details */}
          <section>
            <h2 className="font-serif text-2xl font-semibold text-[#4A1620]">
              Account Details
            </h2>
            <div className="mt-1 h-px w-14 rounded bg-[#D9B36A]" />

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#2E2A24]">
                  Email address
                </label>
                <div className={inputClasses}>
                  <Mail className="h-4 w-4 text-neutral-400" strokeWidth={1.75} />
                  <input
                    id="email"
                    type="email"
                    placeholder="hello@yourboutique.com"
                    className={fieldClasses}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#2E2A24]">
                  Password
                </label>
                <div className={inputClasses}>
                  <Lock className="h-4 w-4 text-neutral-400" strokeWidth={1.75} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={fieldClasses}
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
            </div>
          </section>

          {/* Business Profile */}
          <section>
            <h2 className="font-serif text-2xl font-semibold text-[#4A1620]">
              Business Profile
            </h2>
            <div className="mt-1 h-px w-14 rounded bg-[#D9B36A]" />

            <div className="mt-6 space-y-6">
              {/* Business Name */}
              <div>
                <label htmlFor="business-name" className="block text-sm font-medium text-[#2E2A24]">
                  Business name
                </label>
                <div className={inputClasses}>
                  <Building2 className="h-4 w-4 text-neutral-400" strokeWidth={1.75} />
                  <input
                    id="business-name"
                    type="text"
                    placeholder="e.g. Eleanor & Co. Botanicals"
                    className={fieldClasses}
                  />
                </div>
              </div>

              {/* Business Description */}
              <div>
                <label htmlFor="business-description" className="block text-sm font-medium text-[#2E2A24]">
                  Business description
                </label>
                <div className="mt-2 flex items-start rounded-[12px] border border-[#DAC0C1] bg-white px-4 py-3 focus-within:border-[#4A1620]">
                  <FileText className="mt-0.5 h-4 w-4 text-neutral-400" strokeWidth={1.75} />
                  <textarea
                    id="business-description"
                    rows={4}
                    placeholder="Tell us about your boutique, your craft, and what makes it special."
                    className="ml-3 w-full resize-none bg-transparent text-sm text-[#2E2A24] placeholder:text-neutral-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Website URL */}
                <div>
                  <label htmlFor="website-url" className="block text-sm font-medium text-[#2E2A24]">
                    Website URL
                  </label>
                  <div className={inputClasses}>
                    <Globe className="h-4 w-4 text-neutral-400" strokeWidth={1.75} />
                    <input
                      id="website-url"
                      type="url"
                      placeholder="https://yourboutique.com"
                      className={fieldClasses}
                    />
                  </div>
                </div>

                {/* Primary Category */}
                <div>
                  <label htmlFor="primary-category" className="block text-sm font-medium text-[#2E2A24]">
                    Primary category
                  </label>
                  <div className={inputClasses}>
                    <Layers className="h-4 w-4 text-neutral-400" strokeWidth={1.75} />
                    <input
                      id="primary-category"
                      type="text"
                      placeholder="e.g. Home & Living, Candles, Apparel"
                      className={fieldClasses}
                    />
                  </div>
                </div>
              </div>

              {/* Business Logo Upload */}
              <div>
                <label htmlFor="business-logo" className="block text-sm font-medium text-[#2E2A24]">
                  Business logo
                </label>
                <label
                  htmlFor="business-logo"
                  className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-[#DAC0C1] bg-white px-4 py-8 text-center transition-colors hover:border-[#4A1620] hover:bg-cream"
                >
                  <Upload className="h-6 w-6 text-neutral-400" strokeWidth={1.5} />
                  <span className="mt-3 text-sm text-neutral-500">
                    Click to upload your logo
                  </span>
                  <span className="mt-1 text-xs text-neutral-400">
                    PNG, JPG · up to 5MB
                  </span>
                  <input
                    id="business-logo"
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col gap-4 pt-2 sm:flex-row">
            <Link
              href="/login"
              className="rounded-[12px] border border-[#DAC0C1] bg-white py-3 text-center text-sm font-medium text-[#4A1620] transition-colors hover:border-[#4A1620] sm:flex-1"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-xl bg-[#4A1620] py-3 text-sm font-medium text-white transition-colors hover:bg-[#5c1c29] sm:flex-1"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
