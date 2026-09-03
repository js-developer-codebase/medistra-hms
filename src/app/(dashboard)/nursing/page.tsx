"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import {
  HeartPulse,
  LayoutDashboard,
  Users,
  Activity,
  FileText,
  Crosshair,
  Pill,
  Droplets,
  ClipboardCheck,
  ArrowLeftRight,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  AlertTriangle,
  Clock,
  Loader2,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";

export default function NursingHubPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <NursingHubContent />
    </Suspense>
  );
}

function NursingHubContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [inpatients, setInpatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [statsRes, patientsRes] = await Promise.all([
        fetch("/api/nursing/stats"),
        fetch("/api/nursing/my-patients")
      ]);

      const [statsData, patientsData] = await Promise.all([
        statsRes.json(),
        patientsRes.json()
      ]);

      if (statsData.success) setStats(statsData.data);
      if (patientsData.success) setInpatients(patientsData.data || []);
    } catch (err) {
      toast("Failed to load nursing operations data", "error");
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

  const submodules = [
    {
      title: "Nursing Dashboard",
      description: "Shift overview, ward census, and clinical action shortcuts",
      href: "/nursing/dashboard",
      icon: LayoutDashboard,
      badge: "Overview",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
      accent: "border-l-blue-500 hover:border-blue-500"
    },
    {
      title: "My Inpatients",
      description: "Admitted ward patient roster with bed allocation & doctor notes",
      href: "/nursing/patients",
      icon: Users,
      badge: `${stats?.totalInpatients || 0} Admitted`,
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
      accent: "border-l-emerald-500 hover:border-emerald-500"
    },
    {
      title: "Bedside Vital Signs",
      description: "Rapid vital entry, abnormal range alerts, and physiological logs",
      href: "/nursing/vitals",
      icon: HeartPulse,
      badge: "Live Monitor",
      badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
      accent: "border-l-rose-500 hover:border-rose-500"
    },
    {
      title: "Nursing Notes",
      description: "DAR (Data, Action, Response) and SOAP bedside observation notes",
      href: "/nursing/notes",
      icon: FileText,
      badge: "Clinical Progress",
      badgeColor: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
      accent: "border-l-cyan-500 hover:border-cyan-500"
    },
    {
      title: "Nursing Care Plans",
      description: "NANDA-style care plans, goals of care, and outcome evaluation",
      href: "/nursing/plans",
      icon: Crosshair,
      badge: `${stats?.activeCarePlans || 0} Active`,
      badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
      accent: "border-l-teal-500 hover:border-teal-500"
    },
    {
      title: "Medication Administration",
      description: "eMAR medication schedule, bedside dose administration, and sign-offs",
      href: "/nursing/medications",
      icon: Pill,
      badge: `${stats?.pendingMedications || 0} Due`,
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
      accent: "border-l-purple-500 hover:border-purple-500"
    },
    {
      title: "Intake & Output Charting",
      description: "24-hour fluid balance recording (Oral/IV fluids vs Urine/Drains)",
      href: "/nursing/intake-output",
      icon: Droplets,
      badge: "Fluid Balance",
      badgeColor: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
      accent: "border-l-sky-500 hover:border-sky-500"
    },
    {
      title: "Bedside Nursing Tasks",
      description: "Wound dressings, catheter care, IV line changes, and doctor orders",
      href: "/nursing/tasks",
      icon: ClipboardCheck,
      badge: `${stats?.pendingTasks || 0} Pending`,
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
      accent: "border-l-amber-500 hover:border-amber-500"
    },
    {
      title: "Shift Handover (SBAR)",
      description: "Structured Situation-Background-Assessment-Recommendation handoffs",
      href: "/nursing/handover",
      icon: ArrowLeftRight,
      badge: `${stats?.recentHandovers || 0} Logs`,
      badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
      accent: "border-l-indigo-500 hover:border-indigo-500"
    },
    {
      title: "Shift Management",
      description: "Nurse duty roster, shift schedule (Morning, Evening, Night), and wards",
      href: "/nursing/shifts",
      icon: Calendar,
      badge: `${stats?.activeShifts || 0} Shifts`,
      badgeColor: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
      accent: "border-l-slate-500 hover:border-slate-500"
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
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <HeartPulse className="h-7 w-7 text-rose-600 dark:text-rose-400" />
            Nursing Operations Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Comprehensive inpatient ward care, bedside vitals monitoring, eMAR medication tracking, and shift coordination.
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
            onClick={() => router.push("/nursing/patients")}
          >
            <Users className="h-4 w-4" />
            View Inpatients ({inpatients.length})
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Total Inpatients</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {stats?.totalInpatients || 0}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">Currently Admitted</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Medications Due</span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">
            {stats?.pendingMedications || 0}
          </span>
          <span className="text-[10px] text-purple-600 font-medium">Pending eMAR Doses</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Nursing Tasks</span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {stats?.pendingTasks || 0}
          </span>
          <span className="text-[10px] text-amber-600 font-medium">Bedside Procedures</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Care Plans</span>
          <span className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1 block">
            {stats?.activeCarePlans || 0}
          </span>
          <span className="text-[10px] text-teal-600 font-medium">Active Pathways</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Active Shifts</span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">
            {stats?.activeShifts || 0}
          </span>
          <span className="text-[10px] text-blue-600 font-medium">Nurses on Duty</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Shift Handovers</span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
            {stats?.recentHandovers || 0}
          </span>
          <span className="text-[10px] text-indigo-600 font-medium">SBAR Logs</span>
        </div>
      </div>

      {/* Submodule Launchpad Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Nursing Workstations & Clinical Submodules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {submodules.map((sub, idx) => {
            const Icon = sub.icon;
            return (
              <Link key={idx} href={sub.href}>
                <div
                  className={`p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md hover:scale-[1.01] border-l-4 ${sub.accent} flex flex-col justify-between h-full`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge className={`text-[10px] ${sub.badgeColor}`}>
                        {sub.badge}
                      </Badge>
                    </div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {sub.title}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {sub.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Open Workstation</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Currently Admitted Ward Inpatients Preview */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Currently Admitted Inpatients</CardTitle>
            <CardDescription>
              Active inpatients under ward nursing care ({inpatients.length} patients)
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => router.push("/nursing/patients")}
          >
            Manage All Inpatients
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bed & Ward</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Admitting Diagnosis</TableHead>
                  <TableHead>Attending Doctor</TableHead>
                  <TableHead>Allergies</TableHead>
                  <TableHead className="text-right">Quick Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inpatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-12 text-xs">
                      No active inpatients currently admitted in wards.
                    </TableCell>
                  </TableRow>
                ) : (
                  inpatients.slice(0, 5).map((p) => (
                    <TableRow key={p.admissionId} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                          Bed {p.bedNumber}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {p.wardName} (Room {p.roomNumber})
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {p.uhid} • {p.gender}, {p.age}y
                        </div>
                      </TableCell>

                      <TableCell className="font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">
                        {p.diagnosis}
                      </TableCell>

                      <TableCell className="font-medium">
                        {p.doctorName}
                      </TableCell>

                      <TableCell>
                        {p.allergies && p.allergies.length > 0 ? (
                          <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-300">
                            <ShieldAlert className="h-3 w-3 mr-1" />
                            {p.allergies.join(", ")}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No known allergies</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                            onClick={() => router.push(`/nursing/vitals?patientId=${p.patientId}`)}
                          >
                            <HeartPulse className="h-3.5 w-3.5 mr-1" />
                            Vitals
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs text-purple-600 border-purple-200 hover:bg-purple-50"
                            onClick={() => router.push(`/nursing/medications?patientId=${p.patientId}`)}
                          >
                            <Pill className="h-3.5 w-3.5 mr-1" />
                            eMAR
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
    </div>
  );
}
