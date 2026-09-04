"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  ArrowLeft,
  RefreshCw,
  Printer,
  Download,
  IndianRupee,
  Users,
  Hospital,
  Activity,
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function DepartmentReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reports/departments");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast("Failed to load department reports: " + json.message, "error");
      }
    } catch (err: any) {
      toast("Error loading department reports: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalDepartments = data?.totalDepartments || 0;
  const departmentPerformance: any[] = data?.departmentPerformance || [];

  const totalFootfall = departmentPerformance.reduce((sum, d) => sum + Number(d.totalFootfall || 0), 0);
  const totalDepartmentRevenue = departmentPerformance.reduce((sum, d) => sum + Number(d.revenue || 0), 0);

  const filteredDepartments = departmentPerformance.filter((d) => {
    const q = searchQuery.toLowerCase();
    return d.name?.toLowerCase().includes(q) || d.code?.toLowerCase().includes(q);
  });

  const handleExportCSV = () => {
    const headers = ["Department Name", "Code", "OPD Appointments", "IPD Admissions", "Total Footfall", "Revenue (INR)"];
    const rows = departmentPerformance.map((d) => [
      `"${d.name}"`,
      d.code,
      d.appointmentCount,
      d.admissionCount,
      d.totalFootfall,
      d.revenue
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Department_Performance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast("Department report exported to CSV", "success");
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
            <span className="text-sm font-medium text-primary">Departments</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Hospital Department Performance & Revenue Analytics
          </h1>
          <p className="text-muted-foreground text-sm">
            Audited specialty footfalls, outpatient consultations, inpatient admissions, and departmental revenues in ₹.
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
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Specialties</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{totalDepartments}</h3>
              <p className="text-xs text-muted-foreground mt-1">Operational hospital departments</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Patient Footfall</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">{totalFootfall}</h3>
              <p className="text-xs text-muted-foreground mt-1">OPD consultations + IPD admissions</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Departmental Revenue</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                ₹{totalDepartmentRevenue.toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Direct specialty billing yield</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg Load / Specialty</p>
              <h3 className="text-2xl font-bold mt-1 text-purple-600">
                {totalDepartments > 0 ? Math.round(totalFootfall / totalDepartments) : 0} Patients
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Average patient encounters</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
              <Hospital className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Specialty Performance Ledger</CardTitle>
              <CardDescription className="text-xs">
                Operational volume, patient footfall, and direct revenue breakdown by clinical department.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search department..."
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
                  <th className="p-3">Department</th>
                  <th className="p-3">Code</th>
                  <th className="p-3 text-center">OPD Appointments</th>
                  <th className="p-3 text-center">IPD Admissions</th>
                  <th className="p-3 text-center">Total Footfall</th>
                  <th className="p-3 text-right">Revenue (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                      {loading ? "Loading departments..." : "No departments found matching search."}
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map((dept: any) => (
                    <tr key={dept.id} className="hover:bg-muted/30 text-xs">
                      <td className="p-3 font-semibold text-foreground flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        {dept.name}
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">{dept.code}</td>
                      <td className="p-3 text-center font-medium text-foreground">{dept.appointmentCount}</td>
                      <td className="p-3 text-center font-medium text-purple-600">{dept.admissionCount}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-muted font-bold text-foreground font-mono">
                          {dept.totalFootfall}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600 font-mono">
                        ₹{Number(dept.revenue || 0).toLocaleString("en-IN")}
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
