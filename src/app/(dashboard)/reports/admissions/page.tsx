"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Hospital,
  ArrowLeft,
  RefreshCw,
  Printer,
  Download,
  AlertTriangle,
  Calendar,
  Bed,
  UserCheck,
  Search,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function AdmissionReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("ALL_TIME");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/admissions?timeframe=${timeframe}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast("Failed to load admission reports: " + json.message, "error");
      }
    } catch (err: any) {
      toast("Error loading admission reports: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const totalAdmissions = data?.totalAdmissions || 0;
  const activeInpatients = data?.activeInpatients || 0;
  const admissionTypes = data?.admissionTypes || { emergency: 0, elective: 0 };
  const admissionsList: any[] = data?.admissionsList || [];

  const filteredAdmissions = admissionsList.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.patientId?.name?.toLowerCase().includes(q) ||
      a.patientId?.uhid?.toLowerCase().includes(q) ||
      a.doctorId?.name?.toLowerCase().includes(q) ||
      a.admissionType?.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    const headers = ["Patient Name", "UHID", "Admission Date", "Type", "Bed", "Doctor", "Department", "Status"];
    const rows = admissionsList.map((a) => [
      `"${a.patientId?.name || "Patient"}"`,
      a.patientId?.uhid || "N/A",
      a.admissionDate ? new Date(a.admissionDate).toLocaleDateString("en-IN") : "N/A",
      a.admissionType || "PLANNED",
      a.bedId?.bedNumber || "Unassigned",
      `"${a.doctorId?.name || "Doctor"}"`,
      `"${a.departmentId?.name || "IPD"}"`,
      a.status || "ADMITTED"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Admission_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast("Admissions report exported to CSV", "success");
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
            <span className="text-sm font-medium text-primary">Inpatient Admissions</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Hospital className="h-6 w-6 text-primary" />
            Inpatient Admissions Analytics
          </h1>
          <p className="text-muted-foreground text-sm">
            Audited admission rates, emergency intake vs elective hospitalization, and bed allocations.
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
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Admissions</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{totalAdmissions}</h3>
              <p className="text-xs text-muted-foreground mt-1">Inpatient hospitalizations</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Hospital className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Census</p>
              <h3 className="text-2xl font-bold mt-1 text-purple-600">{activeInpatients} Patients</h3>
              <p className="text-xs text-muted-foreground mt-1">Currently admitted in wards</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
              <Bed className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-rose-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Emergency Admissions</p>
              <h3 className="text-2xl font-bold mt-1 text-rose-600">{admissionTypes.emergency}</h3>
              <p className="text-xs text-rose-600 font-medium mt-1">Trauma & critical intake</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Elective / Planned</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">{admissionTypes.elective}</h3>
              <p className="text-xs text-blue-600 font-medium mt-1">Scheduled surgeries & care</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admissions Log Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Inpatient Admissions Log</CardTitle>
              <CardDescription className="text-xs">
                Comprehensive roster of admitted patients and bed placements.
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
                  <th className="p-3">Admission Date</th>
                  <th className="p-3">Admission Type</th>
                  <th className="p-3">Bed Allocation</th>
                  <th className="p-3">Attending Doctor</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                      {loading ? "Loading admission records..." : "No admission records found."}
                    </td>
                  </tr>
                ) : (
                  filteredAdmissions.map((adm: any) => (
                    <tr key={adm._id} className="hover:bg-muted/30 text-xs">
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{adm.patientId?.name || "Patient"}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">{adm.patientId?.uhid || "UHID-N/A"}</div>
                      </td>
                      <td className="p-3 text-foreground">
                        {adm.admissionDate ? new Date(adm.admissionDate).toLocaleDateString("en-IN") : "N/A"}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            adm.admissionType === "EMERGENCY"
                              ? "bg-rose-50 text-rose-600 border-rose-300"
                              : "bg-blue-50 text-blue-600 border-blue-300"
                          }`}
                        >
                          {adm.admissionType || "PLANNED"}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono font-medium text-foreground">
                        {adm.bedId?.bedNumber || "Unassigned"}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {adm.doctorId?.name || "Consultant"}
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            adm.status === "ADMITTED" || adm.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {adm.status || "ADMITTED"}
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
