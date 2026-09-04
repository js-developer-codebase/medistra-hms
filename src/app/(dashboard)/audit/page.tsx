"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  Activity,
  LogIn,
  Eye,
  History,
  Trash2,
  Lock,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Terminal,
  FileSpreadsheet,
} from "lucide-react";

interface IAuditTelemetry {
  totalLogs: number;
  logs24h: number;
  userActivitiesCount: number;
  loginEventsCount: number;
  failedLoginsCount: number;
  sensitiveDataAccessCount: number;
  recordChangesCount: number;
  securityEventsCount: number;
  openSecurityAlerts: number;
  deletedRecordsCount: number;
  complianceScoreAvg: number;
  recentLogs: Array<{
    _id: string;
    action: string;
    entity: string;
    category: string;
    severity: string;
    status: string;
    details: string;
    userName?: string;
    ipAddress?: string;
    createdAt: string;
  }>;
}

export default function AuditDashboardPage() {
  const [stats, setStats] = useState<IAuditTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/audit/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to load audit stats", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const navCards = [
    {
      title: "Audit Logs",
      desc: "Central stream of all platform actions, entity modifications, and system triggers.",
      href: "/audit/logs",
      icon: Terminal,
      badge: `${stats?.totalLogs || 0} Events`,
      color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800",
    },
    {
      title: "User Activity",
      desc: "Clinical and administrative staff workflow timeline across clinical, billing, and pharmacy.",
      href: "/audit/activity",
      icon: Activity,
      badge: `${stats?.userActivitiesCount || 0} Records`,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800",
    },
    {
      title: "Login History",
      desc: "Authentication audits, session validations, failed login alerts, and IP forensics.",
      href: "/audit/login",
      icon: LogIn,
      badge: `${stats?.failedLoginsCount || 0} Failed Trials`,
      color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800",
    },
    {
      title: "Data Access Logs",
      desc: "Patient Health Information (PHI) chart views and sensitive record inspection ledger (HIPAA/NABH).",
      href: "/audit/access",
      icon: Eye,
      badge: `${stats?.sensitiveDataAccessCount || 0} Chart Reads`,
      color: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800",
    },
    {
      title: "Record Change History",
      desc: "Field-level before-and-after change diffs on prescriptions, patient bills in ₹, and orders.",
      href: "/audit/changes",
      icon: History,
      badge: `${stats?.recordChangesCount || 0} Diffs`,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800",
    },
    {
      title: "Security Events",
      desc: "Threat detection, brute-force alarms, unauthorized role access, and IP blacklist status.",
      href: "/audit/security",
      icon: ShieldAlert,
      badge: `${stats?.openSecurityAlerts || 0} Active Alerts`,
      color: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800",
    },
    {
      title: "Deleted Records",
      desc: "Forensic ledger of soft-deleted records, cancelled diagnostic orders, and voided receipts.",
      href: "/audit/deleted",
      icon: Trash2,
      badge: `${stats?.deletedRecordsCount || 0} Purged/Voided`,
      color: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800",
    },
    {
      title: "Compliance Reports",
      desc: "Statutory framework evaluations across NABH 5th Ed, HIPAA, DISHA/ABDM, and ISO 27001.",
      href: "/audit/reports",
      icon: ShieldCheck,
      badge: `${stats?.complianceScoreAvg || 94}% Overall Score`,
      color: "text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800",
    },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl dark:bg-blue-950/50">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Audit & Compliance</h1>
              <p className="text-muted-foreground text-sm">
                System Forensic Ledger, Information Security Monitoring & Regulatory Compliance (NABH / HIPAA / DISHA)
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh Telemetry
          </Button>
          <Link href="/audit/reports">
            <Button size="sm">
              <FileText className="w-4 h-4 mr-2" /> Compliance Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Security Threat Alert (if any active alerts) */}
      {(stats?.openSecurityAlerts || 0) > 0 && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/70 dark:bg-rose-950/30 dark:border-rose-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500 text-white rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                {stats?.openSecurityAlerts} Active Security Threat Alert{(stats?.openSecurityAlerts || 0) > 1 ? "s" : ""}
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Brute-force attempts or unauthorized access violations require security review and IP verification.
              </p>
            </div>
          </div>
          <Link href="/audit/security">
            <Button variant="outline" size="sm" className="border-rose-300 text-rose-900 hover:bg-rose-100 dark:text-rose-100">
              Review Security Console
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="shadow-sm border-l-4 border-l-blue-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Total Audit Events
            </CardTitle>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-950/50">
              <Terminal className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : (stats?.totalLogs || 0).toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold text-foreground">+{stats?.logs24h || 0}</span> events in last 24h
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-rose-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Security Incidents
            </CardTitle>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg dark:bg-rose-950/50">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : stats?.securityEventsCount || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="font-medium text-rose-600">{stats?.openSecurityAlerts || 0} Unresolved</span> •{" "}
              <span>{(stats?.securityEventsCount || 0) - (stats?.openSecurityAlerts || 0)} Cleared</span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              PHI Data Chart Reads
            </CardTitle>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg dark:bg-purple-950/50">
              <Eye className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : (stats?.sensitiveDataAccessCount || 0).toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% HIPAA/DISHA Tracked
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-teal-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Compliance Posture Score
            </CardTitle>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg dark:bg-teal-950/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : `${stats?.complianceScoreAvg || 94}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-teal-600 font-medium">NABH & ABDM Tier 1</span> Accredited
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Specialized Workstations Grid */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Audit Workstations & Regulatory Controls
          </h2>
          <p className="text-sm text-muted-foreground">
            Granular forensic inspection modules matching statutory standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href} className="group block">
                <Card className="h-full border hover:border-primary/50 hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-xl border ${card.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-medium">
                        {card.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors flex items-center gap-1 pt-2">
                      {card.title}
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs line-clamp-2 leading-relaxed">
                      {card.desc}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Audit Activity Stream */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Live Audit Event Feed
            </CardTitle>
            <CardDescription className="text-xs">
              Chronological stream of recent system transactions, patient chart accesses, and record changes.
            </CardDescription>
          </div>
          <Link href="/audit/logs">
            <Button variant="outline" size="sm">
              View All Logs
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading live stream...
            </div>
          ) : !stats?.recentLogs?.length ? (
            <div className="py-12 text-center text-muted-foreground text-xs">
              No audit logs found. Seed the database to view baseline records.
            </div>
          ) : (
            <div className="divide-y text-xs">
              {stats.recentLogs.map((log) => {
                const isHigh = log.severity === "HIGH" || log.severity === "CRITICAL";
                const isWarning = log.severity === "WARNING";

                return (
                  <div key={log._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{log.action}</span>
                        <Badge variant="secondary" className="text-[10px] font-mono uppercase">
                          {log.entity}
                        </Badge>
                        <Badge
                          variant={isHigh ? "destructive" : isWarning ? "outline" : "secondary"}
                          className={`text-[10px] uppercase font-semibold ${
                            isWarning ? "border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-950/30" : ""
                          }`}
                        >
                          {log.severity}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground line-clamp-1">{log.details}</p>
                    </div>

                    <div className="text-right sm:shrink-0 text-muted-foreground space-y-0.5">
                      <div className="font-medium text-foreground">
                        {log.userName || "System / Automated"}
                      </div>
                      <div className="text-[11px] font-mono">
                        {log.ipAddress && <span>{log.ipAddress} • </span>}
                        {new Date(log.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
