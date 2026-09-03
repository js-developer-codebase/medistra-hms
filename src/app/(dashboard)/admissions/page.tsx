"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import {
  Bed,
  Users,
  UserPlus,
  ArrowRightLeft,
  LogOut,
  FileText,
  History,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Building,
  RefreshCw,
  Loader2
} from "lucide-react";

export default function AdmissionsOverviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [recentAdmissions, setRecentAdmissions] = useState<any[]>([]);
  const [recentDischarges, setRecentDischarges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch aggregate stats
      const sRes = await fetch("/api/admission/stats");
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.success) {
          setStats(sData.data);
        }
      }

      // 2. Fetch recent active admissions
      const aRes = await fetch("/api/admission?status=ACTIVE");
      if (aRes.ok) {
        const aData = await aRes.json();
        if (aData.success && Array.isArray(aData.data)) {
          setRecentAdmissions(aData.data.slice(0, 5));
        }
      }

      // 3. Fetch recent discharges
      const dRes = await fetch("/api/admission?status=DISCHARGED");
      if (dRes.ok) {
        const dData = await dRes.json();
        if (dData.success && Array.isArray(dData.data)) {
          setRecentDischarges(dData.data.slice(0, 5));
        }
      }
    } catch (err) {
      toast("Failed to load admissions dashboard data", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getDurationText = (admissionDate: string, dischargeDate?: string) => {
    const start = new Date(admissionDate).getTime();
    const end = dischargeDate ? new Date(dischargeDate).getTime() : Date.now();
    const diffHours = Math.max(0, Math.floor((end - start) / (1000 * 60 * 60)));
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;
    if (days === 0) return `${hours} hrs`;
    return `${days}d ${hours}h`;
  };

  const getConditionBadgeColor = (condition?: string) => {
    switch (condition) {
      case "RECOVERED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300";
      case "IMPROVED":
      case "STABLE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-300";
      case "TRANSFERRED":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-300";
      case "LAMA":
      case "ON_REQUEST":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300";
      case "DECEASED":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const submenus = [
    {
      title: "New Admission",
      description: "Admit a new patient to an available bed",
      icon: UserPlus,
      href: "/admissions/new",
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    },
    {
      title: "Current Admissions",
      description: "Manage currently admitted patients",
      icon: Bed,
      href: "/admissions/current",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      badge: stats?.activeCount ? `${stats.activeCount} Active` : undefined
    },
    {
      title: "Patient Transfer",
      description: "Transfer patient between beds/wards/doctors",
      icon: ArrowRightLeft,
      href: "/admissions/transfer",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
    },
    {
      title: "Discharge Patient",
      description: "Process clinical patient discharge",
      icon: LogOut,
      href: "/admissions/discharge",
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
    },
    {
      title: "Discharge Summary",
      description: "Generate and print official discharge documents",
      icon: FileText,
      href: "/admissions/summary",
      color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
    },
    {
      title: "Discharge History",
      description: "Complete archive of discharged patients",
      icon: History,
      href: "/admissions/discharge-history",
      color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
      badge: stats?.dischargedCount ? `${stats.dischargedCount} Total` : undefined
    },
    {
      title: "Admission History",
      description: "All historical inpatient admission logs",
      icon: Clock,
      href: "/admissions/history",
      color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
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
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bed className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            Admissions & Discharge Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Inpatient department command center, bed occupancy analytics, and clinical patient workflows.
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
            onClick={() => router.push("/admissions/new")}
          >
            <UserPlus className="h-4 w-4" />
            New Admission
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Inpatients */}
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Active Inpatients
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.activeCount ?? 0}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <Activity className="h-3 w-3 text-emerald-500" />
              Currently occupying beds
            </p>
          </CardContent>
        </Card>

        {/* Bed Occupancy Rate */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Bed Occupancy
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.occupancyRate ?? 0}%
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, stats?.occupancyRate || 0)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {stats?.availableBeds ?? 0} beds available of {stats?.totalBeds ?? 0}
            </p>
          </CardContent>
        </Card>

        {/* Today's Admissions */}
        <Card className="border-l-4 border-l-indigo-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Admitted Today
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UserPlus className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.admittedToday ?? 0}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-indigo-500" />
              New admissions processed today
            </p>
          </CardContent>
        </Card>

        {/* Today's Discharges */}
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Discharged Today
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.dischargedToday ?? 0}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-500" />
              Avg length of stay: {stats?.avgStayDays ?? 0} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Submenus Quick Navigation */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-3">
          Admissions & Discharge Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {submenus.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/50 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-lg border ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="text-[11px] font-semibold">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Recent Inpatients & Recent Discharges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inpatients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent Inpatients</CardTitle>
              <CardDescription>Currently admitted to hospital beds</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-emerald-600 hover:text-emerald-700"
              onClick={() => router.push("/admissions/current")}
            >
              View All →
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Patient</TableHead>
                    <TableHead className="text-xs">Bed / Ward</TableHead>
                    <TableHead className="text-xs">Stay</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAdmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-500 text-xs py-8">
                        No active inpatients currently.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentAdmissions.map((adm) => (
                      <TableRow key={adm._id} className="text-xs">
                        <TableCell>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {adm.patientId?.name || "Unknown Patient"}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {adm.patientId?.uhid || adm.patientId?.contact || "No UHID"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            Bed {adm.bedId?.bedNumber || "N/A"}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {adm.bedId?.roomId?.wardId?.wardName || adm.bedId?.roomId?.roomNumber || "General"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {getDurationText(adm.admissionDate)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[11px]"
                              onClick={() => router.push(`/admissions/transfer?admissionId=${adm._id}`)}
                            >
                              Transfer
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 px-2 text-[11px]"
                              onClick={() => router.push(`/admissions/discharge?admissionId=${adm._id}`)}
                            >
                              Discharge
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Discharges */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent Discharges</CardTitle>
              <CardDescription>Patients discharged with outcomes</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-emerald-600 hover:text-emerald-700"
              onClick={() => router.push("/admissions/discharge-history")}
            >
              View All →
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Patient</TableHead>
                    <TableHead className="text-xs">Outcome</TableHead>
                    <TableHead className="text-xs">Discharged At</TableHead>
                    <TableHead className="text-xs text-right">Summary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDischarges.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-500 text-xs py-8">
                        No recent discharges recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentDischarges.map((adm) => (
                      <TableRow key={adm._id} className="text-xs">
                        <TableCell>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {adm.patientId?.name || "Unknown Patient"}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Dr. {adm.doctorId?.name || "Attending"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[10px] border ${getConditionBadgeColor(adm.dischargeCondition)}`}
                          >
                            {adm.dischargeCondition || "DISCHARGED"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500 text-[11px]">
                          {adm.dischargeDate ? new Date(adm.dischargeDate).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-[11px]"
                            onClick={() => router.push(`/admissions/summary?id=${adm._id}`)}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Summary
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
