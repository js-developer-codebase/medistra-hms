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
  Building,
  DoorOpen,
  BedDouble,
  Activity,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Loader2,
  BarChart3,
  Calendar
} from "lucide-react";

export default function WardsOperationsHubPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/ward/stats");
      const data = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
      } else {
        toast(data.message || "Failed to load ward statistics", "error");
      }
    } catch (err) {
      toast("An error occurred while loading ward metrics", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const SUBMODULES = [
    {
      title: "Wards Directory",
      description: "Manage hospital wards, floor mapping, and capacity.",
      href: "/wards/list",
      icon: Building,
      color: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
      badge: `${stats?.totalWards || 0} Wards`
    },
    {
      title: "Rooms Directory",
      description: "Configure room units, room categories, and ward assignments.",
      href: "/wards/rooms",
      icon: DoorOpen,
      color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
      badge: `${stats?.totalRooms || 0} Rooms`
    },
    {
      title: "Beds Inventory",
      description: "Complete bed inventory with bed types, rates, and active states.",
      href: "/wards/beds",
      icon: BedDouble,
      color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
      badge: `${stats?.totalBeds || 0} Total Beds`
    },
    {
      title: "Bed Allocation",
      description: "Allocate and assign available hospital beds to waiting inpatients.",
      href: "/wards/allocate",
      icon: Plus,
      color: "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
      badge: "Allocation Station"
    },
    {
      title: "Bed Transfer",
      description: "Transfer patients between rooms, wards, and service levels.",
      href: "/wards/transfer",
      icon: ArrowRightLeft,
      color: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
      badge: "Fast Transfer"
    },
    {
      title: "Bed Occupancy",
      description: "Ward-by-ward census, occupancy heatmaps, and length of stay.",
      href: "/wards/occupancy",
      icon: Activity,
      color: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
      badge: `${stats?.occupancyRate || 0}% Occupied`
    },
    {
      title: "Live Bed Board",
      description: "Real-time visual matrix of all beds, color-coded by current status.",
      href: "/wards/availability",
      icon: Layers,
      color: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300",
      badge: `${stats?.availableBeds || 0} Available`
    },
    {
      title: "Ward Dashboard",
      description: "Executive census analytics, ICU readiness alerts, and capacity gauge.",
      href: "/wards/dashboard",
      icon: BarChart3,
      color: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
      badge: "Census Hub"
    }
  ];

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
            <Building className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Ward & Bed Operations Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time management of hospital wards, room allocation, bed turn-around, and inpatient census.
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
            onClick={() => router.push("/wards/beds")}
          >
            <Plus className="h-4 w-4" />
            Manage Beds
          </Button>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Wards */}
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Wards</span>
            <Building className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {stats?.totalWards || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Across {stats?.totalRooms || 0} rooms
          </div>
        </div>

        {/* Total Beds */}
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Total Beds</span>
            <BedDouble className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {stats?.totalBeds || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Full hospital capacity</div>
        </div>

        {/* Occupancy Rate */}
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Occupancy</span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {stats?.occupancyRate || 0}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {stats?.occupiedBeds || 0} currently occupied
          </div>
        </div>

        {/* Available Beds */}
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Available</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {stats?.availableBeds || 0}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
            Ready for admission
          </div>
        </div>

        {/* Occupied Inpatients */}
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Occupied</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {stats?.occupiedBeds || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Inpatient census</div>
        </div>

        {/* Maintenance / Cleaning */}
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Maintenance</span>
            <Wrench className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            {(stats?.maintenanceBeds || 0) + (stats?.blockedBeds || 0)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Sanitizing / offline</div>
        </div>
      </div>

      {/* Navigation Submodules Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Ward & Bed Management Submodules
          </h2>
          <span className="text-xs text-slate-500">8 Modules Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SUBMODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Card
                key={mod.href}
                className="group hover:border-emerald-500/50 hover:shadow-md transition-all duration-200 cursor-pointer border relative overflow-hidden"
                onClick={() => router.push(mod.href)}
              >
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                  <div className={`p-2 rounded-lg ${mod.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-medium font-mono">
                    {mod.badge}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {mod.title}
                    </CardTitle>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <CardDescription className="text-xs mt-1 text-slate-500 dark:text-slate-400 line-clamp-2">
                    {mod.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Real-time Ward Capacity & Status Breakdown Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold">Ward Capacity & Occupancy Breakdown</CardTitle>
            <CardDescription>
              Live operational status, room counts, and occupancy percentages across all facility wards.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-emerald-600 hover:text-emerald-700"
            onClick={() => router.push("/wards/occupancy")}
          >
            Detailed Occupancy Analysis →
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ward Name & Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead className="text-center">Rooms</TableHead>
                  <TableHead className="text-center">Total Beds</TableHead>
                  <TableHead className="text-center">Occupied</TableHead>
                  <TableHead className="text-center">Available</TableHead>
                  <TableHead className="w-48">Occupancy Rate</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!stats?.wardStats || stats.wardStats.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-slate-500 py-12 text-xs">
                      No ward records found in system.
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.wardStats.map((w: any) => {
                    const rate = w.occupancyRate || 0;
                    const isCritical = rate >= 85;
                    const isHigh = rate >= 70 && rate < 85;
                    return (
                      <TableRow key={w.wardId} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <TableCell>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {w.wardName}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {w.wardCode}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {w.wardType}
                          </Badge>
                        </TableCell>

                        <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                          Floor {w.floor}
                        </TableCell>

                        <TableCell className="text-center font-mono font-medium">
                          {w.totalRooms}
                        </TableCell>

                        <TableCell className="text-center font-mono font-bold">
                          {w.totalBeds}
                        </TableCell>

                        <TableCell className="text-center font-mono font-semibold text-amber-600">
                          {w.occupiedBeds}
                        </TableCell>

                        <TableCell className="text-center font-mono font-semibold text-emerald-600">
                          {w.availableBeds}
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span
                                className={
                                  isCritical
                                    ? "text-rose-600 font-bold"
                                    : isHigh
                                    ? "text-amber-600 font-semibold"
                                    : "text-emerald-600 font-medium"
                                }
                              >
                                {rate}%
                              </span>
                              <span className="text-slate-400 text-[10px]">
                                {w.occupiedBeds}/{w.totalBeds}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
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
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-emerald-600 hover:text-emerald-700"
                            onClick={() => router.push(`/wards/availability`)}
                          >
                            View Board →
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
