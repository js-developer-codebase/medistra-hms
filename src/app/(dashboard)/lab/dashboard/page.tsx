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
  FlaskConical,
  TestTube2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Zap,
  ArrowRight,
  RefreshCw,
  Loader2,
  BarChart3,
  Microscope,
  Dna,
  ShieldAlert
} from "lucide-react";

export default function LaboratoryDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <LaboratoryDashboardContent />
    </Suspense>
  );
}

function LaboratoryDashboardContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch("/api/lab/stats"),
        fetch("/api/lab/orders")
      ]);

      const [statsData, ordersData] = await Promise.all([
        statsRes.json(),
        ordersRes.json()
      ]);

      if (statsData.success) setStats(statsData.data);
      if (ordersData.success) setOrders(ordersData.data || []);
    } catch (err) {
      toast("Failed to load laboratory analytics", "error");
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

  // Urgent / STAT priority orders
  const statOrders = useMemo(() => {
    return orders.filter(
      (o) => (o.priority === "STAT" || o.priority === "Urgent") && o.status !== "Completed"
    );
  }, [orders]);

  // Stage pipeline breakdown
  const stages = useMemo(() => {
    const total = orders.length || 1;
    const pending = orders.filter((o) => o.status === "Pending").length;
    const collected = orders.filter((o) => o.status === "Sample Collected").length;
    const processing = orders.filter((o) => o.status === "Processing").length;
    const completed = orders.filter((o) => o.status === "Completed").length;

    return {
      pending: { count: pending, percent: Math.round((pending / total) * 100) },
      collected: { count: collected, percent: Math.round((collected / total) * 100) },
      processing: { count: processing, percent: Math.round((processing / total) * 100) },
      completed: { count: completed, percent: Math.round((completed / total) * 100) }
    };
  }, [orders]);

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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-2">
            <Activity className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
            Live Diagnostic Operations
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Laboratory Executive Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time specimen throughput, turnaround time (TAT) tracking, STAT priority queues, and quality control.
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
            onClick={() => router.push("/lab/orders")}
          >
            <TestTube2 className="h-4 w-4" />
            Order Workstation
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Active Test Requisitions</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {orders.length}
            </div>
            <div className="text-[10px] text-indigo-600 mt-0.5 font-medium">Total registered orders</div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
            <FlaskConical className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">STAT / Urgent Requisitions</div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {statOrders.length}
            </div>
            <div className="text-[10px] text-rose-600 mt-0.5 font-medium">Fast-track TAT required</div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
            <Zap className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">In Bench Processing</div>
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
              {stats?.processing || 0}
            </div>
            <div className="text-[10px] text-cyan-600 mt-0.5 font-medium">Analyzers & cultures active</div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 flex items-center justify-center">
            <Microscope className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Certified Diagnostic Reports</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {stats?.completed || 0}
            </div>
            <div className="text-[10px] text-emerald-600 mt-0.5 font-medium">Verified & released</div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Throughput Pipeline Progression */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Laboratory Diagnostic Pipeline</CardTitle>
          <CardDescription>
            Current distribution of specimen across workflow milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link href="/lab/pending" className="block p-3 rounded-lg border bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-400 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-amber-800 dark:text-amber-300">1. Pending Sample</span>
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-xl font-bold text-amber-900 dark:text-amber-100">
                {stages.pending.count} orders
              </div>
              <div className="text-[10px] text-amber-600 mt-0.5">{stages.pending.percent}% of pipeline</div>
            </Link>

            <Link href="/lab/collection" className="block p-3 rounded-lg border bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-400 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-rose-800 dark:text-rose-300">2. Sample Collected</span>
                <TestTube2 className="h-4 w-4 text-rose-600" />
              </div>
              <div className="text-xl font-bold text-rose-900 dark:text-rose-100">
                {stages.collected.count} orders
              </div>
              <div className="text-[10px] text-rose-600 mt-0.5">{stages.collected.percent}% of pipeline</div>
            </Link>

            <Link href="/lab/processing" className="block p-3 rounded-lg border bg-cyan-50/40 dark:bg-cyan-950/20 hover:border-cyan-400 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-cyan-800 dark:text-cyan-300">3. In Processing</span>
                <Microscope className="h-4 w-4 text-cyan-600" />
              </div>
              <div className="text-xl font-bold text-cyan-900 dark:text-cyan-100">
                {stages.processing.count} orders
              </div>
              <div className="text-[10px] text-cyan-600 mt-0.5">{stages.processing.percent}% of pipeline</div>
            </Link>

            <Link href="/lab/reports" className="block p-3 rounded-lg border bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-400 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300">4. Certified Reports</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                {stages.completed.count} reports
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">{stages.completed.percent}% of pipeline</div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: STAT Orders & Department Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* STAT & Urgent Orders Queue (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-rose-600" />
                  STAT & Urgent Triage Worklist
                </CardTitle>
                <CardDescription>
                  High-priority specimens requiring expedited turnaround and immediate reporting
                </CardDescription>
              </div>
              <Badge className="bg-rose-100 text-rose-800 text-xs">
                {statOrders.length} Urgent Due
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Barcode / Time</TableHead>
                      <TableHead>Patient Particulars</TableHead>
                      <TableHead>Ordered Tests</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-500 py-10 text-xs">
                          <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                          No pending STAT or urgent specimens in queue.
                        </TableCell>
                      </TableRow>
                    ) : (
                      statOrders.map((o) => (
                        <TableRow key={o._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <TableCell>
                            <div className="font-bold font-mono text-slate-900 dark:text-white">
                              {o.barcode || `LB-${o._id.slice(-6).toUpperCase()}`}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(o.orderDate || o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {o.patient?.name || "Patient"}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {o.patient?.uhid}
                            </div>
                          </TableCell>

                          <TableCell className="max-w-xs truncate font-medium">
                            {o.tests && o.tests.length > 0
                              ? o.tests.map((t: any) => t.name).join(", ")
                              : "Laboratory Panel"}
                          </TableCell>

                          <TableCell>
                            <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-[10px]">
                              {o.priority}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {o.status}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white"
                              onClick={() => {
                                if (o.status === "Pending") router.push(`/lab/collection?orderId=${o._id}`);
                                else if (o.status === "Sample Collected") router.push(`/lab/processing?orderId=${o._id}`);
                                else router.push(`/lab/results?orderId=${o._id}`);
                              }}
                            >
                              Fast Track
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

        {/* Department Breakdown & TAT Metrics (1 Col) */}
        <div className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-indigo-600" />
                Target Turnaround Times (TAT)
              </CardTitle>
              <CardDescription className="text-xs">
                Clinical laboratory SLA benchmarks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">STAT Priority SLA</div>
                  <div className="text-[10px] text-slate-400">Emergency & Critical Care</div>
                </div>
                <Badge className="bg-rose-100 text-rose-800">&lt; 45 Minutes</Badge>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Urgent Priority SLA</div>
                  <div className="text-[10px] text-slate-400">Inpatient Ward Panels</div>
                </div>
                <Badge className="bg-amber-100 text-amber-800">&lt; 2 Hours</Badge>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Routine Requisition SLA</div>
                  <div className="text-[10px] text-slate-400">Outpatient & Health Checks</div>
                </div>
                <Badge className="bg-slate-100 text-slate-800">&lt; 6 Hours</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Dna className="h-4 w-4 text-purple-600" />
                Diagnostic Disciplines
              </CardTitle>
              <CardDescription className="text-xs">
                Active laboratory analyzer benches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <span className="font-medium">Hematology & Coagulation</span>
                <Badge variant="outline">Automated CBC & PT/INR</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <span className="font-medium">Clinical Biochemistry</span>
                <Badge variant="outline">LFT, KFT, Electrolytes</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <span className="font-medium">Microbiology & Serology</span>
                <Badge variant="outline">Cultures, HIV, Hepatitis</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <span className="font-medium">Histopathology & Cytology</span>
                <Badge variant="outline">Biopsies, Pap Smear</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
