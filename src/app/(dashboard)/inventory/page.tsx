"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Boxes,
  Layers,
  PackagePlus,
  PackageMinus,
  ArrowRightLeft,
  SlidersHorizontal,
  Clock,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Plus,
  IndianRupee,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function InventoryHub() {
  const [stats, setStats] = useState<any>({
    totalItems: 0,
    totalStockValuation: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    categoriesCount: 0,
    todayInTransactions: 0,
    todayOutTransactions: 0,
    categoryDistribution: {}
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inventory/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      toast("Failed to load inventory stats", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 20000);
    return () => clearInterval(interval);
  }, []);

  const navCards = [
    {
      title: "Inventory Dashboard",
      href: "/inventory/dashboard",
      icon: Boxes,
      desc: "Executive inventory valuation, stock turnover velocity, and consumption metrics.",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40"
    },
    {
      title: "Items Master Catalog",
      href: "/inventory/items",
      icon: Layers,
      desc: "Comprehensive master directory of medical supplies, surgical instruments, and UOM.",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40"
    },
    {
      title: "Categories",
      href: "/inventory/categories",
      icon: Building2,
      desc: "Classification hierarchy: Surgical Disposables, ICU, CSSD, Linen, and Biomedical.",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/40"
    },
    {
      title: "Master Stock Ledger",
      href: "/inventory/stock",
      icon: Boxes,
      desc: "Live bin balances, current on-hand quantities, batch tracking, and valuations in ₹.",
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-950/40"
    },
    {
      title: "Stock In (GRN)",
      href: "/inventory/stock-in",
      icon: PackagePlus,
      desc: "Goods Receipt Notes for supplier deliveries, batch intake, and purchase rates in ₹.",
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/40"
    },
    {
      title: "Stock Out (Issues)",
      href: "/inventory/stock-out",
      icon: PackageMinus,
      desc: "Departmental requisitions issue to Emergency, OT, ICU, and Inpatient wards.",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40"
    },
    {
      title: "Stock Transfer",
      href: "/inventory/transfer",
      icon: ArrowRightLeft,
      desc: "Inter-store movement between Central Store, OT sub-store, and crash cart satellites.",
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-50 dark:bg-cyan-950/40"
    },
    {
      title: "Stock Adjustment",
      href: "/inventory/adjustment",
      icon: SlidersHorizontal,
      desc: "Physical audit reconciliation, damage write-offs, and cost impact accounting.",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40"
    },
    {
      title: "Expiry Tracking",
      href: "/inventory/expiry",
      icon: Clock,
      desc: "Near-expiry alert tiers (&le;30/60/90 days), batch quarantine, and supplier return.",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/40"
    },
    {
      title: "Low Stock Alerts",
      href: "/inventory/low-stock",
      icon: AlertTriangle,
      desc: "Items below reorder point thresholds, safety stock gap, and procurement trigger.",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/40"
    },
    {
      title: "Inventory Reports",
      href: "/inventory/reports",
      icon: BarChart3,
      desc: "ABC / VED analysis, departmental consumption logs, and CSV ledger export.",
      color: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-50 dark:bg-slate-800/40"
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Low Stock Warning Banner */}
      {stats.lowStockCount > 0 && (
        <div className="p-3.5 rounded-lg bg-amber-500 text-slate-900 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <AlertTriangle className="h-5 w-5 animate-pulse text-slate-950" />
            <span>
              REORDER LEVEL ALERT: {stats.lowStockCount} inventory items have reached or fallen below statutory reorder thresholds!
            </span>
          </div>
          <Link href="/inventory/low-stock">
            <Button size="sm" variant="secondary" className="text-xs bg-slate-900 text-white hover:bg-slate-800 h-7 font-bold">
              Review Shortages
            </Button>
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Inventory &amp; General Stores Operations Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Medical consumables, surgical supplies, biomedical spares, Goods Receipt Notes (GRN), and department dispensations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadStats}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Link href="/inventory/stock-in">
            <Button size="sm" className="text-xs flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
              <PackagePlus className="h-4 w-4" />
              Stock In (GRN)
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Real-Time KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Total Stock Asset
              <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl font-bold text-emerald-600 font-mono">
              ₹{(stats.totalStockValuation || 0).toLocaleString("en-IN")}
            </div>
            <p className="text-[9px] text-slate-400">Live inventory valuation</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Catalog Items
              <Layers className="h-3.5 w-3.5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalItems}
            </div>
            <p className="text-[9px] text-slate-400">Active supply items</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Low Stock Alert
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-amber-600">
              {stats.lowStockCount}
            </div>
            <p className="text-[9px] text-slate-400">&le; Reorder point</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Stockout Items
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-rose-600">
              {stats.outOfStockCount}
            </div>
            <p className="text-[9px] text-slate-400">Zero balance</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Receipts (In)
              <PackagePlus className="h-3.5 w-3.5 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.todayInTransactions}
            </div>
            <p className="text-[9px] text-slate-400">GRN received today</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Issues (Out)
              <PackageMinus className="h-3.5 w-3.5 text-rose-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-rose-600">
              {stats.todayOutTransactions}
            </div>
            <p className="text-[9px] text-slate-400">Dispatched to wards</p>
          </CardContent>
        </Card>
      </div>

      {/* 11 Submodule Launchpad Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Inventory Department Workstations</span>
            <Badge variant="outline" className="text-xs">11 Submodules</Badge>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href} className="group">
                <Card className="h-full border hover:border-blue-500/50 hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-900 flex flex-col justify-between">
                  <CardHeader className="p-3.5 pb-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`p-2 rounded-lg ${card.bg}`}>
                        <Icon className={`h-4 w-4 ${card.color}`} />
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <CardTitle className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-0">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {card.desc}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
