"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  ArrowLeft,
  RefreshCw,
  Printer,
  Download,
  IndianRupee,
  Building2,
  Calendar,
  Search,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function DoctorReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reports/doctors");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast("Failed to load doctor reports: " + json.message, "error");
      }
    } catch (err: any) {
      toast("Error loading doctor report: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalDoctors = data?.totalDoctors || 0;
  const activeDoctors = data?.activeDoctors || 0;
  const doctorPerformance: any[] = data?.doctorPerformance || [];

  const totalConsultations = doctorPerformance.reduce((sum, d) => sum + Number(d.consultationsCount || 0), 0);
  const totalDoctorRevenue = doctorPerformance.reduce((sum, d) => sum + Number(d.estimatedRevenue || 0), 0);

  const filteredDoctors = doctorPerformance.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q) ||
      d.department?.toLowerCase().includes(q) ||
      d.licenseNo?.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    const headers = ["Doctor Name", "Specialization", "Department", "Consultation Fee (INR)", "Consultations", "Estimated Revenue (INR)", "Status"];
    const rows = doctorPerformance.map((d) => [
      `"${d.name}"`,
      `"${d.specialization}"`,
      `"${d.department}"`,
      d.consultationFee,
      d.consultationsCount,
      d.estimatedRevenue,
      d.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Doctor_Productivity_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast("Doctor report exported", "success");
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
            <span className="text-sm font-medium text-primary">Doctor Productivity</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" />
            Doctor Consultations & Productivity Analytics
          </h1>
          <p className="text-muted-foreground text-sm">
            Audited clinical consultations by physician, OPD load distribution, and consultation revenue yield in ₹.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Medical Staff</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{totalDoctors}</h3>
              <p className="text-xs text-muted-foreground mt-1">{activeDoctors} active consultants</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Consultations</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">{totalConsultations}</h3>
              <p className="text-xs text-muted-foreground mt-1">Outpatient encounters delivered</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Consultation Revenue</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                ₹{totalDoctorRevenue.toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Estimated direct OPD billing</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg Load / Doctor</p>
              <h3 className="text-2xl font-bold mt-1 text-purple-600">
                {activeDoctors > 0 ? Math.round(totalConsultations / activeDoctors) : 0} Patients
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Per physician workload</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctor Performance Scorecard */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Doctor Consultation Productivity Ledger</CardTitle>
              <CardDescription className="text-xs">
                Performance breakdown by physician, clinical specialization, and consultation volume.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search doctor, specialty..."
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
                  <th className="p-3">Doctor & License</th>
                  <th className="p-3">Specialization</th>
                  <th className="p-3">Department</th>
                  <th className="p-3 text-right">Fee (₹)</th>
                  <th className="p-3 text-center">Consultations</th>
                  <th className="p-3 text-right">Estimated Revenue (₹)</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                      {loading ? "Loading doctor productivity records..." : "No doctors found matching search."}
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-muted/30 text-xs">
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{doc.name}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">Lic: {doc.licenseNo || "MCI-N/A"}</div>
                      </td>
                      <td className="p-3 text-muted-foreground">{doc.specialization}</td>
                      <td className="p-3 text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground/60" />
                        {doc.department}
                      </td>
                      <td className="p-3 text-right font-mono">₹{doc.consultationFee}</td>
                      <td className="p-3 text-center font-bold text-foreground">
                        <span className="px-2 py-0.5 rounded-full bg-muted">{doc.consultationsCount}</span>
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        ₹{Number(doc.estimatedRevenue || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            doc.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {doc.status}
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
