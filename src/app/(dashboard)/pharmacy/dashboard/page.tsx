"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Pill,
  FileText,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  ClockAlert,
  Boxes,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  IndianRupee
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function PharmacyDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [pendingPrescriptions, setPendingPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, medsRes, presRes] = await Promise.all([
        fetch("/api/pharmacy/stats"),
        fetch("/api/pharmacy/medicines"),
        fetch("/api/pharmacy/prescriptions")
      ]);

      const sData = await statsRes.json();
      if (sData.success) setStats(sData.data);

      const mData = await medsRes.json();
      if (mData.success) setMedicines(mData.data || []);

      const pData = await presRes.json();
      if (pData.success) {
        const list = pData.data || [];
        const pending = list.filter((p: any) => p.dispenseStatus === "PENDING" || !p.dispenseStatus);
        setPendingPrescriptions(pending.slice(0, 5));
      }
    } catch (err) {
      console.error(err);
      toast("Failed to load dashboard metrics", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Pharmacy Executive Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time drug inventory valuation, dispensing throughput, and stock replenishment radar.
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
            Refresh Data
          </Button>

          <Link href="/pharmacy/dispensing">
            <Button size="sm" className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
              <ShoppingCart className="h-3.5 w-3.5" />
              Go to Dispense POS
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Total Formulations
            </CardTitle>
            <Pill className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.totalMedicines ?? 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Across {stats?.totalCategories ?? 0} therapeutic categories
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Inventory Valuation
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ₹{(stats?.totalStockValuation ?? 0).toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active warehouse &amp; counter stock
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Low Stock Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats?.lowStockCount ?? 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats?.outOfStockCount ?? 0} items at zero balance
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Today's Dispenses
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {stats?.todayDispensedCount ?? 0}
              <span className="text-xs font-normal text-slate-500 ml-2">
                (₹{(stats?.todayRevenue ?? 0).toLocaleString("en-IN")})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Total lifetime: {stats?.totalDispensesCount ?? 0} bills
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Middle Grid: Pending Prescriptions & Stock Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Prescriptions (2 Cols) */}
        <Card className="lg:col-span-2 border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                Doctor Prescriptions Awaiting Dispensing
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Queued from OP Consultations &amp; IP Wards
              </p>
            </div>
            <Link href="/pharmacy/prescriptions">
              <Button variant="outline" size="sm" className="text-xs h-7">
                Prescription Desk <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {pendingPrescriptions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                No pending prescriptions. All doctor orders have been dispensed!
              </div>
            ) : (
              <div className="divide-y text-xs">
                {pendingPrescriptions.map((p: any) => (
                  <div
                    key={p._id}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{p.patientId?.name || "Patient"}</span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {p.patientId?.uhid || "UHID"}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Dr. {p.doctorId?.name || "Physician"} • {p.medications?.length || 0} drugs prescribed
                      </div>
                      {p.diagnosis && (
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                          Dx: {p.diagnosis}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        Pending
                      </Badge>
                      <Link href={`/pharmacy/dispensing?prescriptionId=${p._id}`}>
                        <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                          Dispense
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Safety & Batch Expiry Alerts (1 Col) */}
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-rose-600">
              <ClockAlert className="h-4 w-4" />
              Drug Expiry &amp; Safety Radar
            </CardTitle>
            <Link href="/pharmacy/expiry">
              <Button variant="ghost" size="sm" className="text-xs h-7 text-rose-600">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                  Expired Stock
                </div>
                <div className="text-[10px] text-rose-600 dark:text-rose-400">
                  Immediate write-off required
                </div>
              </div>
              <div className="text-xl font-bold text-rose-700 dark:text-rose-300">
                {stats?.expiredCount ?? 0}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  Expiring &lt; 30 Days
                </div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400">
                  Critical shelf rotation
                </div>
              </div>
              <div className="text-xl font-bold text-amber-700 dark:text-amber-300">
                {stats?.expiringIn30DaysCount ?? 0}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">
                  Expiring in 30–90 Days
                </div>
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400">
                  Upcoming supplier returns
                </div>
              </div>
              <div className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                {stats?.expiringIn90DaysCount ?? 0}
              </div>
            </div>

            <Link href="/pharmacy/expiry" className="block mt-2">
              <Button variant="outline" size="sm" className="w-full text-xs border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800">
                Open Expiry Desk
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Fast Moving Essential Formulations */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Boxes className="h-4 w-4 text-emerald-600" />
              Essential Formulations Inventory Sample
            </CardTitle>
            <p className="text-xs text-slate-500">
              Active warehouse stock levels, batch numbers, and rack locations
            </p>
          </div>
          <Link href="/pharmacy/medicines">
            <Button variant="outline" size="sm" className="text-xs h-7">
              Full Catalog ({medicines.length})
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y text-xs">
            {medicines.slice(0, 6).map((m: any) => (
              <div key={m._id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{m.name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {m.dosageForm || "TABLET"}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {m.category} • Batch: <span className="font-mono">{m.batchNumber || "N/A"}</span> • {m.rackLocation || "Rack A-01"}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      ₹{m.unitPrice || 0}
                    </div>
                    <div className="text-[10px] text-slate-400">per unit</div>
                  </div>

                  <div className="min-w-[90px]">
                    <Badge
                      className={
                        m.stockQuantity <= (m.reorderLevel || 10)
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      }
                    >
                      {m.stockQuantity} in stock
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
