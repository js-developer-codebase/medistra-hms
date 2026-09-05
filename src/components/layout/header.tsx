"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Menu as MenuIcon, Bell, Search, LogOut, User as UserIcon, Building2, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMobileToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileToggle }) => {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/60 bg-white/70 px-4 backdrop-blur-2xl shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-950/60 sm:px-6 transition-colors">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileToggle}
          className="rounded-xl p-2 text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-800/60 border border-transparent hover:border-white/40 dark:hover:border-white/10 backdrop-blur-sm lg:hidden transition-all"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
          <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Medistra Central Hospital
          </span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex max-w-sm flex-1 items-center px-4">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients, doctors, records..."
            className="h-9 w-full rounded-full border border-white/70 bg-white/60 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 backdrop-blur-md shadow-sm transition-all focus:border-emerald-500/50 focus:bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:bg-slate-900/90"
          />
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full p-2 text-slate-600 hover:text-slate-900 bg-white/60 hover:bg-white/90 border border-white/80 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-800/80 backdrop-blur-md shadow-sm transition-all"
          title="Toggle Theme"
        >
          {mounted && theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        <button 
          className="relative rounded-full p-2 text-slate-600 hover:text-slate-900 bg-white/60 hover:bg-white/90 border border-white/80 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-800/80 backdrop-blur-md shadow-sm transition-all"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
        </button>

        <div className="h-6 w-px bg-slate-200/80 dark:bg-slate-800" />

        <div className="flex items-center gap-3">
          <div className="hidden flex-col text-right sm:flex">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              {session?.user?.name || "Super Admin"}
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {session?.user?.email || "admin@hospital.com"}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-slate-600 hover:text-red-600 hover:bg-red-500/10 dark:text-slate-400 dark:hover:text-red-400 gap-1.5 text-xs rounded-xl backdrop-blur-sm transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
