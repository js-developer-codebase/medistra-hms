"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu as MenuIcon, Bell, Search, LogOut, User as UserIcon, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMobileToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileToggle }) => {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileToggle}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Medistra Central Hospital
          </span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex max-w-sm flex-1 items-center px-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients, doctors, records..."
            className="h-9 w-full rounded-full border border-slate-200 bg-slate-50/80 pl-9 pr-4 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-3">
        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

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
            className="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 gap-1.5 text-xs"
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
