"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Users,
  Stethoscope,
  IndianRupee,
  Search,
  Download,
  RefreshCw,
  Loader2,
  MapPin,
  PhoneCall,
  Scale
} from "lucide-react";

interface HRDepartmentItem {
  _id: string;
  name: string;
  code: string;
  location: string;
  phoneExtension: string;
  headCount: number;
  staffCount: number;
  doctorCount: number;
  ratio: string;
  monthlyPayroll: number;
  staff: any[];
}

export default function HRDepartmentsPage() {
  const [departments, setDepartments] = useState<HRDepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hr/departments");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDepartments(json.data);
      }
    } catch (err) {
      console.error("Failed to load HR departments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDepts = useMemo(() => {
    return departments.filter((d) => {
      const q = search.toLowerCase();
      return (
        !search ||
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q)
      );
    });
  }, [departments, search]);

  const summary = useMemo(() => {
    const totalStaff = departments.reduce((sum, d) => sum + d.staffCount, 0);
    const totalDoctors = departments.reduce((sum, d) => sum + d.doctorCount, 0);
    const totalPayroll = departments.reduce((sum, d) => sum + d.monthlyPayroll, 0);
    return { totalStaff, totalDoctors, totalPayroll };
  }, [departments]);

  const handleExportCSV = () => {
    const headers = ["Department Code", "Department Name", "Location", "Doctors Count", "Staff Count", "Total Headcount", "Staff-to-Doctor Ratio", "Monthly Payroll (INR)"];
    const rows = filteredDepts.map((d) => [
      `"${d.code}"`,
      `"${d.name}"`,
      `"${d.location}"`,
      `"${d.doctorCount}"`,
      `"${d.staffCount}"`,
      `"${d.headCount}"`,
      `"${d.ratio}"`,
      `"${d.monthlyPayroll}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hr_department_workforce_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
              <Building2 className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Department Workforce & Payroll Allocations
              </h1>
              <p className="text-sm text-muted-foreground">
                Departmental human capital distribution, clinical doctor-to-staff ratios, and monthly payroll allocations in ₹.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Active Units
            </CardTitle>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600">
              <Building2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : departments.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Clinical & support departments</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Specialist Physicians
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <Stethoscope className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {loading ? "..." : summary.totalDoctors}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Assigned to specialty units</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assigned Nursing & Techs
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {loading ? "..." : summary.totalStaff}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Operational support staff</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Consolidated Payroll (₹)
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <IndianRupee className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-mono">
              {loading ? "..." : `₹${summary.totalPayroll.toLocaleString("en-IN")}`}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Monthly compensation liability</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Filter */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search department name, code, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Departments Table */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="p-4 border-b border-border">
          <CardTitle className="text-base font-semibold">Department Workforce Distribution</CardTitle>
          <CardDescription className="text-xs">
            Showing headcount, staffing ratios, and monthly payroll budget allocation by clinical unit
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-xs">
                  <TableHead className="w-[100px]">Code</TableHead>
                  <TableHead>Department Name</TableHead>
                  <TableHead>Location & Extension</TableHead>
                  <TableHead className="text-center">Physicians</TableHead>
                  <TableHead className="text-center">Staff & Nurses</TableHead>
                  <TableHead className="text-center">Total Headcount</TableHead>
                  <TableHead className="text-center">Staff : Doctor Ratio</TableHead>
                  <TableHead className="text-right">Monthly Payroll (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                        Loading department workforce...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredDepts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                      No departments found matching search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDepts.map((dept) => (
                    <TableRow key={dept._id} className="hover:bg-muted/30 text-xs">
                      <TableCell className="font-mono font-bold text-foreground">
                        {dept.code}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-foreground">{dept.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{dept.location}</span>
                          <span className="text-muted-foreground/60">•</span>
                          <PhoneCall className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Ext {dept.phoneExtension}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium text-blue-600">
                        {dept.doctorCount}
                      </TableCell>
                      <TableCell className="text-center font-medium text-emerald-600">
                        {dept.staffCount}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[11px] font-semibold">
                          {dept.headCount} Personnel
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono text-muted-foreground">
                        {dept.ratio}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-foreground">
                        ₹{dept.monthlyPayroll.toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
