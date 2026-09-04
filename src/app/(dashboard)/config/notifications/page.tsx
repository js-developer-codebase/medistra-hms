"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BellRing,
  Save,
  MessageSquare,
  Mail,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  Server,
  Radio,
  Sliders
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function NotificationsConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    sms_gateway_provider: "NIC_CDAC_GOV",
    sms_sender_id: "MDSTRA",
    whatsapp_api_status: "CONNECTED",
    smtp_host: "smtp.medistra.in",
    smtp_port: "587",
    smtp_user: "notifications@medistra.in",
    smtp_encryption: "STARTTLS",
    notify_patient_appointment: "true",
    notify_critical_lab_doctor: "true",
    notify_discharge_ready: "true"
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/config/settings?category=notifications&map=true");
      const data = await res.json();
      if (data.success && data.data && Object.keys(data.data).length > 0) {
        setFormData((prev) => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error("Failed to load notification settings:", err);
      toast("Failed to load notification settings from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const settingsPayload = Object.entries(formData).map(([key, value]) => ({
        key,
        value: String(value)
      }));

      const res = await fetch("/api/config/settings/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "notifications", settings: settingsPayload })
      });

      const data = await res.json();
      if (data.success) {
        toast("Communication gateways and broadcast triggers updated successfully!", "success");
      } else {
        toast(data.message || "Failed to update notification settings.", "error");
      }
    } catch (err) {
      console.error("Error saving notification settings:", err);
      toast("Error saving settings to database.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/config">
              <Button variant="ghost" size="sm" className="h-7 text-xs px-2 gap-1 text-slate-500">
                <ArrowLeft className="h-3.5 w-3.5" />
                Config Hub
              </Button>
            </Link>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
              <BellRing className="h-3.5 w-3.5 text-orange-600" />
              Multi-Channel Dispatch Engine
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Notification Gateways & Automated Triggers
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure National Telecom SMS gateways, WhatsApp Business Cloud APIs, hospital SMTP relays, and critical event broadcast rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchSettings}
            disabled={loading || saving}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Reload
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-1.5"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving Changes..." : "Save Configuration"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Controls (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* SMS & WhatsApp Gateway Setup */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-orange-600" />
                  SMS & Instant Messaging Gateways
                </CardTitle>
                <CardDescription className="text-xs">
                  National Telecom (DLT Registered) SMS delivery and WhatsApp Business Cloud connectivity.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="sms_gateway_provider" className="text-xs font-semibold">
                      Telecom SMS Provider *
                    </Label>
                    <Select
                      id="sms_gateway_provider"
                      value={formData.sms_gateway_provider}
                      onChange={(e) => setFormData({ ...formData, sms_gateway_provider: e.target.value })}
                      className="h-9 text-xs"
                    >
                      <option value="NIC_CDAC_GOV">NIC / CDAC National Health SMS Gateway (Govt)</option>
                      <option value="AIRTEL_IQ">Airtel IQ Enterprise</option>
                      <option value="JIO_TELECOM">Reliance Jio DLT Gateway</option>
                      <option value="TWILIO">Twilio International</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sms_sender_id" className="text-xs font-semibold">
                      TRAI DLT Sender ID (6 Characters) *
                    </Label>
                    <Input
                      id="sms_sender_id"
                      maxLength={6}
                      value={formData.sms_sender_id}
                      onChange={(e) => setFormData({ ...formData, sms_sender_id: e.target.value.toUpperCase() })}
                      required
                      className="h-9 text-xs font-mono font-bold tracking-wider"
                      placeholder="MDSTRA"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="whatsapp_api_status" className="text-xs font-semibold">
                    WhatsApp Business Cloud API Status
                  </Label>
                  <Select
                    id="whatsapp_api_status"
                    value={formData.whatsapp_api_status}
                    onChange={(e) => setFormData({ ...formData, whatsapp_api_status: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="CONNECTED">Connected & Verified (Meta Business ID 10842910)</option>
                    <option value="DISCONNECTED">Disconnected (Disabled)</option>
                    <option value="SANDBOX">Sandbox Test Environment</option>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* SMTP Outbound Email Server */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Hospital SMTP Mail Relay Server
                </CardTitle>
                <CardDescription className="text-xs">
                  Dedicated secure email server for electronic lab test report delivery, discharge summaries, and tax invoices.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="smtp_host" className="text-xs font-semibold">
                      SMTP Hostname *
                    </Label>
                    <Input
                      id="smtp_host"
                      value={formData.smtp_host}
                      onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
                      required
                      className="h-9 text-xs font-mono"
                      placeholder="smtp.medistra.in"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="smtp_port" className="text-xs font-semibold">
                      Port & Encryption
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        id="smtp_port"
                        value={formData.smtp_port}
                        onChange={(e) => setFormData({ ...formData, smtp_port: e.target.value })}
                        className="h-9 text-xs font-mono"
                        placeholder="587"
                      />
                      <Select
                        value={formData.smtp_encryption}
                        onChange={(e) => setFormData({ ...formData, smtp_encryption: e.target.value })}
                        className="h-9 text-xs font-mono"
                      >
                        <option value="STARTTLS">STARTTLS</option>
                        <option value="SSL_TLS">SSL/TLS</option>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="smtp_user" className="text-xs font-semibold">
                    Sender Email Address *
                  </Label>
                  <Input
                    id="smtp_user"
                    type="email"
                    value={formData.smtp_user}
                    onChange={(e) => setFormData({ ...formData, smtp_user: e.target.value })}
                    required
                    className="h-9 text-xs"
                    placeholder="notifications@medistra.in"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Broadcast Triggers */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Radio className="h-4 w-4 text-emerald-600" />
                  Automated Event Broadcast Triggers
                </CardTitle>
                <CardDescription className="text-xs">
                  Toggle automated dispatches for key clinical milestones.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-slate-800">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Patient OPD Appointment Booking</div>
                    <div className="text-[11px] text-slate-400">Sends instant SMS + WhatsApp confirmation with token number and clinic map</div>
                  </div>
                  <Select
                    value={formData.notify_patient_appointment}
                    onChange={(e) => setFormData({ ...formData, notify_patient_appointment: e.target.value })}
                    className="h-8 text-xs w-28"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-slate-800">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Critical Laboratory Panic Alert</div>
                    <div className="text-[11px] text-slate-400">Emergency notification to attending physician phone when critical bounds exceeded</div>
                  </div>
                  <Select
                    value={formData.notify_critical_lab_doctor}
                    onChange={(e) => setFormData({ ...formData, notify_critical_lab_doctor: e.target.value })}
                    className="h-8 text-xs w-28 font-semibold text-rose-600"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-slate-800">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Discharge Clearance Notification</div>
                    <div className="text-[11px] text-slate-400">Notify family attendant when pharmacy, billing, and nursing clearance are signed</div>
                  </div>
                  <Select
                    value={formData.notify_discharge_ready}
                    onChange={(e) => setFormData({ ...formData, notify_discharge_ready: e.target.value })}
                    className="h-8 text-xs w-28"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Gateway Health */}
          <div className="space-y-5">
            <Card className="border shadow-sm bg-gradient-to-br from-orange-50/50 to-slate-50 dark:from-slate-900 dark:to-orange-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Radio className="h-4 w-4 text-orange-600 animate-pulse" />
                  Gateway Operational Telemetry
                </CardTitle>
                <CardDescription className="text-xs">
                  Active connection heartbeat
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>DLT Sender ID:</span>
                  <Badge className="bg-orange-100 text-orange-800 font-mono text-xs font-bold">
                    {formData.sms_sender_id}
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>WhatsApp Cloud:</span>
                  <Badge className={formData.whatsapp_api_status === "CONNECTED" ? "bg-emerald-100 text-emerald-800 text-xs" : "bg-slate-100 text-slate-800 text-xs"}>
                    {formData.whatsapp_api_status}
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>SMTP Relay:</span>
                  <Badge variant="outline" className="font-mono text-xs text-blue-600">
                    {formData.smtp_host}:{formData.smtp_port}
                  </Badge>
                </div>

                <div className="p-3 rounded-md bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-[11px] text-orange-800 dark:text-orange-300 flex items-start gap-2 mt-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">TRAI DLT Template Registered</span>
                    All transactional SMS messages follow mandatory Indian telecom header registration guidelines with 99.8% delivery rate.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
