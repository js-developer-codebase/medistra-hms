"use client";

import React, { useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";

export function MasterLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-slate-100/70 font-sans dark:bg-[#080d1a]">
      {/* Ambient Glassmorphism Backlight Mesh Orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
        {/* Top-Right Emerald Orb */}
        <div className="animate-float-slow absolute -top-32 right-10 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-emerald-400/20 via-teal-400/15 to-transparent blur-[120px] dark:from-emerald-500/15 dark:via-teal-600/10" />
        
        {/* Mid-Left Cyan/Sky Orb */}
        <div className="animate-float-reverse absolute top-1/3 -left-32 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-cyan-400/20 via-sky-400/15 to-transparent blur-[130px] dark:from-cyan-500/12 dark:via-sky-600/10" />
        
        {/* Bottom-Right Indigo Orb */}
        <div className="animate-float-slow absolute -bottom-32 right-1/4 h-[550px] w-[550px] rounded-full bg-gradient-to-tl from-indigo-400/15 via-purple-400/10 to-transparent blur-[140px] dark:from-indigo-600/15 dark:via-violet-600/10" />
      </div>

      {/* Dynamic Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* Header Bar */}
        <Header onMobileToggle={() => setMobileOpen(!mobileOpen)} />

        {/* Page Body View */}
        <main className="flex-1 overflow-y-auto scrollbar-slim p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MasterLayout;
