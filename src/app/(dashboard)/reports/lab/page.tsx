"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FlaskConical,
  ArrowLeft,
  RefreshCw,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function LabReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("ALL_TIME");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/lab?timeframe=${timeframe}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast("Failed to load lab reports: " + json.message, "error");
      }
    } catch (err: any) {
      toast("Error loading lab reports: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const totalOrders = data?.totalOrders || 0;
  const statusBreakdown = data?.statusBreakdown || {};
  const priorityBreakdown = data?.priorityBreakdown || {};
  const recentOrders: any[] = data?.recentOrders || [];

  const completedCount = statusBreakdown.Completed || 0;
  const pendingCount = (statusBreakdown.Pending || 0) + (statusBreakdown["Sample Collected"] || 0) + (statusBreakdown.Processing || 0);
  const statCount = (priorityBreakdown.STAT || 0) + (priorityBreakdown.Urgent || 0);

  const filteredOrders = recentOrders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.patient?.name?.toLowerCase().includes(q) ||
      o.patient?.uhid?.toLowerCase().includes(q) ||
      o.doctor?.name?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    const headers = ["Patient Name", "UHID", "Doctor", "Order Date", "Priority", "Status"];
    const rows = recentOrders.map((o) => [
      `"${o.patient?.name || "Patient"}"`,
      o.patient?.uhid || "N/A",
      `"${o.doctor?.name || "Doctor"}"`,
      o.orderDate ? new Date(o.orderDate).toLocaleString("en-IN") : "N/A",
      o.priority || "Routine",
      o.status || "Pending"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Lab_Orders_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast("Lab report exported to CSV", "success");
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
            <span className="text-sm font-medium text-primary">Laboratory</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            Laboratory Test Ordering & Turnaround Analytics
          </h1>
          <p className="text-muted-foreground text-sm">
            Audited test order volumes, STAT priority workloads, specimen processing rates, and verification status.
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
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Lab Orders</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{totalOrders}</h3>
              <p className="text-xs text-muted-foreground mt-1">Diagnostic investigations ordered</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FlaskConical className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completed Tests</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">{completedCount}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">Verified lab results</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Processing / Pending</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600">{pendingCount}</h3>
              <p className="text-xs text-muted-foreground mt-1">In analysis or collection</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-rose-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">STAT & Urgent</p>
              <h3 className="text-2xl font-bold mt-1 text-rose-600">{statCount}</h3>
              <p className="text-xs text-rose-600 font-medium mt-1">Critical emergency priority</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lab Orders Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Laboratory Worklist Log</CardTitle>
              <CardDescription className="text-xs">Specimen collection and result status ledger.</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search patient, UHID, doctor..."
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
                  <th className="p-3">Ordering Physician</th>
                  <th className="p-3">Order Date</th>
                  <th className="p-3 text-center">Priority</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                      {loading ? "Loading lab orders..." : "No laboratory orders found."}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord: any) => (
                    <tr key={ord._id} className="hover:bg-muted/30 text-xs">
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{ord.patient?.name || "Patient"}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">{ord.patient?.uhid || "UHID-N/A"}</div>
                      </td>
                      <td className="p-3 text-muted-foreground">{ord.doctor?.name || "Hospital Staff"}</td>
                      <td className="p-3 text-foreground">
                        {ord.orderDate ? new Date(ord.orderDate).toLocaleString("en-IN") : "N/A"}
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            ord.priority === "STAT" || ord.priority === "Urgent"
                              ? "bg-rose-50 text-rose-600 border-rose-300"
                              : "bg-blue-50 text-blue-600 border-blue-300"
                          }`}
                        >
                          {ord.priority || "Routine"}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            ord.status === "Completed"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-300"
                              : ord.status === "Processing"
                              ? "bg-purple-50 text-purple-600 border-purple-300"
                              : "bg-amber-50 text-amber-600 border-amber-300"
                          }`}
                        >
                          {ord.status || "Pending"}
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
  );
}
