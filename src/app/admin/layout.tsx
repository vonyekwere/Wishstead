"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import TopHeader from "@/components/admin/TopHeader";
import Footer from "@/components/admin/Footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-dvh w-full bg-[#FBF9F4]">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader onMenuToggle={() => setMenuOpen((v) => !v)} />
        <main className="flex-1 px-5 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-9">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}