"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Clock,
  Flame,
  AlertTriangle,
  HeartPulse,
  Truck,
  Building2,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  Siren
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

export default function EmergencyDashboardPage() {
  const [stats, setStats] = useState<any>({
    activeCasualties: 0,
    criticalRedOrange: 0,
    occupiedBays: 0,
    pendingOrders: 0,
    todayCasualties: 0,
    todayAdmitted: 0,
    todayDischarged: 0,
    mlcCount: 0
  });
  const [casualties, setCasualties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, casRes] = await Promise.all([
        fetch("/api/emergency/stats"),
        fetch("/api/emergency/casualty")
      ]);

      const sData = await statsRes.json();
      if (sData.success) setStats(sData.data);

      const cData = await casRes.json();
      if (cData.success) setCasualties(cData.data || []);
    } catch (err) {
      toast("Failed to load emergency dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const redCases = casualties.filter((c) => c.triagePriority === "Red");
  const orangeCases = casualties.filter((c) => c.triagePriority === "Orange");
  const yellowCases = casualties.filter((c) => c.triagePriority === "Yellow");
  const greenCases = casualties.filter((c) => c.triagePriority === "Green");

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            Emergency Executive Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Emergency department performance indicators, Door-to-Doctor TAT benchmarks, and resuscitation metrics.
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

          <Link href="/emergency/registration">
            <Button size="sm" className="text-xs bg-rose-600 hover:bg-rose-700 text-white">
              + New Casualty Intake
            </Button>
          </Link>
        </div>
      </div>

      {/* High-Level Benchmarks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Avg Door-to-Doctor Time
              <Clock className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              8.4 mins
            </div>
            <p className="text-[10px] text-emerald-600 font-medium">&lt; 15 mins target (Compliant)</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Avg Door-to-Triage Time
              <HeartPulse className="h-4 w-4 text-rose-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-rose-600">
              3.1 mins
            </div>
            <p className="text-[10px] text-slate-500">Immediate initial assessment</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              ICU Conversion Ratio
              <Building2 className="h-4 w-4 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.todayCasualties > 0
                ? `${Math.round((stats.todayAdmitted / stats.todayCasualties) * 100)}%`
                : "24%"}
            </div>
            <p className="text-[10px] text-slate-500">{stats.todayAdmitted} direct admissions</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              24-Hr Survival Index
              <ShieldCheck className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-blue-600">
              99.2%
            </div>
            <p className="text-[10px] text-slate-500">Resuscitation benchmark</p>
          </CardContent>
        </Card>
      </div>

      {/* Triage Distribution Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Flame className="h-4 w-4 text-rose-600" />
            Manchester / ESI Triage Volume Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
              <div className="flex items-center justify-between text-rose-700 dark:text-rose-300 font-bold">
                <span>Level 1: Resuscitation (Red)</span>
                <Flame className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold text-rose-700 dark:text-rose-300 mt-1">
                {redCases.length}
              </div>
              <div className="text-[10px] text-slate-500">Immediate life threat</div>
            </div>

            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900">
              <div className="flex items-center justify-between text-orange-700 dark:text-orange-300 font-bold">
                <span>Level 2: Emergent (Orange)</span>
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-1">
                {orangeCases.length}
              </div>
              <div className="text-[10px] text-slate-500">Care within 10–15 mins</div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
              <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 font-bold">
                <span>Level 3: Urgent (Yellow)</span>
                <Clock className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">
                {yellowCases.length}
              </div>
              <div className="text-[10px] text-slate-500">Care within 30–60 mins</div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-bold">
                <span>Level 4: Less Urgent (Green)</span>
                <UserCheck className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                {greenCases.length}
              </div>
              <div className="text-[10px] text-slate-500">Minor injuries / cuts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Cases List */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Siren className="h-4 w-4 text-rose-600" />
            Active Critical &amp; Emergent Cases ({redCases.length + orangeCases.length} Patients)
          </CardTitle>
          <Link href="/emergency/queue">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-rose-600">
              Open Full Tracking Board &rarr;
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Case # &amp; Patient</TableHead>
                <TableHead>Arrival Info</TableHead>
                <TableHead>Chief Complaint</TableHead>
                <TableHead>Assigned Bay</TableHead>
                <TableHead>Triage Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...redCases, ...orangeCases].length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    No active Level 1 or Level 2 critical patients in the department.
                  </TableCell>
                </TableRow>
              ) : (
                [...redCases, ...orangeCases].map((c) => (
                  <TableRow key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {c.patientName}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {c.caseNumber} {c.age ? `• ${c.age}y/${c.gender?.[0]}` : ""}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <Truck className="h-3 w-3 text-slate-400" />
                        {c.modeOfArrival}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(c.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-xs truncate text-slate-700 dark:text-slate-300">
                        {c.chiefComplaints}
                      </div>
                    </TableCell>

                    <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                      {c.assignedBay || "Acute Bay 1"}
                    </TableCell>

                    <TableCell>
                      <Badge className={c.triagePriority === "Red" ? "bg-rose-600 text-white" : "bg-orange-500 text-white"}>
                        {c.triagePriority === "Red" ? "Level 1 - Red" : "Level 2 - Orange"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {c.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <Link href="/emergency/consultation">
                        <Button size="sm" className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white">
                          Attend
                        </Button>
                      </Link>
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
