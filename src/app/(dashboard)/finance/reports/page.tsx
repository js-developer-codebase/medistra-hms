"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  IndianRupee,
  FileText,
  TrendingUp,
  Building2,
  Percent,
  RotateCcw,
  CheckCircle2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function FinancialReportsPage() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"DAILY" | "DEPARTMENT" | "GST" | "AUDIT">("DAILY");

  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/finance/reports");
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      } else {
        toast(data.message || "Failed to load financial reports", "error");
      }
    } catch (err: any) {
      toast("Error: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const exportCSV = (type: string) => {
    let rows: string[] = [];
    let filename = `medistra-financial-report-${type.toLowerCase()}.csv`;

    if (type === "DAILY") {
      rows.push("Date,Cash Collections (INR),Digital Collections (INR),Total Collections (INR),Transactions Count");
      reports?.dailyRegister?.forEach((r: any) => {
        rows.push(`"${r.date}",${r.cash},${r.digital},${r.total},${r.count}`);
      });
    } else if (type === "DEPARTMENT") {
      rows.push("Department,Invoices Count,Gross Amount (INR),Discount (INR),Net Revenue (INR)");
      reports?.departmentRevenue?.forEach((d: any) => {
        rows.push(`"${d.department}",${d.invoicesCount},${d.grossAmount},${d.discount},${d.netRevenue}`);
      });
    } else if (type === "GST") {
      rows.push("Tax Category,Amount (INR)");
      rows.push(`"Taxable Hospital Services",${reports?.gstStatement?.totalTaxableValue || 0}`);
      rows.push(`"CGST (Central Tax)",${reports?.gstStatement?.cgst || 0}`);
      rows.push(`"SGST (State Tax)",${reports?.gstStatement?.sgst || 0}`);
      rows.push(`"Total GST Realized",${reports?.gstStatement?.totalGstCollected || 0}`);
    } else {
      rows.push("Type,Identifier,Patient,Amount (INR),Status");
      reports?.auditSummary?.discounts?.forEach((d: any) => {
        rows.push(`"Concession","${d.concessionNumber}","${d.patientId?.name || "Patient"}",${d.discountAmount},"${d.status}"`);
      });
      reports?.auditSummary?.refunds?.forEach((r: any) => {
        rows.push(`"Refund","${r.refundNumber}","${r.patientId?.name || "Patient"}",${r.amount},"${r.status}"`);
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("CSV exported successfully", "success");
  };

  const dailyRegister = reports?.dailyRegister || [];
  const departmentRevenue = reports?.departmentRevenue || [];
  const gstStatement = reports?.gstStatement || {};
  const auditSummary = reports?.auditSummary || {};

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-600/10 text-cyan-600 rounded-xl">
              <Banknote className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Financial Statements & Audit Reports</h1>
              <p className="text-sm text-muted-foreground">
                Official fiscal statements, daily collection registers, department profit centers & statutory GST reporting
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchReports} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportCSV(activeTab)} className="gap-1.5">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => window.print()} className="gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white">
            <Printer className="h-4 w-4" />
            Print Statement
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        <button
          onClick={() => setActiveTab("DAILY")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === "DAILY"
              ? "bg-cyan-600 text-white"
              : "bg-muted/60 text-muted-foreground hover:bg-muted"
          }`}
        >
          Daily Collection Register
        </button>
        <button
          onClick={() => setActiveTab("DEPARTMENT")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === "DEPARTMENT"
              ? "bg-cyan-600 text-white"
              : "bg-muted/60 text-muted-foreground hover:bg-muted"
          }`}
        >
          Department Revenue Statement
        </button>
        <button
          onClick={() => setActiveTab("GST")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === "GST"
              ? "bg-cyan-600 text-white"
              : "bg-muted/60 text-muted-foreground hover:bg-muted"
          }`}
        >
          GST & Tax Summary
        </button>
        <button
          onClick={() => setActiveTab("AUDIT")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === "AUDIT"
              ? "bg-cyan-600 text-white"
              : "bg-muted/60 text-muted-foreground hover:bg-muted"
          }`}
        >
          Concessions & Refunds Audit
        </button>
      </div>

      {/* Tab 1: Daily Collection Register */}
      {activeTab === "DAILY" && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Daily Cashier Collection Register</CardTitle>
                <CardDescription className="text-xs">Day-wise chronological reconciliation of Cash vs Digital inflows</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-y text-muted-foreground text-left">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Cash Counter (₹)</th>
                    <th className="py-3 px-4 font-semibold text-right">Digital / Online (₹)</th>
                    <th className="py-3 px-4 font-semibold text-center">Transactions</th>
                    <th className="py-3 px-4 font-semibold text-right">Total Realized (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {dailyRegister.length > 0 ? (
                    dailyRegister.map((day: any) => (
                      <tr key={day.date} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {new Date(day.date).toLocaleDateString("en-IN", { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-emerald-600">
                          ₹{Number(day.cash || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-teal-600">
                          ₹{Number(day.digital || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className="text-[10px]">{day.count} receipts</Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                          ₹{Number(day.total || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-muted-foreground">
                        {loading ? "Compiling register..." : "No collection transactions recorded yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Department Revenue Statement */}
      {activeTab === "DEPARTMENT" && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Department Revenue Contribution</CardTitle>
                <CardDescription className="text-xs">Gross volume, patient discounts & net realized revenue by clinical unit</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-y text-muted-foreground text-left">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Department</th>
                    <th className="py-3 px-4 font-semibold text-center">Invoices Generated</th>
                    <th className="py-3 px-4 font-semibold text-right">Gross Volume (₹)</th>
                    <th className="py-3 px-4 font-semibold text-right">Discounts / Waivers (₹)</th>
                    <th className="py-3 px-4 font-semibold text-right">Net Revenue (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {departmentRevenue.length > 0 ? (
                    departmentRevenue.map((d: any) => (
                      <tr key={d.department} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {d.department}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className="text-[10px]">{d.invoicesCount} bills</Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          ₹{Number(d.grossAmount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-right text-rose-600 font-medium">
                          -₹{Number(d.discount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-cyan-700 dark:text-cyan-300">
                          ₹{Number(d.netRevenue || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-muted-foreground">
                        {loading ? "Calculating revenue statement..." : "No departmental billing records found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: GST & Tax Summary */}
      {activeTab === "GST" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="shadow-sm border-l-4 border-l-blue-600">
              <CardContent className="p-4">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Taxable Value</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  ₹{Number(gstStatement.totalTaxableValue || 0).toLocaleString("en-IN")}
                </h3>
                <p className="text-[11px] text-muted-foreground">Base taxable clinical services</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-l-4 border-l-cyan-600">
              <CardContent className="p-4">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total GST Collected</p>
                <h3 className="text-2xl font-bold text-cyan-700 dark:text-cyan-300 mt-1">
                  ₹{Number(gstStatement.totalGstCollected || 0).toLocaleString("en-IN")}
                </h3>
                <p className="text-[11px] text-muted-foreground">Effective rate: {gstStatement.effectiveRate || "0%"}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-l-4 border-l-emerald-600">
              <CardContent className="p-4">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">CGST / SGST Split</p>
                <h3 className="text-xl font-bold text-emerald-600 mt-1">
                  ₹{Number(gstStatement.cgst || 0).toLocaleString("en-IN")} Each
                </h3>
                <p className="text-[11px] text-muted-foreground">50% Central + 50% State GST</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Statutory GST Filing Schedule (GSTR-1 / GSTR-3B)</CardTitle>
              <CardDescription className="text-xs">Summary of GST breakdown for hospital accounting compliance</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-y text-muted-foreground text-left">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Tax Category</th>
                    <th className="py-3 px-4 font-semibold text-right">Taxable Amount (₹)</th>
                    <th className="py-3 px-4 font-semibold text-right">CGST (₹)</th>
                    <th className="py-3 px-4 font-semibold text-right">SGST (₹)</th>
                    <th className="py-3 px-4 font-semibold text-right">Total Tax (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="hover:bg-muted/20">
                    <td className="py-3 px-4 font-semibold">Hospital Inpatient & Diagnostic Services (Composite)</td>
                    <td className="py-3 px-4 text-right">₹{Number(gstStatement.totalTaxableValue || 0).toLocaleString("en-IN")}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">₹{Number(gstStatement.cgst || 0).toLocaleString("en-IN")}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">₹{Number(gstStatement.sgst || 0).toLocaleString("en-IN")}</td>
                    <td className="py-3 px-4 text-right font-bold text-cyan-700">₹{Number(gstStatement.totalGstCollected || 0).toLocaleString("en-IN")}</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 4: Concessions & Refunds Audit */}
      {activeTab === "AUDIT" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="shadow-sm border-l-4 border-l-rose-600">
              <CardContent className="p-4">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Concessions Granted</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">
                  ₹{Number(auditSummary.totalConcessionsAmount || 0).toLocaleString("en-IN")}
                </h3>
                <p className="text-[11px] text-muted-foreground">{auditSummary.concessionsCount || 0} beneficiary vouchers</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-l-4 border-l-amber-600">
              <CardContent className="p-4">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Refunds Disbursed</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">
                  ₹{Number(auditSummary.totalRefundsAmount || 0).toLocaleString("en-IN")}
                </h3>
                <p className="text-[11px] text-muted-foreground">{auditSummary.refundsCount || 0} patient refund claims</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Recent Approved Concessions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 border-y text-muted-foreground text-left">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Voucher</th>
                      <th className="py-2.5 px-4 font-semibold">Patient</th>
                      <th className="py-2.5 px-4 font-semibold">Category</th>
                      <th className="py-2.5 px-4 font-semibold">Approved By</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {auditSummary.discounts?.length > 0 ? (
                      auditSummary.discounts.slice(0, 5).map((d: any) => (
                        <tr key={d._id}>
                          <td className="py-2 px-4 font-bold text-rose-600">{d.concessionNumber}</td>
                          <td className="py-2 px-4">{d.patientId?.name || "Patient"}</td>
                          <td className="py-2 px-4"><Badge variant="outline" className="text-[10px]">{d.category.replace(/_/g, " ")}</Badge></td>
                          <td className="py-2 px-4 text-muted-foreground">{d.approvedBy}</td>
                          <td className="py-2 px-4 text-right font-bold text-rose-600">₹{Number(d.discountAmount || 0).toLocaleString("en-IN")}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No approved concessions found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
