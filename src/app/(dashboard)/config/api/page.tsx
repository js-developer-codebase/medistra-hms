"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Code2,
  Save,
  Key,
  Globe,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  Terminal,
  Activity,
  Zap,
  Sliders
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function ApiConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    api_gateway_enabled: "true",
    global_rate_limit_per_min: "120",
    webhook_retry_count: "3",
    cors_allowed_origins: "https://medistra.in, https://portal.medistra.in",
    api_audit_level: "VERBOSE",
    api_key_expiry_days: "90"
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/config/settings?category=api&map=true");
      const data = await res.json();
      if (data.success && data.data && Object.keys(data.data).length > 0) {
        setFormData((prev) => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error("Failed to load API settings:", err);
      toast("Failed to load API settings from server.", "error");
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
        body: JSON.stringify({ category: "api", settings: settingsPayload })
      });

      const data = await res.json();
      if (data.success) {
        toast("REST API gateway and developer security settings updated successfully!", "success");
      } else {
        toast(data.message || "Failed to update API settings.", "error");
      }
    } catch (err) {
      console.error("Error saving API settings:", err);
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Code2 className="h-3.5 w-3.5 text-slate-600" />
              Developer Gateway & Edge Security
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            API Gateway & Webhook Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure REST API rate-limits, CORS origin whitelisting, webhook delivery retries, and cryptographic token expiration policies.
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
            className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5"
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
            {/* Gateway Security & Rate Limiting */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  API Gateway & Rate Throttling
                </CardTitle>
                <CardDescription className="text-xs">
                  Protection against brute force and distributed denial-of-service (DDoS) across clinical endpoints.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="api_gateway_enabled" className="text-xs font-semibold">
                      Public REST API Gateway
                    </Label>
                    <Select
                      id="api_gateway_enabled"
                      value={formData.api_gateway_enabled}
                      onChange={(e) => setFormData({ ...formData, api_gateway_enabled: e.target.value })}
                      className="h-9 text-xs"
                    >
                      <option value="true">Active (Accepting Authorized Traffic)</option>
                      <option value="false">Disabled (Maintenance Lockout)</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="global_rate_limit_per_min" className="text-xs font-semibold">
                      Client Rate Limit (Requests / Min) *
                    </Label>
                    <Input
                      id="global_rate_limit_per_min"
                      type="number"
                      min="30"
                      max="1000"
                      value={formData.global_rate_limit_per_min}
                      onChange={(e) => setFormData({ ...formData, global_rate_limit_per_min: e.target.value })}
                      required
                      className="h-9 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="webhook_retry_count" className="text-xs font-semibold">
                      Webhook Delivery Retries
                    </Label>
                    <Select
                      id="webhook_retry_count"
                      value={formData.webhook_retry_count}
                      onChange={(e) => setFormData({ ...formData, webhook_retry_count: e.target.value })}
                      className="h-9 text-xs font-mono"
                    >
                      <option value="1">1 Attempt (No Retries)</option>
                      <option value="3">3 Attempts with Exponential Backoff (Default)</option>
                      <option value="5">5 Attempts</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="api_key_expiry_days" className="text-xs font-semibold">
                      API Key Mandatory Rotation (Days)
                    </Label>
                    <Select
                      id="api_key_expiry_days"
                      value={formData.api_key_expiry_days}
                      onChange={(e) => setFormData({ ...formData, api_key_expiry_days: e.target.value })}
                      className="h-9 text-xs font-mono"
                    >
                      <option value="30">30 Days</option>
                      <option value="60">60 Days</option>
                      <option value="90">90 Days (Recommended)</option>
                      <option value="180">180 Days</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CORS & Forensics */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  CORS Allowed Origins & Forensic Audit
                </CardTitle>
                <CardDescription className="text-xs">
                  Whitelist trusted portal domains and set audit log verbosity for API transactions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="cors_allowed_origins" className="text-xs font-semibold">
                    Whitelisted CORS Domains (Comma-separated) *
                  </Label>
                  <Input
                    id="cors_allowed_origins"
                    value={formData.cors_allowed_origins}
                    onChange={(e) => setFormData({ ...formData, cors_allowed_origins: e.target.value })}
                    required
                    className="h-9 text-xs font-mono"
                    placeholder="https://medistra.in, https://portal.medistra.in"
                  />
                  <p className="text-[11px] text-slate-400">
                    Browsers will block Cross-Origin requests from domains not explicitly enumerated here.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="api_audit_level" className="text-xs font-semibold">
                    API Access Audit Logging Level
                  </Label>
                  <Select
                    id="api_audit_level"
                    value={formData.api_audit_level}
                    onChange={(e) => setFormData({ ...formData, api_audit_level: e.target.value })}
                    className="h-9 text-xs font-mono font-semibold"
                  >
                    <option value="VERBOSE">VERBOSE (Log all headers, status codes, IPs, and latency)</option>
                    <option value="SECURITY_ONLY">SECURITY ONLY (Log 4xx/5xx errors & auth failures)</option>
                    <option value="MINIMAL">MINIMAL (Count queries only)</option>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Security Posture */}
          <div className="space-y-5">
            <Card className="border shadow-sm bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Terminal className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                  Gateway Telemetry
                </CardTitle>
                <CardDescription className="text-xs">
                  Active policy parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Rate Ceiling:</span>
                  <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold">
                    {formData.global_rate_limit_per_min} req/min
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Webhook Retries:</span>
                  <Badge variant="outline" className="font-mono text-xs text-blue-600">
                    {formData.webhook_retry_count} attempts
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Audit Level:</span>
                  <Badge className="bg-emerald-100 text-emerald-800 text-xs font-mono">
                    {formData.api_audit_level}
                  </Badge>
                </div>

                <div className="p-3 rounded-md bg-slate-200/60 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-[11px] text-slate-800 dark:text-slate-200 flex items-start gap-2 mt-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Zero Trust Architecture</span>
                    All API calls are authenticated with rotating cryptographically signed JWT tokens and inspected by edge rate-limiters.
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
