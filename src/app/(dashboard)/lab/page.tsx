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
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Clock,
  TestTube2,
  Cpu,
  ListOrdered,
  FileCheck2,
  ShieldCheck,
  FileText,
  History,
  RefreshCw,
  ArrowUpRight,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  TrendingUp,
  Plus
} from "lucide-react";
import { ModuleNavCards } from "@/components/layout/module-nav-cards";

export default function LaboratoryHubPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <LaboratoryHubContent />
    </Suspense>
  );
}

function LaboratoryHubContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
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
      if (ordersData.success) setRecentOrders(ordersData.data || []);
    } catch (err) {
      toast("Failed to load laboratory operations data", "error");
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
            <FlaskConical className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            Laboratory Operations Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            End-to-end diagnostic workflow: order requisition, phlebotomy collection, bench processing, result entry, verification, and certified reports.
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
            <Plus className="h-4 w-4" />
            New Lab Requisition
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Total Orders</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {stats?.totalOrders || 0}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">All Requisitions</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Pending Sample</span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {stats?.pendingOrders || 0}
          </span>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting Phlebotomy</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Samples Collected</span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
            {stats?.samplesCollected || 0}
          </span>
          <span className="text-[10px] text-rose-600 font-medium">In Transit to Lab</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">In Processing</span>
          <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1 block">
            {stats?.processing || 0}
          </span>
          <span className="text-[10px] text-cyan-600 font-medium">On Analyzer Benches</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Certified Reports</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {stats?.completed || 0}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">Verified & Signed</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">STAT / Urgent</span>
          <span className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1 block">
            {stats?.statOrders || 0}
          </span>
          <span className="text-[10px] text-red-600 font-medium">High Priority Triage</span>
        </div>
      </div>

      {/* Submodule Navigation */}
      <ModuleNavCards
        modulePath="/lab"
        title="Laboratory Workstations & Diagnostic Workflow"
        subtitle="Sample collection, laboratory worklist, test result entry, verification, and pathology reports"
      />

      {/* Recent Laboratory Orders Feed */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Recent Diagnostic Orders</CardTitle>
            <CardDescription>
              Latest test requests moving through the laboratory workflow
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => router.push("/lab/orders")}
          >
            View All Orders
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Time & Barcode</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Ordered Tests</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Current Stage</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-12 text-xs">
                      No laboratory orders registered in the system yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.slice(0, 5).map((o) => (
                    <TableRow key={o._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-bold font-mono text-slate-900 dark:text-white">
                          {o.barcode || `LB-${o._id.slice(-6).toUpperCase()}`}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(o.orderDate || o.createdAt).toLocaleDateString()}
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

                      <TableCell className="max-w-xs truncate font-medium text-slate-800 dark:text-slate-200">
                        {o.tests && o.tests.length > 0
                          ? o.tests.map((t: any) => t.name).join(", ")
                          : "Custom Panel"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            o.priority === "STAT"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300"
                              : o.priority === "Urgent"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                              : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          }
                        >
                          {o.priority || "Routine"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            o.status === "Completed"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : o.status === "Processing"
                              ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300"
                              : o.status === "Sample Collected"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }
                        >
                          {o.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        {o.status === "Pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs text-amber-600 border-amber-300 hover:bg-amber-50"
                            onClick={() => router.push(`/lab/collection?orderId=${o._id}`)}
                          >
                            Collect
                          </Button>
                        )}
                        {o.status === "Sample Collected" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs text-cyan-600 border-cyan-300 hover:bg-cyan-50"
                            onClick={() => router.push(`/lab/processing?orderId=${o._id}`)}
                          >
                            Process
                          </Button>
                        )}
                        {o.status === "Processing" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs text-teal-600 border-teal-300 hover:bg-teal-50"
                            onClick={() => router.push(`/lab/results?orderId=${o._id}`)}
                          >
                            Enter Results
                          </Button>
                        )}
                        {o.status === "Completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                            onClick={() => router.push(`/lab/reports?orderId=${o._id}`)}
                          >
                            View Report
                          </Button>
                        )}
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
