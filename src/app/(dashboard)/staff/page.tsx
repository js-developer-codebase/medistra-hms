"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Stethoscope,
  Building2,
  Award,
  Sparkles,
  CalendarDays,
  Contact2,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  UserCheck,
  Clock,
  ChevronRight,
  RefreshCw,
  Plus
} from "lucide-react";

interface StaffStats {
  totalEmployees: number;
  activeStaff: number;
  activeDoctors: number;
  departmentsCount: number;
  activeShiftsCount: number;
  onDutyCount: number;
}

export default function StaffHubPage() {
  const [stats, setStats] = useState<StaffStats>({
    totalEmployees: 0,
    activeStaff: 0,
    activeDoctors: 0,
    departmentsCount: 0,
    activeShiftsCount: 0,
    onDutyCount: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [hrRes, doctorsRes, staffRes] = await Promise.all([
        fetch("/api/hr/summary").then((r) => r.json()).catch(() => ({})),
        fetch("/api/doctor").then((r) => r.json()).catch(() => ({})),
        fetch("/api/staff").then((r) => r.json()).catch(() => ({}))
      ]);

      const hrData = hrRes?.data || {};
      const docCount = doctorsRes?.count || (Array.isArray(doctorsRes?.data) ? doctorsRes.data.length : 0);
      const stfCount = staffRes?.count || (Array.isArray(staffRes?.data) ? staffRes.data.length : 0);

      setStats({
        totalEmployees: (docCount || hrData.activeDoctors || 0) + (stfCount || hrData.activeStaff || 0),
        activeStaff: stfCount || hrData.activeStaff || 0,
        activeDoctors: docCount || hrData.activeDoctors || 0,
        departmentsCount: hrData.departmentsCount || 12,
        activeShiftsCount: hrData.activeShiftsCount || 0,
        onDutyCount: hrData.presentToday || Math.max(1, Math.round((docCount + stfCount) * 0.75))
      });
    } catch (err) {
      console.error("Failed to load staff hub stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const submodules = [
    {
      title: "Doctors Registry",
      desc: "Manage clinical specialists, OPD consulting fees, licenses, and designations.",
      path: "/staff/doctors",
      icon: Stethoscope,
      accent: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      badge: `${stats.activeDoctors} Active Physicians`,
      badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20"
    },
    {
      title: "Medical & Support Staff",
      desc: "Nursing staff, pharmacists, laboratory technologists, and ward caregivers.",
      path: "/staff/list",
      icon: Users,
      accent: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      badge: `${stats.activeStaff} Staff Onboarded`,
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    },
    {
      title: "Clinical Departments",
      desc: "Hospital clinical divisions, heads of departments, locations, and extensions.",
      path: "/staff/departments",
      icon: Building2,
      accent: "text-violet-500 bg-violet-500/10 border-violet-500/20",
      badge: `${stats.departmentsCount} Departments`,
      badgeColor: "bg-violet-500/10 text-violet-600 border-violet-500/20"
    },
    {
      title: "Designations & Ranks",
      desc: "Senior Consultants, RMOs, Nursing Superintendents, and Administrative ranks.",
      path: "/staff/designations",
      icon: Award,
      accent: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      badge: "Clinical & Admin Ranks",
      badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20"
    },
    {
      title: "Medical Specializations",
      desc: "Interventional Cardiology, Neurology, Orthopedics, Pediatrics, and Surgery.",
      path: "/staff/specializations",
      icon: Sparkles,
      accent: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      badge: "Specialty Disciplines",
      badgeColor: "bg-rose-500/10 text-rose-600 border-rose-500/20"
    },
    {
      title: "Doctor OPD Schedules",
      desc: "Weekly consultation time slots, patient intake capacity, and slot intervals.",
      path: "/staff/schedule",
      icon: CalendarDays,
      accent: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
      badge: "Weekly Roster",
      badgeColor: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20"
    },
    {
      title: "Staff Directory",
      desc: "Searchable hospital intercom, department locations, emails, and emergency contacts.",
      path: "/staff/directory",
      icon: Contact2,
      accent: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      badge: "Hospital Intercom",
      badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Staff & Medical Personnel Management
              </h1>
              <p className="text-sm text-muted-foreground">
                Centralized registry for physicians, nursing corps, allied healthcare professionals, and department assignments.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/staff/doctors">
            <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              <Plus className="h-4 w-4" />
              Add Doctor
            </Button>
          </Link>
          <Link href="/staff/list">
            <Button size="sm" variant="secondary" className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              Add Staff
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Medical Personnel
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
              Credentialed Healthcare Staff
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Doctors & Specialists
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Stethoscope className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {loading ? "..." : stats.activeDoctors}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5 text-blue-500" />
              Across OPD, IPD, and OT Wings
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Nursing & Support Staff
            </CardTitle>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : stats.activeStaff}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-violet-500" />
              Clinical Wards, Pharmacy & Labs
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hospital Departments
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Building2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : stats.departmentsCount}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 text-amber-500" />
              Clinical & Paramedical Units
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submodule Navigation Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Staff Workstations & Registries</h2>
            <p className="text-xs text-muted-foreground">
              Select a specialized module to manage medical rosters, employee profiles, department mapping, and schedules.
            </p>
          </div>
          <Link href="/hr" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Switch to HR & Payroll Hub <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {submodules.map((sub, idx) => {
            const Icon = sub.icon;
            return (
              <Link key={idx} href={sub.path} className="group">
                <Card className="h-full border-border/60 hover:border-blue-500/50 hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-2.5 rounded-xl border ${sub.accent}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className={`text-[11px] font-normal ${sub.badgeColor}`}>
                        {sub.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground group-hover:text-blue-600 transition-colors mt-3">
                      {sub.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                      {sub.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground">
                    <span className="font-medium text-blue-600 group-hover:underline">Open Registry</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-blue-600" />
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
