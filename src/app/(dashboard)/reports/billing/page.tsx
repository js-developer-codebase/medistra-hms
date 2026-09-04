"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  ArrowLeft,
  RefreshCw,
  Printer,
  Download,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Percent,
  Search,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function BillingReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("ALL_TIME");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/billing?timeframe=${timeframe}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast("Failed to load billing reports: " + json.message, "error");
      }
    } catch (err: any) {
      toast("Error loading billing reports: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const grossBilled = data?.grossBilled || 0;
  const netCollected = data?.netCollected || 0;
  const outstandingBalance = data?.outstandingBalance || 0;
  const collectionEfficiency = data?.collectionEfficiency || "0%";
  const departmentRevenue = data?.departmentRevenue || {};
  const recentInvoices: any[] = data?.recentInvoices || [];

  const filteredInvoices = recentInvoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    return (
      inv.invoiceNumber?.toLowerCase().includes(q) ||
      inv.patientId?.name?.toLowerCase().includes(q) ||
      inv.patientId?.uhid?.toLowerCase().includes(q) ||
      inv.department?.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    const headers = ["Invoice Number", "Patient Name", "UHID", "Department", "Billed (INR)", "Paid (INR)", "Status", "Date"];
    const rows = recentInvoices.map((inv) => [
      `"${inv.invoiceNumber || inv._id?.slice(-8)}"`,
      `"${inv.patientId?.name || "Patient"}"`,
      inv.patientId?.uhid || "N/A",
      `"${inv.department || "General"}"`,
      inv.finalAmount,
      inv.paidAmount || (inv.status === "PAID" ? inv.finalAmount : 0),
      inv.status || "UNPAID",
      inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("en-IN") : "N/A"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hospital_Billing_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast("Billing report exported to CSV", "success");
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/reports" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" /> Reports Hub
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-sm font-medium text-primary">Billing & Revenue</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Hospital Billing & Revenue Realization Analytics
          </h1>
          <p className="text-muted-foreground text-sm">
            Audited gross inpatient & outpatient invoicing, realized cash-flow collections, and outstanding receivables in ₹.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="h-8 text-xs rounded-md border border-input bg-background px-2.5 text-foreground focus:ring-1 focus:ring-primary"
          >
            <option value="ALL_TIME">All Time</option>
            <option value="TODAY">Today</option>
            <option value="7_DAYS">Last 7 Days</option>
            <option value="30_DAYS">Last 30 Days</option>
            <option value="QUARTER">Last 90 Days</option>
            <option value="YTD">Year to Date (YTD)</option>
          </select>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Collected Revenue</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                ₹{Number(netCollected || 0).toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Realized payments in bank</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gross Invoiced Billed</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                ₹{Number(grossBilled || 0).toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">IPD + OPD total tariff</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Outstanding Receivables</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600">
                ₹{Number(outstandingBalance || 0).toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-amber-600 font-medium mt-1">Unsettled patient dues</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Collection Yield</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">{collectionEfficiency}</h3>
              <p className="text-xs text-blue-600 font-medium mt-1">Recovery efficiency ratio</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Percent className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Departmental Collections + Invoice Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Revenue (1 col) */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-semibold">Specialty Revenue Share</CardTitle>
            <CardDescription className="text-xs">Billing generation by hospital department.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {Object.entries(departmentRevenue).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No billing records logged.
              </div>
            ) : (
              Object.entries(departmentRevenue).map(([dept, amt]: [string, any]) => (
                <div key={dept} className="flex justify-between items-center p-2.5 rounded-lg bg-muted/40 text-xs">
                  <span className="font-medium text-foreground">{dept}</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    ₹{Number(amt || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Invoice Ledger (2 cols) */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">Patient Invoices Ledger</CardTitle>
                  <CardDescription className="text-xs">Audited billings and payment settlement status.</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search invoice, UHID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-muted-foreground font-semibold text-xs uppercase border-b border-border/60">
                    <tr>
                      <th className="p-3">Invoice & Patient</th>
                      <th className="p-3">Department</th>
                      <th className="p-3 text-right">Billed (₹)</th>
                      <th className="p-3 text-right">Paid (₹)</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                          {loading ? "Loading invoices..." : "No invoices found."}
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map((inv: any) => {
                        const isPaid = inv.status === "PAID";
                        return (
                          <tr key={inv._id} className="hover:bg-muted/30 text-xs">
                            <td className="p-3">
                              <div className="font-mono font-semibold text-primary">
                                {inv.invoiceNumber || inv._id?.slice(-8)}
                              </div>
                              <div className="text-muted-foreground text-[11px]">
                                {inv.patientId?.name || "Patient"} •{" "}
                                <span className="font-mono">{inv.patientId?.uhid || "UHID-N/A"}</span>
                              </div>
                            </td>
                            <td className="p-3 text-muted-foreground">{inv.department || "General"}</td>
                            <td className="p-3 text-right font-medium text-foreground">
                              ₹{Number(inv.finalAmount || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 text-right font-bold text-emerald-600">
                              ₹{Number(inv.paidAmount || (isPaid ? inv.finalAmount : 0)).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 text-center">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  isPaid
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-300"
                                    : "bg-amber-50 text-amber-600 border-amber-300"
                                }`}
                              >
                                {inv.status || "UNPAID"}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
