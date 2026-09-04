"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ArrowLeft,
  RefreshCw,
  Printer,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  UserCheck,
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function AppointmentReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("ALL_TIME");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/appointments?timeframe=${timeframe}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast("Failed to load appointment reports: " + json.message, "error");
      }
    } catch (err: any) {
      toast("Error loading reports: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const totalAppointments = data?.totalAppointments || 0;
  const statusCounts = data?.statusCounts || {
    CONFIRMED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    PENDING: 0,
    NO_SHOW: 0
  };
  const completionRate = data?.completionRate || "0%";
  const cancellationCount = data?.cancellationCount || 0;
  const recentAppointments: any[] = data?.recentAppointments || [];

  const filteredAppointments = recentAppointments.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.patientId?.name?.toLowerCase().includes(q) ||
      a.patientId?.uhid?.toLowerCase().includes(q) ||
      a.doctorId?.name?.toLowerCase().includes(q) ||
      a.status?.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    const headers = ["Patient Name", "UHID", "Doctor", "Department", "Appointment Date", "Status"];
    const rows = recentAppointments.map((a) => [
      `"${a.patientId?.name || "Patient"}"`,
      a.patientId?.uhid || "N/A",
      `"${a.doctorId?.name || "Doctor"}"`,
      `"${a.departmentId?.name || "OPD"}"`,
      a.appointmentDate ? new Date(a.appointmentDate).toLocaleString("en-IN") : "N/A",
      a.status || "CONFIRMED"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Appointment_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast("Appointment report exported to CSV", "success");
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
            <span className="text-sm font-medium text-primary">Appointment Analytics</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Outpatient Appointment Analytics
          </h1>
          <p className="text-muted-foreground text-sm">
            Audited booking volume, completion ratios, no-show occurrences, and doctor scheduling loads.
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
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Bookings</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{totalAppointments}</h3>
              <p className="text-xs text-muted-foreground mt-1">Across all OPD specialties</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completion Rate</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">{completionRate}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                {statusCounts.COMPLETED} appointments served
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirmed & Active</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">{statusCounts.CONFIRMED}</h3>
              <p className="text-xs text-muted-foreground mt-1">Ready for consultation</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-rose-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cancelled / No-Show</p>
              <h3 className="text-2xl font-bold mt-1 text-rose-600">{cancellationCount}</h3>
              <p className="text-xs text-rose-600 font-medium mt-1">
                {statusCounts.NO_SHOW} patient no-shows
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Registry Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Appointment Records Log</CardTitle>
              <CardDescription className="text-xs">
                Detailed appointment consultations and status ledger.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search patient, doctor, UHID..."
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
                  <th className="p-3">Attending Doctor</th>
                  <th className="p-3">Specialty / Department</th>
                  <th className="p-3">Appointment Date</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                      {loading ? "Loading appointments..." : "No appointments found matching search."}
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appt: any) => (
                    <tr key={appt._id} className="hover:bg-muted/30 text-xs">
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{appt.patientId?.name || "Patient"}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">{appt.patientId?.uhid || "UHID-N/A"}</div>
                      </td>
                      <td className="p-3 text-foreground font-medium">
                        {appt.doctorId?.name || "Consulting Physician"}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {appt.departmentId?.name || appt.doctorId?.specialization || "OPD Department"}
                      </td>
                      <td className="p-3 text-foreground">
                        {appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleString("en-IN") : "N/A"}
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            appt.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-300"
                              : appt.status === "CANCELLED" || appt.status === "NO_SHOW"
                              ? "bg-rose-50 text-rose-600 border-rose-300"
                              : "bg-blue-50 text-blue-600 border-blue-300"
                          }`}
                        >
                          {appt.status || "CONFIRMED"}
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
