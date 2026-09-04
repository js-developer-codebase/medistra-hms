"use client";

import React, { useEffect, useState } from "react";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Users,
  Eye,
  FileText,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EmailGatewayPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Email Composer Form
  const [recipientMode, setRecipientMode] = useState<"PATIENT" | "STAFF" | "CUSTOM">("PATIENT");
  const [recipientId, setRecipientId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [priority, setPriority] = useState("NORMAL");

  // Email Inspector
  const [viewEmail, setViewEmail] = useState<any>(null);
  const [inspectOpen, setInspectOpen] = useState(false);

  const fetchEmailData = async () => {
    try {
      setLoading(true);
      const [emailRes, tplRes, patRes, userRes] = await Promise.all([
        fetch("/api/notifications/email"),
        fetch("/api/notifications/templates?type=EMAIL"),
        fetch("/api/patient"),
        fetch("/api/user"),
      ]);

      const emailData = await emailRes.json();
      const tplData = await tplRes.json();
      const patData = await patRes.json();
      const userData = await userRes.json();

      if (emailData.success) setStats(emailData.data);
      if (tplData.success) setTemplates(tplData.data);
      if (patData.success) setPatients(patData.data || []);
      if (userData.success) setUsers(userData.data || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to load email service data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailData();
  }, []);

  const handleSelectRecipient = (id: string) => {
    setRecipientId(id);
    if (recipientMode === "PATIENT") {
      const p = patients.find((pat) => pat._id === id);
      if (p) {
        setRecipientName(`${p.firstName || ""} ${p.lastName || ""}`.trim() || p.name || "Patient");
        setEmail(p.email || "");
      }
    } else if (recipientMode === "STAFF") {
      const u = users.find((usr) => usr._id === id);
      if (u) {
        setRecipientName(u.name || "Hospital Staff");
        setEmail(u.email || "");
      }
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const t = templates.find((tpl) => tpl._id === templateId);
    if (t) {
      setSubject(t.subject || t.name);
      let templatedText = t.content;
      if (recipientName) {
        templatedText = templatedText.replace(/{{patientName}}/g, recipientName);
      }
      templatedText = templatedText
        .replace(/{{doctorName}}/g, "Dr. Subhash Chandra")
        .replace(/{{department}}/g, "Cardiology")
        .replace(/{{appointmentDate}}/g, "05-Sep-2026")
        .replace(/{{appointmentTime}}/g, "11:30 AM")
        .replace(/{{consultationFee}}/g, "800")
        .replace(/{{invoiceNumber}}/g, "INV-2026-0849")
        .replace(/{{totalAmount}}/g, "1,450.00")
        .replace(/{{paidAmount}}/g, "1,450.00")
        .replace(/{{balanceDue}}/g, "0.00");
      setContent(templatedText);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !subject || !content) return;
    try {
      setSending(true);
      const res = await fetch("/api/notifications/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          recipientName: recipientName || "Subscriber",
          subject,
          content,
          recipientId: recipientId || undefined,
          recipientModel: recipientMode === "PATIENT" ? "Patient" : "User",
          templateId: selectedTemplateId || undefined,
          priority,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: "Email Dispatched",
          description: `Message queued and sent to ${email} via SMTP.`,
        });
        setSubject("");
        setContent("");
        setSelectedTemplateId("");
        fetchEmailData();
      } else {
        toast({ title: "Failed", description: data.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Email Dispatch & Broadcast Center</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Hospital SMTP communication console for patient appointment confirmations, invoices, and clinical notices.
              </p>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={fetchEmailData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* SMTP Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Emails Sent
            </CardTitle>
            <Mail className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {loading ? "..." : (stats?.totalEmail || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Today: <span className="font-semibold text-foreground">{stats?.todayEmail || 0} messages</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              SMTP Delivery Rate
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {loading ? "..." : `${stats?.deliveryRate || 100}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Delivered: {stats?.deliveredEmail || 0} | Bounced: {stats?.failedEmail || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              SMTP Server
            </CardTitle>
            <Server className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold text-foreground font-mono">
              {stats?.smtpHost || "smtp.medistra.in"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              TLS / Port 587 Secured
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Sender Identity
            </CardTitle>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold text-foreground truncate">
              {stats?.emailFromName || "Medistra Hospital"}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
              {stats?.emailFromAddress || "noreply@medistra.in"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Composer & Email Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Composer */}
        <div className="lg:col-span-5">
          <Card className="border shadow-sm sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                Compose Outbound Email
              </CardTitle>
              <CardDescription className="text-xs">
                Draft rich clinical emails with pre-built hospital templates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendEmail} className="space-y-4 text-xs">
                {/* Recipient Target Tabs */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Target Recipient</Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <Button
                      type="button"
                      variant={recipientMode === "PATIENT" ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-8 px-2"
                      onClick={() => setRecipientMode("PATIENT")}
                    >
                      Patient
                    </Button>
                    <Button
                      type="button"
                      variant={recipientMode === "STAFF" ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-8 px-2"
                      onClick={() => setRecipientMode("STAFF")}
                    >
                      Staff / Doctor
                    </Button>
                    <Button
                      type="button"
                      variant={recipientMode === "CUSTOM" ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-8 px-2"
                      onClick={() => setRecipientMode("CUSTOM")}
                    >
                      Custom
                    </Button>
                  </div>
                </div>

                {recipientMode !== "CUSTOM" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      Select {recipientMode === "PATIENT" ? "Patient" : "Staff Member"}
                    </Label>
                    <select
                      className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                      value={recipientId}
                      onChange={(e) => handleSelectRecipient(e.target.value)}
                    >
                      <option value="">-- Choose Directory Contact --</option>
                      {recipientMode === "PATIENT"
                        ? patients.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.firstName} {p.lastName} ({p.email || "No Email"})
                            </option>
                          ))
                        : users.map((u) => (
                            <option key={u._id} value={u._id}>
                              {u.name} ({u.email || u.role})
                            </option>
                          ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Recipient Name</Label>
                    <Input
                      placeholder="e.g. Smt. Sunita Mukherjee"
                      className="text-xs h-9"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email Address *</Label>
                    <Input
                      type="email"
                      placeholder="recipient@domain.com"
                      className="text-xs h-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Pre-set Template</Label>
                    <select
                      className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                      value={selectedTemplateId}
                      onChange={(e) => handleTemplateSelect(e.target.value)}
                    >
                      <option value="">-- Select Template --</option>
                      {templates.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name} ({t.category})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Priority</Label>
                    <select
                      className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">High Priority</option>
                      <option value="URGENT">Urgent / Critical</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Subject Line *</Label>
                  <Input
                    placeholder="e.g. Confirmed: Your Medical Consultation at Medistra"
                    className="text-xs h-9"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Email Body *</Label>
                  <Textarea
                    rows={5}
                    placeholder="Type message content..."
                    className="text-xs font-sans"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={sending || !email || !subject || !content}
                >
                  {sending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {sending ? "Transmitting via SMTP..." : "Send Outbound Email"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sent Emails Log */}
        <div className="lg:col-span-7">
          <Card className="border shadow-sm">
            <CardHeader className="py-3.5 px-6 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Sent Emails Register</CardTitle>
                <CardDescription className="text-xs">
                  Outbound SMTP transmission ledger with delivery statuses.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {stats?.logs?.length || 0} Recent Deliveries
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="py-16 text-center text-sm text-muted-foreground">Loading email register...</div>
              ) : !stats?.logs || stats.logs.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  No email dispatches recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 border-b">
                      <tr className="text-left font-medium text-muted-foreground">
                        <th className="py-2.5 px-4">Recipient</th>
                        <th className="py-2.5 px-4">Subject</th>
                        <th className="py-2.5 px-4">Priority</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4 text-right">Time</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {stats.logs.map((log: any) => (
                        <tr key={log._id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-foreground">
                              {log.recipientName || "Recipient"}
                            </div>
                            <div className="text-muted-foreground text-[11px]">
                              {log.recipientEmail || "-"}
                            </div>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-medium text-foreground truncate">
                              {log.subject || "No Subject"}
                            </div>
                            <div className="text-muted-foreground text-[11px] truncate">
                              {log.content}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant="outline"
                              className={
                                log.metadata?.priority === "URGENT"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : log.metadata?.priority === "HIGH"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {log.metadata?.priority || "NORMAL"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                log.status === "DELIVERED"
                                  ? "default"
                                  : log.status === "FAILED"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="text-[10px] uppercase"
                            >
                              {log.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right text-muted-foreground whitespace-nowrap">
                            {log.sentAt
                              ? new Date(log.sentAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "-"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => {
                                setViewEmail(log);
                                setInspectOpen(true);
                              }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Inspect Email Modal */}
      <Dialog open={inspectOpen} onOpenChange={setInspectOpen}>
        <DialogContent className="sm:max-w-[550px]">
          {viewEmail && (
            <div>
              <DialogHeader>
                <div className="flex items-center justify-between gap-2">
                  <DialogTitle className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    Email Inspection
                  </DialogTitle>
                  <Badge
                    variant={viewEmail.status === "DELIVERED" ? "default" : "destructive"}
                  >
                    {viewEmail.status}
                  </Badge>
                </div>
                <DialogDescription>
                  Dispatched via {viewEmail.metadata?.from || "Medistra SMTP"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 text-xs">
                <div className="p-3 bg-muted/40 rounded-lg space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">To:</span>
                    <span className="font-semibold text-foreground">
                      {viewEmail.recipientName} &lt;{viewEmail.recipientEmail}&gt;
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-semibold text-foreground">{viewEmail.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timestamp:</span>
                    <span>
                      {viewEmail.sentAt ? new Date(viewEmail.sentAt).toLocaleString() : "-"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground">Message Body</span>
                  <div className="p-3 bg-muted/20 border rounded whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed">
                    {viewEmail.content}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button size="sm" onClick={() => setInspectOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
