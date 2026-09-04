"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  MessageSquare,
  Mail,
  FileText,
  Sliders,
  History,
  Settings,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Radio,
  Zap,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NotificationsHubPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Quick dispatch dialogs
  const [quickSmsOpen, setQuickSmsOpen] = useState(false);
  const [quickEmailOpen, setQuickEmailOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [smsForm, setSmsForm] = useState({ phone: "", name: "", content: "" });
  const [emailForm, setEmailForm] = useState({ email: "", name: "", subject: "", content: "" });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications/stats");
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to load notification statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSendQuickSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsForm.phone || !smsForm.content) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/notifications/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: smsForm.phone,
          recipientName: smsForm.name || "Recipient",
          content: smsForm.content,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "SMS Dispatched", description: "Message queued and delivered to carrier." });
        setQuickSmsOpen(false);
        setSmsForm({ phone: "", name: "", content: "" });
        fetchStats();
      } else {
        toast({ title: "Dispatch Failed", description: data.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendQuickEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.email || !emailForm.subject || !emailForm.content) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/notifications/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailForm.email,
          recipientName: emailForm.name || "Recipient",
          subject: emailForm.subject,
          content: emailForm.content,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Email Sent", description: "Message queued and delivered via SMTP." });
        setQuickEmailOpen(false);
        setEmailForm({ email: "", name: "", subject: "", content: "" });
        fetchStats();
      } else {
        toast({ title: "Dispatch Failed", description: data.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTriggerEmergencyCode = async () => {
    try {
      setSubmitting(true);
      const res = await fetch("/api/notifications/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SYSTEM",
          subject: "CODE RED TRAUMA ALERT",
          content: "EMERGENCY: Immediate trauma resuscitation team dispatched to ER Bay 1.",
          recipientName: "Hospital Emergency Trauma Team",
          metadata: { priority: "CRITICAL", alertType: "CODE_RED" },
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Code Red Broadcasted",
          description: "Emergency siren & alerts triggered across clinical consoles.",
        });
        setEmergencyOpen(false);
        fetchStats();
      }
    } catch (err: any) {
      toast({ title: "Emergency Trigger Failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const modules = [
    {
      title: "Notification Directory",
      path: "/notifications/list",
      icon: Bell,
      desc: "Live multi-channel notification log with search, status filters, and message viewer.",
      badge: "Unified Stream",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    {
      title: "SMS Gateway & Dispatch",
      path: "/notifications/sms",
      icon: MessageSquare,
      desc: "Indian DLT compliant SMS gateway, credit balance in ₹, and instant phone messaging.",
      badge: "DLT Registered",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    },
    {
      title: "Email Dispatch Center",
      path: "/notifications/email",
      icon: Mail,
      desc: "Hospital SMTP email broadcaster with rich templates, priority headers, and delivery tracker.",
      badge: "SMTP Active",
      badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    },
    {
      title: "Notification Templates",
      path: "/notifications/templates",
      icon: FileText,
      desc: "Standardized clinical, billing, and OPD templates with dynamic variable interpolation.",
      badge: "7 Standard Pre-Sets",
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    },
    {
      title: "Notification Rules & Triggers",
      path: "/notifications/rules",
      icon: Sliders,
      desc: "Automated event triggers for OPD bookings, admissions, discharges, bills, and lab results.",
      badge: "Event-Driven",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    },
    {
      title: "Delivery History & Audit Trail",
      path: "/notifications/history",
      icon: History,
      desc: "Exhaustive delivery audit trail, failure root-cause analysis, retry actions, and CSV export.",
      badge: "Audit Ready",
      badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
    },
    {
      title: "Gateway & Provider Settings",
      path: "/config/notifications",
      icon: Settings,
      desc: "Configure SMS API tokens, SMTP credentials, DLT Entity IDs, and ping live gateways.",
      badge: "Gateway Config",
      badgeColor: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Bell className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Notification Operations & Dispatch Hub
              </h1>
              <p className="text-muted-foreground text-sm">
                Omnichannel SMS, Email, and clinical alert dispatch with carrier gateway monitoring.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickSmsOpen(true)}
            className="border-emerald-600/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Quick SMS
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickEmailOpen(true)}
            className="border-blue-600/30 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
          >
            <Mail className="w-4 h-4 mr-2" />
            Quick Email
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setEmergencyOpen(true)}
            className="shadow-sm"
          >
            <Radio className="w-4 h-4 mr-2 animate-pulse" />
            Code Red Alert
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Dispatched
            </CardTitle>
            <Send className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : (stats?.totalCount || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Today:{" "}
              <span className="font-semibold text-foreground">
                {stats?.todayCount || 0} messages
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Delivery Success Rate
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {loading ? "..." : `${stats?.deliveryRate || 100}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Delivered: {stats?.deliveredCount || 0} | Sent: {stats?.sentCount || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              SMS Gateway Balance
            </CardTitle>
            <CreditCard className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {loading ? "..." : `${(stats?.smsCredits || 0).toLocaleString()} Credits`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valued at:{" "}
              <span className="font-semibold text-foreground">
                ₹{(stats?.smsCreditValueINR || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed / Bounces
            </CardTitle>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats?.failedCount > 0 ? "text-rose-600" : "text-muted-foreground"}`}>
              {loading ? "..." : stats?.failedCount || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pending in queue: {stats?.pendingCount || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Channel Volume Strip */}
      <Card className="bg-gradient-to-r from-muted/50 via-muted/30 to-background border">
        <CardContent className="p-4 flex flex-wrap items-center justify-around gap-4 text-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">SMS Messages</p>
              <p className="text-lg font-semibold">{stats?.channelBreakdown?.SMS || 0}</p>
            </div>
          </div>

          <div className="h-8 w-px bg-border hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-lg">
              <Mail className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Emails Sent</p>
              <p className="text-lg font-semibold">{stats?.channelBreakdown?.EMAIL || 0}</p>
            </div>
          </div>

          <div className="h-8 w-px bg-border hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">System Alerts</p>
              <p className="text-lg font-semibold">{stats?.channelBreakdown?.SYSTEM || 0}</p>
            </div>
          </div>

          <div className="h-8 w-px bg-border hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded-lg">
              <Radio className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Push Notifications</p>
              <p className="text-lg font-semibold">{stats?.channelBreakdown?.PUSH || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submodule Navigation Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Notification Subsystems & Workstations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link key={m.path} href={m.path} className="group">
                <Card className="h-full hover:border-primary/50 transition-all duration-200 hover:shadow-md cursor-pointer border">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge className={m.badgeColor} variant="outline">
                        {m.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold pt-2 flex items-center justify-between">
                      {m.title}
                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {m.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Dispatched Activity */}
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Live Outbound Activity Stream</CardTitle>
            <CardDescription className="text-xs">
              Recent communications processed across SMS, SMTP, and internal queues.
            </CardDescription>
          </div>
          <Link href="/notifications/list">
            <Button variant="ghost" size="sm" className="text-xs">
              View All Logs <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading recent logs...</div>
          ) : !stats?.recentActivity || stats.recentActivity.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No recent notification logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left font-medium py-2.5">Channel</th>
                    <th className="text-left font-medium py-2.5">Recipient</th>
                    <th className="text-left font-medium py-2.5">Content Preview</th>
                    <th className="text-left font-medium py-2.5">Status</th>
                    <th className="text-right font-medium py-2.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.recentActivity.map((log: any) => (
                    <tr key={log._id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3">
                        <Badge
                          variant="outline"
                          className={
                            log.type === "SMS"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : log.type === "EMAIL"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : log.type === "SYSTEM"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }
                        >
                          {log.type}
                        </Badge>
                      </td>
                      <td className="py-3 font-medium">
                        <div>{log.recipientName || "Recipient"}</div>
                        <div className="text-xs text-muted-foreground">
                          {log.recipientPhone || log.recipientEmail || "-"}
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground max-w-md truncate">
                        {log.subject ? `[${log.subject}] ` : ""}
                        {log.content}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={
                            log.status === "DELIVERED"
                              ? "default"
                              : log.status === "FAILED"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-[11px]"
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right text-xs text-muted-foreground">
                        {log.sentAt ? new Date(log.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick SMS Dialog */}
      <Dialog open={quickSmsOpen} onOpenChange={setQuickSmsOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSendQuickSMS}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                Quick Outbound SMS
              </DialogTitle>
              <DialogDescription>
                Dispatch an immediate SMS via configured Indian DLT gateway (MEDSTR).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sms-phone">Mobile Number (+91) *</Label>
                <Input
                  id="sms-phone"
                  placeholder="+91 98300 00000"
                  value={smsForm.phone}
                  onChange={(e) => setSmsForm({ ...smsForm, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sms-name">Recipient Name (Optional)</Label>
                <Input
                  id="sms-name"
                  placeholder="Patient / Clinician name"
                  value={smsForm.name}
                  onChange={(e) => setSmsForm({ ...smsForm, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="sms-content">Message Content *</Label>
                  <span className="text-xs text-muted-foreground">
                    {smsForm.content.length} chars | {Math.max(1, Math.ceil((smsForm.content.length || 1) / 160))} SMS
                  </span>
                </div>
                <Textarea
                  id="sms-content"
                  rows={4}
                  placeholder="Enter message text... (standard 160 characters per SMS credit)"
                  value={smsForm.content}
                  onChange={(e) => setSmsForm({ ...smsForm, content: e.target.value })}
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Estimated cost: ₹{((Math.max(1, Math.ceil((smsForm.content.length || 1) / 160))) * 0.2).toFixed(2)} (₹0.20/credit)
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setQuickSmsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Dispatch SMS"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Email Dialog */}
      <Dialog open={quickEmailOpen} onOpenChange={setQuickEmailOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <form onSubmit={handleSendQuickEmail}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Quick Outbound Email
              </DialogTitle>
              <DialogDescription>
                Send an email alert via hospital SMTP server (smtp.medistra.in).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="email-to">Email Address *</Label>
                  <Input
                    id="email-to"
                    type="email"
                    placeholder="patient@gmail.com"
                    value={emailForm.email}
                    onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-name">Recipient Name</Label>
                  <Input
                    id="email-name"
                    placeholder="Full Name"
                    value={emailForm.name}
                    onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-subject">Subject *</Label>
                <Input
                  id="email-subject"
                  placeholder="Medical Consultation / Report Notice"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-content">Body Content *</Label>
                <Textarea
                  id="email-content"
                  rows={5}
                  placeholder="Type message body..."
                  value={emailForm.content}
                  onChange={(e) => setEmailForm({ ...emailForm, content: e.target.value })}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setQuickEmailOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Dispatch Email"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Emergency Code Red Dialog */}
      <Dialog open={emergencyOpen} onOpenChange={setEmergencyOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <Radio className="w-5 h-5 animate-pulse" />
              Trigger Hospital Code Red Alert
            </DialogTitle>
            <DialogDescription>
              This will immediately broadcast an audible emergency trauma notification across all clinician dashboards and mobile stations.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-sm space-y-2">
            <p className="font-semibold">Trauma Protocol Details:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Target: ER Trauma Team, On-Duty Anesthetist, Surgical Registrar</li>
              <li>Bay Location: Emergency Bay 1 Resuscitation</li>
              <li>Priority: Critical / Immediate Response</li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEmergencyOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={submitting}
              onClick={handleTriggerEmergencyCode}
            >
              {submitting ? "Broadcasting..." : "Confirm & Broadcast Alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
