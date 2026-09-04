"use client";

import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  Send,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Phone,
  FileCode,
  Users,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

export default function SMSGatewayPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // SMS Form
  const [recipientMode, setRecipientMode] = useState<"PATIENT" | "CUSTOM">("PATIENT");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [phone, setPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [content, setContent] = useState("");

  const fetchSMSData = async () => {
    try {
      setLoading(true);
      const [smsRes, tplRes, patRes] = await Promise.all([
        fetch("/api/notifications/sms"),
        fetch("/api/notifications/templates?type=SMS"),
        fetch("/api/patient"),
      ]);

      const smsData = await smsRes.json();
      const tplData = await tplRes.json();
      const patData = await patRes.json();

      if (smsData.success) setStats(smsData.data);
      if (tplData.success) setTemplates(tplData.data);
      if (patData.success) setPatients(patData.data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to load SMS gateway data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSMSData();
  }, []);

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    const p = patients.find((pat) => pat._id === patientId);
    if (p) {
      setRecipientName(`${p.firstName || ""} ${p.lastName || ""}`.trim() || p.name || "Patient");
      setPhone(p.phone || "");
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const t = templates.find((tpl) => tpl._id === templateId);
    if (t) {
      let templatedText = t.content;
      if (recipientName) {
        templatedText = templatedText.replace(/{{patientName}}/g, recipientName);
      }
      templatedText = templatedText
        .replace(/{{doctorName}}/g, "Dr. Subhash Chandra")
        .replace(/{{department}}/g, "Cardiology")
        .replace(/{{appointmentDate}}/g, "05-Sep-2026")
        .replace(/{{appointmentTime}}/g, "11:30 AM")
        .replace(/{{tokenNumber}}/g, "C-22");
      setContent(templatedText);
    }
  };

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !content) return;
    try {
      setSending(true);
      const res = await fetch("/api/notifications/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          recipientName: recipientName || "Subscriber",
          content,
          recipientId: recipientMode === "PATIENT" ? selectedPatientId || undefined : undefined,
          templateId: selectedTemplateId || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: "SMS Dispatched Successfully",
          description: `Message delivered to ${phone} via MEDSTR carrier gateway.`,
        });
        setContent("");
        setSelectedTemplateId("");
        fetchSMSData();
      } else {
        toast({ title: "Dispatch Failed", description: data.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const charCount = content.length;
  const segments = Math.max(1, Math.ceil(charCount / 160));
  const estimatedCost = (segments * (stats?.costPerCreditINR || 0.2)).toFixed(2);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">SMS Gateway & Dispatch Desk</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                TRAI DLT compliant telecom dispatch center with real-time credit tracking in Indian Rupees.
              </p>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={fetchSMSData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Gateway Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Available Credits
            </CardTitle>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {loading ? "..." : (stats?.balanceCredits || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Worth: <span className="font-semibold text-foreground">₹{(stats?.balanceValueINR || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span> (@ ₹{stats?.costPerCreditINR || "0.20"}/SMS)
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Dispatched Today
            </CardTitle>
            <Send className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats?.todaySMS || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All Time: <span className="font-semibold text-foreground">{stats?.totalSMS || 0}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Carrier Delivery Rate
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {loading ? "..." : `${stats?.deliveryRate || 100}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Delivered: {stats?.deliveredSMS || 0} | Failed: {stats?.failedSMS || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Carrier Telemetry
            </CardTitle>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
              Header: <Badge variant="outline" className="font-mono">{stats?.senderId || "MEDSTR"}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
              DLT: {stats?.dltEntityId || "1101234567890"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Composer & Delivery Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive SMS Composer */}
        <div className="lg:col-span-5">
          <Card className="border shadow-sm sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                Compose & Dispatch SMS
              </CardTitle>
              <CardDescription className="text-xs">
                Draft messages with variable interpolation and 160-character segment validation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendSMS} className="space-y-4">
                {/* Recipient Mode */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Recipient Mode</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={recipientMode === "PATIENT" ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => setRecipientMode("PATIENT")}
                    >
                      <Users className="w-3.5 h-3.5 mr-1" /> Hospital Patient
                    </Button>
                    <Button
                      type="button"
                      variant={recipientMode === "CUSTOM" ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => setRecipientMode("CUSTOM")}
                    >
                      <Phone className="w-3.5 h-3.5 mr-1" /> Custom Phone
                    </Button>
                  </div>
                </div>

                {/* Patient Selector */}
                {recipientMode === "PATIENT" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Select Patient</Label>
                    <select
                      className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                      value={selectedPatientId}
                      onChange={(e) => handlePatientSelect(e.target.value)}
                    >
                      <option value="">-- Choose Registered Patient --</option>
                      {patients.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.firstName} {p.lastName} ({p.phone || "No Phone"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Recipient Name</Label>
                    <Input
                      placeholder="e.g. Amitabh Banerjee"
                      className="text-xs h-9"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Phone (+91) *</Label>
                    <Input
                      placeholder="+91 98300 00000"
                      className="text-xs h-9 font-mono"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* DLT Approved Template Selector */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs">DLT Approved SMS Template</Label>
                    <span className="text-[11px] text-muted-foreground">Optional</span>
                  </div>
                  <select
                    className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                    value={selectedTemplateId}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                  >
                    <option value="">-- Select Template to Pre-fill --</option>
                    {templates.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* SMS Message Body */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs">SMS Body *</Label>
                    <span
                      className={`text-[11px] font-mono ${
                        charCount > 160 ? "text-amber-600 font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      {charCount} chars | {segments} segment{segments > 1 ? "s" : ""}
                    </span>
                  </div>
                  <Textarea
                    rows={4}
                    placeholder="Type SMS text..."
                    className="text-xs font-sans"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span>Rate: ₹{stats?.costPerCreditINR || "0.20"} / segment</span>
                    <span className="font-semibold text-foreground">
                      Total Cost: ₹{estimatedCost}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={sending || !phone || !content}
                >
                  {sending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {sending ? "Transmitting to Carrier..." : "Dispatch SMS Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Outbound SMS Register */}
        <div className="lg:col-span-7">
          <Card className="border shadow-sm">
            <CardHeader className="py-3.5 px-6 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">SMS Outbound Register</CardTitle>
                <CardDescription className="text-xs">
                  Real-time carrier delivery receipt and segment billing.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {stats?.logs?.length || 0} Recent Dispatches
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="py-16 text-center text-sm text-muted-foreground">Loading SMS logs...</div>
              ) : !stats?.logs || stats.logs.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  No outbound SMS dispatches recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 border-b">
                      <tr className="text-left font-medium text-muted-foreground">
                        <th className="py-2.5 px-4">Recipient</th>
                        <th className="py-2.5 px-4">Message Preview</th>
                        <th className="py-2.5 px-4">Cost (₹)</th>
                        <th className="py-2.5 px-4">Carrier Status</th>
                        <th className="py-2.5 px-4 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {stats.logs.map((log: any) => (
                        <tr key={log._id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-foreground">
                              {log.recipientName || "Recipient"}
                            </div>
                            <div className="font-mono text-muted-foreground text-[11px]">
                              {log.recipientPhone || "-"}
                            </div>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="text-muted-foreground line-clamp-2">
                              {log.content}
                            </div>
                            {log.templateId && (
                              <div className="text-[10px] text-primary/80 mt-0.5">
                                Template: {log.templateId.name}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono font-medium">
                            ₹{(log.cost || 0.2).toFixed(2)}
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
    </div>
  );
}
