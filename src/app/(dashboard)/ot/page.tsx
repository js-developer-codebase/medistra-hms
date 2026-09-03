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

export default function OperationTheatreHub() {
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
  const [seeding, setSeeding] = useState(false);
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

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await fetch("/api/ot/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast("Sample multi-specialty surgical cases seeded successfully!", "success");
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
      title: "OT Dashboard",
      href: "/ot/dashboard",
      icon: Activity,
      desc: "Suite utilization benchmarks, caseload volumes, and surgical timeline.",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40"
    },
    {
      title: "Surgical Schedule",
      href: "/ot/schedule",
      icon: Calendar,
      desc: "Timeline calendar across OT 1–5, surgeon assignments, and status tracker.",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40"
    },
    {
      title: "Surgery Requests",
      href: "/ot/requests",
      icon: FileCheck2,
      desc: "Inpatient and emergency surgical booking requisitions and approval desk.",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/40"
    },
    {
      title: "OT Booking & Equipment",
      href: "/ot/booking",
      icon: Layers,
      desc: "Surgical suite reservations, C-Arm, Laparoscopic Tower, and CSSD sterilizer checks.",
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/40"
    },
    {
      title: "Surgical Team Roster",
      href: "/ot/team",
      icon: Users,
      desc: "Primary surgeon, anesthesiologist, scrub nurse, and perfusionist assignments.",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40"
    },
    {
      title: "Pre-Operative Checklist",
      href: "/ot/preop",
      icon: ShieldCheck,
      desc: "WHO Surgical Safety Sign-In, PAC clearance, ASA grading, and site marking.",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40"
    },
    {
      title: "Anesthesia Station",
      href: "/ot/anesthesia",
      icon: HeartPulse,
      desc: "GA, Spinal & Regional blocks, Mallampati airway, induction and gas logs.",
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-950/40"
    },
    {
      title: "Intraoperative Notes",
      href: "/ot/intraop",
      icon: Scissors,
      desc: "Time-out verification, skin incision/closure times, implants, and swab counts.",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/40"
    },
    {
      title: "Post-Operative (PACU)",
      href: "/ot/postop",
      icon: Syringe,
      desc: "Aldrete Recovery Scoring (0–10), post-op vitals, and ICU/ward clearance.",
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-50 dark:bg-cyan-950/40"
    },
    {
      title: "OT Reports & Audits",
      href: "/ot/reports",
      icon: BarChart3,
      desc: "Surgical room utilization, turnaround times, infection surveillance, and CSV export.",
      color: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-50 dark:bg-slate-800/40"
    }
  ];

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

          <Button
            size="sm"
            onClick={handleSeed}
            disabled={seeding}
            className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {seeding ? "Seeding..." : "Seed Sample Surgeries"}
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

      {/* 10 Submodule Launchpad Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Operation Theatre Department Submodules</span>
            <Badge variant="outline" className="text-xs">10 Workstations</Badge>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href} className="group">
                <Card className="h-full border hover:border-emerald-500/50 hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-900 flex flex-col justify-between">
                  <CardHeader className="p-3.5 pb-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`p-2 rounded-lg ${card.bg}`}>
                        <Icon className={`h-4 w-4 ${card.color}`} />
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <CardTitle className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
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
                  No surgeries scheduled. Click &quot;Seed Sample Surgeries&quot; to test.
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
