"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Printer,
  Download,
  IndianRupee,
  Building2,
  CheckCircle2,
  AlertCircle,
  Percent,
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function InsuranceReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("ALL_TIME");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/insurance?timeframe=${timeframe}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast("Failed to load insurance reports: " + json.message, "error");
      }
    } catch (err: any) {
      toast("Error loading insurance reports: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const totalClaimsCount = data?.totalClaimsCount || 0;
  const totalClaimedAmount = data?.totalClaimedAmount || 0;
  const totalSettledAmount = data?.totalSettledAmount || 0;
  const totalDisallowedAmount = data?.totalDisallowedAmount || 0;
  const overallYield = data?.overallYield || "0%";
  const providerScorecard: any[] = data?.providerScorecard || [];
  const recentClaims: any[] = data?.recentClaims || [];

  const filteredClaims = recentClaims.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.claimNumber?.toLowerCase().includes(q) ||
      c.patientId?.name?.toLowerCase().includes(q) ||
      c.providerId?.name?.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    const headers = ["Carrier Name", "Claims Count", "Claimed (INR)", "Settled (INR)", "Disallowed (INR)", "Settlement %"];
    const rows = providerScorecard.map((p) => {
      const pct = p.claimed > 0 ? `${Math.round((p.settled / p.claimed) * 100)}%` : "0%";
      return [`"${p.name}"`, p.count, p.claimed, p.settled, p.disallowed, `"${pct}"`];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Insurance_TPA_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast("Insurance report exported to CSV", "success");
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
            <span className="text-sm font-medium text-primary">Insurance & TPA</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Health Insurance & TPA Claims Analytics
          </h1>
          <p className="text-muted-foreground text-sm">
            Audited cashless recovery yields, TPA disallowance deductions, and carrier settlement ratios in ₹.
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
        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Claims Billed</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                ₹{Number(totalClaimedAmount || 0).toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Across {totalClaimsCount} filed claims</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Settled Remittances</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                ₹{Number(totalSettledAmount || 0).toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">Bank credits received</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-rose-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">TPA Deductions</p>
              <h3 className="text-2xl font-bold mt-1 text-rose-600">
                ₹{Number(totalDisallowedAmount || 0).toLocaleString("en-IN")}
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
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recovery Yield</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">{overallYield}</h3>
              <p className="text-xs text-blue-600 font-medium mt-1">Realization efficiency</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Percent className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Carrier Performance Scorecard */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-semibold">TPA / Carrier Settlement Yield Scorecard</CardTitle>
          <CardDescription className="text-xs">
            Performance comparison of empaneled health insurance providers and third-party administrators.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground font-semibold text-xs uppercase border-b border-border/60">
                <tr>
                  <th className="p-3">Insurance Provider / TPA</th>
                  <th className="p-3 text-center">Volume</th>
                  <th className="p-3 text-right">Claimed (₹)</th>
                  <th className="p-3 text-right">Settled (₹)</th>
                  <th className="p-3 text-right">Disallowed (₹)</th>
                  <th className="p-3 text-center">Yield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {providerScorecard.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                      {loading ? "Loading insurance performance..." : "No claims recorded."}
                    </td>
                  </tr>
                ) : (
                  providerScorecard.map((p: any, idx: number) => {
                    const pct = p.claimed > 0 ? Math.round((p.settled / p.claimed) * 100) : 0;
                    return (
                      <tr key={idx} className="hover:bg-muted/30 text-xs">
                        <td className="p-3 font-medium text-foreground flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          {p.name}
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
                            {p.count}
                          </span>
                        </td>
                        <td className="p-3 text-right font-medium text-foreground">
                          ₹{Number(p.claimed || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-600">
                          ₹{Number(p.settled || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-right font-medium text-rose-600">
                          ₹{Number(p.disallowed || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-center">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              pct >= 80
                                ? "bg-emerald-50 text-emerald-600 border-emerald-300"
                                : pct >= 60
                                ? "bg-amber-50 text-amber-600 border-amber-300"
                                : "bg-rose-50 text-rose-600 border-rose-300"
                            }`}
                          >
                            {pct}%
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
  );
}
