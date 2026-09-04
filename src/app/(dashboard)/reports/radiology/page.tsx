"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Radio,
  ArrowLeft,
  RefreshCw,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  Activity,
  Search,
  Layers
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function RadiologyReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("ALL_TIME");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/radiology?timeframe=${timeframe}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast("Failed to load radiology reports: " + json.message, "error");
      }
    } catch (err: any) {
      toast("Error loading radiology reports: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const totalStudies = data?.totalStudies || 0;
  const modalityDistribution = data?.modalityDistribution || {};
  const statusDistribution = data?.statusDistribution || {};
  const recentStudies: any[] = data?.recentStudies || [];

  const completedCount = statusDistribution.COMPLETED || 0;
  const inProgressCount = (statusDistribution.IN_PROGRESS || 0) + (statusDistribution.SCHEDULED || 0);

  const filteredStudies = recentStudies.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.patient?.name?.toLowerCase().includes(q) ||
      s.patient?.uhid?.toLowerCase().includes(q) ||
      s.studyType?.toLowerCase().includes(q) ||
      s.modality?.toLowerCase().includes(q) ||
      s.status?.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    const headers = ["Patient Name", "UHID", "Study Type", "Modality", "Date Ordered", "Status"];
    const rows = recentStudies.map((s) => [
      `"${s.patient?.name || "Patient"}"`,
      s.patient?.uhid || "N/A",
      `"${s.studyType || "Imaging Scan"}"`,
      s.modality || "X-RAY",
      s.createdAt ? new Date(s.createdAt).toLocaleString("en-IN") : "N/A",
      s.status || "COMPLETED"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Radiology_Studies_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast("Radiology report exported to CSV", "success");
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
            <span className="text-sm font-medium text-primary">Radiology & Imaging</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Radio className="h-6 w-6 text-primary" />
            Radiology & Imaging Modality Analytics
          </h1>
          <p className="text-muted-foreground text-sm">
            Audited study loads across imaging equipment (MRI, CT, X-Ray, Ultrasound), PACS verification, and radiologist reports.
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
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Imaging Scans</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{totalStudies}</h3>
              <p className="text-xs text-muted-foreground mt-1">Diagnostic radiological studies</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Radio className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completed Scans</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">{completedCount}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">Verified radiologist reports</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">CT & MRI Scans</p>
              <h3 className="text-2xl font-bold mt-1 text-purple-600">
                {(modalityDistribution.CT || 0) + (modalityDistribution.MRI || 0)}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Advanced cross-sectional imaging</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scheduled / In-Scan</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">{inProgressCount}</h3>
              <p className="text-xs text-blue-600 font-medium mt-1">Active examination queue</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Modality Distribution + Recent Studies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modality Breakdown (1 col) */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-semibold">Modality Utilization</CardTitle>
            <CardDescription className="text-xs">Volume distribution by imaging equipment type.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {Object.entries(modalityDistribution).map(([mod, count]: [string, any]) => (
              <div key={mod} className="flex justify-between items-center p-2.5 rounded-lg bg-muted/40 text-xs">
                <span className="font-semibold text-foreground font-mono">{mod}</span>
                <Badge variant="outline" className="text-xs">
                  {count} studies
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Radiology Studies Log (2 cols) */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">Radiological Examination Log</CardTitle>
                  <CardDescription className="text-xs">PACS studies and radiologist review status.</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search study, patient, modality..."
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
                      <th className="p-3">Patient & UHID</th>
                      <th className="p-3">Study Description</th>
                      <th className="p-3 text-center">Modality</th>
                      <th className="p-3">Ordered Date</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredStudies.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                          {loading ? "Loading radiology studies..." : "No imaging studies found."}
                        </td>
                      </tr>
                    ) : (
                      filteredStudies.map((std: any) => (
                        <tr key={std._id} className="hover:bg-muted/30 text-xs">
                          <td className="p-3">
                            <div className="font-semibold text-foreground">{std.patient?.name || "Patient"}</div>
                            <div className="font-mono text-[11px] text-muted-foreground">{std.patient?.uhid || "UHID-N/A"}</div>
                          </td>
                          <td className="p-3 text-foreground font-medium">{std.studyType || "Standard Imaging"}</td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className="font-mono text-[10px]">
                              {std.modality || "X-RAY"}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {std.createdAt ? new Date(std.createdAt).toLocaleDateString("en-IN") : "N/A"}
                          </td>
                          <td className="p-3 text-center">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                std.status === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-300"
                                  : "bg-blue-50 text-blue-600 border-blue-300"
                              }`}
                            >
                              {std.status || "COMPLETED"}
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
