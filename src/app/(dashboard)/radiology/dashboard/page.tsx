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
  Scan,
  Zap,
  Activity,
  CheckCircle2,
  RefreshCw,
  Loader2,
  BarChart3,
  Layers,
  Images,
  Radio,
  FileCheck2,
  ShieldAlert
} from "lucide-react";

export default function RadiologyDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <RadiologyDashboardContent />
    </Suspense>
  );
}

function RadiologyDashboardContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch("/api/radiology/stats"),
        fetch("/api/radiology/orders")
      ]);

      const [statsData, ordersData] = await Promise.all([
        statsRes.json(),
        ordersRes.json()
      ]);

      if (statsData.success) setStats(statsData.data);
      if (ordersData.success) setOrders(ordersData.data || []);
    } catch (err) {
      toast("Failed to load radiology executive metrics", "error");
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

  const statOrders = useMemo(() => {
    return orders.filter(
      (o) => (o.priority === "STAT" || o.priority === "URGENT") && o.status !== "COMPLETED"
    );
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
            <Radio className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
            Live Diagnostic Imaging Grid
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Scan className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Radiology Executive Analytics & Command
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time scanner throughput, turnaround times (TAT), emergency STAT queues, and radiation safety metrics.
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
            onClick={() => router.push("/radiology/worklist")}
          >
            <Layers className="h-4 w-4" />
            Open Worklist
          </Button>
        </div>
      </div>

      {/* Modality Volume Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Digital Radiography (X-Ray)</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {stats?.modalities?.xray || 0} Scans
            </div>
            <div className="text-[10px] text-indigo-600 mt-0.5 font-medium">Standard Skeletal & Chest</div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
            <Scan className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Computed Tomography (CT)</div>
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
              {stats?.modalities?.ct || 0} Scans
            </div>
            <div className="text-[10px] text-cyan-600 mt-0.5 font-medium">128-Slice Volumetric</div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 flex items-center justify-center">
            <Radio className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Magnetic Resonance (MRI)</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {stats?.modalities?.mri || 0} Scans
            </div>
            <div className="text-[10px] text-purple-600 mt-0.5 font-medium">3.0 Tesla High-Res</div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Diagnostic Ultrasound (USG)</div>
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
              {stats?.modalities?.usg || 0} Scans
            </div>
            <div className="text-[10px] text-teal-600 mt-0.5 font-medium">Doppler & Abdominal</div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
            <Activity className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: STAT Queue & SLAs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* STAT & Urgent Emergency Queue (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-rose-600" />
                  Emergency STAT & Urgent Imaging Queue
                </CardTitle>
                <CardDescription>
                  Trauma, Stroke Protocol, and ICU requisitions requiring immediate acquisition and read
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
                      <TableHead>Accession #</TableHead>
                      <TableHead>Patient Particulars</TableHead>
                      <TableHead>Modality & Study</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-500 py-10 text-xs">
                          <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                          No pending emergency STAT scans in queue. All clear!
                        </TableCell>
                      </TableRow>
                    ) : (
                      statOrders.map((o) => (
                        <TableRow key={o._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                            {o.accessionNumber || `RAD-${o._id.slice(-6).toUpperCase()}`}
                          </TableCell>

                          <TableCell>
                            <div className="font-semibold">{o.patient?.name || "Patient"}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{o.patient?.uhid}</div>
                          </TableCell>

                          <TableCell>
                            <span className="font-semibold text-slate-900 dark:text-white block">
                              {o.studyType}
                            </span>
                            <span className="text-[10px] text-slate-400">{o.modality} • {o.bodyPart}</span>
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
                              onClick={() => router.push(`/radiology/worklist`)}
                            >
                              Fast Track Scan
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

        {/* SLAs & Quality Benchmarks (1 Col) */}
        <div className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-indigo-600" />
                Target Turnaround Times (TAT)
              </CardTitle>
              <CardDescription className="text-xs">
                Clinical radiology SLA commitments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">STAT / Emergency SLA</div>
                  <div className="text-[10px] text-slate-400">Trauma & Acute Resuscitation</div>
                </div>
                <Badge className="bg-rose-100 text-rose-800">&lt; 30 Minutes</Badge>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Inpatient Ward SLA</div>
                  <div className="text-[10px] text-slate-400">Routine Inpatient Scans</div>
                </div>
                <Badge className="bg-amber-100 text-amber-800">&lt; 2 Hours</Badge>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Outpatient Health Check</div>
                  <div className="text-[10px] text-slate-400">Elective & Screenings</div>
                </div>
                <Badge className="bg-slate-100 text-slate-800">&lt; 6 Hours</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-emerald-600" />
                Radiation Safety & Compliance
              </CardTitle>
              <CardDescription className="text-xs">
                ALARA radiation safety protocols
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <span className="font-medium">Lead Shielding Protocol</span>
                <Badge variant="outline" className="text-emerald-600 border-emerald-300">Active / Certified</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <span className="font-medium">Dosimeter TLD Badge Audits</span>
                <Badge variant="outline">Monthly Log Current</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <span className="font-medium">AERB License Verification</span>
                <Badge variant="outline">Compliant 2026</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
