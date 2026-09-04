"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  LogOut,
  ArrowLeft,
  RefreshCw,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Activity,
  UserCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function DischargeReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("ALL_TIME");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/discharges?timeframe=${timeframe}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast("Failed to load discharge reports: " + json.message, "error");
      }
    } catch (err: any) {
      toast("Error loading discharge reports: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const totalDischarges = data?.totalDischarges || 0;
  const averageLengthOfStay = data?.averageLengthOfStay || "0 days";
  const dischargeConditions = data?.dischargeConditions || {
    RECOVERED: 0,
    STABLE: 0,
    TRANSFERRED: 0,
    LAMA: 0,
    DECEASED: 0
  };
  const dischargesList: any[] = data?.dischargesList || [];

  const filteredDischarges = dischargesList.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.patientId?.name?.toLowerCase().includes(q) ||
      d.patientId?.uhid?.toLowerCase().includes(q) ||
      d.doctorId?.name?.toLowerCase().includes(q) ||
      d.dischargeCondition?.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    const headers = ["Patient Name", "UHID", "Discharge Date", "Condition", "Attending Doctor", "Discharge Advice"];
    const rows = dischargesList.map((d) => [
      `"${d.patientId?.name || "Patient"}"`,
      d.patientId?.uhid || "N/A",
      d.dischargeDate ? new Date(d.dischargeDate).toLocaleDateString("en-IN") : "N/A",
      d.dischargeCondition || "RECOVERED",
      `"${d.doctorId?.name || "Doctor"}"`,
      `"${d.dischargeAdvice || "Routine follow-up"}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Discharge_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast("Discharge report exported to CSV", "success");
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
            <span className="text-sm font-medium text-primary">Inpatient Discharges</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LogOut className="h-6 w-6 text-primary" />
            Inpatient Discharges & ALOS Analytics
          </h1>
          <p className="text-muted-foreground text-sm">
            Audited discharge conditions, Average Length of Stay (ALOS), recovery metrics, and transfer statistics.
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
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Discharges</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{totalDischarges}</h3>
              <p className="text-xs text-muted-foreground mt-1">Completed inpatient stays</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <LogOut className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Average Length of Stay</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">{averageLengthOfStay}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">Target benchmark: &lt; 4.5 days</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recovered / Stable</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">
                {(dischargeConditions.RECOVERED || 0) + (dischargeConditions.STABLE || 0)}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Positive clinical outcomes</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">LAMA / Transferred</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600">
                {(dischargeConditions.LAMA || 0) + (dischargeConditions.TRANSFERRED || 0)}
              </h3>
              <p className="text-xs text-amber-600 font-medium mt-1">
                {dischargeConditions.LAMA || 0} Left Against Medical Advice
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discharges Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Discharged Patients Register</CardTitle>
              <CardDescription className="text-xs">
                Inpatient discharge summaries, discharge conditions, and follow-up directives.
              </CardDescription>
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
                  <th className="p-3">Discharge Date</th>
                  <th className="p-3">Discharge Condition</th>
                  <th className="p-3">Attending Doctor</th>
                  <th className="p-3">Discharge Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredDischarges.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                      {loading ? "Loading discharge records..." : "No discharge records found."}
                    </td>
                  </tr>
                ) : (
                  filteredDischarges.map((dis: any) => (
                    <tr key={dis._id} className="hover:bg-muted/30 text-xs">
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{dis.patientId?.name || "Patient"}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">{dis.patientId?.uhid || "UHID-N/A"}</div>
                      </td>
                      <td className="p-3 text-foreground">
                        {dis.dischargeDate ? new Date(dis.dischargeDate).toLocaleDateString("en-IN") : "N/A"}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            dis.dischargeCondition === "RECOVERED" || dis.dischargeCondition === "STABLE"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-300"
                              : dis.dischargeCondition === "LAMA"
                              ? "bg-amber-50 text-amber-600 border-amber-300"
                              : "bg-rose-50 text-rose-600 border-rose-300"
                          }`}
                        >
                          {dis.dischargeCondition || "RECOVERED"}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{dis.doctorId?.name || "Attending Physician"}</td>
                      <td className="p-3 text-muted-foreground max-w-[280px] truncate">
                        {dis.dischargeAdvice || "Follow-up in OPD after 7 days"}
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
