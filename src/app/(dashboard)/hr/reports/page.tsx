"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  IndianRupee,
  CalendarCheck,
  FileCheck2,
  Download,
  Printer,
  RefreshCw,
  Loader2,
  Building2,
  Clock,
  ShieldCheck,
  FileText
} from "lucide-react";

interface HRReportData {
  totalWorkforce: number;
  totalMonthlyPayroll: number;
  roleDistribution: Record<string, number>;
  shiftDistribution: Record<string, number>;
  leaveTypeDistribution: Record<string, number>;
  documentCompliance: {
    VERIFIED: number;
    PENDING: number;
    REJECTED: number;
  };
  departmentPayrollDistribution: Array<{
    department: string;
    headCount: number;
    payrollSpend: number;
  }>;
}

const TIMEFRAMES = [
  { label: "Today", value: "TODAY" },
  { label: "Last 7 Days", value: "7_DAYS" },
  { label: "Last 30 Days", value: "30_DAYS" },
  { label: "This Quarter", value: "QUARTER" },
  { label: "Year to Date", value: "YTD" },
  { label: "All Time", value: "ALL_TIME" }
];

export default function HRReportsPage() {
  const [data, setData] = useState<HRReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("30_DAYS");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hr/reports?timeframe=${timeframe}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to load HR reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const complianceRate = useMemo(() => {
    if (!data?.documentCompliance) return "100%";
    const total = data.documentCompliance.VERIFIED + data.documentCompliance.PENDING + data.documentCompliance.REJECTED;
    if (total === 0) return "100%";
    return `${Math.round((data.documentCompliance.VERIFIED / total) * 100)}%`;
  }, [data]);

  const handleExportCSV = () => {
    if (!data) return;
    const headers = ["Department", "Staff Headcount", "Monthly Payroll (INR)"];
    const rows = (data.departmentPayrollDistribution || []).map((d) => [
      `"${d.department}"`,
      `"${d.headCount}"`,
      `"${d.payrollSpend}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hr_workforce_report_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-xl border border-border shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
              <BarChart3 className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Human Resources Workforce & Payroll Analytics
              </h1>
              <p className="text-sm text-muted-foreground">
                Executive human capital intelligence, department payroll distributions in ₹, shift coverage, and compliance audits.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {TIMEFRAMES.map((tf) => (
            <Button
              key={tf.value}
              variant={timeframe === tf.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe(tf.value)}
              className="text-xs"
            >
              {tf.label}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Hospital Workforce
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : data?.totalWorkforce || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Medical, Nursing & Operations</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Monthly Payroll Commitment
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <IndianRupee className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 font-mono">
              {loading ? "..." : `₹${(data?.totalMonthlyPayroll || 0).toLocaleString("en-IN")}`}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Consolidated monthly gross salary</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Credential Compliance Rate
            </CardTitle>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-600">
              {loading ? "..." : complianceRate}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {data?.documentCompliance?.VERIFIED || 0} Verified of {(data?.documentCompliance?.VERIFIED || 0) + (data?.documentCompliance?.PENDING || 0)} Documents
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Shift Cycles
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              3 Cycles
            </div>
            <div className="text-xs text-muted-foreground mt-1">24/7 Ward & Emergency Coverage</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center p-16">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <>
          {/* Visual Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Role Distribution */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Workforce By Role</CardTitle>
                <CardDescription className="text-xs">Staff breakdown by clinical specialization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {Object.entries(data?.roleDistribution || {}).map(([role, count]) => {
                  const pct = data?.totalWorkforce ? Math.round((count / data.totalWorkforce) * 100) : 0;
                  return (
                    <div key={role} className="space-y-1">
                      <div className="flex justify-between text-muted-foreground font-medium">
                        <span>{role}</span>
                        <span className="text-foreground">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Shift Distribution */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Shift Allocation</CardTitle>
                <CardDescription className="text-xs">Coverage across hospital operating shifts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {Object.entries(data?.shiftDistribution || {}).map(([shift, count]) => {
                  const total = Object.values(data?.shiftDistribution || {}).reduce((a, b) => a + b, 0);
                  const pct = total ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={shift} className="space-y-1">
                      <div className="flex justify-between text-muted-foreground font-medium">
                        <span>{shift}</span>
                        <span className="text-foreground">{count} staff ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Leave Distribution */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Leave Categories</CardTitle>
                <CardDescription className="text-xs">Leave utilization across categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {Object.entries(data?.leaveTypeDistribution || {}).map(([type, count]) => {
                  const total = Object.values(data?.leaveTypeDistribution || {}).reduce((a, b) => a + b, 0);
                  const pct = total ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-muted-foreground font-medium">
                        <span>{type} LEAVE</span>
                        <span className="text-foreground">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Department Payroll Breakdown Table */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="p-4 border-b border-border">
              <CardTitle className="text-base font-semibold">Department-Wise Payroll Distribution</CardTitle>
              <CardDescription className="text-xs">
                Monthly gross compensation expenditure breakdown ranked by departmental budget
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 text-muted-foreground font-medium">
                    <tr>
                      <th className="p-3">Department</th>
                      <th className="p-3 text-center">Workforce Headcount</th>
                      <th className="p-3 text-right">Monthly Payroll (₹)</th>
                      <th className="p-3 text-right">Share of Total Payroll</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {(data?.departmentPayrollDistribution || []).map((dept) => {
                      const share = data?.totalMonthlyPayroll
                        ? Math.round((dept.payrollSpend / data.totalMonthlyPayroll) * 100)
                        : 0;
                      return (
                        <tr key={dept.department} className="hover:bg-muted/30">
                          <td className="p-3 font-semibold text-foreground">{dept.department}</td>
                          <td className="p-3 text-center font-medium">{dept.headCount} Personnel</td>
                          <td className="p-3 text-right font-mono font-bold text-foreground">
                            ₹{dept.payrollSpend.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 text-right font-mono text-muted-foreground">
                            {share}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
