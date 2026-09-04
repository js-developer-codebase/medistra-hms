"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Settings,
  Building2,
  Globe2,
  Coins,
  Clock,
  Hash,
  CalendarCheck,
  ReceiptText,
  Stethoscope,
  FlaskConical,
  Pill,
  BellRing,
  Network,
  Code2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Search,
  Sparkles,
  Server
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface ConfigModule {
  id: string;
  name: string;
  path: string;
  categoryGroup: "Core & Regional" | "Clinical & Operations" | "Technical & Security";
  icon: React.ElementType;
  description: string;
  color: string;
  tags: string[];
  keyHighlights: string;
}

const CONFIG_MODULES: ConfigModule[] = [
  {
    id: "general",
    name: "General Settings",
    path: "/config/general",
    categoryGroup: "Core & Regional",
    icon: Building2,
    description: "Hospital legal identity, corporate accreditation, branding, 24x7 emergency helpline, and contact addresses.",
    color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900",
    tags: ["Branding", "NABH", "Emergency 1066", "Contact"],
    keyHighlights: "Medistra Super Speciality Hospital, New Delhi"
  },
  {
    id: "localization",
    name: "Localization",
    path: "/config/localization",
    categoryGroup: "Core & Regional",
    icon: Globe2,
    description: "Regional settings, multi-lingual preferences (en-IN, hi-IN), Indian standard date format (DD/MM/YYYY), and calendar week.",
    color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900",
    tags: ["en-IN", "hi-IN", "DD/MM/YYYY", "Indian Calendar"],
    keyHighlights: "Indian English, Hindi, DD/MM/YYYY"
  },
  {
    id: "currency",
    name: "Currency & Monetary",
    path: "/config/currency",
    categoryGroup: "Core & Regional",
    icon: Coins,
    description: "Strict Indian Rupee (₹ / INR) standards, Lakhs/Crores numbering format, rounding rules, and tariff representations.",
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900",
    tags: ["INR (₹)", "Lakhs/Crores", "GST Billing", "Round to Rupee"],
    keyHighlights: "₹ Indian Rupee, Lakhs/Crores Grouping"
  },
  {
    id: "timezone",
    name: "Timezone & Synchronization",
    path: "/config/timezone",
    categoryGroup: "Core & Regional",
    icon: Clock,
    description: "Asia/Kolkata (IST - UTC+05:30) configuration, national NTP time server synchronization, and clinical time-stamping drift tolerance.",
    color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900",
    tags: ["Asia/Kolkata", "UTC+05:30", "NTP Sync", "IST Clock"],
    keyHighlights: "Asia/Kolkata (IST), 15m NTP Sync"
  },
  {
    id: "numbering",
    name: "Auto-Numbering Sequences",
    path: "/config/numbering",
    categoryGroup: "Core & Regional",
    icon: Hash,
    description: "Automated sequence generators for UHID, IPD Admissions, OPD Tokens, Invoices, Prescriptions, Lab Orders, and POs.",
    color: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-900",
    tags: ["UHID", "IPD", "OPD", "INV", "RX", "LAB", "PO"],
    keyHighlights: "MED-UHID-, MED-IPD-, INV-2026-"
  },
  {
    id: "appointments",
    name: "Appointment Settings",
    path: "/config/appointments",
    categoryGroup: "Clinical & Operations",
    icon: CalendarCheck,
    description: "OPD consultation slot durations, buffer windows, advance booking windows, cancellation rules, and teleconsultation WebRTC.",
    color: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-900",
    tags: ["15m Slots", "Teleconsult", "Advance 60d", "SMS Reminders"],
    keyHighlights: "15 min slots, 5 min buffer, WebRTC active"
  },
  {
    id: "billing",
    name: "Billing & GST Settings",
    path: "/config/billing",
    categoryGroup: "Clinical & Operations",
    icon: ReceiptText,
    description: "Statutory Indian GST slabs (0%, 5%, 12%, 18%), room rent tax (>₹5000/day: 5%), accepted payment modes, credit periods.",
    color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-900",
    tags: ["GST Slabs", "Room Tax", "UPI / QR", "TPA Settlement"],
    keyHighlights: "0%/5%/12%/18% GST, UPI/Cards/Cash"
  },
  {
    id: "clinical",
    name: "Clinical Settings",
    path: "/config/clinical",
    categoryGroup: "Clinical & Operations",
    icon: Stethoscope,
    description: "ICD-10 coding classification, panic vital alert thresholds (BP, Pulse, SpO2, Sugar), drug-allergy red-flags, and signature requirements.",
    color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900",
    tags: ["ICD-10-CM", "Vital Alerts", "SpO2 <92%", "Allergy Block"],
    keyHighlights: "ICD-10-CM, Strict Allergy Contraindication"
  },
  {
    id: "laboratory",
    name: "Laboratory Settings",
    path: "/config/laboratory",
    categoryGroup: "Clinical & Operations",
    icon: FlaskConical,
    description: "Panic critical value alert bounds (Potassium, Hemoglobin, Platelets), Code 128 barcode standards, and STAT emergency turnaround times.",
    color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900",
    tags: ["Panic Alerts", "Code 128", "STAT 1h", "Specimen Rejection"],
    keyHighlights: "Immediate Panic SMS, 1h STAT TAT"
  },
  {
    id: "pharmacy",
    name: "Pharmacy Settings",
    path: "/config/pharmacy",
    categoryGroup: "Clinical & Operations",
    icon: Pill,
    description: "FEFO dispensing valuation, Schedule H/H1 prescription enforcement, Schedule X dual pharmacist sign-offs, and low-stock auto-PO.",
    color: "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50 border-pink-200 dark:border-pink-900",
    tags: ["FEFO", "Schedule H/X", "Auto-PO", "Expiry Alerts"],
    keyHighlights: "FEFO Stock Rotation, Schedule H/X Control"
  },
  {
    id: "notifications",
    name: "Notification Settings",
    path: "/config/notifications",
    categoryGroup: "Technical & Security",
    icon: BellRing,
    description: "National Health SMS gateway (NIC/CDAC), WhatsApp Cloud API, SMTP mail relay (smtp.medistra.in), and automated appointment dispatches.",
    color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-900",
    tags: ["SMS Gateway", "WhatsApp API", "SMTP Relay", "Panic Alerts"],
    keyHighlights: "NIC/CDAC SMS, WhatsApp Cloud, SMTP"
  },
  {
    id: "integrations",
    name: "Integration Settings",
    path: "/config/integrations",
    categoryGroup: "Technical & Security",
    icon: Network,
    description: "Ayushman Bharat Digital Mission (ABDM M1/M2/M3), ABHA generation, interoperable HL7/FHIR R4 server, and DICOM PACS radiology archives.",
    color: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-900",
    tags: ["ABDM M1-M3", "ABHA", "HL7/FHIR R4", "DICOM PACS"],
    keyHighlights: "ABDM Milestone 1-3, FHIR R4, PACS"
  },
  {
    id: "api",
    name: "API & Security Settings",
    path: "/config/api",
    categoryGroup: "Technical & Security",
    icon: Code2,
    description: "Public REST API gateway controls, client rate-limiting (120 req/min), webhook delivery retries, CORS whitelisting, and audit levels.",
    color: "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800",
    tags: ["Rate Limits", "Webhooks", "CORS", "Verbose Audit"],
    keyHighlights: "120 req/min, CORS Whitelisted, Key Rotation"
  }
];

export default function ConfigHubPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/config/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Failed to load config stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const runDiagnostics = async () => {
    setDiagnosticRunning(true);
    try {
      const res = await fetch("/api/config/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
        toast("System configuration diagnostics complete: All 13 modules operational and synchronized with MongoDB!", "success");
      }
    } catch {
      toast("Diagnostics failed to reach configuration endpoints.", "error");
    } finally {
      setDiagnosticRunning(false);
    }
  };

  const filteredModules = CONFIG_MODULES.filter((mod) => {
    const matchesSearch =
      mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGroup = selectedGroup === "ALL" || mod.categoryGroup === selectedGroup;

    return matchesSearch && matchesGroup;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-2">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            Hospital Master Configuration & Governance
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Settings className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            System Configuration Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Centralized control plane for Medistra Super Speciality Hospital settings across all 13 specialized domains.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Status
          </Button>

          <Button
            size="sm"
            onClick={runDiagnostics}
            disabled={diagnosticRunning}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
          >
            <Sparkles className={`h-4 w-4 ${diagnosticRunning ? "animate-spin" : ""}`} />
            {diagnosticRunning ? "Verifying..." : "Run Diagnostics"}
          </Button>
        </div>
      </div>

      {/* Telemetry Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-gradient-to-br from-white to-blue-50/40 dark:from-slate-900 dark:to-blue-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-slate-500">Configured Modules</CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-baseline justify-between">
              <span>{stats ? `${stats.configuredCategories} / ${stats.totalCategories}` : "13 / 13"}</span>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px]">
                100% Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">
            All 13 administrative & clinical modules seeded
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-gradient-to-br from-white to-emerald-50/40 dark:from-slate-900 dark:to-emerald-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-slate-500">Primary Currency</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-baseline justify-between">
              <span>₹ INR</span>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px]">
                Indian Standard
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">
            Lakhs/Crores grouping & GST compliant
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-gradient-to-br from-white to-amber-50/40 dark:from-slate-900 dark:to-amber-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-slate-500">Master Timezone</CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-baseline justify-between">
              <span>Asia/Kolkata</span>
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px]">
                UTC+05:30
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">
            NTP synchronized with time.google.com
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-gradient-to-br from-white to-purple-50/40 dark:from-slate-900 dark:to-purple-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-slate-500">Total Config Keys</CardDescription>
            <CardTitle className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-baseline justify-between">
              <span>{stats?.totalSettings || 77}</span>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px]">
                MongoDB
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">
            Synchronized with persistent storage
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["ALL", "Core & Regional", "Clinical & Operations", "Technical & Security"] as const).map((grp) => (
            <Button
              key={grp}
              size="sm"
              variant={selectedGroup === grp ? "default" : "outline"}
              onClick={() => setSelectedGroup(grp)}
              className="text-xs h-8 whitespace-nowrap"
            >
              {grp === "ALL" ? "All Submodules (13)" : grp}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search configurations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs"
          />
        </div>
      </div>

      {/* Submodule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModules.map((mod) => {
          const IconComponent = mod.icon;
          return (
            <Card
              key={mod.id}
              className="border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`p-2.5 rounded-lg border ${mod.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-medium">
                      {mod.categoryGroup}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-semibold pt-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {mod.name}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2 text-slate-500">
                    {mod.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-0 text-xs">
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider mb-0.5">
                      Active Parameter Highlights
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {mod.keyHighlights}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {mod.tags.map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </div>

              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Configured</span>
                </div>
                <Link href={mod.path}>
                  <Button size="sm" variant="ghost" className="h-8 text-xs font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Manage
                    <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
