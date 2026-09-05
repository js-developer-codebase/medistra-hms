"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Stethoscope,
  Calendar,
  Bed,
  TrendingUp,
  UserPlus,
  CalendarPlus,
  PlusCircle,
  FilePlus,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Clock,
  HeartPulse,
  Building2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [liveData, setLiveData] = React.useState<any>(null);

  React.useEffect(() => {
    fetch("/api/dashboard/stats")
      .then(res => res.json())
      .then(json => {
        if (json.success) setLiveData(json.data);
      })
      .catch(err => console.error("Failed to load dashboard stats", err));
  }, []);

  const stats = [
    {
      title: "Total Patients",
      value: liveData?.totalPatients?.toString() || "0",
      change: "All time records",
      icon: Users,
      accentGlow: "bg-emerald-500/20 dark:bg-emerald-500/20",
      iconStyle: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10",
      trendColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Active Doctors",
      value: liveData?.totalDoctors?.toString() || "0",
      change: "On medical duty",
      icon: Stethoscope,
      accentGlow: "bg-teal-500/20 dark:bg-teal-500/20",
      iconStyle: "text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20 shadow-teal-500/10",
      trendColor: "text-teal-600 dark:text-teal-400",
    },
    {
      title: "Appointments",
      value: (liveData?.totalAppointments ?? liveData?.todayAppointments ?? 0).toString(),
      change: liveData?.todayAppointments && liveData.todayAppointments > 0
        ? `${liveData.todayAppointments} today`
        : "Total booked",
      icon: Calendar,
      accentGlow: "bg-cyan-500/20 dark:bg-cyan-500/20",
      iconStyle: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-cyan-500/10",
      trendColor: "text-cyan-600 dark:text-cyan-400",
    },
    {
      title: "Occupied Beds",
      value: liveData ? `${liveData.occupiedBeds} / ${liveData.totalBeds}` : "0 / 0",
      change: liveData && liveData.totalBeds > 0 
        ? `${Math.round((liveData.occupiedBeds / liveData.totalBeds) * 100)}% capacity` 
        : "0% capacity",
      icon: Bed,
      accentGlow: "bg-indigo-500/20 dark:bg-indigo-500/20",
      iconStyle: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/10",
      trendColor: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  const quickActions = [
    { 
      title: "Add New Patient", 
      subtitle: "Register intake", 
      href: "/patients/register", 
      icon: UserPlus, 
      gradient: "from-emerald-600/90 to-emerald-700/90 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-600/20 border-emerald-400/30" 
    },
    { 
      title: "Book Appointment", 
      subtitle: "Doctor schedule", 
      href: "/appointments/book", 
      icon: CalendarPlus, 
      gradient: "from-teal-600/90 to-teal-700/90 hover:from-teal-600 hover:to-teal-700 shadow-teal-600/20 border-teal-400/30" 
    },
    { 
      title: "New Admission", 
      subtitle: "Bed allocation", 
      href: "/wards/beds", 
      icon: PlusCircle, 
      gradient: "from-cyan-600/90 to-cyan-700/90 hover:from-cyan-600 hover:to-cyan-700 shadow-cyan-600/20 border-cyan-400/30" 
    },
    { 
      title: "Create Invoice", 
      subtitle: "Billing desk", 
      href: "/finance/invoice/create", 
      icon: FilePlus, 
      gradient: "from-indigo-600/90 to-purple-700/90 hover:from-indigo-600 hover:to-purple-700 shadow-indigo-600/20 border-indigo-400/30" 
    },
  ];

  const recentPatients = liveData?.recentPatients || [
    { name: "Rahul Chatterjee", id: "P-9042", doctor: "Dr. Arup Biswas", status: "Admitted", time: "10 mins ago", ward: "Ward 3B - Bed 04" },
    { name: "Srabanti Sen", id: "P-9043", doctor: "Dr. Ananya Roy", status: "Outpatient", time: "25 mins ago", ward: "General OPD" },
    { name: "Sourav Ganguly", id: "P-9044", doctor: "Dr. Sandip Mitra", status: "ICU", time: "1 hour ago", ward: "ICU Unit 2" },
    { name: "Debjani Das", id: "P-9045", doctor: "Dr. Sudipta Saha", status: "Discharged", time: "2 hours ago", ward: "Cabin 102" },
  ];

  const bedOccupancyPercent = liveData && liveData.totalBeds > 0
    ? Math.round((liveData.occupiedBeds / liveData.totalBeds) * 100)
    : 45;

  return (
    <div className="space-y-6">
      {/* Glassmorphic Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 transition-all duration-300">
        {/* Ambient Specular Refraction Glows */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-400/25 via-teal-400/20 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-tr from-cyan-400/20 via-sky-400/10 to-transparent blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold glass-pill text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-500/30">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Verified Session</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Medistra HMS v2.4</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back, <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">{session?.user?.name || "Super Admin"}</span>
            </h1>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              Real-time operational dashboard for Medistra Central Hospital. All patient monitoring, doctor schedules, and ward telemetry are operational.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="glass-pill px-4 py-2.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Telemetry: Active</span>
            </div>

            <Link href="/dashboard/alerts">
              <Button 
                variant="outline"
                className="glass-pill rounded-2xl text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white border-white/60 dark:border-white/10 hover:bg-white/80 dark:hover:bg-slate-800/80 shadow-sm transition-all"
              >
                <HeartPulse className="h-4 w-4 mr-1.5 text-rose-500" />
                Critical Alerts
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Glassmorphic KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-default"
            >
              {/* Backlight Ambient Glow */}
              <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full ${stat.accentGlow} blur-2xl transition-all duration-500 group-hover:scale-125`} />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {stat.title}
                  </span>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-md shadow-sm transition-transform duration-300 group-hover:scale-110 ${stat.iconStyle}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {liveData === null ? (
                      <span className="inline-block h-8 w-16 animate-pulse rounded-lg bg-white/40 dark:bg-slate-800/60" />
                    ) : (
                      stat.value
                    )}
                  </span>

                  <span className={`glass-pill px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 border border-white/60 dark:border-white/10 ${stat.trendColor}`}>
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bed Occupancy & Capacity Glass Widget */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 backdrop-blur-md">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Hospital Ward & Bed Utilization Monitor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live bed allocation status across General, ICU, and Specialty cabins
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>Available: {liveData ? liveData.totalBeds - liveData.occupiedBeds : 0} beds</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <span>Occupied: {liveData?.occupiedBeds ?? 0} beds</span>
            </div>
          </div>
        </div>

        {/* Frosted Progress Track */}
        <div className="mt-2 relative w-full h-3.5 rounded-full bg-slate-200/50 dark:bg-slate-800/50 overflow-hidden border border-white/50 dark:border-white/10 backdrop-blur-sm p-0.5">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 shadow-sm transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(100, Math.max(8, bedOccupancyPercent))}%` }}
          />
        </div>
      </div>

      {/* Glassmorphic Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Express Operational Workflows
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">Fast shortcuts</span>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link key={idx} href={action.href} className="group">
                <div className={`relative overflow-hidden flex items-center justify-between p-4 rounded-2xl font-medium text-sm transition-all duration-300 shadow-lg group-hover:-translate-y-1 group-hover:shadow-xl backdrop-blur-xl border bg-gradient-to-br text-white ${action.gradient}`}>
                  {/* Subtle glass specular highlight */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex items-center gap-3.5 relative z-10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 border border-white/30 backdrop-blur-md group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="block font-bold text-sm tracking-tight text-white">{action.title}</span>
                      <span className="block text-[11px] text-white/80 font-normal">{action.subtitle}</span>
                    </div>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 border border-white/20 backdrop-blur-sm group-hover:bg-white/25 group-hover:translate-x-0.5 transition-all">
                    <ArrowUpRight className="h-4 w-4 text-white" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Glassmorphic Recent Patient Admissions */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 pb-5 border-b border-white/60 dark:border-white/10 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Recent Patient Admissions
              </h3>
              <span className="glass-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                Live Feed
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time patient intake telemetry from emergency and admission desks
            </p>
          </div>

          <Link href="/patients/list">
            <Button 
              variant="outline" 
              size="sm" 
              className="glass-pill rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white border-white/60 dark:border-white/10 hover:bg-white/80 dark:hover:bg-slate-800 transition-all gap-1"
            >
              <span>View All Patients</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/40 dark:bg-slate-900/40 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-white/50 dark:border-white/10 backdrop-blur-md">
              <tr>
                <th className="py-3.5 px-6">Patient Details</th>
                <th className="py-3.5 px-6">MRN / ID</th>
                <th className="py-3.5 px-6">Assigned Doctor</th>
                <th className="py-3.5 px-6">Ward / Unit</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Time Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40 dark:divide-white/5">
              {recentPatients.map((patient: any, idx: number) => {
                const isICU = patient.status === 'ICU';
                const isAdmitted = patient.status === 'Admitted';
                const isOutpatient = patient.status === 'Outpatient';

                return (
                  <tr 
                    key={idx} 
                    className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors duration-150"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-white/80 dark:border-white/10 shadow-sm">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {patient.name}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            General Admission
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="glass-subtle inline-block font-mono text-xs px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300 border border-white/50 dark:border-white/10 font-medium">
                        {patient.id}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">
                      {patient.doctor}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
                      {patient.ward || "General Ward"}
                    </td>

                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border backdrop-blur-md shadow-sm ${
                        isICU 
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' 
                          : isAdmitted 
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' 
                          : isOutpatient 
                          ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30' 
                          : 'bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/20'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          isICU ? 'bg-rose-500 animate-pulse' : isAdmitted ? 'bg-emerald-500' : isOutpatient ? 'bg-cyan-500' : 'bg-slate-400'
                        }`} />
                        {patient.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right text-xs text-slate-400 dark:text-slate-500 font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3 opacity-60" />
                        <span>{patient.time}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

