"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  ArrowLeft,
  RefreshCw,
  Printer,
  Download,
  UserPlus,
  Heart,
  Calendar,
  Activity,
  UserCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function PatientReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("ALL_TIME");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/patients?timeframe=${timeframe}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast("Failed to load patient reports: " + json.message, "error");
      }
    } catch (err: any) {
      toast("Error loading patient reports: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const totalPatients = data?.totalPatients || 0;
  const newRegistrations = data?.newRegistrations || 0;
  const demographics = data?.demographics || {
    genderStats: {},
    bloodGroupStats: {},
    ageBrackets: { pediatric: 0, adult: 0, geriatric: 0 }
  };

  const handleExportCSV = () => {
    const rows = [
      ["Demographic Metric", "Count"],
      ["Total Patients", totalPatients],
      ["New Registrations in Timeframe", newRegistrations],
      ["Pediatric (<18)", demographics.ageBrackets.pediatric],
      ["Adult (18-59)", demographics.ageBrackets.adult],
      ["Geriatric (60+)", demographics.ageBrackets.geriatric],
      ...Object.entries(demographics.genderStats).map(([g, c]) => [`Gender: ${g}`, c]),
      ...Object.entries(demographics.bloodGroupStats).map(([b, c]) => [`Blood Group: ${b}`, c])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Patient_Demographics_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast("Patient report exported", "success");
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
            <span className="text-sm font-medium text-primary">Patient Demographics</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Patient Demographics & Registration Analytics
          </h1>
          <p className="text-muted-foreground text-sm">
            Audited breakdown of hospital patient demographics, age distribution brackets, and blood group statistics.
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
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Registered</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{totalPatients}</h3>
              <p className="text-xs text-muted-foreground mt-1">Unique UHID registrations</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Registrations</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">{newRegistrations}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">During selected timeframe</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <UserPlus className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Adult Demographics</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">{demographics.ageBrackets.adult}</h3>
              <p className="text-xs text-muted-foreground mt-1">Age group 18 – 59 years</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Geriatric Care</p>
              <h3 className="text-2xl font-bold mt-1 text-purple-600">{demographics.ageBrackets.geriatric}</h3>
              <p className="text-xs text-muted-foreground mt-1">Senior citizens (60+ years)</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demographics Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gender Breakdown Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-semibold">Gender Distribution</CardTitle>
            <CardDescription className="text-xs">Gender parity across patient registrations.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {Object.entries(demographics.genderStats).map(([gender, count]: [string, any]) => {
              const pct = totalPatients > 0 ? Math.round((count / totalPatients) * 100) : 0;
              return (
                <div key={gender} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{gender}</span>
                    <span className="text-muted-foreground">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Age Groups Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-semibold">Age Group Brackets</CardTitle>
            <CardDescription className="text-xs">Pediatric, adult, and senior patient populations.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Pediatric (&lt; 18 Years)</span>
                <span className="text-muted-foreground">{demographics.ageBrackets.pediatric}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{
                    width: `${totalPatients > 0 ? (demographics.ageBrackets.pediatric / totalPatients) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Adult (18 – 59 Years)</span>
                <span className="text-muted-foreground">{demographics.ageBrackets.adult}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${totalPatients > 0 ? (demographics.ageBrackets.adult / totalPatients) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Geriatric (60+ Years)</span>
                <span className="text-muted-foreground">{demographics.ageBrackets.geriatric}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{
                    width: `${totalPatients > 0 ? (demographics.ageBrackets.geriatric / totalPatients) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blood Groups Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              Blood Group Distribution
            </CardTitle>
            <CardDescription className="text-xs">Patient records blood group distribution.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(demographics.bloodGroupStats).length === 0 ? (
                <div className="col-span-2 text-center text-muted-foreground py-4">
                  No blood group data recorded.
                </div>
              ) : (
                Object.entries(demographics.bloodGroupStats).map(([bg, count]: [string, any]) => (
                  <div key={bg} className="p-2.5 rounded-lg bg-muted/40 border border-border/50 flex justify-between items-center">
                    <span className="font-bold text-rose-600 font-mono">{bg}</span>
                    <span className="font-semibold text-foreground">{count}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
