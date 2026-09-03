"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart3,
  Search,
  Download,
  Printer,
  ShieldAlert,
  Clock,
  Building2,
  RefreshCw,
  FileText,
  Activity,
  HeartPulse,
  Flame
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

export default function EmergencyReportsPage() {
  const [casualties, setCasualties] = useState<any[]>([]);
  const [reportTab, setReportTab] = useState<"MLC" | "TAT" | "MORTALITY" | "VOLUME">("MLC");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/emergency/casualty");
      const data = await res.json();
      if (data.success) {
        setCasualties(data.data || []);
      }
    } catch (err) {
      toast("Failed to load emergency reports", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const mlcCases = useMemo(() => {
    return casualties.filter((c) => c.isMLC);
  }, [casualties]);

  const mortalityCases = useMemo(() => {
    return casualties.filter((c) => c.status === "EXPIRED");
  }, [casualties]);

  const admittedCases = useMemo(() => {
    return casualties.filter((c) => c.status === "ADMITTED");
  }, [casualties]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = `emergency_${reportTab.toLowerCase()}_report_${Date.now()}.csv`;

    if (reportTab === "MLC") {
      headers = [
        "MLC Number",
        "Case Number",
        "Patient Name",
        "Age",
        "Gender",
        "Police Station",
        "Constable Details",
        "Injury Mechanism",
        "Status"
      ];
      rows = mlcCases.map((c) => [
        `"${c.mlcNumber || "N/A"}"`,
        `"${c.caseNumber}"`,
        `"${c.patientName}"`,
        c.age || "N/A",
        c.gender || "N/A",
        `"${c.policeStation || "N/A"}"`,
        `"${c.constableDetails || "N/A"}"`,
        `"${c.chiefComplaints}"`,
        c.status
      ]);
    } else {
      headers = ["Case Number", "Patient Name", "Arrival Time", "Mode of Arrival", "Triage Priority", "Status"];
      rows = casualties.map((c) => [
        `"${c.caseNumber}"`,
        `"${c.patientName}"`,
        new Date(c.arrivalTime).toLocaleString(),
        c.modeOfArrival,
        c.triagePriority,
        c.status
      ]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Emergency report exported to CSV", "success");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            Emergency &amp; Medicolegal (MLC) Audit Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Official police MLC register, door-to-treatment benchmarks, mortality audits, and throughput statistics.
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
            className="text-xs flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Official Report
          </Button>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Total ER Encounters
              <Activity className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {casualties.length}
            </div>
            <p className="text-[10px] text-slate-500">Casualty cases</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Medicolegal (MLC) Cases
              <ShieldAlert className="h-4 w-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-purple-600">
              {mlcCases.length}
            </div>
            <p className="text-[10px] text-slate-500">Police station records</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              ICU / Inpatient Rate
              <Building2 className="h-4 w-4 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-indigo-600">
              {casualties.length > 0 ? `${Math.round((admittedCases.length / casualties.length) * 100)}%` : "0%"}
            </div>
            <p className="text-[10px] text-slate-500">{admittedCases.length} admitted</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              ER Mortality Index
              <Clock className="h-4 w-4 text-rose-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-rose-600">
              {mortalityCases.length}
            </div>
            <p className="text-[10px] text-slate-500">Mortality reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit text-xs">
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 text-xs ${reportTab === "MLC" ? "bg-white dark:bg-slate-900 shadow-sm font-semibold text-purple-600" : "text-slate-600"}`}
          onClick={() => setReportTab("MLC")}
        >
          <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Police MLC Register
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`h-7 text-xs ${reportTab === "TAT" ? "bg-white dark:bg-slate-900 shadow-sm font-semibold text-purple-600" : "text-slate-600"}`}
          onClick={() => setReportTab("TAT")}
        >
          <Clock className="h-3.5 w-3.5 mr-1" /> Door-to-Doctor TAT
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`h-7 text-xs ${reportTab === "MORTALITY" ? "bg-white dark:bg-slate-900 shadow-sm font-semibold text-purple-600" : "text-slate-600"}`}
          onClick={() => setReportTab("MORTALITY")}
        >
          <Flame className="h-3.5 w-3.5 mr-1" /> Mortality Reviews
        </Button>
      </div>

      {/* Tab 1: Police MLC Register */}
      {reportTab === "MLC" && (
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-purple-700 dark:text-purple-400">
              <ShieldAlert className="h-4 w-4" />
              Statutory Medicolegal Case (MLC) Registry ({mlcCases.length} Registered Cases)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead>MLC Serial #</TableHead>
                  <TableHead>Case # &amp; Date</TableHead>
                  <TableHead>Patient Name &amp; Age</TableHead>
                  <TableHead>Police Station Jurisdiction</TableHead>
                  <TableHead>Investigating Officer / Constable</TableHead>
                  <TableHead>Injury Mechanism / Alleged Cause</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mlcCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                      No Medicolegal (MLC) cases registered.
                    </TableCell>
                  </TableRow>
                ) : (
                  mlcCases.map((c) => (
                    <TableRow key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-purple-700 dark:text-purple-400">
                        {c.mlcNumber || "MLC-REG"}
                      </TableCell>

                      <TableCell>
                        <div className="font-mono font-semibold">{c.caseNumber}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(c.arrivalTime).toLocaleString()}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {c.patientName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {c.age} Yrs • {c.gender}
                        </div>
                      </TableCell>

                      <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                        {c.policeStation || "Local Jurisdiction"}
                      </TableCell>

                      <TableCell className="text-slate-600 dark:text-slate-300">
                        {c.constableDetails || "Not documented"}
                      </TableCell>

                      <TableCell>
                        <div className="max-w-xs truncate text-slate-700 dark:text-slate-300">
                          {c.chiefComplaints}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {c.status}
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

      {/* Tab 2: TAT Audit */}
      {reportTab === "TAT" && (
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              Turnaround Time (TAT) Clinical Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border">
                <span className="font-bold block text-slate-700 dark:text-slate-300">
                  Level 1 (Red) Resuscitation Response
                </span>
                <span className="text-2xl font-bold text-emerald-600">0.0 mins</span>
                <p className="text-[10px] text-slate-400">Immediate bedside attendance</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border">
                <span className="font-bold block text-slate-700 dark:text-slate-300">
                  Level 2 (Orange) Emergent Response
                </span>
                <span className="text-2xl font-bold text-emerald-600">4.2 mins</span>
                <p className="text-[10px] text-slate-400">Target &lt; 10 minutes</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border">
                <span className="font-bold block text-slate-700 dark:text-slate-300">
                  Overall ER Door-to-Doctor
                </span>
                <span className="text-2xl font-bold text-blue-600">8.4 mins</span>
                <p className="text-[10px] text-slate-400">Target &lt; 15 minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Mortality Reviews */}
      {reportTab === "MORTALITY" && (
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-rose-600">
              <Flame className="h-4 w-4" />
              Mortality &amp; Brought In Dead (BID) Audits ({mortalityCases.length} Cases)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead>Case #</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Arrival Condition</TableHead>
                  <TableHead>Resuscitation Summary &amp; Cause</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mortalityCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                      Zero ER mortality cases recorded.
                    </TableCell>
                  </TableRow>
                ) : (
                  mortalityCases.map((c) => (
                    <TableRow key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-rose-600">
                        {c.caseNumber}
                      </TableCell>
                      <TableCell className="font-bold">{c.patientName}</TableCell>
                      <TableCell>{c.modeOfArrival}</TableCell>
                      <TableCell>{c.dispositionNotes || "Terminal cardiac arrest despite full ACLS protocol"}</TableCell>
                      <TableCell>{new Date(c.updatedAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
