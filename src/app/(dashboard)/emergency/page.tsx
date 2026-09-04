"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Siren,
  Activity,
  AlertTriangle,
  Clock,
  BedDouble,
  UserPlus,
  Stethoscope,
  ListOrdered,
  FileCheck2,
  Syringe,
  Building2,
  LogOut,
  BarChart3,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  HeartPulse,
  Flame,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { ModuleNavCards } from "@/components/layout/module-nav-cards";

export default function EmergencyOperationsHub() {
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
  const [recentCasualties, setRecentCasualties] = useState<any[]>([]);
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
      if (cData.success) setRecentCasualties(cData.data.slice(0, 6));
    } catch (err) {
      console.error(err);
      toast("Failed to load emergency hub metrics", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000); // 20s auto refresh
    return () => clearInterval(interval);
  }, []);

  const renderPriorityBadge = (priority?: string) => {
    switch (priority) {
      case "Red":
        return (
          <Badge className="bg-rose-600 text-white animate-pulse text-[10px] flex items-center gap-1">
            <Flame className="h-3 w-3" /> Level 1 - Resuscitation
          </Badge>
        );
      case "Orange":
        return (
          <Badge className="bg-orange-500 text-white text-[10px] flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Level 2 - Emergent
          </Badge>
        );
      case "Yellow":
        return (
          <Badge className="bg-amber-400 text-slate-900 text-[10px]">
            Level 3 - Urgent
          </Badge>
        );
      case "Green":
      default:
        return (
          <Badge className="bg-emerald-600 text-white text-[10px]">
            Level 4 - Less Urgent
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Critical ER Banner */}
      {stats.criticalRedOrange > 0 && (
        <div className="p-3 rounded-lg bg-rose-600 text-white flex items-center justify-between shadow-md animate-pulse">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <Siren className="h-5 w-5" />
            <span>
              CRITICAL TRAUMA ALERT: {stats.criticalRedOrange} Level 1 / Level 2 patients currently under active resuscitation in ER!
            </span>
          </div>
          <Link href="/emergency/queue">
            <Button size="sm" variant="secondary" className="text-xs text-rose-700 bg-white hover:bg-rose-50 h-7 font-bold">
              View ER Tracking Board
            </Button>
          </Link>
        </div>
      )}

      {/* Operations Hub Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Siren className="h-6 w-6 text-rose-600 dark:text-rose-500" />
            Emergency &amp; Casualty Operations Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            24x7 Level-1 Trauma Center, clinical triage, STAT order processing, and rapid ICU escalation.
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
        </div>
      </div>

      {/* 6 Real-time KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Active in ER
              <Activity className="h-3.5 w-3.5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.activeCasualties}
            </div>
            <p className="text-[9px] text-slate-400">Currently admitted</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Red / Orange Alerts
              <Flame className="h-3.5 w-3.5 text-rose-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-rose-600">
              {stats.criticalRedOrange}
            </div>
            <p className="text-[9px] text-slate-400">Immediate care</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Occupied Bays
              <BedDouble className="h-3.5 w-3.5 text-amber-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.occupiedBays}
            </div>
            <p className="text-[9px] text-slate-400">Beds in use</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Pending STAT Orders
              <Clock className="h-3.5 w-3.5 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingOrders}
            </div>
            <p className="text-[9px] text-slate-400">Labs &amp; portable scans</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Admitted to ICU / Wards
              <Building2 className="h-3.5 w-3.5 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.todayAdmitted}
            </div>
            <p className="text-[9px] text-slate-400">Escalated today</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              MLC Cases
              <ShieldAlert className="h-3.5 w-3.5 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-purple-600">
              {stats.mlcCount}
            </div>
            <p className="text-[9px] text-slate-400">Medicolegal registry</p>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Submodule Navigation */}
      <ModuleNavCards
        modulePath="/emergency"
        title="Emergency Department Submodules"
        subtitle="Direct access to triage, queue, casualty intake, and emergency clinical operations"
      />

      {/* Active Casualty Stream & Bay Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Real-time Patient Stream (8 cols) */}
        <div className="lg:col-span-8">
          <Card className="border shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-rose-600" />
                  Live Casualty Inflow ({recentCasualties.length} Records)
                </CardTitle>
              </div>
              <Link href="/emergency/queue">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-rose-600">
                  Full ER Monitor &rarr;
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {recentCasualties.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No active emergency cases currently registered in ER.
                </div>
              ) : (
                recentCasualties.map((c) => (
                  <div key={c._id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {c.patientName}
                        </span>
                        {c.age && (
                          <span className="text-slate-400">
                            ({c.age}y/{c.gender?.[0]})
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-slate-400">
                          {c.caseNumber}
                        </span>
                        {c.isMLC && (
                          <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
                            MLC
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 max-w-xl truncate">
                        {c.chiefComplaints}
                      </p>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>Arrival: {new Date(c.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} via {c.modeOfArrival}</span>
                        <span>•</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">Bay: {c.assignedBay || "Unassigned"}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {renderPriorityBadge(c.triagePriority)}
                      <Badge variant="outline" className="text-[9px]">
                        {c.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: ER Bay Occupancy Radar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="p-4 pb-2 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-emerald-600" />
                ER Bay Capacity Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs">
              <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between">
                <div>
                  <div className="font-bold text-rose-800 dark:text-rose-300">Resuscitation Bay 1 &amp; 2</div>
                  <div className="text-[10px] text-slate-500">Defibrillator &amp; Ventilator Equipped</div>
                </div>
                <Badge className="bg-rose-600 text-white text-[10px]">OCCUPIED</Badge>
              </div>

              <div className="p-2 rounded bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 flex items-center justify-between">
                <div>
                  <div className="font-bold text-orange-800 dark:text-orange-300">Trauma Bay</div>
                  <div className="text-[10px] text-slate-500">Rapid Transfusion &amp; Splints</div>
                </div>
                <Badge className="bg-orange-500 text-white text-[10px]">IN USE</Badge>
              </div>

              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Acute Bays (1 to 6)</div>
                  <div className="text-[10px] text-slate-500">Continuous Multi-para Monitoring</div>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-600">4 Available</Badge>
              </div>

              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Pediatric ER Bay</div>
                  <div className="text-[10px] text-slate-500">Child Resuscitation Warmers</div>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-600">Ready</Badge>
              </div>

              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Procedure / Suture Room</div>
                  <div className="text-[10px] text-slate-500">Minor Trauma &amp; Dressing</div>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-600">Available</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
