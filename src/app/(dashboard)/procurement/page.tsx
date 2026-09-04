"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Building2,
  FileText,
  FileCheck2,
  PackageCheck,
  Receipt,
  BarChart3,
  RefreshCw,
  ArrowRight,
  Plus,
  IndianRupee,
  ShieldCheck,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function ProcurementHubPage() {
  const [stats, setStats] = useState<any>({
    totalSpend: 0,
    activeSuppliersCount: 0,
    pendingRequestsCount: 0,
    approvedOrdersCount: 0,
    pendingOrdersCount: 0,
    totalOrdersCount: 0,
    monthReceiptsCount: 0,
    unpaidInvoicesCount: 0,
    unpaidLiability: 0,
    poStatusDistribution: {}
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/procurement/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err: any) {
      toast(err.message || "Failed to load procurement statistics", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const timer = setInterval(fetchStats, 20000);
    return () => clearInterval(timer);
  }, []);

  const navCards = [
    {
      title: "Procurement Dashboard",
      href: "/procurement/dashboard",
      icon: ShoppingCart,
      desc: "Executive procurement KPIs, PO approval velocity, and annual hospital spend trajectory.",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40"
    },
    {
      title: "Suppliers Directory",
      href: "/procurement/suppliers",
      icon: Building2,
      desc: "Approved medical vendors, GSTIN credentials, credit terms (Net 30/60), and performance ratings.",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40"
    },
    {
      title: "Purchase Requests",
      href: "/procurement/requests",
      icon: FileText,
      desc: "Departmental requisitions & clinical indents from OT, ICU, Emergency, and Wards.",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40"
    },
    {
      title: "Purchase Orders",
      href: "/procurement/orders",
      icon: FileCheck2,
      desc: "Legally binding PO generation, tax breakdown in ₹, HOD approval workflow, and vendor dispatch.",
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/40"
    },
    {
      title: "Goods Receipt (GRN)",
      href: "/procurement/receipt",
      icon: PackageCheck,
      desc: "Physical consignment inspection, accepted vs rejected QC audit, and automated warehouse stock credit.",
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-950/40"
    },
    {
      title: "Purchase Invoices",
      href: "/procurement/invoices",
      icon: Receipt,
      desc: "Automated 3-Way Reconciliation (PO vs GRN vs Vendor Bill), discrepancy detection, and payment tracking.",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/40"
    },
    {
      title: "Procurement Reports",
      href: "/procurement/reports",
      icon: BarChart3,
      desc: "Spend analytics by department and vendor, QC acceptance rates, and CSV ledger export.",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40"
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Procurement &amp; Supply Chain Operations Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            End-to-end hospital supply chain: Purchase Indents, PO Approvals, Inward Inspections, 3-Way Invoice Matching, and Vendor Management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Link href="/procurement/requests">
            <Button size="sm" variant="outline" className="text-xs flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-amber-600" />
              Raise Indent (PR)
            </Button>
          </Link>

          <Link href="/procurement/orders">
            <Button size="sm" className="text-xs flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-3.5 w-3.5" />
              Generate PO
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Real-Time Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Committed Spend
              <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl font-bold text-emerald-600 font-mono">
              ₹{(stats.totalSpend || 0).toLocaleString("en-IN")}
            </div>
            <p className="text-[9px] text-slate-400">Approved purchase orders</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Active Vendors
              <Building2 className="h-3.5 w-3.5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.activeSuppliersCount}
            </div>
            <p className="text-[9px] text-slate-400">Certified suppliers</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Pending Indents
              <Clock className="h-3.5 w-3.5 text-amber-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-amber-600">
              {stats.pendingRequestsCount}
            </div>
            <p className="text-[9px] text-slate-400">Awaiting HOD approval</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Approved POs
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.approvedOrdersCount}
            </div>
            <p className="text-[9px] text-slate-400">Pending delivery</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Receipts (GRN)
              <PackageCheck className="h-3.5 w-3.5 text-teal-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-teal-600">
              {stats.monthReceiptsCount}
            </div>
            <p className="text-[9px] text-slate-400">Inspected this month</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Pending Bills
              <Receipt className="h-3.5 w-3.5 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl font-bold text-purple-600 font-mono">
              ₹{(stats.unpaidLiability || 0).toLocaleString("en-IN")}
            </div>
            <p className="text-[9px] text-slate-400">{stats.unpaidInvoicesCount} invoices pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Procurement Lifecycle Pipeline */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            Hospital Supply Chain Governance Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 block">STEP 1</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">Department Indent</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">OT / ICU requisitions</p>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 block">STEP 2</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">HOD Approval</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Clinical justification</p>
            </div>

            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900">
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 block">STEP 3</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">PO Generation</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Approved vendor dispatch</p>
            </div>

            <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900">
              <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 block">STEP 4</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">QC &amp; Goods Receipt</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Batch inspection &amp; stock in</p>
            </div>

            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
              <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 block">STEP 5</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">3-Way Match</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">PO vs GRN vs Tax Invoice</p>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 block">STEP 6</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">Payment Settlement</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Net 30/60 disbursement</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 7 Workstations Launchpad */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Procurement Workstations</span>
            <Badge variant="outline" className="text-xs">7 Submodules</Badge>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href} className="group">
                <Card className="h-full border hover:border-blue-500/50 hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-900 flex flex-col justify-between">
                  <CardHeader className="p-3.5 pb-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`p-2 rounded-lg ${card.bg}`}>
                        <Icon className={`h-4 w-4 ${card.color}`} />
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <CardTitle className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-0">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {card.desc}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
