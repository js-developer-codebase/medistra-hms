"use client";

import React, { useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";

export function MasterLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950/5 font-sans dark:bg-slate-950">
      {/* Dynamic Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header Bar */}
        <Header onMobileToggle={() => setMobileOpen(!mobileOpen)} />

        {/* Page Body View */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MasterLayout;
