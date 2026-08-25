"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import DynamicIcon from "./dynamic-icon";
import { ChevronDown, ChevronRight, LogOut, Activity, User as UserIcon, Shield } from "lucide-react";

interface MenuItem {
  _id: string;
  name: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
}

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchMenus() {
      try {
        const res = await fetch("/api/menu");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          // Filter out items that are children of other menus to avoid duplicating top-level renders
          const childIds = new Set<string>();
          json.data.forEach((m: MenuItem) => {
            if (m.children && Array.isArray(m.children)) {
              m.children.forEach((c: any) => {
                if (typeof c === "object" && c._id) {
                  childIds.add(c._id.toString());
                } else if (typeof c === "string") {
                  childIds.add(c);
                }
              });
            }
          });
          const topLevel = json.data.filter((m: MenuItem) => !childIds.has(m._id.toString()));
          setMenus(topLevel);
        }
      } catch (err) {
        console.error("Failed to fetch menus:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMenus();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen?.(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 dark:border-slate-800/80 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/30">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Medistra <span className="text-emerald-600 dark:text-emerald-400">HMS</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Healthcare Admin
            </span>
          </div>
        </div>

        {/* Navigation Menu List */}
        <div className="flex-1 overflow-y-auto scrollbar-slim px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Navigation Menu
          </div>

          {loading ? (
            <div className="space-y-2 px-3 py-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-9 w-full rounded-lg bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          ) : (
            menus.map((menu) => {
              const hasChildren = menu.children && menu.children.length > 0;
              const isExpanded = expandedItems[menu._id];
              const isActive = pathname === menu.path || (hasChildren && menu.children?.some(c => pathname === c.path));

              return (
                <div key={menu._id} className="space-y-1">
                  {hasChildren ? (
                    <button
                      onClick={() => toggleExpand(menu._id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white",
                        isActive ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20" : "text-slate-600 dark:text-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <DynamicIcon name={menu.icon || "Folder"} className={cn("h-4 w-4", isActive ? "text-emerald-400" : "text-slate-400")} />
                        <span>{menu.name}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  ) : (
                    <Link
                      href={menu.path || "#"}
                      onClick={() => setMobileOpen?.(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white",
                        pathname === menu.path ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "text-slate-600 dark:text-slate-300"
                      )}
                    >
                      <DynamicIcon name={menu.icon || "Circle"} className={cn("h-4 w-4", pathname === menu.path ? "text-white" : "text-slate-400")} />
                      <span>{menu.name}</span>
                    </Link>
                  )}

                  {/* Submenu Accordion */}
                  {hasChildren && isExpanded && (
                    <div className="ml-4 pl-3 border-l border-slate-800 space-y-1 py-1">
                      {menu.children?.map((child: MenuItem) => {
                        const childActive = pathname === child.path;
                        return (
                          <Link
                            key={child._id}
                            href={child.path || "#"}
                            onClick={() => setMobileOpen?.(false)}
                            className={cn(
                              "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:text-slate-900 dark:hover:text-white",
                              childActive
                                ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-semibold"
                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                            )}
                          >
                            <DynamicIcon name={child.icon || "Circle"} className="h-3.5 w-3.5 opacity-80" />
                            <span>{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* User Profile & Footer Section */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 p-3 bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-800/60 p-3 shadow-sm dark:shadow-none border border-slate-100 dark:border-transparent">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex flex-col truncate">
                <span className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                  {session?.user?.name || "User"}
                </span>
                <span className="truncate text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {typeof session?.user?.role === 'object' ? session.user.role?.role || 'Admin' : 'Super Admin'}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign Out"
              className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
