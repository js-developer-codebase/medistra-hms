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
import { ModuleNavCards } from "@/components/layout/module-nav-cards";

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

      {/* Dynamic Submodules Navigation */}
      <ModuleNavCards
        modulePath="/pharmacy"
        title="Pharmacy Modules & Workstations"
        subtitle="Medication inventory, electronic dispensing, POS billing, and stock analytics"
      />

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
