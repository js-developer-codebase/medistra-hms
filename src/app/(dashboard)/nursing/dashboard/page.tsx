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
  Users,
  Activity,
  Pill,
  Droplets,
  ClipboardCheck,
  ArrowLeftRight,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Calendar,
  FileText
} from "lucide-react";

export default function NursingDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <NursingDashboardContent />
    </Suspense>
  );
}

function NursingDashboardContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [inpatients, setInpatients] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [meds, setMeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [statsRes, patientsRes, tasksRes, medsRes] = await Promise.all([
        fetch("/api/nursing/stats"),
        fetch("/api/nursing/my-patients"),
        fetch("/api/nursing/tasks"),
        fetch("/api/nursing/medications")
      ]);

      const [statsData, patientsData, tasksData, medsData] = await Promise.all([
        statsRes.json(),
        patientsRes.json(),
        tasksRes.json(),
        medsRes.json()
      ]);

      if (statsData.success) setStats(statsData.data);
      if (patientsData.success) setInpatients(patientsData.data || []);
      if (tasksData.success) setTasks(tasksData.data || []);
      if (medsData.success) setMeds(medsData.data || []);
    } catch (err) {
      toast("Failed to load nursing dashboard data", "error");
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

  const pendingTasks = useMemo(() => {
    return tasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS");
  }, [tasks]);

  const dueMeds = useMemo(() => {
    return meds.filter((m) => m.status === "PENDING");
  }, [meds]);

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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-2">
            <Activity className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
            Ward Active Duty Roster
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            Nursing Station & Ward Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time inpatient census, bedside nursing tasks, medication schedules, and clinical handover coordination.
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
            onClick={() => router.push("/nursing/handover")}
          >
            <ArrowLeftRight className="h-4 w-4" />
            Shift Handover (SBAR)
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Inpatients under Care</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {inpatients.length}
            </div>
            <div className="text-[10px] text-emerald-600 mt-0.5 font-medium">Occupying Ward Beds</div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Due Medications</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {dueMeds.length}
            </div>
            <div className="text-[10px] text-purple-600 mt-0.5 font-medium">Pending Administration</div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
            <Pill className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Pending Bedside Tasks</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {pendingTasks.length}
            </div>
            <div className="text-[10px] text-amber-600 mt-0.5 font-medium">Dressings, Lines & Care</div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
            <ClipboardCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Active Care Plans</div>
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
              {stats?.activeCarePlans || 0}
            </div>
            <div className="text-[10px] text-teal-600 mt-0.5 font-medium">NANDA Interventions</div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
            <HeartPulse className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Inpatient Census & Task Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inpatients Table (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Ward Inpatient Roster</CardTitle>
                <CardDescription>
                  Bed-allocated inpatients currently monitored by the nursing station
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => router.push("/nursing/patients")}
              >
                View Details
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inpatients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500 py-12 text-xs">
                          No active admitted patients found in wards.
                        </TableCell>
                      </TableRow>
                    ) : (
                      inpatients.map((p) => (
                        <TableRow key={p.admissionId} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <TableCell>
                            <div className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                              Bed {p.bedNumber}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {p.wardName} (Rm {p.roomNumber})
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

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700"
                                onClick={() => router.push(`/nursing/vitals?patientId=${p.patientId}`)}
                              >
                                Vitals
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-purple-600 hover:text-purple-700"
                                onClick={() => router.push(`/nursing/medications?patientId=${p.patientId}`)}
                              >
                                Meds
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-cyan-600 hover:text-cyan-700"
                                onClick={() => router.push(`/nursing/notes?patientId=${p.patientId}`)}
                              >
                                Note
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

          {/* Quick Action Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto p-3 flex flex-col items-center gap-1 text-center justify-center border-dashed"
              onClick={() => router.push("/nursing/vitals")}
            >
              <HeartPulse className="h-5 w-5 text-rose-600 mb-1" />
              <span className="font-semibold text-xs">Record Vitals</span>
              <span className="text-[10px] text-slate-400">Log patient BP/Pulse</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-3 flex flex-col items-center gap-1 text-center justify-center border-dashed"
              onClick={() => router.push("/nursing/medications")}
            >
              <Pill className="h-5 w-5 text-purple-600 mb-1" />
              <span className="font-semibold text-xs">eMAR Admin</span>
              <span className="text-[10px] text-slate-400">Give scheduled drugs</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-3 flex flex-col items-center gap-1 text-center justify-center border-dashed"
              onClick={() => router.push("/nursing/intake-output")}
            >
              <Droplets className="h-5 w-5 text-sky-600 mb-1" />
              <span className="font-semibold text-xs">I/O Chart</span>
              <span className="text-[10px] text-slate-400">Fluid balance sheet</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-3 flex flex-col items-center gap-1 text-center justify-center border-dashed"
              onClick={() => router.push("/nursing/tasks")}
            >
              <ClipboardCheck className="h-5 w-5 text-amber-600 mb-1" />
              <span className="font-semibold text-xs">Nursing Tasks</span>
              <span className="text-[10px] text-slate-400">Ward procedures</span>
            </Button>
          </div>
        </div>

        {/* Sidebar: Pending Tasks & Due Meds (1 Col) */}
        <div className="space-y-4">
          {/* Due Medications Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Pill className="h-4 w-4 text-purple-600" />
                  Due Medications ({dueMeds.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Pending doses requiring administration
                </CardDescription>
              </div>
              <Link href="/nursing/medications" className="text-xs text-purple-600 font-semibold hover:underline">
                View eMAR
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {dueMeds.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                    All scheduled medications up to date.
                  </div>
                ) : (
                  dueMeds.slice(0, 4).map((m) => (
                    <div
                      key={m._id}
                      className="p-2.5 rounded-lg border bg-purple-50/40 dark:bg-purple-950/20 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {m.medicationName} ({m.dosage})
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Pt: {m.patient?.name} • Route: {m.route}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] border-purple-300 text-purple-700">
                        {new Date(m.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <ClipboardCheck className="h-4 w-4 text-amber-600" />
                  Bedside Tasks ({pendingTasks.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Ward procedures scheduled for this shift
                </CardDescription>
              </div>
              <Link href="/nursing/tasks" className="text-xs text-amber-600 font-semibold hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                    No pending nursing procedures.
                  </div>
                ) : (
                  pendingTasks.slice(0, 4).map((t) => (
                    <div
                      key={t._id}
                      className="p-2.5 rounded-lg border bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {t.taskName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Pt: {t.patient?.name} • {t.category}
                        </div>
                      </div>
                      <Badge
                        className={
                          t.priority === "STAT"
                            ? "bg-rose-100 text-rose-800 text-[10px]"
                            : "bg-amber-100 text-amber-800 text-[10px]"
                        }
                      >
                        {t.priority}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
