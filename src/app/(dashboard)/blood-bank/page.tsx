"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Droplet,
  Users,
  Layers,
  HeartPulse,
  Activity,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  BarChart3,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Flame,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function BloodBankHub() {
  const [stats, setStats] = useState<any>({
    totalAvailableUnits: 0,
    totalDonors: 0,
    pendingRequests: 0,
    todayIssues: 0,
    expiringSoon: 0,
    reservedBags: 0,
    groupStock: {
      "A+": 0, "A-": 0, "B+": 0, "B-": 0,
      "AB+": 0, "AB-": 0, "O+": 0, "O-": 0
    },
    criticalGroups: [],
    componentStock: {
      PRBC: 0, WHOLE_BLOOD: 0, FFP: 0, PLATELETS: 0, CRYOPRECIPITATE: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/blood-bank/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      toast("Failed to load blood bank stats", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 20000);
    return () => clearInterval(interval);
  }, []);

  const navCards = [
    {
      title: "Blood Bank Dashboard",
      href: "/blood-bank/dashboard",
      icon: Activity,
      desc: "Comprehensive blood banking overview, collections, and usage analytics.",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40"
    },
    {
      title: "Donors Registry",
      href: "/blood-bank/donors",
      icon: Users,
      desc: "Voluntary and replacement donor registration, clinical screening, and deferrals.",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40"
    },
    {
      title: "Blood Collection",
      href: "/blood-bank/collection",
      icon: HeartPulse,
      desc: "Phlebotomy session logs, bag types (Single/Double/Triple SAGM), and component separation.",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40"
    },
    {
      title: "Blood Inventory",
      href: "/blood-bank/inventory",
      icon: Layers,
      desc: "Refrigerator, Deep Freezer, and Platelet Agitator stock monitoring with expiry countdowns.",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/40"
    },
    {
      title: "Blood Testing (TTI)",
      href: "/blood-bank/testing",
      icon: ShieldCheck,
      desc: "Mandatory screening for HIV, HBV, HCV, Syphilis, and Malaria before release.",
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-950/40"
    },
    {
      title: "Cross Matching",
      href: "/blood-bank/cross-matching",
      icon: CheckCircle2,
      desc: "Major & minor Gel Card Coombs compatibility testing and 48-hour reservations.",
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/40"
    },
    {
      title: "Blood Requests",
      href: "/blood-bank/requests",
      icon: FileCheck2,
      desc: "Clinical requisitions desk for Emergency, OT, ICU, and Inpatient wards.",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40"
    },
    {
      title: "Blood Issue",
      href: "/blood-bank/issue",
      icon: Droplet,
      desc: "Dual-nurse cross-checked dispensing, cold-chain transport, and transfusion vouchers.",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/40"
    },
    {
      title: "Blood Return",
      href: "/blood-bank/return",
      icon: RotateCcw,
      desc: "Cold-chain verification for unused returned units and biohazard discard log.",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/40"
    },
    {
      title: "Blood Reports",
      href: "/blood-bank/reports",
      icon: BarChart3,
      desc: "Statutory SBTC/DCGI registers, hemovigilance audits, and CSV data export.",
      color: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-50 dark:bg-slate-800/40"
    }
  ];

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

  return (
    <div className="space-y-6 pb-12">
      {/* Critical Shortage Warning Banner */}
      {stats.criticalGroups && stats.criticalGroups.length > 0 && (
        <div className="p-3.5 rounded-lg bg-rose-600 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            <span>
              BLOOD BANK SHORTAGE ALERT: Critical low reserve for blood groups:{" "}
              <span className="underline">{stats.criticalGroups.join(", ")}</span> (&lt; 5 units available). Immediate voluntary donor calls recommended!
            </span>
          </div>
          <Link href="/blood-bank/donors">
            <Button size="sm" variant="secondary" className="text-xs text-rose-800 bg-white hover:bg-rose-50 h-7 font-bold">
              Donor Directory
            </Button>
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Droplet className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            Blood Bank &amp; Transfusion Medicine Operations Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Certified blood component inventory, voluntary donor screening, TTI serology testing, and cold-chain dispensing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadStats}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Link href="/blood-bank/donors">
            <Button size="sm" className="text-xs flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white">
              <Plus className="h-4 w-4" />
              Register Donor
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Real-Time KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Available Units
              <Droplet className="h-3.5 w-3.5 text-rose-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-rose-600">
              {stats.totalAvailableUnits}
            </div>
            <p className="text-[9px] text-slate-400">Tested &amp; safe in bank</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Voluntary Donors
              <Users className="h-3.5 w-3.5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalDonors}
            </div>
            <p className="text-[9px] text-slate-400">Active donor registry</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Pending Requests
              <FileCheck2 className="h-3.5 w-3.5 text-amber-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-amber-600">
              {stats.pendingRequests}
            </div>
            <p className="text-[9px] text-slate-400">Awaiting crossmatch</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Reserved for OT
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.reservedBags}
            </div>
            <p className="text-[9px] text-slate-400">Crossmatch compatible</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Issued Today
              <Activity className="h-3.5 w-3.5 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-emerald-600">
              {stats.todayIssues}
            </div>
            <p className="text-[9px] text-slate-400">Dispatched to wards</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              Expiring &lt; 7 Days
              <Clock className="h-3.5 w-3.5 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold text-orange-600">
              {stats.expiringSoon}
            </div>
            <p className="text-[9px] text-slate-400">Immediate utilization</p>
          </CardContent>
        </Card>
      </div>

      {/* 8-Blood Group Real-Time Stock Radar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Droplet className="h-4 w-4 text-rose-600" />
              Live Blood Group Stock Radar (8 Groups)
            </span>
            <span className="text-xs font-normal text-slate-500">
              Safe Benchmark: &ge; 10 units/group
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {bloodGroups.map((bg) => {
              const count = stats.groupStock?.[bg] || 0;
              const isLow = count < 5;
              const isModerate = count >= 5 && count < 10;
              return (
                <div
                  key={bg}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    isLow
                      ? "bg-rose-50 border-rose-300 dark:bg-rose-950/40 dark:border-rose-900"
                      : isModerate
                      ? "bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-900"
                      : "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-900"
                  }`}
                >
                  <div className="text-lg font-black text-slate-900 dark:text-white">{bg}</div>
                  <div
                    className={`text-2xl font-bold font-mono my-0.5 ${
                      isLow
                        ? "text-rose-600"
                        : isModerate
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {count}
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-1 py-0 ${
                      isLow
                        ? "border-rose-400 text-rose-700 bg-rose-100 dark:bg-rose-900"
                        : isModerate
                        ? "border-amber-400 text-amber-700 bg-amber-100 dark:bg-amber-900"
                        : "border-emerald-400 text-emerald-700 bg-emerald-100 dark:bg-emerald-900"
                    }`}
                  >
                    {isLow ? "Critical Low" : isModerate ? "Moderate" : "Sufficient"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 10 Submodule Launchpad Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Blood Bank Department Submodules</span>
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

      {/* Therapeutic Component Stock Overview */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Layers className="h-4 w-4 text-purple-600" />
            Therapeutic Blood Component Fractionation Inventory
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3 rounded bg-slate-50 dark:bg-slate-800 border">
              <span className="font-bold block text-slate-800 dark:text-slate-200">
                Packed Red Cells (PRBC)
              </span>
              <span className="text-2xl font-bold text-rose-600 font-mono">
                {stats.componentStock?.PRBC || 0} Bags
              </span>
              <p className="text-[10px] text-slate-400">Stored at 2°C–6°C</p>
            </div>

            <div className="p-3 rounded bg-slate-50 dark:bg-slate-800 border">
              <span className="font-bold block text-slate-800 dark:text-slate-200">
                Whole Blood (WB)
              </span>
              <span className="text-2xl font-bold text-red-600 font-mono">
                {stats.componentStock?.WHOLE_BLOOD || 0} Bags
              </span>
              <p className="text-[10px] text-slate-400">350ml / 450ml CPDA-1</p>
            </div>

            <div className="p-3 rounded bg-slate-50 dark:bg-slate-800 border">
              <span className="font-bold block text-slate-800 dark:text-slate-200">
                Fresh Frozen Plasma (FFP)
              </span>
              <span className="text-2xl font-bold text-amber-600 font-mono">
                {stats.componentStock?.FFP || 0} Units
              </span>
              <p className="text-[10px] text-slate-400">Stored at -40°C freezer</p>
            </div>

            <div className="p-3 rounded bg-slate-50 dark:bg-slate-800 border">
              <span className="font-bold block text-slate-800 dark:text-slate-200">
                Platelet Concentrate (RDP)
              </span>
              <span className="text-2xl font-bold text-teal-600 font-mono">
                {stats.componentStock?.PLATELETS || 0} Units
              </span>
              <p className="text-[10px] text-slate-400">Platelet Agitator (22°C)</p>
            </div>

            <div className="p-3 rounded bg-slate-50 dark:bg-slate-800 border">
              <span className="font-bold block text-slate-800 dark:text-slate-200">
                Cryoprecipitate
              </span>
              <span className="text-2xl font-bold text-indigo-600 font-mono">
                {stats.componentStock?.CRYOPRECIPITATE || 0} Units
              </span>
              <p className="text-[10px] text-slate-400">Factor VIII / Fibrinogen</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
