"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe2,
  Save,
  Calendar,
  Clock,
  CheckCircle2,
  Languages,
  ArrowLeft,
  RefreshCw,
  Hash,
  Eye
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function LocalizationConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    language: "en-IN",
    secondary_language: "hi-IN",
    timezone: "Asia/Kolkata",
    date_format: "DD/MM/YYYY",
    time_format: "12h",
    week_start: "Monday",
    number_format: "en-IN"
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/config/settings?category=localization&map=true");
      const data = await res.json();
      if (data.success && data.data && Object.keys(data.data).length > 0) {
        setFormData((prev) => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error("Failed to load localization settings:", err);
      toast("Failed to load localization settings from server.", "error");
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
        body: JSON.stringify({ category: "localization", settings: settingsPayload })
      });

      const data = await res.json();
      if (data.success) {
        toast("Regional localization preferences updated successfully!", "success");
      } else {
        toast(data.message || "Failed to save localization settings.", "error");
      }
    } catch (err) {
      console.error("Error saving localization:", err);
      toast("Error saving settings to database.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Preview helper
  const now = new Date();
  const getFormattedDate = () => {
    const d = String(now.getDate()).padStart(2, "0");
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const y = now.getFullYear();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (formData.date_format === "DD/MM/YYYY") return `${d}/${m}/${y}`;
    if (formData.date_format === "DD-MMM-YYYY") return `${d}-${months[now.getMonth()]}-${y}`;
    if (formData.date_format === "YYYY-MM-DD") return `${y}-${m}-${d}`;
    if (formData.date_format === "MM/DD/YYYY") return `${m}/${d}/${y}`;
    return `${d}/${m}/${y}`;
  };

  const getFormattedTime = () => {
    return formData.time_format === "12h" ? "04:30 PM" : "16:30";
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Globe2 className="h-3.5 w-3.5 text-indigo-600" />
              Regional & Language Standards
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Localization & Regional Preferences
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure system language, secondary regional dialects, Indian calendar formats (DD/MM/YYYY), and 12-hour/24-hour clocks.
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
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
            {/* Language & Regional Settings */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Languages className="h-4 w-4 text-indigo-600" />
                  Language & Clinical Interface Dialects
                </CardTitle>
                <CardDescription className="text-xs">
                  Primary user interface language and secondary bilingual display for patient portals and SMS notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="language" className="text-xs font-semibold">
                      Primary Interface Language *
                    </Label>
                    <Select
                      id="language"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="h-9 text-xs"
                    >
                      <option value="en-IN">English (India) — en-IN</option>
                      <option value="en-GB">English (UK) — en-GB</option>
                      <option value="en-US">English (US) — en-US</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="secondary_language" className="text-xs font-semibold">
                      Secondary Regional Language (Bilingual SMS & Kiosk)
                    </Label>
                    <Select
                      id="secondary_language"
                      value={formData.secondary_language}
                      onChange={(e) => setFormData({ ...formData, secondary_language: e.target.value })}
                      className="h-9 text-xs"
                    >
                      <option value="hi-IN">Hindi (हिन्दी) — hi-IN</option>
                      <option value="bn-IN">Bengali (বাংলা) — bn-IN</option>
                      <option value="ta-IN">Tamil (தமிழ்) — ta-IN</option>
                      <option value="te-IN">Telugu (తెలుగు) — te-IN</option>
                      <option value="mr-IN">Marathi (मराठी) — mr-IN</option>
                      <option value="gu-IN">Gujarati (ગુજરાતી) — gu-IN</option>
                      <option value="pa-IN">Punjabi (ਪੰਜਾਬੀ) — pa-IN</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="number_format" className="text-xs font-semibold">
                    Numeric Grouping Standard
                  </Label>
                  <Select
                    id="number_format"
                    value={formData.number_format}
                    onChange={(e) => setFormData({ ...formData, number_format: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="en-IN">Indian Numeral System (Lakhs & Crores — ₹ 1,00,000.00)</option>
                    <option value="en-US">International Standard (Millions & Billions — 100,000.00)</option>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Date & Time Formatting */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Date, Time & Calendar Conventions
                </CardTitle>
                <CardDescription className="text-xs">
                  Standard timestamp conventions used across medical records, nursing charts, lab test stamps, and bill prints.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="date_format" className="text-xs font-semibold">
                      Hospital Standard Date Format *
                    </Label>
                    <Select
                      id="date_format"
                      value={formData.date_format}
                      onChange={(e) => setFormData({ ...formData, date_format: e.target.value })}
                      className="h-9 text-xs font-mono"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 04/09/2026) — Indian Statutory</option>
                      <option value="DD-MMM-YYYY">DD-MMM-YYYY (e.g. 04-Sep-2026) — Formal Medical</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-09-04) — ISO 8601</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/04/2026) — US Format</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="time_format" className="text-xs font-semibold">
                      Clinical Time Format *
                    </Label>
                    <Select
                      id="time_format"
                      value={formData.time_format}
                      onChange={(e) => setFormData({ ...formData, time_format: e.target.value })}
                      className="h-9 text-xs font-mono"
                    >
                      <option value="12h">12-Hour Clock (04:30 PM) — OPD Consultations</option>
                      <option value="24h">24-Hour Military Clock (16:30) — ICU & OT Records</option>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="week_start" className="text-xs font-semibold">
                      Hospital Roster Week Start
                    </Label>
                    <Select
                      id="week_start"
                      value={formData.week_start}
                      onChange={(e) => setFormData({ ...formData, week_start: e.target.value })}
                      className="h-9 text-xs"
                    >
                      <option value="Monday">Monday (Standard Indian Work Week)</option>
                      <option value="Sunday">Sunday</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="timezone" className="text-xs font-semibold">
                      Associated Timezone
                    </Label>
                    <Select
                      id="timezone"
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="h-9 text-xs font-mono"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Dynamic Format Preview */}
          <div className="space-y-5">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-indigo-600" />
                  Live Rendering Preview
                </CardTitle>
                <CardDescription className="text-xs">
                  How dates, times, and regional scripts appear in workstations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Date Stamp:</span>
                    <Badge variant="outline" className="font-mono text-xs font-bold text-indigo-600">
                      {getFormattedDate()}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Time Stamp:</span>
                    <Badge variant="outline" className="font-mono text-xs font-bold text-blue-600">
                      {getFormattedTime()}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Full Audit Timestamp:</span>
                    <span className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                      {getFormattedDate()} {getFormattedTime()} IST
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">High-Value Amount:</span>
                    <span className="font-mono text-xs font-bold text-emerald-600">
                      ₹ 12,50,000.00
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-800 dark:text-indigo-300 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Indian Standards Active</span>
                    Enforces DD/MM/YYYY compliance across patient chart printouts and NABH clinical governance documentation.
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
