"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import {
  BarChart3,
  Building,
  BedDouble,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Layers,
  ArrowRightLeft,
  Plus,
  RefreshCw,
  ShieldAlert,
  Loader2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  HeartPulse
} from "lucide-react";

export default function WardDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [beds, setBeds] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [statsRes, bedRes, admRes] = await Promise.all([
        fetch("/api/ward/stats"),
        fetch("/api/bed"),
        fetch("/api/admission?status=ACTIVE")
      ]);

      const [statsData, bedData, admData] = await Promise.all([
        statsRes.json(),
        bedRes.json(),
        admRes.json()
      ]);

      if (statsData.success) setStats(statsData.data);
      if (bedData.success) setBeds(bedData.data || []);
      if (admData.success) setAdmissions(admData.data || []);
    } catch (err) {
      toast("Failed to load ward dashboard metrics", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Critical Care (ICU / CCU) readiness metrics
  const criticalCareStats = useMemo(() => {
    const icuBeds = beds.filter(
      (b) =>
        b.bedType === "ICU" ||
        b.roomId?.wardId?.wardType === "ICU" ||
        b.roomId?.wardId?.wardType === "CCU"
    );
    const total = icuBeds.length;
    const available = icuBeds.filter((b) => b.status === "AVAILABLE").length;
    const occupied = icuBeds.filter((b) => b.status === "OCCUPIED").length;
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    const isAlert = available <= 1 && total > 0;
    return { total, available, occupied, occupancyRate, isAlert };
  }, [beds]);

  // Floor-by-floor distribution
  const floorStats = useMemo(() => {
    const map: Record<number, { floor: number; totalBeds: number; occupied: number; available: number }> = {};
    beds.forEach((b) => {
      const floor = b.roomId?.wardId?.floor ?? 1;
      if (!map[floor]) {
        map[floor] = { floor, totalBeds: 0, occupied: 0, available: 0 };
      }
      map[floor].totalBeds++;
      if (b.status === "OCCUPIED") map[floor].occupied++;
      else if (b.status === "AVAILABLE") map[floor].available++;
    });
    return Object.values(map).sort((a, b) => a.floor - b.floor);
  }, [beds]);

  if (loading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Ward Executive Dashboard & Census
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Strategic inpatient census analytics, ICU readiness monitoring, and ward occupancy performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
            onClick={() => router.push("/wards/availability")}
          >
            <Layers className="h-4 w-4" />
            Live Bed Board
          </Button>
        </div>
      </div>

      {/* Critical Care Readiness Banner (if low ICU capacity) */}
      {criticalCareStats.isAlert && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 dark:bg-rose-950/40 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold">CRITICAL CARE CAPACITY WARNING: </span>
              <span>
                Only {criticalCareStats.available} of {criticalCareStats.total} ICU/CCU beds currently available (
                {criticalCareStats.occupancyRate}% occupancy).
              </span>
            </div>
          </div>
          <Button
            size="sm"
            variant="destructive"
            className="h-7 text-xs shrink-0"
            onClick={() => router.push("/wards/availability?status=AVAILABLE")}
          >
            View Vacant Beds
          </Button>
        </div>
      )}

      {/* High-Level Executive Census KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Overall Occupancy</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {stats?.occupancyRate || 0}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {stats?.occupiedBeds || 0} of {stats?.totalBeds || 0} beds
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Vacant for Intake</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {stats?.availableBeds || 0}
            </div>
            <div className="text-[10px] text-emerald-600 mt-0.5">Ready for admission</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">ICU / Critical Care</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {criticalCareStats.occupancyRate}%
            </div>
            <div className="text-[10px] text-purple-600 mt-0.5">
              {criticalCareStats.available} beds vacant
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
            <HeartPulse className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Bed Turnover / Cleaning</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {stats?.maintenanceBeds || 0}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Sanitizing in progress</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
            <Wrench className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Ward Performance Comparison */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Ward Capacity & Utilization</CardTitle>
                <CardDescription>Comparative performance across all active hospital wards</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-emerald-600"
                onClick={() => router.push("/wards/occupancy")}
              >
                Full Census →
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(!stats?.wardStats || stats.wardStats.length === 0) ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No ward data available.</p>
                ) : (
                  stats.wardStats.map((w: any) => {
                    const rate = w.occupancyRate || 0;
                    const isCritical = rate >= 85;
                    const isHigh = rate >= 70 && rate < 85;
                    return (
                      <div key={w.wardId} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {w.wardName}
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              Floor {w.floor} • {w.wardType}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 text-[11px]">
                              {w.occupiedBeds} occupied / {w.availableBeds} vacant
                            </span>
                            <span
                              className={`font-mono font-bold ${
                                isCritical
                                  ? "text-rose-600"
                                  : isHigh
                                  ? "text-amber-600"
                                  : "text-emerald-600"
                              }`}
                            >
                              {rate}%
                            </span>
                          </div>
                        </div>

                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCritical
                                ? "bg-rose-500"
                                : isHigh
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, rate)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Floor-by-Floor Capacity Overview */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Floor Distribution Census</CardTitle>
              <CardDescription>Capacity and patient concentration by hospital floor level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {floorStats.map((f) => {
                  const rate = f.totalBeds > 0 ? Math.round((f.occupied / f.totalBeds) * 100) : 0;
                  return (
                    <div
                      key={f.floor}
                      className="p-3 rounded-lg border bg-slate-50/60 dark:bg-slate-800/40 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Floor {f.floor}
                        </span>
                        <Badge variant="outline" className="font-mono text-[9px]">
                          {rate}% Full
                        </Badge>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Total Beds: <span className="font-semibold text-slate-700 dark:text-slate-300">{f.totalBeds}</span>
                      </div>
                      <div className="text-[10px] text-emerald-600">
                        {f.available} Vacant • {f.occupied} Occupied
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Quick Actions & Live Status Breakdown */}
        <div className="space-y-6">
          {/* Quick Action Drawer */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Operations</CardTitle>
              <CardDescription>Direct shortcuts to operational workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between h-10 text-xs font-medium hover:border-teal-400"
                onClick={() => router.push("/wards/allocate")}
              >
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-teal-600" />
                  <span>Allocate Bed to Patient</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between h-10 text-xs font-medium hover:border-purple-400"
                onClick={() => router.push("/wards/transfer")}
              >
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="h-4 w-4 text-purple-600" />
                  <span>Transfer Bed / Room</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between h-10 text-xs font-medium hover:border-emerald-400"
                onClick={() => router.push("/wards/availability")}
              >
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  <span>Open Live Bed Matrix</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between h-10 text-xs font-medium hover:border-blue-400"
                onClick={() => router.push("/wards/beds")}
              >
                <div className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-blue-600" />
                  <span>Manage Beds Inventory</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </CardContent>
          </Card>

          {/* Bed Status Distribution */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Inventory Distribution</CardTitle>
              <CardDescription>Breakdown by bed operational state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-emerald-900 dark:text-emerald-300">Available</span>
                </div>
                <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  {stats?.availableBeds || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="font-semibold text-rose-900 dark:text-rose-300">Occupied</span>
                </div>
                <span className="font-bold font-mono text-rose-700 dark:text-rose-400">
                  {stats?.occupiedBeds || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="font-semibold text-amber-900 dark:text-amber-300">Sanitizing / Maint.</span>
                </div>
                <span className="font-bold font-mono text-amber-700 dark:text-amber-400">
                  {stats?.maintenanceBeds || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="font-semibold text-blue-900 dark:text-blue-300">Reserved</span>
                </div>
                <span className="font-bold font-mono text-blue-700 dark:text-blue-400">
                  {stats?.reservedBeds || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
