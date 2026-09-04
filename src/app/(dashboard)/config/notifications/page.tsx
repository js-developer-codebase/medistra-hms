"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  MessageSquare,
  Mail,
  ShieldCheck,
  Zap,
  CheckCircle2,
  RefreshCw,
  Save,
  Server,
  Radio,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export default function NotificationSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSMS, setTestingSMS] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    smsProvider: "FAST2SMS",
    smsApiKey: "",
    smsSenderId: "MEDSTR",
    smsDltEntityId: "1101234567890",
    smsCostPerCredit: 0.2, // ₹0.20
    smsBalanceCredits: 4850,
    emailProvider: "SMTP",
    smtpHost: "smtp.medistra.in",
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: "notifications@medistra.in",
    smtpPass: "",
    emailFromName: "Medistra Super Speciality Hospital",
    emailFromAddress: "noreply@medistra.in",
    systemAlertSound: true,
    autoRetryFailed: true,
    maxRetryCount: 3,
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications/settings");
      const json = await res.json();
      if (json.success && json.data) {
        setSettings(json.data);
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load notification settings", variant: "destructive" });
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
      const res = await fetch("/api/notifications/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: "Settings Saved",
          description: "Gateway credentials and notification policies updated.",
        });
      } else {
        toast({ title: "Save Failed", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleTestPing = async (type: "SMS" | "EMAIL") => {
    try {
      if (type === "SMS") setTestingSMS(true);
      else setTestingEmail(true);

      const res = await fetch("/api/notifications/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: `${type} Gateway Ping Succeeded`,
          description: json.message,
        });
      } else {
        toast({ title: "Ping Failed", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Test Failed", description: err.message, variant: "destructive" });
    } finally {
      if (type === "SMS") setTestingSMS(false);
      else setTestingEmail(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Notification & Gateway Settings</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Configure carrier SMS gateways, TRAI DLT compliance IDs, SMTP credentials, and alert retry rules.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSettings} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: SMS Gateway Configuration */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                Telecom SMS Gateway (TRAI DLT Compliant)
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleTestPing("SMS")}
                disabled={testingSMS}
              >
                {testingSMS ? <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Zap className="w-3.5 h-3.5 mr-1" />}
                Send Test Ping
              </Button>
            </div>
            <CardDescription className="text-xs">
              Direct connection to approved SMS carrier infrastructure for transactional alerts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Provider</Label>
                <select
                  className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                  value={settings.smsProvider}
                  onChange={(e) => setSettings({ ...settings, smsProvider: e.target.value as any })}
                >
                  <option value="FAST2SMS">Fast2SMS (India)</option>
                  <option value="MSG91">MSG91 Enterprise</option>
                  <option value="TWILIO">Twilio Telecom</option>
                  <option value="CUSTOM">Custom HTTP Gateway</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">DLT Approved Sender ID (Header) *</Label>
                <Input
                  className="h-9 font-mono"
                  value={settings.smsSenderId}
                  onChange={(e) => setSettings({ ...settings, smsSenderId: e.target.value })}
                  placeholder="e.g. MEDSTR"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">TRAI Principal Entity ID *</Label>
                <Input
                  className="h-9 font-mono"
                  value={settings.smsDltEntityId}
                  onChange={(e) => setSettings({ ...settings, smsDltEntityId: e.target.value })}
                  placeholder="e.g. 1101234567890"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs">Gateway API Key / Token</Label>
                <Input
                  type="password"
                  className="h-9 font-mono"
                  value={settings.smsApiKey}
                  onChange={(e) => setSettings({ ...settings, smsApiKey: e.target.value })}
                  placeholder="Enter carrier API authorization secret key..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Cost Per SMS Credit (INR)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-xs font-semibold">₹</span>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-9 pl-7 font-mono"
                    value={settings.smsCostPerCredit}
                    onChange={(e) => setSettings({ ...settings, smsCostPerCredit: parseFloat(e.target.value) || 0.2 })}
                  />
                </div>
              </div>
            </div>

            {/* Credits Counter Card */}
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
              <div>
                <span className="font-semibold text-emerald-800 dark:text-emerald-200 block text-xs">
                  Active SMS Prepaid Balance
                </span>
                <span className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                  {settings.smsBalanceCredits} Credits remaining (~₹{(settings.smsBalanceCredits * settings.smsCostPerCredit).toFixed(2)})
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs border-emerald-300 text-emerald-800 dark:text-emerald-200"
                onClick={() => {
                  setSettings({ ...settings, smsBalanceCredits: settings.smsBalanceCredits + 1000 });
                  toast({ title: "Credits Added", description: "Simulated 1,000 credits added to gateway balance." });
                }}
              >
                Top-up +1,000 Credits
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Email SMTP Configuration */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Hospital SMTP Server Settings
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleTestPing("EMAIL")}
                disabled={testingEmail}
              >
                {testingEmail ? <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Zap className="w-3.5 h-3.5 mr-1" />}
                Send Test Ping
              </Button>
            </div>
            <CardDescription className="text-xs">
              Outbound mail transport settings for invoices, consultation receipts, and clinical reports.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs">SMTP Host Server *</Label>
                <Input
                  className="h-9 font-mono"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                  placeholder="e.g. smtp.medistra.in"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">SMTP Port *</Label>
                <Input
                  type="number"
                  className="h-9 font-mono"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value, 10) || 587 })}
                  placeholder="587"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Sender Display Name *</Label>
                <Input
                  className="h-9"
                  value={settings.emailFromName}
                  onChange={(e) => setSettings({ ...settings, emailFromName: e.target.value })}
                  placeholder="Medistra Super Speciality Hospital"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Sender Email Address *</Label>
                <Input
                  type="email"
                  className="h-9 font-mono"
                  value={settings.emailFromAddress}
                  onChange={(e) => setSettings({ ...settings, emailFromAddress: e.target.value })}
                  placeholder="noreply@medistra.in"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">SMTP Username / Account</Label>
                <Input
                  className="h-9 font-mono"
                  value={settings.smtpUser}
                  onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                  placeholder="alerts@medistra.in"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">SMTP Password</Label>
                <Input
                  type="password"
                  className="h-9 font-mono"
                  value={settings.smtpPass}
                  onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                  placeholder="••••••••••••"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Operational Policies */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              Automated Dispatch & Retry Policies
            </CardTitle>
            <CardDescription className="text-xs">
              Control audible station sirens and automated retry thresholds on network failures.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-muted/30 border rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-semibold block">Audible Siren on Code Red</span>
                  <span className="text-[11px] text-muted-foreground">Play tone on ER triage alerts</span>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded text-primary"
                  checked={settings.systemAlertSound}
                  onChange={(e) => setSettings({ ...settings, systemAlertSound: e.target.checked })}
                />
              </div>

              <div className="p-3 bg-muted/30 border rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-semibold block">Auto-Retry Failed SMS</span>
                  <span className="text-[11px] text-muted-foreground">Re-transmit on network drop</span>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded text-primary"
                  checked={settings.autoRetryFailed}
                  onChange={(e) => setSettings({ ...settings, autoRetryFailed: e.target.checked })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Max Automated Retries</Label>
                <Input
                  type="number"
                  className="h-9"
                  value={settings.maxRetryCount}
                  onChange={(e) => setSettings({ ...settings, maxRetryCount: parseInt(e.target.value, 10) || 3 })}
                  min={1}
                  max={5}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Footer */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" size="sm" disabled={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? "Saving Configuration..." : "Save Notification Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
