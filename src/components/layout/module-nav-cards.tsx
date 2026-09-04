"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Layers, Loader2 } from "lucide-react";
import DynamicIcon from "./dynamic-icon";
import { Badge } from "@/components/ui/badge";

interface MenuItem {
  _id: string;
  name: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
}

interface ModuleNavCardsProps {
  modulePath: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const ModuleNavCards: React.FC<ModuleNavCardsProps> = ({
  modulePath,
  title = "Module Navigation & Workflows",
  subtitle = "Direct access to specialized sub-menus and operations",
  className = "",
}) => {
  const [submenus, setSubmenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadMenu() {
      try {
        setLoading(true);
        const res = await fetch("/api/menu");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && isMounted) {
          // Find the menu matching this module's root path
          const cleanPath = modulePath.toLowerCase().trim();
          const targetMenu = json.data.find(
            (m: MenuItem) =>
              m.path &&
              (m.path.toLowerCase() === cleanPath ||
                cleanPath.startsWith(m.path.toLowerCase()))
          );

          if (targetMenu && Array.isArray(targetMenu.children)) {
            setSubmenus(targetMenu.children);
          } else {
            // Also check if any top-level menu children match this module
            const matchingChildren: MenuItem[] = [];
            json.data.forEach((m: MenuItem) => {
              if (m.children && Array.isArray(m.children)) {
                m.children.forEach((c: any) => {
                  if (
                    typeof c === "object" &&
                    c.path &&
                    c.path.toLowerCase().startsWith(cleanPath)
                  ) {
                    matchingChildren.push(c);
                  }
                });
              }
            });
            if (matchingChildren.length > 0) {
              setSubmenus(matchingChildren);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load module submenus:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMenu();
    return () => {
      isMounted = false;
    };
  }, [modulePath]);

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (submenus.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-600" />
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
          <Badge variant="outline" className="text-[11px] font-medium w-fit">
            {submenus.length} Sub-menus
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {submenus.map((item) => (
          <Link
            key={item._id || item.path}
            href={item.path}
            className="group flex flex-col justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/50 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-600 dark:group-hover:bg-emerald-500/20 dark:group-hover:text-emerald-400 transition-colors">
                <DynamicIcon name={item.icon || "Activity"} className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {item.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate font-mono">
                {item.path}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ModuleNavCards;
