"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import {
  Activity,
  Stethoscope,
  FileText,
  HeartPulse,
  AlertOctagon,
  ClipboardList,
  ShoppingBag,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  Calendar,
  User,
  Pill
} from "lucide-react";

export default function ClinicalDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [vitals, setVitals] = useState<any[]>([]);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [statsRes, vitalsRes, allergyRes] = await Promise.all([
        fetch("/api/clinical/stats"),
        fetch("/api/clinical/vitals"),
        fetch("/api/clinical/records?recordType=Allergy")
      ]);

      const [statsData, vitalsData, allergyData] = await Promise.all([
        statsRes.json(),
        vitalsRes.json(),
        allergyRes.json()
      ]);

      if (statsData.success) setStats(statsData.data);
      if (vitalsData.success) setVitals((vitalsData.data || []).slice(0, 5));
      if (allergyData.success) setAllergies((allergyData.data || []).slice(0, 5));
    } catch (err) {
      toast("Failed to load clinical analytics", "error");
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Clinical Dashboard & Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Strategic EMR overview, clinical encounter metrics, vital signs alert warnings, and diagnostic breakdown.
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Consultations</span>
            <Stethoscope className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {stats?.consultationsCount || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Encounters logged</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Active Diagnoses</span>
            <ClipboardList className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {stats?.diagnosesCount || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">ICD classifications</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Vitals Recorded</span>
            <HeartPulse className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            {stats?.vitalsCount || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Physiological logs</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Allergy Flags</span>
            <AlertOctagon className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
            {stats?.allergiesCount || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Patient safety alerts</div>
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

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Treatment Plans</span>
            <FileText className="h-4 w-4 text-teal-500" />
          </div>
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-2">
            {stats?.plansCount || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Active regimens</div>
        </div>
      </div>

      {/* Main Grid: Left Column Recent Vitals & Critical Flags; Right Column Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Vitals & Clinical Events */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Latest Vital Signs Monitoring</CardTitle>
                <CardDescription>Most recently recorded patient physiological metrics</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-emerald-600"
                onClick={() => router.push("/clinical/vitals")}
              >
                All Vitals →
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>BP (mmHg)</TableHead>
                      <TableHead>Heart Rate</TableHead>
                      <TableHead>SpO2</TableHead>
                      <TableHead>Temp (°C)</TableHead>
                      <TableHead>Date Recorded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vitals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-500 py-6 text-xs">
                          No vital sign entries recorded yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      vitals.map((v) => (
                        <TableRow key={v._id} className="text-xs">
                          <TableCell className="font-semibold">
                            {v.patient?.name || "Patient"}
                          </TableCell>
                          <TableCell className="font-mono">
                            {v.bloodPressure || "N/A"}
                          </TableCell>
                          <TableCell className="font-mono">
                            {v.heartRate ? `${v.heartRate} bpm` : "N/A"}
                          </TableCell>
                          <TableCell className="font-mono font-semibold text-emerald-600">
                            {v.oxygenSaturation ? `${v.oxygenSaturation}%` : "N/A"}
                          </TableCell>
                          <TableCell className="font-mono">
                            {v.temperature ? `${v.temperature}°` : "N/A"}
                          </TableCell>
                          <TableCell className="text-slate-500 text-[11px]">
                            {new Date(v.dateRecorded || v.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Active Allergy Safety Flags */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Active Allergy Warnings</CardTitle>
                <CardDescription>Critical patient adverse reactions and contraindications</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-rose-600"
                onClick={() => router.push("/clinical/allergies")}
              >
                Allergy Registry →
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allergies.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No allergy flags recorded.</p>
                ) : (
                  allergies.map((a) => (
                    <div
                      key={a._id}
                      className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <AlertOctagon className="h-4 w-4 text-rose-600 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {a.patient?.name}:{" "}
                          </span>
                          <span className="text-rose-700 dark:text-rose-300 font-semibold">
                            {a.title || a.details || "Allergy"}
                          </span>
                          {a.reaction && (
                            <span className="text-slate-500 text-[11px]"> ({a.reaction})</span>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] text-rose-700 border-rose-300">
                        {a.severity || "Severe"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Quick Launch Shortcuts */}
        <div className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Clinical Actions</CardTitle>
              <CardDescription>Direct shortcuts to EMR workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between h-10 text-xs font-medium hover:border-emerald-400"
                onClick={() => router.push("/clinical/consultations")}
              >
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-emerald-600" />
                  <span>Start Consultation</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between h-10 text-xs font-medium hover:border-rose-400"
                onClick={() => router.push("/clinical/vitals")}
              >
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-rose-600" />
                  <span>Log Vital Signs</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between h-10 text-xs font-medium hover:border-amber-400"
                onClick={() => router.push("/clinical/diagnoses")}
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-amber-600" />
                  <span>Record Diagnosis</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between h-10 text-xs font-medium hover:border-sky-400"
                onClick={() => router.push("/clinical/prescriptions")}
              >
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-sky-600" />
                  <span>Write Prescription</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between h-10 text-xs font-medium hover:border-blue-400"
                onClick={() => router.push("/clinical/orders")}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-blue-600" />
                  <span>Place Clinical Order</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
