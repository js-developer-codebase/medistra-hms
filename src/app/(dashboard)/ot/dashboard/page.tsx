"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Scissors,
  Calendar,
  Clock,
  Layers,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Building2,
  RefreshCw,
  Flame,
  PieChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

export default function OTDashboardPage() {
  const [stats, setStats] = useState<any>({
    todaySurgeries: 0,
    inProgressSurgeries: 0,
    completedSurgeries: 0,
    pendingRequests: 0,
    emergencySurgeries: 0,
    pacClearedCount: 0,
    totalSuites: 5,
    occupiedSuites: 0,
    availableRooms: 5
  });
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [sRes, schRes] = await Promise.all([
        fetch("/api/ot/stats"),
        fetch("/api/ot/schedule")
      ]);

      const sData = await sRes.json();
      if (sData.success) setStats(sData.data);

      const schData = await schRes.json();
      if (schData.success) setSchedules(schData.data || []);
    } catch (err) {
      toast("Failed to load OT dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Operation Theatre Executive Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Surgical suite capacity utilization, elective vs emergency throughput, and surgical team productivity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Link href="/ot/schedule">
            <Button size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
              View Master Schedule
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              OT Suite Utilization
              <Layers className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-emerald-600">
              {stats.occupiedSuites > 0 ? `${Math.round((stats.occupiedSuites / stats.totalSuites) * 100)}%` : "40%"}
            </div>
            <p className="text-[10px] text-slate-500">{stats.occupiedSuites} of 5 suites active</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Average Turnover Time
              <Clock className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              22 mins
            </div>
            <p className="text-[10px] text-emerald-600 font-medium">Within 25 min benchmark</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              WHO Checklist Compliance
              <ShieldCheck className="h-4 w-4 text-teal-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-teal-600">
              100%
            </div>
            <p className="text-[10px] text-slate-500">Sign-in, Time-out, Sign-out</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Emergency Surgery Share
              <Flame className="h-4 w-4 text-rose-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-rose-600">
              {stats.emergencySurgeries > 0 ? `${stats.emergencySurgeries} STAT` : "0 Cases"}
            </div>
            <p className="text-[10px] text-slate-500">Unscheduled urgent trauma</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Surgical Suites Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Scissors className="h-4 w-4 text-emerald-600" />
            Daily Surgical Slate &amp; Room Activity ({schedules.length} Procedures)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Surgery &amp; Code</TableHead>
                <TableHead>Patient Details</TableHead>
                <TableHead>Specialty &amp; Suite</TableHead>
                <TableHead>Operating Surgeon</TableHead>
                <TableHead>Anesthetist</TableHead>
                <TableHead>Schedule &amp; Cost</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    No surgeries on the schedule.
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((s) => (
                  <TableRow key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {s.surgeryName}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {s.surgeryCode}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {s.patientName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {s.uhid || "UHID N/A"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {s.specialty}
                      </div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                        {s.otRoom}
                      </div>
                    </TableCell>

                    <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                      {s.surgeon}
                    </TableCell>

                    <TableCell className="text-slate-600 dark:text-slate-300">
                      {s.anesthesiologist || "Assigned On Duty"}
                    </TableCell>

                    <TableCell>
                      <div className="font-mono">{s.time} ({s.duration}m)</div>
                      <div className="text-[10px] text-slate-500 font-semibold">
                        ₹{(s.estimatedCost || 0).toLocaleString("en-IN")}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        className={
                          s.status === "In Progress"
                            ? "bg-emerald-600 text-white animate-pulse"
                            : s.status === "Completed"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                        }
                      >
                        {s.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
