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
  ShieldCheck
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
      change: "All time total",
      icon: Users,
      color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Active Doctors",
      value: liveData?.totalDoctors?.toString() || "0",
      change: "Registered in system",
      icon: Stethoscope,
      color: "text-teal-600 bg-teal-500/10 border-teal-500/20",
    },
    {
      title: "Appointments",
      value: liveData?.todayAppointments?.toString() || "0",
      change: "Scheduled today",
      icon: Calendar,
      color: "text-cyan-600 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      title: "Occupied Beds",
      value: liveData ? `${liveData.occupiedBeds} / ${liveData.totalBeds}` : "0 / 0",
      change: liveData && liveData.totalBeds > 0 ? `${Math.round((liveData.occupiedBeds / liveData.totalBeds) * 100)}% capacity` : "0% capacity",
      icon: Bed,
      color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20",
    },
  ];

  const quickActions = [
    { title: "Add New Patient", href: "/patients/register", icon: UserPlus, color: "bg-emerald-600 hover:bg-emerald-700 text-white" },
    { title: "Book Appointment", href: "/appointments/book", icon: CalendarPlus, color: "bg-teal-600 hover:bg-teal-700 text-white" },
    { title: "New Admission", href: "/wards/beds", icon: PlusCircle, color: "bg-cyan-600 hover:bg-cyan-700 text-white" },
    { title: "Create Invoice", href: "/finance/invoice/create", icon: FilePlus, color: "bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600" },
  ];

  const recentPatients = liveData?.recentPatients || [
    { name: "Rahul Chatterjee", id: "P-9042", doctor: "Dr. Arup Biswas", status: "Admitted", time: "10 mins ago" },
    { name: "Srabanti Sen", id: "P-9043", doctor: "Dr. Ananya Roy", status: "Outpatient", time: "25 mins ago" },
    { name: "Sourav Ganguly", id: "P-9044", doctor: "Dr. Sandip Mitra", status: "ICU", time: "1 hour ago" },
    { name: "Debjani Das", id: "P-9045", doctor: "Dr. Sudipta Saha", status: "Discharged", time: "2 hours ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="h-4 w-4" />
              Authenticated Session
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="text-emerald-400">{session?.user?.name || "Super Admin"}</span>
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              Medistra Hospital Management Dashboard. Here is the operational summary for today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-600/30 gap-2">
              <Activity className="h-4 w-4" />
              System Status: Active
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border-slate-200/80 dark:border-slate-800 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {stat.title}
                  </span>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {liveData === null ? <span className="animate-pulse bg-slate-200 dark:bg-slate-700 h-8 w-16 rounded inline-block" /> : stat.value}
                  </span>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link key={idx} href={action.href}>
                <div className={`flex items-center justify-between p-4 rounded-xl font-medium text-sm transition-all shadow-md hover:scale-[1.01] ${action.color}`}>
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span>{action.title}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 opacity-70" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Table */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-bold">Recent Patient Admissions</CardTitle>
            <CardDescription>Live updates from the admission desk</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="text-xs">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="border-b border-slate-200 text-xs uppercase font-semibold text-slate-400 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Patient ID</th>
                  <th className="py-3 px-4">Assigned Doctor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentPatients.map((patient: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {patient.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">
                      {patient.id}
                    </td>
                    <td className="py-3 px-4">{patient.doctor}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        patient.status === 'ICU' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                        patient.status === 'Admitted' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        patient.status === 'Outpatient' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' :
                        'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-slate-400">
                      {patient.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
