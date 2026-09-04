"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  RefreshCw,
  Printer,
  Download,
  FileText,
  HeartPulse,
  Search,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function ClinicalReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("ALL_TIME");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/clinical?timeframe=${timeframe}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast("Failed to load clinical reports: " + json.message, "error");
      }
    } catch (err: any) {
      toast("Error loading clinical reports: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const totalDiagnosesLogged = data?.totalDiagnosesLogged || 0;
  const totalClinicalRecords = data?.totalClinicalRecords || 0;
  const topDiagnoses: any[] = data?.topDiagnoses || [];
  const recordTypeDistribution = data?.recordTypeDistribution || {};
  const recentDiagnoses: any[] = data?.recentDiagnoses || [];

  const filteredDiagnoses = recentDiagnoses.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.description?.toLowerCase().includes(q) ||
      d.code?.toLowerCase().includes(q) ||
      d.patient?.name?.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    const headers = ["Diagnosis Description", "ICD-10 Code", "Patient Name", "Status", "Date Diagnosed"];
    const rows = recentDiagnoses.map((d) => [
      `"${d.description || "General Diagnosis"}"`,
      d.code || "N/A",
      `"${d.patient?.name || "Patient"}"`,
      d.status || "Active",
      d.dateDiagnosed ? new Date(d.dateDiagnosed).toLocaleDateString("en-IN") : "N/A"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Clinical_Diagnoses_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast("Clinical report exported to CSV", "success");
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
            <span className="text-sm font-medium text-primary">Clinical & Diagnoses</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Clinical Diagnoses & Morbidity Analytics
          </h1>
          <p className="text-muted-foreground text-sm">
            Audited clinical morbidity patterns, top ICD diagnoses, treatment documentation, and patient problem registries.
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
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Diagnoses Logged</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{totalDiagnosesLogged}</h3>
              <p className="text-xs text-muted-foreground mt-1">Confirmed clinical findings</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clinical Records</p>
              <h3 className="text-2xl font-bold mt-1 text-purple-600">{totalClinicalRecords}</h3>
              <p className="text-xs text-muted-foreground mt-1">SOAP notes & treatment plans</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top Condition</p>
              <h3 className="text-lg font-bold mt-1 text-emerald-600 truncate max-w-[180px]">
                {topDiagnoses[0]?.name || "Hypertension"}
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                {topDiagnoses[0]?.count || 0} documented cases
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <HeartPulse className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Primary Disease Types</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">{topDiagnoses.length}</h3>
              <p className="text-xs text-muted-foreground mt-1">Distinct clinical categories</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Top Diagnoses + Diagnosis Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Diagnoses (1 col) */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-semibold">Top Morbidity Patterns</CardTitle>
            <CardDescription className="text-xs">Most prevalent clinical conditions diagnosed.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {topDiagnoses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No diagnoses logged in selected timeframe.
              </div>
            ) : (
              topDiagnoses.map((diag, idx) => (
                <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-muted/40 text-xs">
                  <span className="font-medium text-foreground truncate max-w-[200px]">{diag.name}</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {diag.count} cases
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Diagnosis Log Table (2 cols) */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">Diagnoses Case Register</CardTitle>
                  <CardDescription className="text-xs">Recent patient diagnoses recorded by medical staff.</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search condition, ICD code..."
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
                      <th className="p-3">Condition / Diagnosis</th>
                      <th className="p-3">ICD Code</th>
                      <th className="p-3">Patient</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredDiagnoses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                          {loading ? "Loading diagnoses..." : "No clinical diagnoses found."}
                        </td>
                      </tr>
                    ) : (
                      filteredDiagnoses.map((d: any) => (
                        <tr key={d._id} className="hover:bg-muted/30 text-xs">
                          <td className="p-3 font-medium text-foreground">{d.description || "Diagnosis"}</td>
                          <td className="p-3 font-mono text-muted-foreground">{d.code || "ICD-10"}</td>
                          <td className="p-3 text-muted-foreground">{d.patient?.name || "Patient"}</td>
                          <td className="p-3 text-muted-foreground">
                            {d.dateDiagnosed ? new Date(d.dateDiagnosed).toLocaleDateString("en-IN") : "N/A"}
                          </td>
                          <td className="p-3 text-center">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                d.status === "Active"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-300"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {d.status || "Active"}
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
      </div>
    </div>
  );
}
