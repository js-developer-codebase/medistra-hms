"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Scissors,
  Calendar,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Syringe,
  Users,
  ShieldCheck,
  FileText,
  BarChart3,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Flame,
  Layers,
  HeartPulse
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { ModuleNavCards } from "@/components/layout/module-nav-cards";

export default function OTOperationsHub() {
  const [stats, setStats] = useState<any>({
    scheduledToday: 0,
    inProgressSurgeries: 0,
    emergencySurgeries: 0,
    pendingRequests: 0,
    pacClearedCount: 0,
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
      if (schData.success) setSchedules(schData.data.slice(0, 5));
    } catch (err) {
      toast("Failed to load OT metrics", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Live Surgery In-Progress Banner */}
      {stats.inProgressSurgeries > 0 && (
        <div className="p-3 rounded-lg bg-emerald-600 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <Activity className="h-5 w-5 animate-pulse" />
            <span>
              LIVE SURGICAL THEATRES: {stats.inProgressSurgeries} complex surgeries currently IN PROGRESS under sterile positive laminar airflow!
            </span>
          </div>
          <Link href="/ot/schedule">
            <Button size="sm" variant="secondary" className="text-xs text-emerald-800 bg-white hover:bg-emerald-50 h-7 font-bold">
              View OT Master Board
            </Button>
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Scissors className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Operation Theatre (OT) Operations Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Multi-specialty surgical suites, WHO safety checklists, high-end equipment bookings, and PACU recovery.
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

      {/* 6 Real-Time KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Scheduled Today
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.todaySurgeries}
            </div>
            <p className="text-[9px] text-slate-400">On today&apos;s OT slate</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              In Progress
              <Activity className="h-3.5 w-3.5 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-emerald-600">
              {stats.inProgressSurgeries}
            </div>
            <p className="text-[9px] text-slate-400">Under sterile drape</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Available Suites
              <Layers className="h-3.5 w-3.5 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.availableRooms} / {stats.totalSuites}
            </div>
            <p className="text-[9px] text-slate-400">Ready for turnover</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Pending Requisitions
              <FileCheck2 className="h-3.5 w-3.5 text-amber-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-amber-600">
              {stats.pendingRequests}
            </div>
            <p className="text-[9px] text-slate-400">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Emergency Surgeries
              <Flame className="h-3.5 w-3.5 text-rose-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-rose-600">
              {stats.emergencySurgeries}
            </div>
            <p className="text-[9px] text-slate-400">STAT / Urgent trauma</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              PAC Cleared
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-teal-600">
              {stats.pacClearedCount}
            </div>
            <p className="text-[9px] text-slate-400">Anesthesia fit</p>
          </CardContent>
        </Card>
      </div>

      {/* Operation Theatre Submodule Navigation */}
      <ModuleNavCards
        modulePath="/ot"
        title="Operation Theatre Department Submodules"
        subtitle="Direct access to OT schedules, surgery requests, WHO checklists, intra-op, and recovery"
      />

      {/* 5-Suite OT Capacity Radar & Live Schedule Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Live Surgery Feed (8 cols) */}
        <div className="lg:col-span-8">
          <Card className="border shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-emerald-600" />
                  Live Surgical Slate ({schedules.length} Surgeries)
                </CardTitle>
              </div>
              <Link href="/ot/schedule">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-600">
                  Full Master Schedule &rarr;
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {schedules.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No surgeries currently scheduled on the slate.
                </div>
              ) : (
                schedules.map((s) => (
                  <div key={s._id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {s.surgeryName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {s.surgeryCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        Patient: <span className="font-semibold text-slate-800 dark:text-slate-200">{s.patientName}</span> ({s.uhid || "UHID N/A"}) • Surgeon: <span className="font-medium">{s.surgeon}</span>
                      </p>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>Slot: {s.time} ({s.duration} mins)</span>
                        <span>•</span>
                        <span className="font-medium text-emerald-700 dark:text-emerald-400">{s.otRoom}</span>
                        <span>•</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">₹{(s.estimatedCost || 0).toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
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
                      <span className="text-[10px] text-slate-500 font-mono">
                        {s.anesthesiaType?.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: 5-Suite OT Capacity Radar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="p-4 pb-2 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-600" />
                OT Suites Real-Time Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs">
              <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-800 dark:text-emerald-300">OT 1: Modular Cardiac Suite</div>
                  <div className="text-[10px] text-slate-500">Heart-Lung Machine &amp; IABP Active</div>
                </div>
                <Badge className="bg-emerald-600 text-white text-[10px] animate-pulse">IN SURGERY</Badge>
              </div>

              <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-800 dark:text-emerald-300">OT 2: Neuro-Trauma Suite</div>
                  <div className="text-[10px] text-slate-500">Microscope &amp; CUSA Ultrasonic</div>
                </div>
                <Badge className="bg-emerald-600 text-white text-[10px] animate-pulse">IN SURGERY</Badge>
              </div>

              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">OT 3: Orthopedic &amp; Joint Suite</div>
                  <div className="text-[10px] text-slate-500">C-Arm Fluoroscopy &amp; Laminar Flow</div>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-600">Ready</Badge>
              </div>

              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">OT 4: Laparoscopic &amp; GI Suite</div>
                  <div className="text-[10px] text-slate-500">Karl Storz 4K Tower &amp; Harmonic</div>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-600">Ready</Badge>
              </div>

              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">OT 5: Emergency &amp; Daycare</div>
                  <div className="text-[10px] text-slate-500">Rapid Turnover Sterile Suite</div>
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
