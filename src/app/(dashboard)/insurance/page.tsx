"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Building2,
  FileBadge,
  UserCheck,
  FileClock,
  ClipboardList,
  Files,
  Send,
  Activity,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  ArrowRight,
  Plus,
  IndianRupee,
  ShieldCheck,
  Clock,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function InsuranceHubPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/insurance/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        toast(data.message || "Failed to load insurance statistics", "error");
      }
    } catch (err: any) {
      toast("Error: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const workstations = [
    {
      title: "Insurance Providers",
      description: "Empanelment directory of insurance companies & TPAs with SLA benchmarks",
      path: "/insurance/providers",
      icon: Building2,
      badge: `${stats?.activeProvidersCount || 0} Partners`,
      color: "border-blue-200 hover:border-blue-500 bg-blue-50/20 dark:bg-blue-950/10"
    },
    {
      title: "Patient Policies",
      description: "Patient policy registry, sum insured coverage limits & copay settings",
      path: "/insurance/policies",
      icon: FileBadge,
      badge: `${stats?.totalPoliciesCount || 0} Active`,
      color: "border-indigo-200 hover:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10"
    },
    {
      title: "Eligibility Verification",
      description: "Real-time coverage verification desk, room limits & cashless qualification",
      path: "/insurance/eligibility",
      icon: UserCheck,
      badge: "Instant Check",
      color: "border-teal-200 hover:border-teal-500 bg-teal-50/20 dark:bg-teal-950/10"
    },
    {
      title: "Pre-Authorization",
      description: "Cashless admission requests (PA-XXXX), doctor notes & initial approval limits",
      path: "/insurance/preauth",
      icon: FileClock,
      badge: stats?.pendingPreauthCount ? `${stats.pendingPreauthCount} Pending` : "Current",
      color: "border-amber-200 hover:border-amber-500 bg-amber-50/20 dark:bg-amber-950/10"
    },
    {
      title: "Claims Directory",
      description: "Complete claims lifecycle repository across all patients and payers",
      path: "/insurance/claims",
      icon: ClipboardList,
      badge: `${stats?.activeClaimsCount || 0} Active`,
      color: "border-emerald-200 hover:border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10"
    },
    {
      title: "Claim Documents",
      description: "Clinical attachments, discharge summaries, final bills & ICP packages",
      path: "/insurance/documents",
      icon: Files,
      badge: "Clinical Dossier",
      color: "border-slate-200 hover:border-slate-500"
    },
    {
      title: "Claim Submission",
      description: "Electronic batch compilation (BATCH-XXXX) and TPA portal dispatch",
      path: "/insurance/submission",
      icon: Send,
      badge: "E-Batching",
      color: "border-purple-200 hover:border-purple-500 bg-purple-50/20 dark:bg-purple-950/10"
    },
    {
      title: "Claim Tracking",
      description: "Turnaround time monitor, query resolution alerts & status milestones",
      path: "/insurance/tracking",
      icon: Activity,
      badge: stats?.queryPendingClaimsCount ? `${stats.queryPendingClaimsCount} Queries` : "Live TAT",
      color: "border-orange-200 hover:border-orange-500 bg-orange-50/20 dark:bg-orange-950/10"
    },
    {
      title: "Claim Settlement",
      description: "TPA remittance recording, deduction reconciliation & UTR settlements",
      path: "/insurance/settlement",
      icon: CheckCircle2,
      badge: `₹${(stats?.totalSettledAmount || 0).toLocaleString("en-IN")}`,
      color: "border-emerald-200 hover:border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10"
    },
    {
      title: "Insurance Reports",
      description: "Payer settlement ratios, deduction analyses & outstanding TPA receivables",
      path: "/insurance/reports",
      icon: BarChart3,
      badge: "Payer Audits",
      color: "border-cyan-200 hover:border-cyan-500 bg-cyan-50/20 dark:bg-cyan-950/10"
    }
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 text-blue-600 rounded-xl">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Insurance & TPA Operations Hub</h1>
              <p className="text-sm text-muted-foreground">
                Cashless hospitalization management, eligibility verification, pre-authorization & TPA claims settlement
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/insurance/preauth">
            <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
              <FileClock className="h-4 w-4" />
              New Pre-Auth
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="shadow-sm border-l-4 border-l-blue-600">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Claims Filed</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                  ₹{(stats?.totalClaimedAmount || 0).toLocaleString("en-IN")}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.activeClaimsCount || 0} active &bull; {stats?.settledClaimsCount || 0} settled
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-lg">
                <ClipboardList className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-600">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Settled by TPAs</p>
                <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                  ₹{(stats?.totalSettledAmount || 0).toLocaleString("en-IN")}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Approved: ₹{(stats?.totalApprovedAmount || 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-lg">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-amber-600">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Pre-Auths</p>
                <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                  {stats?.pendingPreauthCount || 0} Requests
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.approvedPreauthCount || 0} approved for cashless
                </p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-lg">
                <FileClock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-600">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending TPA Receivables</p>
                <h3 className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">
                  ₹{(stats?.pendingDuesFromTpa || 0).toLocaleString("en-IN")}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {stats?.activeClaimsCount || 0} in-progress claims
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950/50 text-purple-600 rounded-lg">
                <IndianRupee className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 10 Workstations Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Insurance Workstations & Submodules</h2>
            <p className="text-sm text-muted-foreground">Select an operational workstation to manage insurance tasks</p>
          </div>
          <Badge variant="outline" className="text-xs font-medium">10 Submodules Active</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workstations.map((ws, i) => {
            const Icon = ws.icon;
            return (
              <Link key={i} href={ws.path} className="group">
                <Card className={`h-full transition-all duration-200 hover:shadow-md ${ws.color}`}>
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2.5 rounded-lg bg-background shadow-xs text-foreground group-hover:text-blue-600 transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="secondary" className="text-xs font-semibold">
                        {ws.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold mt-3 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                      {ws.title}
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {ws.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Claims Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Recent Claims Activity</CardTitle>
                <CardDescription className="text-xs">Latest cashless and reimbursement claims submitted to TPAs</CardDescription>
              </div>
              <Link href="/insurance/claims">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600 gap-1">
                  View All Claims <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {stats?.recentClaims?.length > 0 ? (
              <div className="divide-y text-xs">
                {stats.recentClaims.map((c: any) => (
                  <div key={c._id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold text-xs">
                        TPA
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {c.claimNumber} &bull; {c.patientId?.name || "Patient"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {c.providerId?.name || "Payer"} &bull; UHID: {c.patientId?.uhid || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white">
                        ₹{Number(c.amountClaimed || 0).toLocaleString("en-IN")}
                      </p>
                      <Badge variant="outline" className="text-[10px] mt-0.5">
                        {c.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-xs">
                No recent claims recorded yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* TPA Partner Distribution */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">TPA Partner Volume</CardTitle>
            <CardDescription className="text-xs">Active cashless claims by insurance partner</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {stats?.providerDistribution && Object.keys(stats.providerDistribution).length > 0 ? (
              Object.entries(stats.providerDistribution).slice(0, 5).map(([pId, data]: [string, any]) => {
                const total = stats?.totalClaimedAmount || 1;
                const pct = Math.round((data.claimed / total) * 100);
                return (
                  <div key={pId} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{data.name}</span>
                      <span className="font-bold">₹{data.claimed.toLocaleString("en-IN")} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-muted-foreground text-xs">
                No provider claims recorded yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
