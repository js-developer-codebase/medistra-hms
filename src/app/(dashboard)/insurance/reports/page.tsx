"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  ArrowLeft,
  RefreshCw,
  Printer,
  Download,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
  Clock,
  Building2,
  TrendingUp,
  FileSpreadsheet,
  PieChart,
  Percent,
  CheckCircle2,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function InsuranceReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("ALL_TIME");
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/insurance/reports");
      const data = await res.json();
      if (data.success) {
        setReportData(data.data);
      } else {
        toast("Failed to load reports: " + data.message, "error");
      }
    } catch (err: any) {
      toast("Error generating report: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    if (!reportData?.providerPerformance?.length) {
      toast("No performance data available to export", "error");
      return;
    }

    const headers = [
      "Provider / TPA Name",
      "Total Claims Count",
      "Total Amount Claimed (INR)",
      "Total Amount Settled (INR)",
      "Total Amount Disallowed (INR)",
      "Settlement Ratio"
    ];

    const rows = reportData.providerPerformance.map((p: any) => [
      `"${p.name}"`,
      p.totalClaims,
      p.claimed,
      p.settled,
      p.disallowed,
      `"${p.settlementRatio}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e: any[]) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TPA_Insurance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast("Report exported successfully to CSV", "success");
  };

  const summary = reportData?.summary || {
    totalClaimsCount: 0,
    totalClaimedAmount: 0,
    totalSettledAmount: 0,
    totalDisallowedAmount: 0,
    overallSettlementRatio: "0%"
  };

  const providerPerformance = reportData?.providerPerformance || [];
  const recentSettlements = reportData?.recentSettlements || [];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/insurance" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" /> Insurance Hub
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-sm font-medium text-primary">Executive Analytics</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Insurance & TPA Performance Analytics
          </h1>
          <p className="text-muted-foreground text-sm">
            Audited financial metrics on claim settlement efficiency, carrier turnaround times, and disallowance deductions in ₹.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchReports} disabled={loading}>
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

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Claims Billed</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                ₹{Number(summary.totalClaimedAmount || 0).toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Across {summary.totalClaimsCount} patient claims</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Settled Remittance</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                ₹{Number(summary.totalSettledAmount || 0).toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">Hospital bank realizations</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-rose-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Disallowances</p>
              <h3 className="text-2xl font-bold mt-1 text-rose-600">
                ₹{Number(summary.totalDisallowedAmount || 0).toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-rose-600 font-medium mt-1">Non-payable items & capping</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Settlement Ratio</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">
                {summary.overallSettlementRatio}
              </h3>
              <p className="text-xs text-blue-600 font-medium mt-1">Portfolio realization yield</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Percent className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Provider Performance + Deduction Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Provider Scorecard (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base font-semibold">TPA / Insurer Performance Scorecard</CardTitle>
                  <CardDescription className="text-xs">
                    Comprehensive audit of claim approvals, settled bank credits, and deduction ratios by carrier.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-muted-foreground font-semibold text-xs uppercase border-b border-border/60">
                    <tr>
                      <th className="p-3">Insurance Carrier / TPA</th>
                      <th className="p-3 text-center">Volume</th>
                      <th className="p-3 text-right">Claimed (₹)</th>
                      <th className="p-3 text-right">Settled (₹)</th>
                      <th className="p-3 text-right">Disallowed (₹)</th>
                      <th className="p-3 text-center">Yield</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {providerPerformance.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                          {loading ? (
                            <div className="flex justify-center items-center gap-2">
                              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                              <span>Compiling performance analytics...</span>
                            </div>
                          ) : (
                            <p>No insurance claim performance records registered yet.</p>
                          )}
                        </td>
                      </tr>
                    ) : (
                      providerPerformance.map((p: any, idx: number) => {
                        const ratioNum = parseInt(p.settlementRatio.replace("%", ""), 10) || 0;
                        const isHigh = ratioNum >= 80;
                        const isMed = ratioNum >= 60 && ratioNum < 80;

                        return (
                          <tr key={idx} className="hover:bg-muted/30 transition-colors">
                            <td className="p-3">
                              <div className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                {p.name}
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
                                {p.totalClaims}
                              </span>
                            </td>
                            <td className="p-3 text-right font-medium text-foreground text-xs">
                              ₹{Number(p.claimed || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 text-right text-emerald-600 font-bold text-xs">
                              ₹{Number(p.settled || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 text-right text-rose-600 font-medium text-xs">
                              ₹{Number(p.disallowed || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 text-center">
                              <Badge
                                className={`text-xs ${
                                  isHigh
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                    : isMed
                                    ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                    : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                }`}
                              >
                                {p.settlementRatio}
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

          {/* Recent High-Value Reconciled Settlements */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-semibold">Audited Settlement Remittance Log</CardTitle>
              <CardDescription className="text-xs">
                Recently reconciled bank remittances and electronic UTR confirmations.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-muted-foreground font-semibold text-xs uppercase border-b border-border/60">
                    <tr>
                      <th className="p-3">Claim & Patient</th>
                      <th className="p-3">Carrier</th>
                      <th className="p-3">Bank UTR</th>
                      <th className="p-3 text-right">Settled Amount</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {recentSettlements.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground text-xs">
                          No settled remittances recorded yet.
                        </td>
                      </tr>
                    ) : (
                      recentSettlements.map((c: any) => (
                        <tr key={c._id} className="hover:bg-muted/30">
                          <td className="p-3">
                            <div className="font-mono font-semibold text-foreground text-xs">{c.claimNumber}</div>
                            <div className="text-[11px] text-muted-foreground">{c.patientId?.name}</div>
                          </td>
                          <td className="p-3 text-xs text-foreground">
                            {c.providerId?.name || "Carrier"}
                          </td>
                          <td className="p-3 font-mono text-xs text-muted-foreground">
                            {c.settlementUtr || "NEFT"}
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-600 text-xs">
                            ₹{Number(c.amountSettled || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 text-center">
                            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">
                              Settled
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Deduction Categories & SLA Guidelines (1 col) */}
        <div className="space-y-4">
          <Card className="shadow-sm border-t-4 border-t-rose-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PieChart className="h-4 w-4 text-rose-500" />
                Deduction Category Analysis
              </CardTitle>
              <CardDescription className="text-xs">
                Typical disallowance reasons deducted by TPA medical underwriters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Non-Medical Consumables:</span>
                  <span className="font-semibold text-foreground">42%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-rose-500 h-2 rounded-full" style={{ width: "42%" }} />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Room Rent Capping Excess:</span>
                  <span className="font-semibold text-foreground">28%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: "28%" }} />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Patient Co-Pay Deductions:</span>
                  <span className="font-semibold text-foreground">18%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "18%" }} />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Investigation / Tariff Caps:</span>
                  <span className="font-semibold text-foreground">12%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: "12%" }} />
                </div>
              </div>

              <div className="pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
                Total disallowed across all portfolios:{" "}
                <span className="font-bold text-rose-600">
                  ₹{Number(summary.totalDisallowedAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* SLA Performance Card */}
          <Card className="shadow-sm border-t-4 border-t-emerald-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" />
                IRDAI / GIPSA Regulatory TATs
              </CardTitle>
              <CardDescription className="text-xs">
                Target turnaround times prescribed for cashless hospital authorizations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex justify-between p-2 rounded bg-muted/40">
                <span>Initial Cashless Pre-Auth:</span>
                <span className="font-semibold text-foreground">Within 1 Hour</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/40">
                <span>Final Discharge Sanction:</span>
                <span className="font-semibold text-foreground">Within 3 Hours</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/40">
                <span>Claim Remittance (NEFT):</span>
                <span className="font-semibold text-foreground">Within 15 Days</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/40">
                <span>Clinical Query Resolution:</span>
                <span className="font-semibold text-foreground">Within 24 Hours</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
