"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  ArrowLeft,
  RefreshCw,
  Printer,
  Download,
  IndianRupee,
  Users,
  Calendar,
  Bed,
  Building2,
  TrendingUp,
  CreditCard,
  UserCheck,
  Activity,
  Hospital
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function ManagementDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("ALL_TIME");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/management?timeframe=${timeframe}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast("Failed to load management report: " + json.message, "error");
      }
    } catch (err: any) {
      toast("Error loading management report: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const overview = data?.overview || {
    totalPatients: 0,
    totalAppointments: 0,
    totalAdmissions: 0,
    activeInpatients: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    bedOccupancyRate: "0%",
    totalRevenue: 0,
    totalBilled: 0,
    totalOutstanding: 0
  };

  const executive = data?.executive || {
    activeDoctors: 0,
    activeDepartments: 0,
    scheduledAppointments: 0,
    recentFinancialTransactions: []
  };

  const handleExportCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Registered Patients", overview.totalPatients],
      ["Total Appointments", overview.totalAppointments],
      ["Total IPD Admissions", overview.totalAdmissions],
      ["Active Inpatients", overview.activeInpatients],
      ["Total Beds", overview.totalBeds],
      ["Occupied Beds", overview.occupiedBeds],
      ["Bed Occupancy Rate", overview.bedOccupancyRate],
      ["Total Revenue (INR)", overview.totalRevenue],
      ["Total Billed (INR)", overview.totalBilled],
      ["Outstanding Balance (INR)", overview.totalOutstanding],
      ["Active Doctors", executive.activeDoctors]
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Executive_Management_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast("Executive report exported", "success");
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
            <span className="text-sm font-medium text-primary">Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Executive Management Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            High-level hospital leadership briefing on clinical activity, bed occupancy, and financial performance.
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
            <Printer className="h-4 w-4 mr-2" /> Print Briefing
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Realized Hospital Revenue</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                ₹{Number(overview.totalRevenue || 0).toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Paid collections to date</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inpatient Occupancy</p>
              <h3 className="text-2xl font-bold mt-1 text-primary">{overview.bedOccupancyRate}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {overview.occupiedBeds} of {overview.totalBeds} beds occupied
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Bed className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active IPD Census</p>
              <h3 className="text-2xl font-bold mt-1 text-purple-600">{overview.activeInpatients} Patients</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {overview.totalAdmissions} cumulative admissions
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
              <Hospital className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clinical Encounters</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">{overview.totalAppointments}</h3>
              <p className="text-xs text-blue-600 font-medium mt-1">
                {executive.activeDoctors} active doctors on duty
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial & Operational Briefing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operational Statistics (1 col) */}
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Operational Health Index</CardTitle>
              <CardDescription className="text-xs">Capacity and staffing utilization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 rounded bg-muted/40">
                <span className="text-muted-foreground">Total Registered Patients:</span>
                <span className="font-bold text-foreground">{overview.totalPatients}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded bg-muted/40">
                <span className="text-muted-foreground">Active Clinical Departments:</span>
                <span className="font-bold text-foreground">{executive.activeDepartments}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded bg-muted/40">
                <span className="text-muted-foreground">Beds Currently Available:</span>
                <span className="font-bold text-emerald-600">{overview.availableBeds} beds</span>
              </div>
              <div className="flex justify-between p-2.5 rounded bg-muted/40">
                <span className="text-muted-foreground">Gross Hospital Billing:</span>
                <span className="font-bold text-foreground">₹{Number(overview.totalBilled || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded bg-muted/40">
                <span className="text-muted-foreground">Outstanding Accounts Receivable:</span>
                <span className="font-bold text-amber-600">₹{Number(overview.totalOutstanding || 0).toLocaleString("en-IN")}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Financial Transactions Table (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-semibold">Recent Billing Transactions</CardTitle>
              <CardDescription className="text-xs">Latest inpatient and outpatient invoices generated.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-muted-foreground font-semibold text-xs uppercase border-b border-border/60">
                    <tr>
                      <th className="p-3">Invoice #</th>
                      <th className="p-3">Department</th>
                      <th className="p-3 text-right">Amount (₹)</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {executive.recentFinancialTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground text-xs">
                          {loading ? "Loading transactions..." : "No recent invoices recorded."}
                        </td>
                      </tr>
                    ) : (
                      executive.recentFinancialTransactions.map((inv: any) => (
                        <tr key={inv._id} className="hover:bg-muted/30 text-xs">
                          <td className="p-3 font-mono font-medium text-primary">
                            {inv.invoiceNumber || inv._id?.slice(-8)}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {inv.department || "General"}
                          </td>
                          <td className="p-3 text-right font-semibold text-foreground">
                            ₹{Number(inv.finalAmount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 text-center">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                inv.status === "PAID"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-300"
                                  : "bg-amber-50 text-amber-600 border-amber-300"
                              }`}
                            >
                              {inv.status || "UNPAID"}
                            </Badge>
                          </td>
                          <td className="p-3 text-right text-muted-foreground">
                            {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("en-IN") : "N/A"}
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
