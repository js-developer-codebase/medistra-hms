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
  const [seeding, setSeeding] = useState(false);
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

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await fetch("/api/emergency/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast("Sample emergency and trauma cases seeded successfully!", "success");
        loadData();
      } else {
        toast(data.message || "Failed to seed sample cases", "error");
      }
    } catch (err) {
      toast("Error executing seeder", "error");
    } finally {
      setSeeding(false);
    }
  };

  const navCards = [
    {
      title: "Emergency Dashboard",
      href: "/emergency/dashboard",
      icon: Activity,
      desc: "Door-to-doctor TAT, ESI case volumes, and ambulance arrival trends.",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40"
    },
    {
      title: "Casualty Registration",
      href: "/emergency/registration",
      icon: UserPlus,
      desc: "Rapid casualty intake, ambulance arrivals, and Medicolegal (MLC) tagging.",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40"
    },
    {
      title: "Clinical Triage (ESI)",
      href: "/emergency/triage",
      icon: HeartPulse,
      desc: "5-level color-coded Manchester triage, vitals alerts, and ABCDE survey.",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40"
    },
    {
      title: "Emergency Queue",
      href: "/emergency/queue",
      icon: ListOrdered,
      desc: "Live ER tracking board sorted by severity, wait times, and bay status.",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40"
    },
    {
      title: "ER Consultation",
      href: "/emergency/consultation",
      icon: Stethoscope,
      desc: "Physician examination, provisional diagnosis, and clinical disposition.",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/40"
    },
    {
      title: "STAT Orders",
      href: "/emergency/orders",
      icon: Flame,
      desc: "STAT requisition for emergency lab panels, portable X-Ray, and IV drugs.",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/40"
    },
    {
      title: "Trauma & Procedures",
      href: "/emergency/treatment",
      icon: Syringe,
      desc: "Resuscitation logs (CPR, intubation, defibrillation, wound suturing).",
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-950/40"
    },
    {
      title: "Inpatient Admission",
      href: "/emergency/admission",
      icon: Building2,
      desc: "Direct escalation and handover to ICU, CCU, Emergency OT, or Wards.",
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/40"
    },
    {
      title: "Discharge & Disposition",
      href: "/emergency/discharge",
      icon: LogOut,
      desc: "Discharge home, LAMA/DAMA, transfer to tertiary trauma center, BID.",
      color: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-50 dark:bg-slate-800/40"
    },
    {
      title: "Emergency & MLC Reports",
      href: "/emergency/reports",
      icon: BarChart3,
      desc: "Door-to-triage TAT, police MLC registry, and ER mortality audit logs.",
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-50 dark:bg-cyan-950/40"
    }
  ];

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

          <Button
            size="sm"
            onClick={handleSeed}
            disabled={seeding}
            className="text-xs flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {seeding ? "Seeding..." : "Seed Sample ER Cases"}
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

      {/* 10 Submodule Launchpad Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Emergency Department Submodules</span>
            <Badge variant="outline" className="text-xs">10 Workstations</Badge>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href} className="group">
                <Card className="h-full border hover:border-rose-500/50 hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-900 flex flex-col justify-between">
                  <CardHeader className="p-3.5 pb-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`p-2 rounded-lg ${card.bg}`}>
                        <Icon className={`h-4 w-4 ${card.color}`} />
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <CardTitle className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-0">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {card.desc}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

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
                  No active emergency cases. Click &quot;Seed Sample ER Cases&quot; to test.
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
