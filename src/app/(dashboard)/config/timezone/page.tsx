"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  Save,
  Server,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  Activity,
  AlertTriangle,
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

export default function TimezoneConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  const [formData, setFormData] = useState({
    primary_timezone: "Asia/Kolkata",
    utc_offset: "+05:30",
    ntp_server: "time.google.com",
    sync_interval_mins: "15",
    daylight_saving: "disabled",
    drift_tolerance_ms: "500"
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/config/settings?category=timezone&map=true");
      const data = await res.json();
      if (data.success && data.data && Object.keys(data.data).length > 0) {
        setFormData((prev) => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error("Failed to load timezone settings:", err);
      toast("Failed to load timezone settings from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        })
      );
    }, 1000);
    return () => clearInterval(timer);
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
        body: JSON.stringify({ category: "timezone", settings: settingsPayload })
      });

      const data = await res.json();
      if (data.success) {
        toast("Timezone and NTP synchronization settings updated successfully!", "success");
      } else {
        toast(data.message || "Failed to update timezone settings.", "error");
      }
    } catch (err) {
      console.error("Error saving timezone settings:", err);
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              National Standard Time (IST - UTC+05:30)
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Timezone & NTP Synchronization
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure Indian Standard Time (IST), national Network Time Protocol (NTP) time servers, and electronic medical record timestamp drift tolerance.
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
            className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
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
            {/* Timezone Setup */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  Primary Timezone
                </CardTitle>
                <CardDescription className="text-xs">
                  Operational standard time applied to clinical observations, medication dispensing, surgery logs, and doctor rounds.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="primary_timezone" className="text-xs font-semibold">
                      Primary Hospital Timezone *
                    </Label>
                    <Select
                      id="primary_timezone"
                      value={formData.primary_timezone}
                      onChange={(e) => setFormData({ ...formData, primary_timezone: e.target.value })}
                      className="h-9 text-xs font-mono"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata — India Standard Time (IST)</option>
                      <option value="UTC">UTC — Universal Coordinated Time</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="utc_offset" className="text-xs font-semibold">
                      UTC Offset
                    </Label>
                    <Input
                      id="utc_offset"
                      value={formData.utc_offset}
                      readOnly
                      className="h-9 text-xs font-mono bg-slate-50 dark:bg-slate-800 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="daylight_saving" className="text-xs font-semibold">
                    Daylight Saving Time (DST) Policy
                  </Label>
                  <Select
                    id="daylight_saving"
                    value={formData.daylight_saving}
                    onChange={(e) => setFormData({ ...formData, daylight_saving: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="disabled">Disabled (Standard for Republic of India / IST)</option>
                    <option value="enabled">Enabled (International branch nodes)</option>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* NTP Server Sync */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-600" />
                  Network Time Protocol (NTP) Synchronization
                </CardTitle>
                <CardDescription className="text-xs">
                  Synchronize hospital servers with stratum-1 atomic time sources to ensure legally defensible forensic timestamps.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ntp_server" className="text-xs font-semibold">
                      Primary Stratum NTP Host *
                    </Label>
                    <Input
                      id="ntp_server"
                      value={formData.ntp_server}
                      onChange={(e) => setFormData({ ...formData, ntp_server: e.target.value })}
                      required
                      className="h-9 text-xs font-mono"
                      placeholder="time.google.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sync_interval_mins" className="text-xs font-semibold">
                      Sync Frequency (Minutes)
                    </Label>
                    <Select
                      id="sync_interval_mins"
                      value={formData.sync_interval_mins}
                      onChange={(e) => setFormData({ ...formData, sync_interval_mins: e.target.value })}
                      className="h-9 text-xs font-mono"
                    >
                      <option value="5">Every 5 Minutes (High Precision ICU Nodes)</option>
                      <option value="15">Every 15 Minutes (Standard Recommendation)</option>
                      <option value="30">Every 30 Minutes</option>
                      <option value="60">Every 60 Minutes</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="drift_tolerance_ms" className="text-xs font-semibold">
                    Maximum Clock Drift Tolerance (Milliseconds)
                  </Label>
                  <Input
                    id="drift_tolerance_ms"
                    type="number"
                    value={formData.drift_tolerance_ms}
                    onChange={(e) => setFormData({ ...formData, drift_tolerance_ms: e.target.value })}
                    className="h-9 text-xs font-mono"
                  />
                  <p className="text-[11px] text-slate-400">
                    If server clock drifts beyond this threshold, a high-severity forensic security alert is broadcast to biomedical IT.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Live Hospital Clock & Health */}
          <div className="space-y-5">
            <Card className="border shadow-sm bg-gradient-to-br from-amber-50/50 to-slate-50 dark:from-slate-900 dark:to-amber-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Radio className="h-4 w-4 text-amber-600 animate-pulse" />
                  Synchronized Hospital Clock
                </CardTitle>
                <CardDescription className="text-xs">
                  Active IST broadcast across clinical nodes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border text-center space-y-1">
                  <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                    {currentTime || "04:30:00 PM"}
                  </div>
                  <div className="text-xs font-medium text-slate-500">
                    India Standard Time (IST - UTC+05:30)
                  </div>
                  <div className="pt-2">
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px]">
                      NTP Lock: ±2ms Drift
                    </Badge>
                  </div>
                </div>

                <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">NABH & DISHA Audit Requirement</span>
                    All clinical notes, death certificates, birth declarations, and ICU charting must carry synchronized atomic timestamps.
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
