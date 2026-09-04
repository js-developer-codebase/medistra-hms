"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import {
  Activity,
  Stethoscope,
  FileText,
  History,
  AlertOctagon,
  ClipboardList,
  FileEdit,
  Crosshair,
  Pill,
  ShoppingBag,
  Share2,
  CalendarCheck,
  HeartPulse,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Loader2,
  Search,
  User
} from "lucide-react";
import { ModuleNavCards } from "@/components/layout/module-nav-cards";

export default function ClinicalEMRHubPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/clinical/stats");
      const data = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
      } else {
        toast("Failed to load clinical statistics", "error");
      }
    } catch (err) {
      toast("Error loading clinical metrics", "error");
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
            <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Clinical & Electronic Medical Records (EMR) Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Comprehensive digital health records, consultations, diagnostic charting, vitals, and treatment plans.
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
            onClick={() => router.push("/clinical/consultations")}
          >
            <Plus className="h-4 w-4" />
            New Consultation
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Total Records</span>
            <FileText className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {stats?.totalRecords || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">EMR documents</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Consultations</span>
            <Stethoscope className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {stats?.consultationsCount || 0}
          </div>
          <div className="text-[10px] text-emerald-600 mt-1">Clinical encounters</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Diagnoses</span>
            <ClipboardList className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {stats?.diagnosesCount || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">ICD classifications</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Vitals Logs</span>
            <HeartPulse className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            {stats?.vitalsCount || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Vitals recorded</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Allergies</span>
            <AlertOctagon className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
            {stats?.allergiesCount || 0}
          </div>
          <div className="text-[10px] text-purple-600 mt-1">Safety flags</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Clinical Orders</span>
            <ShoppingBag className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {stats?.ordersCount || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Diagnostic orders</div>
        </div>
      </div>

      {/* Submodule Navigation */}
      <ModuleNavCards
        modulePath="/clinical"
        title="Clinical Submodules & Workstations"
        subtitle="Electronic medical records, consultations, doctor notes, prescriptions, and care plans"
      />

      {/* Recent Clinical Records Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold">Recent Clinical Events & Documents</CardTitle>
            <CardDescription>
              Latest consultation notes, diagnoses, and medical records logged across hospital departments.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-emerald-600"
            onClick={() => router.push("/clinical/records")}
          >
            View Complete Dossier →
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Record Type</TableHead>
                  <TableHead>Summary / Chief Complaint</TableHead>
                  <TableHead>Attending Doctor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!stats?.recentRecords || stats.recentRecords.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-10 text-xs">
                      No clinical records found. Click "New Consultation" to create the first record.
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.recentRecords.map((r: any) => (
                    <TableRow key={r._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono text-slate-500">
                        {new Date(r.dateRecorded || r.createdAt).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short"
                        })}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {r.patient?.name || "Unknown"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {r.patient?.uhid || "No UHID"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {r.recordType}
                        </Badge>
                      </TableCell>

                      <TableCell className="max-w-xs truncate text-slate-700 dark:text-slate-300">
                        {r.title || r.chiefComplaint || r.assessment || r.details || "Clinical Entry"}
                      </TableCell>

                      <TableCell className="font-medium">
                        Dr. {r.doctor?.name || "Attending"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            r.status === "Final"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }
                        >
                          {r.status || "Final"}
                        </Badge>
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
