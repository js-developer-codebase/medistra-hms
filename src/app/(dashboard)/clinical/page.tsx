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

  const SUBMODULES = [
    {
      title: "Clinical Dashboard",
      description: "Clinical activity trends, alert monitors, and consultation summaries.",
      href: "/clinical/dashboard",
      icon: Activity,
      color: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
      badge: "EMR Central"
    },
    {
      title: "Consultations",
      description: "Inpatient & outpatient clinical encounters, chief complaints, and assessments.",
      href: "/clinical/consultations",
      icon: Stethoscope,
      color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
      badge: `${stats?.consultationsCount || 0} Encounters`
    },
    {
      title: "Medical Records",
      description: "Centralized digital patient dossier and clinical document archive.",
      href: "/clinical/records",
      icon: FileText,
      color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
      badge: `${stats?.totalRecords || 0} Records`
    },
    {
      title: "Medical History",
      description: "Past medical, surgical, chronic, and family history repository.",
      href: "/clinical/history",
      icon: History,
      color: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
      badge: "Patient History"
    },
    {
      title: "Allergies",
      description: "Critical drug, food, and environmental allergy and adverse reaction tracking.",
      href: "/clinical/allergies",
      icon: AlertOctagon,
      color: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
      badge: `${stats?.allergiesCount || 0} Flagged`
    },
    {
      title: "Diagnoses",
      description: "ICD-10 clinical diagnoses registry, provisional and final classifications.",
      href: "/clinical/diagnoses",
      icon: ClipboardList,
      color: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
      badge: `${stats?.diagnosesCount || 0} Diagnoses`
    },
    {
      title: "Clinical Notes",
      description: "SOAP progress notes, nursing observations, and ward rounds notes.",
      href: "/clinical/notes",
      icon: FileEdit,
      color: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300",
      badge: `${stats?.notesCount || 0} Notes`
    },
    {
      title: "Treatment Plans",
      description: "Therapeutic regimens, clinical pathways, and care goal documentation.",
      href: "/clinical/plans",
      icon: Crosshair,
      color: "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
      badge: `${stats?.plansCount || 0} Plans`
    },
    {
      title: "Prescriptions",
      description: "Electronic prescribing, medication orders, dosages, and Rx generation.",
      href: "/clinical/prescriptions",
      icon: Pill,
      color: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
      badge: "Rx Registry"
    },
    {
      title: "Clinical Orders",
      description: "Laboratory, imaging, nursing, and procedure diagnostic orders.",
      href: "/clinical/orders",
      icon: ShoppingBag,
      color: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
      badge: `${stats?.ordersCount || 0} Orders`
    },
    {
      title: "Referrals",
      description: "Specialist consultations, inter-departmental transfers, and external referrals.",
      href: "/clinical/referrals",
      icon: Share2,
      color: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300",
      badge: `${stats?.referralsCount || 0} Referrals`
    },
    {
      title: "Follow-Up",
      description: "Post-discharge callbacks, chronic disease monitoring, and review visits.",
      href: "/clinical/follow-up",
      icon: CalendarCheck,
      color: "bg-lime-50 text-lime-700 dark:bg-lime-950/50 dark:text-lime-300",
      badge: `${stats?.followUpsCount || 0} Scheduled`
    },
    {
      title: "Vital Signs",
      description: "Blood pressure, heart rate, SpO2, temperature, and BMI charting.",
      href: "/clinical/vitals",
      icon: HeartPulse,
      color: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300",
      badge: `${stats?.vitalsCount || 0} Logs`
    },
    {
      title: "Patient Problems",
      description: "Active, chronic, and resolved clinical problem list management.",
      href: "/clinical/problems",
      icon: AlertTriangle,
      color: "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
      badge: `${stats?.problemsCount || 0} Problems`
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

      {/* Submodules Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Clinical Submodules & Workstations
          </h2>
          <span className="text-xs text-slate-500">14 Workstations Active</span>
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
