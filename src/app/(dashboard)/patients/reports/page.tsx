"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  BarChart3,
  Users,
  UserCheck,
  UserX,
  Heart,
  Calendar,
  Download,
  RefreshCw,
  PieChart,
  ArrowLeft,
  Building,
  TrendingUp,
  Activity
} from "lucide-react";

export default function PatientReportsPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("ALL");

  const fetchStats = async () => {
    setLoading(true);
    try {
      const url = selectedBranch === "ALL" ? "/api/patient/reports" : `/api/patient/reports?branchId=${selectedBranch}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.data);
      } else {
        toast(data.message || "Failed to load patient statistics", "error");
      }
    } catch (err) {
      toast("Error loading patient reports", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadBranches() {
      try {
        const res = await fetch("/api/org");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setBranches(data.data);
        }
      } catch (err) {
        console.error("Failed to load branches");
      }
    }
    loadBranches();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [selectedBranch]);

  const exportReportCSV = () => {
    if (!stats) return;

    const lines = [
      ["Metric", "Value"],
      ["Total Registered Patients", stats.totalPatients || 0],
      ["Active Patients", stats.activePatients || 0],
      ["Merged Duplicate Patients", stats.mergedPatients || 0],
      [],
      ["Gender Breakdown"],
      ...(stats.genderStats || []).map((g: any) => [g._id || "Other", g.count]),
      [],
      ["Blood Group Breakdown"],
      ...(stats.bloodStats || []).map((b: any) => [b._id || "Other", b.count]),
      [],
      ["Age Group Breakdown"],
      ...(stats.ageStats || []).map((a: any) => [`Age ${a._id}`, a.count])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + lines.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `patient_demographic_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Demographic Report exported successfully", "success");
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link href="/patients/list">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <BarChart3 className="h-6 w-6 text-emerald-500" />
              Patient Demographic & Statistical Reports
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Comprehensive analytics, population health demographics, blood bank readiness, and registration statistics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="min-w-56"
          >
            <option value="ALL">All Hospital Branches</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>{b.organizationName}</option>
            ))}
          </Select>

          <Button variant="outline" size="sm" onClick={exportReportCSV} className="gap-1.5">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-500" />
          <p className="text-sm">Aggregating demographic metrics...</p>
        </div>
      ) : !stats ? (
        <Card className="border-slate-200 dark:border-slate-800 p-12 text-center">
          <p className="text-slate-400 text-sm">No statistical data available.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Key KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200 dark:border-slate-800 bg-emerald-500/5 border-emerald-500/20">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total Registered
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                    {stats.totalPatients || 0}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Master registry count
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Active Patients
                  </div>
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {stats.activePatients || 0}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1">
                    Eligible for OPD & IPD admissions
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <UserCheck className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Merged Records
                  </div>
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {stats.mergedPatients || 0}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1">
                    Deduplicated & deactivated
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <UserX className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Blood Types Logged
                  </div>
                  <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                    {(stats.bloodStats || []).length} / 8
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1">
                    Blood Bank readiness tracked
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Heart className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demographic Distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gender Distribution */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-500" />
                  Gender Distribution
                </CardTitle>
                <CardDescription>Breakdown by registered biological sex.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                {(!stats.genderStats || stats.genderStats.length === 0) ? (
                  <div className="p-6 text-center text-slate-400 text-xs">No gender data recorded.</div>
                ) : (
                  stats.genderStats.map((item: any) => {
                    const total = stats.totalPatients || 1;
                    const percent = Math.round((item.count / total) * 100);
                    return (
                      <div key={item._id} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-700 dark:text-slate-300">{item._id || "Unspecified"}</span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {item.count} patients ({percent}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Blood Group Distribution */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <Heart className="h-4 w-4" />
                  Blood Group Distribution
                </CardTitle>
                <CardDescription>Inventory and emergency blood bank matching data.</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {(!stats.bloodStats || stats.bloodStats.length === 0) ? (
                  <div className="p-6 text-center text-slate-400 text-xs">No blood group records found.</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {stats.bloodStats.map((item: any) => (
                      <div
                        key={item._id}
                        className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-center space-y-1"
                      >
                        <div className="text-lg font-black text-rose-600 dark:text-rose-400">
                          {item._id || "Unknown"}
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.count}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Patients</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Age Demographic Distribution */}
            <Card className="border-slate-200 dark:border-slate-800 lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                  <Activity className="h-4 w-4" />
                  Age Group Demographic Cohorts
                </CardTitle>
                <CardDescription>Distribution across pediatric, adult, and geriatric cohorts.</CardDescription>
              </CardHeader>
              <CardContent className="pt-2 space-y-3">
                {(!stats.ageStats || stats.ageStats.length === 0) ? (
                  <div className="p-6 text-center text-slate-400 text-xs">No age records found.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {stats.ageStats.map((item: any, idx: number) => {
                      const labels = ["0 - 17 (Pediatric)", "18 - 34 (Young Adult)", "35 - 49 (Adult)", "50 - 64 (Senior)", "65+ (Geriatric)"];
                      const label = labels[idx] || `Age Bucket ${item._id}`;
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center space-y-1"
                        >
                          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate" title={label}>
                            {label}
                          </div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {item.count}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {Math.round((item.count / (stats.totalPatients || 1)) * 100)}% of total
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
