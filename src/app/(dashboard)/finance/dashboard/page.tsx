"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  FileText,
  CreditCard,
  RotateCcw,
  ClockAlert,
  Percent,
  RefreshCw,
  ArrowRight,
  IndianRupee,
  FilePlus2,
  CheckCircle2,
  Calendar,
  Building2,
  PieChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function BillingDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, invRes] = await Promise.all([
        fetch("/api/finance/stats"),
        fetch("/api/invoice")
      ]);
      const statsData = await statsRes.json();
      const invData = await invRes.json();

      if (statsData.success) {
        setStats(statsData.data);
      }
      if (invData.success) {
        setInvoices(invData.data?.slice(0, 8) || []);
      }
    } catch (err: any) {
      toast("Failed to load billing dashboard data: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const paymentModes = stats?.paymentModeDistribution || {};
  const totalCollected = stats?.totalCollected || 1;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 text-blue-600 rounded-xl">
              <BarChart3 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Billing & Revenue Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Live executive financial overview, department revenue contribution & cashier collection trends
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
          <Link href="/finance/invoice/create">
            <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
              <FilePlus2 className="h-4 w-4" />
              New Patient Bill
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="shadow-sm border-l-4 border-l-blue-600">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Invoiced (Gross)</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                  ₹{(stats?.totalInvoiced || 0).toLocaleString("en-IN")}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.counts?.totalInvoices || 0} bills generated
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-600">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Collections Today</p>
                <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                  ₹{(stats?.todayCollections || 0).toLocaleString("en-IN")}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Cumulative: ₹{(stats?.totalCollected || 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-amber-600">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Outstanding Dues</p>
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

        <Card className="shadow-sm border-l-4 border-l-rose-600">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Discounts & Refunds</p>
                <h3 className="text-2xl font-bold mt-1 text-rose-600 dark:text-rose-400">
                  ₹{((stats?.totalRefunds || 0) + (stats?.totalConcessions || 0)).toLocaleString("en-IN")}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Refunds: ₹{(stats?.totalRefunds || 0).toLocaleString("en-IN")} &bull; Disc: ₹{(stats?.totalConcessions || 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 rounded-lg">
                <Percent className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Rows: Payment Distribution & Department Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Mode Distribution */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Payment Modes Collection</CardTitle>
                <CardDescription className="text-xs">Breakdown of collections across digital & cash channels</CardDescription>
              </div>
              <Link href="/finance/payments">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600 gap-1">
                  Ledger <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-2 space-y-4">
            {Object.entries({
              UPI: { name: "UPI / QR Code", color: "bg-teal-500", amt: paymentModes.UPI || 0 },
              CASH: { name: "Cash Counter", color: "bg-emerald-500", amt: paymentModes.CASH || 0 },
              CARD: { name: "Credit / Debit Card", color: "bg-blue-500", amt: paymentModes.CARD || 0 },
              BANK_TRANSFER: { name: "Bank Transfer / NEFT", color: "bg-indigo-500", amt: paymentModes.BANK_TRANSFER || 0 },
              INSURANCE_TPA: { name: "Insurance / TPA Settlement", color: "bg-purple-500", amt: paymentModes.INSURANCE_TPA || 0 },
              CHEQUE: { name: "Cheque", color: "bg-amber-500", amt: paymentModes.CHEQUE || 0 }
            }).map(([key, item]: [string, any]) => {
              const pct = totalCollected > 0 ? Math.round((item.amt / totalCollected) * 100) : 0;
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                    <span className="font-bold">
                      ₹{item.amt.toLocaleString("en-IN")} <span className="text-muted-foreground font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Department Revenue Contribution */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Department Revenue Share</CardTitle>
                <CardDescription className="text-xs">Gross invoiced volume by medical department</CardDescription>
              </div>
              <Link href="/finance/reports">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600 gap-1">
                  Full Report <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-2 space-y-4">
            {stats?.departmentRevenue && Object.keys(stats.departmentRevenue).length > 0 ? (
              Object.entries(stats.departmentRevenue).map(([dept, amt]: [string, any]) => {
                const total = stats?.totalInvoiced || 1;
                const percentage = Math.round((amt / total) * 100);
                return (
                  <div key={dept} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{dept}</span>
                      <span className="font-bold">
                        ₹{Number(amt).toLocaleString("en-IN")} <span className="text-muted-foreground font-normal">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-muted-foreground text-xs">
                No departmental revenue recorded yet. Create an invoice to begin.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Recent Patient Invoices</CardTitle>
              <CardDescription className="text-xs">Latest billed invoices across all hospital counters</CardDescription>
            </div>
            <Link href="/finance/invoices">
              <Button variant="outline" size="sm" className="text-xs gap-1">
                View All Invoices <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 text-muted-foreground border-y text-left">
                <tr>
                  <th className="py-3 px-4 font-semibold">Invoice No</th>
                  <th className="py-3 px-4 font-semibold">Patient</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold text-right">Gross (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Discount (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Net Payable (₹)</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.length > 0 ? (
                  invoices.map((inv: any) => {
                    const statusColors: Record<string, string> = {
                      PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      UNPAID: "bg-rose-50 text-rose-700 border-rose-200",
                      PARTIALLY_PAID: "bg-amber-50 text-amber-700 border-amber-200",
                      CANCELLED: "bg-slate-100 text-slate-600 border-slate-200"
                    };
                    return (
                      <tr key={inv._id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-medium text-blue-600">
                          <Link href={`/finance/invoices`}>
                            {inv.invoiceNumber || inv._id?.slice(-8).toUpperCase()}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {inv.patientId?.name || "OPD Patient"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            UHID: {inv.patientId?.uhid || "N/A"}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-[10px] font-normal">
                            {inv.department || "General"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          ₹{Number(inv.totalAmount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-right text-rose-600">
                          -₹{Number(inv.discount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                          ₹{Number(inv.finalAmount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[inv.status] || "bg-slate-100"}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground">
                          {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("en-IN", { month: 'short', day: 'numeric' }) : "-"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No invoices recorded yet. Click "New Patient Bill" to create the first invoice.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
