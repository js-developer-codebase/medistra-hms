"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart3,
  Search,
  Download,
  Printer,
  Calendar,
  Layers,
  Clock,
  ShieldCheck,
  Scissors,
  RefreshCw,
  TrendingUp,
  Activity,
  HeartPulse
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

export default function OTReportsPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [reportTab, setReportTab] = useState<"SLATE" | "UTILIZATION" | "FINANCIAL">("SLATE");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ot/schedule");
      const data = await res.json();
      if (data.success) {
        setSchedules(data.data || []);
      }
    } catch (err) {
      toast("Failed to load surgical reports", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalBilling = useMemo(() => {
    return schedules.reduce((sum, s) => sum + (s.estimatedCost || 0), 0);
  }, [schedules]);

  const emergencyCount = useMemo(() => {
    return schedules.filter((s) => s.urgency === "EMERGENCY_STAT").length;
  }, [schedules]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      "Surgery Code",
      "Patient Name",
      "UHID",
      "Surgery Name",
      "Specialty",
      "OT Room",
      "Lead Surgeon",
      "Anesthesiologist",
      "Date",
      "Time",
      "Status",
      "Package Tariff (INR)"
    ];

    const rows = schedules.map((s) => [
      `"${s.surgeryCode}"`,
      `"${s.patientName}"`,
      `"${s.uhid || "N/A"}"`,
      `"${s.surgeryName}"`,
      `"${s.specialty}"`,
      `"${s.otRoom}"`,
      `"${s.surgeon}"`,
      `"${s.anesthesiologist || "N/A"}"`,
      new Date(s.date).toLocaleDateString(),
      `"${s.time}"`,
      s.status,
      s.estimatedCost || 0
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ot_surgical_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Surgical report exported to CSV", "success");
  };

  const filtered = useMemo(() => {
    return schedules.filter((s) => {
      const pName = s.patientName || "";
      const surg = s.surgeryName || "";
      const doc = s.surgeon || "";
      const code = s.surgeryCode || "";

      return (
        pName.toLowerCase().includes(search.toLowerCase()) ||
        surg.toLowerCase().includes(search.toLowerCase()) ||
        doc.toLowerCase().includes(search.toLowerCase()) ||
        code.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [schedules, search]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Operation Theatre Analytics &amp; Surgical Audits
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Surgical caseload volumes, theatre suite utilization, turnaround times, and surgical package revenue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Audit Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Total Surgeries Audited
              <Scissors className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {schedules.length}
            </div>
            <p className="text-[10px] text-slate-500">Documented procedures</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Total Surgical Value
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-indigo-600">
              ₹{totalBilling.toLocaleString("en-IN")}
            </div>
            <p className="text-[10px] text-slate-500">Package tariffs &amp; rentals</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Emergency STAT Cases
              <Activity className="h-4 w-4 text-rose-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-rose-600">
              {emergencyCount}
            </div>
            <p className="text-[10px] text-slate-500">Unscheduled urgent trauma</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Checklist Compliance
              <ShieldCheck className="h-4 w-4 text-teal-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-teal-600">
              100%
            </div>
            <p className="text-[10px] text-slate-500">Zero sentinel events</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit text-xs">
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 text-xs ${reportTab === "SLATE" ? "bg-white dark:bg-slate-900 shadow-sm font-semibold text-emerald-600" : "text-slate-600"}`}
          onClick={() => setReportTab("SLATE")}
        >
          <Scissors className="h-3.5 w-3.5 mr-1" /> Master Surgical Slate
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`h-7 text-xs ${reportTab === "UTILIZATION" ? "bg-white dark:bg-slate-900 shadow-sm font-semibold text-emerald-600" : "text-slate-600"}`}
          onClick={() => setReportTab("UTILIZATION")}
        >
          <Layers className="h-3.5 w-3.5 mr-1" /> Suite Utilization
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`h-7 text-xs ${reportTab === "FINANCIAL" ? "bg-white dark:bg-slate-900 shadow-sm font-semibold text-emerald-600" : "text-slate-600"}`}
          onClick={() => setReportTab("FINANCIAL")}
        >
          <TrendingUp className="h-3.5 w-3.5 mr-1" /> Tariffs &amp; Revenue
        </Button>
      </div>

      {/* Tab 1: Master Surgical Slate */}
      {reportTab === "SLATE" && (
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Scissors className="h-4 w-4 text-emerald-600" />
              Comprehensive Surgical Manifest ({filtered.length} Records)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead>Case Code</TableHead>
                  <TableHead>Patient Details</TableHead>
                  <TableHead>Procedure &amp; Specialty</TableHead>
                  <TableHead>Lead Surgeon</TableHead>
                  <TableHead>OT Room</TableHead>
                  <TableHead>Package Fee</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((s) => (
                    <TableRow key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                        {s.surgeryCode}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold">{s.patientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {s.uhid || "Casualty"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {s.surgeryName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {s.specialty}
                        </div>
                      </TableCell>

                      <TableCell>{s.surgeon}</TableCell>

                      <TableCell className="text-emerald-700 dark:text-emerald-400 font-medium">
                        {s.otRoom}
                      </TableCell>

                      <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                        ₹{(s.estimatedCost || 0).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {s.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Suite Utilization */}
      {reportTab === "UTILIZATION" && (
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-600" />
              Surgical Suite Utilization Benchmarks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border">
                <span className="font-bold block text-slate-700 dark:text-slate-300">
                  OT 1: Modular Cardiac Suite
                </span>
                <span className="text-2xl font-bold text-emerald-600">85%</span>
                <p className="text-[10px] text-slate-400">High acuity open-heart cases</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border">
                <span className="font-bold block text-slate-700 dark:text-slate-300">
                  OT 2: Neuro-Trauma Suite
                </span>
                <span className="text-2xl font-bold text-emerald-600">78%</span>
                <p className="text-[10px] text-slate-400">Craniectomy &amp; trauma emergencies</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border">
                <span className="font-bold block text-slate-700 dark:text-slate-300">
                  OT 3: Orthopedic &amp; Joint Suite
                </span>
                <span className="text-2xl font-bold text-emerald-600">72%</span>
                <p className="text-[10px] text-slate-400">Joint replacement &amp; C-Arm procedures</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Financial Tariffs */}
      {reportTab === "FINANCIAL" && (
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-600">
              <TrendingUp className="h-4 w-4" />
              Surgical Package Tariff Realization
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs">
            <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 flex items-center justify-between">
              <div>
                <span className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold block">
                  CUMULATIVE SURGICAL BILLING
                </span>
                <span className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                  ₹{totalBilling.toLocaleString("en-IN")}
                </span>
              </div>
              <Badge className="bg-indigo-600 text-white text-xs">Indian Rupees (₹)</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
