"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import {
  Scan,
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  ListOrdered,
  Layers,
  Images,
  FileEdit,
  ShieldCheck,
  FileText,
  History,
  RefreshCw,
  ArrowUpRight,
  Loader2,
  Zap,
  Plus
} from "lucide-react";
import { ModuleNavCards } from "@/components/layout/module-nav-cards";

export default function RadiologyHubPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <RadiologyHubContent />
    </Suspense>
  );
}

function RadiologyHubContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
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
      if (ordersData.success) setRecentOrders(ordersData.data || []);
    } catch (err) {
      toast("Failed to load radiology operations data", "error");
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
            <Scan className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            Radiology & Diagnostic Imaging Operations Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            End-to-end diagnostic imaging workflow: requisitions, modality worklists, PACS scan inspection, structured radiologist reporting, and certified releases.
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
            onClick={() => router.push("/radiology/orders")}
          >
            <Plus className="h-4 w-4" />
            New Imaging Requisition
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
          <span className="text-xs text-slate-500 block">Pending Scan</span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {stats?.pendingOrders || 0}
          </span>
          <span className="text-[10px] text-amber-600 font-medium">In Modality Worklist</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">In Progress</span>
          <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1 block">
            {stats?.inProgressStudies || 0}
          </span>
          <span className="text-[10px] text-cyan-600 font-medium">Active Acquisition</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Awaiting Report</span>
          <span className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1 block">
            {stats?.awaitingReporting || 0}
          </span>
          <span className="text-[10px] text-teal-600 font-medium">Radiologist Queue</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Certified Reports</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {stats?.finalizedReports || 0}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">Verified & Released</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">STAT / Urgent</span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
            {stats?.statCount || 0}
          </span>
          <span className="text-[10px] text-rose-600 font-medium">Fast-track Emergency</span>
        </div>
      </div>

      {/* Submodule Navigation */}
      <ModuleNavCards
        modulePath="/radiology"
        title="Radiology Workstations & Diagnostic Workflow"
        subtitle="Modality worklists, PACS scan inspection, structured radiologist reporting, and certified releases"
      />

      {/* Recent Imaging Requisitions Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Recent Imaging Requisitions</CardTitle>
            <CardDescription>
              Latest scan orders progressing through modality acquisition and reporting
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => router.push("/radiology/orders")}
          >
            View All Orders
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Accession # / Date</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Modality & Body Part</TableHead>
                  <TableHead>Requested Procedure</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No imaging requisitions registered yet. Click "New Imaging Requisition" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.slice(0, 5).map((o) => (
                    <TableRow key={o._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-bold font-mono text-slate-900 dark:text-white">
                          {o.accessionNumber || `RAD-${o._id.slice(-6).toUpperCase()}`}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {o.patient?.name || "Patient"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {o.patient?.uhid} • {o.patient?.gender}, {o.patient?.age}y
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-semibold text-indigo-700 border-indigo-300">
                          {o.modality || "X-RAY"}
                        </Badge>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {o.bodyPart || "Chest"}
                        </span>
                      </TableCell>

                      <TableCell className="max-w-xs truncate font-medium text-slate-800 dark:text-slate-200">
                        {o.studyType}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            o.priority === "STAT"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300"
                              : o.priority === "URGENT"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                              : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          }
                        >
                          {o.priority}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            o.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : o.status === "IN_PROGRESS"
                              ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }
                        >
                          {o.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        {o.status === "PENDING" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs text-amber-600 border-amber-300 hover:bg-amber-50"
                            onClick={() => router.push(`/radiology/worklist`)}
                          >
                            Acquire Scan
                          </Button>
                        )}
                        {o.status === "IN_PROGRESS" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                            onClick={() => router.push(`/radiology/images`)}
                          >
                            View PACS
                          </Button>
                        )}
                        {o.status === "COMPLETED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                            onClick={() => router.push(`/radiology/imaging-reports`)}
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
