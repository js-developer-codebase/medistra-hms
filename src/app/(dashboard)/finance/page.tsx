"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  FileText,
  FilePlus2,
  CreditCard,
  Receipt,
  RotateCcw,
  Percent,
  FileCheck2,
  ClockAlert,
  BarChart3,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  IndianRupee,
  Building2,
  Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function FinanceHubPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/finance/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        toast(data.message || "Failed to load financial statistics", "error");
      }
    } catch (err: any) {
      toast("Error fetching financial overview: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const workstations = [
    {
      title: "Billing Dashboard",
      description: "Executive revenue metrics, collection breakdowns & KPI trends",
      path: "/finance/dashboard",
      icon: BarChart3,
      badge: "Analytics",
      color: "border-blue-200 hover:border-blue-500 bg-blue-50/20 dark:bg-blue-950/10"
    },
    {
      title: "Create Invoice",
      description: "Fast multi-department patient billing terminal with auto GST & concessions",
      path: "/finance/invoice/create",
      icon: FilePlus2,
      badge: "Billing Counter",
      color: "border-emerald-200 hover:border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10"
    },
    {
      title: "Invoices Directory",
      description: "Manage, search, reprint tax invoices, and record partial/full payments",
      path: "/finance/invoices",
      icon: FileText,
      badge: `${stats?.counts?.totalInvoices || 0} Total`,
      color: "border-slate-200 hover:border-slate-500"
    },
    {
      title: "Payments Ledger",
      description: "Real-time audit ledger across Cash, UPI, Card, NetBanking & TPA",
      path: "/finance/payments",
      icon: CreditCard,
      badge: `₹${(stats?.totalCollected || 0).toLocaleString("en-IN")}`,
      color: "border-teal-200 hover:border-teal-500 bg-teal-50/20 dark:bg-teal-950/10"
    },
    {
      title: "Official Receipts",
      description: "Official hospital money receipts (REC-XXXX) with verification stamps",
      path: "/finance/receipts",
      icon: Receipt,
      badge: "Print & Export",
      color: "border-indigo-200 hover:border-indigo-500"
    },
    {
      title: "Patient Refunds",
      description: "Manage cancellation credits, overpayment returns & refund approvals",
      path: "/finance/refunds",
      icon: RotateCcw,
      badge: stats?.counts?.pendingRefunds ? `${stats.counts.pendingRefunds} Pending` : "Settled",
      color: "border-amber-200 hover:border-amber-500 bg-amber-50/20 dark:bg-amber-950/10"
    },
    {
      title: "Discounts & Waivers",
      description: "Staff, BPL, Senior Citizen & management concession voucher approvals",
      path: "/finance/discounts",
      icon: Percent,
      badge: stats?.counts?.pendingConcessions ? `${stats.counts.pendingConcessions} Pending` : "Verified",
      color: "border-rose-200 hover:border-rose-500 bg-rose-50/20 dark:bg-rose-950/10"
    },
    {
      title: "Credit Notes",
      description: "Issue official credit notes (CN-XXXX) for post-billing corrections & returns",
      path: "/finance/credit-notes",
      icon: FileCheck2,
      badge: `${stats?.counts?.creditNotesCount || 0} Issued`,
      color: "border-violet-200 hover:border-violet-500"
    },
    {
      title: "Outstanding Payments",
      description: "Accounts receivable aging analysis (0-30, 31-60, 61-90, >90 days) & dues collection",
      path: "/finance/outstanding",
      icon: ClockAlert,
      badge: `₹${(stats?.totalOutstanding || 0).toLocaleString("en-IN")} Due`,
      color: "border-orange-200 hover:border-orange-500 bg-orange-50/20 dark:bg-orange-950/10"
    },
    {
      title: "Financial Reports",
      description: "Daily collection register, departmental revenue statements & GST audit reports",
      path: "/finance/reports",
      icon: Banknote,
      badge: "Audited Statements",
      color: "border-cyan-200 hover:border-cyan-500 bg-cyan-50/20 dark:bg-cyan-950/10"
    }
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/10 text-emerald-600 rounded-xl">
              <Banknote className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Billing & Finance Hub</h1>
              <p className="text-sm text-muted-foreground">
                Centralized hospital revenue cycle management, multi-department invoicing, digital collections & fiscal audits
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/finance/invoice/create">
            <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
              <FilePlus2 className="h-4 w-4" />
              New Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Invoiced</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                  ₹{(stats?.totalInvoiced || 0).toLocaleString("en-IN")}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {stats?.counts?.totalInvoices || 0} patient bills
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Collections Today</p>
                <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                  ₹{(stats?.todayCollections || 0).toLocaleString("en-IN")}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Total Collected: ₹{(stats?.totalCollected || 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Receivables</p>
                <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                  ₹{(stats?.totalOutstanding || 0).toLocaleString("en-IN")}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.counts?.unpaid || 0} unpaid &bull; {stats?.counts?.partiallyPaid || 0} partial
                </p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-lg">
                <ClockAlert className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Realized Revenue</p>
                <h3 className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">
                  ₹{(stats?.netRevenue || 0).toLocaleString("en-IN")}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Less ₹{(stats?.totalRefunds || 0).toLocaleString("en-IN")} refunds
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
            <h2 className="text-lg font-semibold tracking-tight">Finance Workstations & Submodules</h2>
            <p className="text-sm text-muted-foreground">Select a department workstation to initiate billing tasks</p>
          </div>
          <Badge variant="outline" className="text-xs font-medium">10 Modules Active</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workstations.map((ws, i) => {
            const Icon = ws.icon;
            return (
              <Link key={i} href={ws.path} className="group">
                <Card className={`h-full transition-all duration-200 hover:shadow-md ${ws.color}`}>
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2.5 rounded-lg bg-background shadow-xs text-foreground group-hover:text-emerald-600 transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="secondary" className="text-xs font-semibold">
                        {ws.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold mt-3 group-hover:text-emerald-600 transition-colors flex items-center justify-between">
                      {ws.title}
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-600" />
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

      {/* Bottom Live Activity Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Recent Payment Activity</CardTitle>
                <CardDescription className="text-xs">Latest recorded payment transactions across all billing desks</CardDescription>
              </div>
              <Link href="/finance/payments">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-emerald-600">
                  View All <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {stats?.recentPayments?.length > 0 ? (
              <div className="divide-y text-sm">
                {stats.recentPayments.map((p: any) => (
                  <div key={p._id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        ₹
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {p.patientId?.name || "OPD Walk-in Patient"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          UHID: {p.patientId?.uhid || "N/A"} &bull; {p.receiptNumber || "REC-ONLINE"} &bull; {p.method}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">
                        +₹{Number(p.amount || 0).toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.date ? new Date(p.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-xs">
                No recent payment transactions recorded today.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Department Revenue Breakdown */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Department Revenue Share</CardTitle>
            <CardDescription className="text-xs">Gross invoiced volume by department</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {stats?.departmentRevenue && Object.keys(stats.departmentRevenue).length > 0 ? (
              Object.entries(stats.departmentRevenue).map(([dept, amt]: [string, any]) => {
                const total = stats?.totalInvoiced || 1;
                const percentage = Math.round((amt / total) * 100);
                return (
                  <div key={dept} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{dept}</span>
                      <span className="font-bold">₹{Number(amt).toLocaleString("en-IN")} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-muted-foreground text-xs">
                No department billing data recorded yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
