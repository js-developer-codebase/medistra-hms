"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Pill,
  LayoutDashboard,
  Layers,
  FileText,
  ShoppingCart,
  RotateCcw,
  Boxes,
  ClockAlert,
  Truck,
  BarChart3,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Plus,
  ReceiptText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface PharmacyStats {
  totalMedicines: number;
  totalStockValuation: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiredCount: number;
  expiringIn30DaysCount: number;
  expiringIn90DaysCount: number;
  todayDispensedCount: number;
  todayRevenue: number;
  totalDispensesCount: number;
  totalRevenue: number;
  pendingPrescriptionsCount: number;
  totalCategories: number;
  totalSuppliers: number;
  totalReturns: number;
  totalRefundAmount: number;
}

export default function PharmacyHubPage() {
  const [stats, setStats] = useState<PharmacyStats | null>(null);
  const [recentDispenses, setRecentDispenses] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, dispensesRes, medsRes] = await Promise.all([
        fetch("/api/pharmacy/stats"),
        fetch("/api/pharmacy/dispense"),
        fetch("/api/pharmacy/medicines")
      ]);

      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.data);

      const dispensesData = await dispensesRes.json();
      if (dispensesData.success) {
        setRecentDispenses((dispensesData.data || []).slice(0, 5));
      }

      const medsData = await medsRes.json();
      if (medsData.success) {
        const meds = medsData.data || [];
        const low = meds.filter((m: any) => m.stockQuantity <= (m.reorderLevel || 10));
        setLowStockItems(low.slice(0, 5));
      }
    } catch (err: any) {
      console.error(err);
      toast("Failed to load pharmacy hub data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await fetch("/api/pharmacy/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast("Seeded essential medicines, categories & suppliers!", "success");
        loadData();
      } else {
        toast(data.message || "Seeding failed", "error");
      }
    } catch (err) {
      toast("Error seeding pharmacy data", "error");
    } finally {
      setSeeding(false);
    }
  };

  const navCards = [
    {
      title: "Pharmacy Dashboard",
      path: "/pharmacy/dashboard",
      icon: LayoutDashboard,
      description: "Inventory valuation, throughput, and sales analytics",
      badge: "Analytics"
    },
    {
      title: "Medicines",
      path: "/pharmacy/medicines",
      icon: Pill,
      description: "Master catalog of drugs, formulations, racks, and batch numbers",
      badge: `${stats?.totalMedicines || 0} Items`
    },
    {
      title: "Medicine Categories",
      path: "/pharmacy/categories",
      icon: Layers,
      description: "Therapeutic classifications, storage vaults, and prescription rules",
      badge: `${stats?.totalCategories || 0} Cats`
    },
    {
      title: "Prescriptions",
      path: "/pharmacy/prescriptions",
      icon: FileText,
      description: "Doctor e-prescriptions queue awaiting pharmacy dispensing",
      badge: `${stats?.pendingPrescriptionsCount || 0} Pending`,
      badgeColor: (stats?.pendingPrescriptionsCount || 0) > 0 ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" : ""
    },
    {
      title: "Dispensing & POS",
      path: "/pharmacy/dispensing",
      icon: ShoppingCart,
      description: "Point-of-Sale counter, bill generation, and inventory auto-deduction",
      badge: "Counter Active"
    },
    {
      title: "Returns",
      path: "/pharmacy/returns",
      icon: RotateCcw,
      description: "Patient and ward medication return logging and refund audits",
      badge: `${stats?.totalReturns || 0} Processed`
    },
    {
      title: "Pharmacy Stock",
      path: "/pharmacy/stock",
      icon: Boxes,
      description: "Real-time stock ledger, batch balances, and manual adjustments",
      badge: `₹${(stats?.totalStockValuation || 0).toLocaleString("en-IN")}`
    },
    {
      title: "Expiry Management",
      path: "/pharmacy/expiry",
      icon: ClockAlert,
      description: "Critical batch expiry tracking, 30/90-day alert tiers, and write-offs",
      badge: `${stats?.expiredCount || 0} Expired`,
      badgeColor: (stats?.expiredCount || 0) > 0 ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300" : ""
    },
    {
      title: "Suppliers",
      path: "/pharmacy/suppliers",
      icon: Truck,
      description: "Pharmaceutical distributors, Drug License records, and lead times",
      badge: `${stats?.totalSuppliers || 0} Vendors`
    },
    {
      title: "Pharmacy Reports",
      path: "/pharmacy/reports",
      icon: BarChart3,
      description: "Sales revenue, consumption audits, and controlled substances log",
      badge: "Print & Export"
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            Pharmacy Operations Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Medication inventory, electronic dispensing, POS billing, batch expiry, and supplier management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSeed}
            disabled={seeding}
            className="text-xs flex items-center gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {seeding ? "Seeding..." : "Seed Essential Medicines"}
          </Button>

          <Link href="/pharmacy/dispensing">
            <Button size="sm" className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
              <ShoppingCart className="h-3.5 w-3.5" />
              New Dispense (POS)
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Total Medicines
              <Pill className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.totalMedicines ?? 0}
            </div>
            <p className="text-[10px] text-slate-500">Active formulations</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Stock Valuation
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              ₹{(stats?.totalStockValuation ?? 0).toLocaleString("en-IN")}
            </div>
            <p className="text-[10px] text-slate-500">Inventory worth</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Low / Out Stock
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-amber-600">
              {stats?.lowStockCount ?? 0}
              <span className="text-xs font-normal text-rose-500 ml-1">
                ({stats?.outOfStockCount ?? 0} Nil)
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Needs reorder</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Expiring &lt;30d
              <ClockAlert className="h-4 w-4 text-rose-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-rose-600">
              {stats?.expiringIn30DaysCount ?? 0}
            </div>
            <p className="text-[10px] text-slate-500">
              {stats?.expiredCount ?? 0} expired
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Pending Prescriptions
              <FileText className="h-4 w-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-purple-600">
              {stats?.pendingPrescriptionsCount ?? 0}
            </div>
            <p className="text-[10px] text-slate-500">Awaiting dispense</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Today's Revenue
              <ReceiptText className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold text-emerald-600">
              ₹{(stats?.todayRevenue ?? 0).toLocaleString("en-IN")}
            </div>
            <p className="text-[10px] text-slate-500">
              {stats?.todayDispensedCount ?? 0} dispenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 10 Submodules Launchpad */}
      <div>
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-between">
          <span>Pharmacy Modules & Workstations</span>
          <span className="text-xs font-normal text-slate-500">10 Submodules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.path} href={card.path} className="group">
                <Card className="h-full border hover:border-emerald-500/60 hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-900">
                  <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <Icon className="h-5 w-5" />
                        </div>
                        {card.badge && (
                          <Badge variant="secondary" className={`text-[10px] font-medium ${card.badgeColor || ""}`}>
                            {card.badge}
                          </Badge>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center gap-1">
                          {card.title}
                          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Operational Queues: Recent Dispenses & Low Stock Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Dispenses */}
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-emerald-600" />
              Recent Pharmacy Dispenses
            </CardTitle>
            <Link href="/pharmacy/dispensing">
              <Button variant="ghost" size="sm" className="text-xs h-7 text-emerald-600">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentDispenses.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No dispenses recorded today. Click "New Dispense (POS)" to process an order.
              </div>
            ) : (
              <div className="divide-y text-xs">
                {recentDispenses.map((d: any) => (
                  <div key={d._id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{d.billNumber}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {d.paymentMode}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {d.patientName} • {d.items?.length || 0} medicines
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-600">
                        ₹{(d.totalAmount || 0).toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(d.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Radar */}
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              Low Stock &amp; Replenishment Radar
            </CardTitle>
            <Link href="/pharmacy/stock">
              <Button variant="ghost" size="sm" className="text-xs h-7 text-amber-600">
                Stock Ledger
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {lowStockItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-emerald-600">
                ✓ All inventory items are adequately stocked above reorder thresholds.
              </div>
            ) : (
              <div className="divide-y text-xs">
                {lowStockItems.map((med: any) => (
                  <div key={med._id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {med.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {med.category} • {med.rackLocation || "Rack A-01"}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive" className="text-[10px]">
                        {med.stockQuantity} Left
                      </Badge>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Min threshold: {med.reorderLevel}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
