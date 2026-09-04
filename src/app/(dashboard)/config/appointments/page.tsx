"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Save,
  Clock,
  Video,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  Bell,
  AlertCircle,
  Users
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function AppointmentsConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    slot_duration_mins: "15",
    buffer_time_mins: "5",
    advance_booking_days: "60",
    same_day_cutoff_hours: "2",
    cancellation_window_hours: "4",
    allow_overbooking: "false",
    max_overbooking_per_slot: "1",
    teleconsult_enabled: "true",
    reminder_sms_hours: "24,2"
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/config/settings?category=appointments&map=true");
      const data = await res.json();
      if (data.success && data.data && Object.keys(data.data).length > 0) {
        setFormData((prev) => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error("Failed to load appointment settings:", err);
      toast("Failed to load appointment settings from server.", "error");
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
        body: JSON.stringify({ category: "appointments", settings: settingsPayload })
      });

      const data = await res.json();
      if (data.success) {
        toast("Appointment scheduling policies updated successfully!", "success");
      } else {
        toast(data.message || "Failed to update appointment settings.", "error");
      }
    } catch (err) {
      console.error("Error saving appointment settings:", err);
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              <CalendarCheck className="h-3.5 w-3.5 text-cyan-600" />
              OPD Scheduling Governance
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Outpatient (OPD) Appointment Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure clinician consultation slot intervals, buffer time, advance booking windows, patient cancellation cutoff rules, and WebRTC teleconsultations.
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
            className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-1.5"
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
            {/* Slot & Time Settings */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyan-600" />
                  Consultation Slot Intervals & Capacity
                </CardTitle>
                <CardDescription className="text-xs">
                  Determine standard appointment length, transition buffer between patients, and overbooking limits.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="slot_duration_mins" className="text-xs font-semibold">
                      Standard OPD Slot Duration *
                    </Label>
                    <Select
                      id="slot_duration_mins"
                      value={formData.slot_duration_mins}
                      onChange={(e) => setFormData({ ...formData, slot_duration_mins: e.target.value })}
                      className="h-9 text-xs font-mono"
                    >
                      <option value="10">10 Minutes (High Throughput / General OPD)</option>
                      <option value="15">15 Minutes (Standard Speciality Consultation)</option>
                      <option value="20">20 Minutes (Super Speciality / Oncology)</option>
                      <option value="30">30 Minutes (Comprehensive Evaluation / Psych)</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="buffer_time_mins" className="text-xs font-semibold">
                      Buffer Interval Between Slots
                    </Label>
                    <Select
                      id="buffer_time_mins"
                      value={formData.buffer_time_mins}
                      onChange={(e) => setFormData({ ...formData, buffer_time_mins: e.target.value })}
                      className="h-9 text-xs font-mono"
                    >
                      <option value="0">0 Minutes (No Gap)</option>
                      <option value="5">5 Minutes (Sanitization & Charting)</option>
                      <option value="10">10 Minutes (Relaxed Transition)</option>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="allow_overbooking" className="text-xs font-semibold">
                      Reception Overbooking Permissions
                    </Label>
                    <Select
                      id="allow_overbooking"
                      value={formData.allow_overbooking}
                      onChange={(e) => setFormData({ ...formData, allow_overbooking: e.target.value })}
                      className="h-9 text-xs"
                    >
                      <option value="false">Strictly Disallowed (Prevent Queue Overcrowding)</option>
                      <option value="true">Allowed with Emergency Override</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="max_overbooking_per_slot" className="text-xs font-semibold">
                      Max Emergency Overbooking per Slot
                    </Label>
                    <Input
                      id="max_overbooking_per_slot"
                      type="number"
                      min="0"
                      max="3"
                      value={formData.max_overbooking_per_slot}
                      onChange={(e) => setFormData({ ...formData, max_overbooking_per_slot: e.target.value })}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Windows & Cancellations */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Booking Windows & Patient Cancellation Policy
                </CardTitle>
                <CardDescription className="text-xs">
                  Advance booking limits and cancellation cutoff windows to minimize doctor no-show rates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="advance_booking_days" className="text-xs font-semibold">
                      Max Advance Booking (Days)
                    </Label>
                    <Input
                      id="advance_booking_days"
                      type="number"
                      min="7"
                      max="180"
                      value={formData.advance_booking_days}
                      onChange={(e) => setFormData({ ...formData, advance_booking_days: e.target.value })}
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="same_day_cutoff_hours" className="text-xs font-semibold">
                      Same-Day Cutoff (Hours Prior)
                    </Label>
                    <Input
                      id="same_day_cutoff_hours"
                      type="number"
                      min="1"
                      max="12"
                      value={formData.same_day_cutoff_hours}
                      onChange={(e) => setFormData({ ...formData, same_day_cutoff_hours: e.target.value })}
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cancellation_window_hours" className="text-xs font-semibold">
                      Free Cancellation (Hours Prior)
                    </Label>
                    <Input
                      id="cancellation_window_hours"
                      type="number"
                      min="1"
                      max="48"
                      value={formData.cancellation_window_hours}
                      onChange={(e) => setFormData({ ...formData, cancellation_window_hours: e.target.value })}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Telemedicine & Automated Notifications */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Video className="h-4 w-4 text-purple-600" />
                  Teleconsultation & Automated Reminders
                </CardTitle>
                <CardDescription className="text-xs">
                  Remote video consultation channels and automated reminder SMS timings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="teleconsult_enabled" className="text-xs font-semibold">
                      Integrated WebRTC Telemedicine
                    </Label>
                    <Select
                      id="teleconsult_enabled"
                      value={formData.teleconsult_enabled}
                      onChange={(e) => setFormData({ ...formData, teleconsult_enabled: e.target.value })}
                      className="h-9 text-xs"
                    >
                      <option value="true">Enabled (Online Video Room Generated on Booking)</option>
                      <option value="false">Disabled (In-Person OPD Only)</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reminder_sms_hours" className="text-xs font-semibold">
                      SMS Reminder Hours Prior
                    </Label>
                    <Input
                      id="reminder_sms_hours"
                      value={formData.reminder_sms_hours}
                      onChange={(e) => setFormData({ ...formData, reminder_sms_hours: e.target.value })}
                      className="h-9 text-xs font-mono"
                      placeholder="24,2 (Sends at 24h and 2h prior)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Policy Telemetry */}
          <div className="space-y-5">
            <Card className="border shadow-sm bg-gradient-to-br from-cyan-50/50 to-slate-50 dark:from-slate-900 dark:to-cyan-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <CalendarCheck className="h-4 w-4 text-cyan-600" />
                  Schedule Summary
                </CardTitle>
                <CardDescription className="text-xs">
                  Active rules applied to doctor timetables
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Slot Duration:</span>
                  <Badge className="bg-cyan-100 text-cyan-800 text-xs font-mono">
                    {formData.slot_duration_mins} Mins
                  </Badge>
                </div>
                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Turnaround Buffer:</span>
                  <Badge className="bg-slate-100 text-slate-800 text-xs font-mono">
                    {formData.buffer_time_mins} Mins
                  </Badge>
                </div>
                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Teleconsultation:</span>
                  <Badge className={formData.teleconsult_enabled === "true" ? "bg-emerald-100 text-emerald-800 text-xs" : "bg-slate-100 text-slate-800 text-xs"}>
                    {formData.teleconsult_enabled === "true" ? "Active" : "Disabled"}
                  </Badge>
                </div>

                <div className="p-3 rounded-md bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-[11px] text-cyan-800 dark:text-cyan-300 flex items-start gap-2 mt-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">NABH Patient Charter Compliant</span>
                    Guarantees minimum 15-minute clinician consultation windows and provides automated dual-channel confirmation SMS.
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
