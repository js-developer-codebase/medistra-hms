"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  Building2,
  Award,
  Clock,
  CalendarCheck,
  FileCheck2,
  BarChart3,
  IndianRupee,
  RefreshCw,
  Plus,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  FileText
} from "lucide-react";

interface HRStats {
  totalEmployees: number;
  activeStaff: number;
  activeDoctors: number;
  totalUsers: number;
  onLeaveToday: number;
  presentToday: number;
  attendanceRate: string;
  monthlyPayrollLiability: number;
  pendingLeaveRequests: number;
  expiringDocumentsCount: number;
  activeShiftsCount: number;
  departmentsCount: number;
}

export default function HRHubPage() {
  const [stats, setStats] = useState<HRStats>({
    totalEmployees: 0,
    activeStaff: 0,
    activeDoctors: 0,
    totalUsers: 0,
    onLeaveToday: 0,
    presentToday: 0,
    attendanceRate: "0%",
    monthlyPayrollLiability: 0,
    pendingLeaveRequests: 0,
    expiringDocumentsCount: 0,
    activeShiftsCount: 0,
    departmentsCount: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hr/summary");
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
      }
    } catch (err) {
      console.error("Failed to load HR stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const hrWorkstations = [
    {
      title: "Employees Management",
      desc: "Directory of all full-time, part-time, and contractual hospital personnel.",
      path: "/hr/employees",
      icon: Users,
      accent: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      badge: `${stats.totalEmployees} Employees`,
      badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20"
    },
    {
      title: "Staff Profiles & Dossiers",
      desc: "Comprehensive employee dossiers, personal credentials, statutory IDs, and bank details.",
      path: "/hr/profiles",
      icon: UserCheck,
      accent: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      badge: "Full Dossiers",
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    },
    {
      title: "Department Workforce & Budget",
      desc: "Departmental staffing allocations, staff-to-doctor ratios, and monthly payroll in ₹.",
      path: "/hr/departments",
      icon: Building2,
      accent: "text-violet-500 bg-violet-500/10 border-violet-500/20",
      badge: `${stats.departmentsCount} Units`,
      badgeColor: "bg-violet-500/10 text-violet-600 border-violet-500/20"
    },
    {
      title: "Designations & Pay Bands",
      desc: "Graded pay scales in ₹, clinical ranks, experience prerequisites, and level criteria.",
      path: "/hr/designations",
      icon: Award,
      accent: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      badge: "Pay Scale Bands",
      badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20"
    },
    {
      title: "Shift Rosters & Rotations",
      desc: "Morning, Evening, Night, and Rotating duty schedules across wards and units.",
      path: "/hr/shifts",
      icon: Clock,
      accent: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
      badge: `${stats.activeShiftsCount} Active Shifts`,
      badgeColor: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20"
    },
    {
      title: "Biometric Attendance & Logs",
      desc: "Live punch tracker, late arrivals, working hours calculation, and manual audit overrides.",
      path: "/hr/attendance",
      icon: CalendarCheck,
      accent: "text-teal-500 bg-teal-500/10 border-teal-500/20",
      badge: `${stats.attendanceRate} Today`,
      badgeColor: "bg-teal-500/10 text-teal-600 border-teal-500/20"
    },
    {
      title: "Leave Management & Approvals",
      desc: "Casual, Sick, Earned, and Maternity leave requests with one-click manager sign-offs.",
      path: "/hr/leave",
      icon: FileCheck2,
      accent: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      badge: `${stats.pendingLeaveRequests} Pending Requests`,
      badgeColor: stats.pendingLeaveRequests > 0 ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-muted text-muted-foreground"
    },
    {
      title: "Compliance & Document Vault",
      desc: "Medical licenses, nursing certifications, ID proofs, appointment letters, and expiry audits.",
      path: "/hr/documents",
      icon: FileText,
      accent: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      badge: stats.expiringDocumentsCount > 0 ? `${stats.expiringDocumentsCount} Expiring Soon` : "Verified Vault",
      badgeColor: stats.expiringDocumentsCount > 0 ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    },
    {
      title: "HR Analytics & Reports",
      desc: "Workforce attrition, department salary distribution in ₹, attendance trends, and CSV reports.",
      path: "/hr/reports",
      icon: BarChart3,
      accent: "text-orange-500 bg-orange-500/10 border-orange-500/20",
      badge: "Executive Reports",
      badgeColor: "bg-orange-500/10 text-orange-600 border-orange-500/20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Human Resources & Workforce Operations
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage hospital employee lifecycle, biometric attendance, shift rotations, statutory compliance, and payroll commitments.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/hr/employees">
            <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
              <Plus className="h-4 w-4" />
              Onboard Employee
            </Button>
          </Link>
          <Link href="/hr/leave">
            <Button size="sm" variant="secondary" className="gap-2 shadow-sm">
              <FileCheck2 className="h-4 w-4" />
              Review Leaves
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Active Workforce
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : stats.totalEmployees}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              {stats.activeDoctors} Doctors • {stats.activeStaff} Staff
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Today's Attendance Rate
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {loading ? "..." : stats.attendanceRate}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-emerald-500" />
              {stats.presentToday} Present • {stats.onLeaveToday} On Leave
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Monthly Payroll Liability
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <IndianRupee className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-mono">
              {loading ? "..." : `₹${stats.monthlyPayrollLiability.toLocaleString("en-IN")}`}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              Base Salaries & Doctor Retainers
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pending HR Action Items
            </CardTitle>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {loading ? "..." : stats.pendingLeaveRequests + stats.expiringDocumentsCount}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              {stats.pendingLeaveRequests} Leaves • {stats.expiringDocumentsCount} Expiring Credentials
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workstations Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">HR Workstations & Submodules</h2>
            <p className="text-xs text-muted-foreground">
              Comprehensive human capital toolset for biometric monitoring, shifts, leave applications, documents, and reports.
            </p>
          </div>
          <Link href="/staff" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Switch to Medical Staff Hub <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hrWorkstations.map((ws, idx) => {
            const Icon = ws.icon;
            return (
              <Link key={idx} href={ws.path} className="group">
                <Card className="h-full border-border/60 hover:border-emerald-500/50 hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-2.5 rounded-xl border ${ws.accent}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className={`text-[11px] font-normal ${ws.badgeColor}`}>
                        {ws.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground group-hover:text-emerald-600 transition-colors mt-3">
                      {ws.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                      {ws.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground">
                    <span className="font-medium text-emerald-600 group-hover:underline">Open Workstation</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-emerald-600" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
