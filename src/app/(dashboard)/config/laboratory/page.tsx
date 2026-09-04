"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Save,
  Barcode,
  Clock,
  AlertOctagon,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  PhoneCall,
  Activity,
  Sliders
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function LaboratoryConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    panic_critical_notification: "IMMEDIATE_SMS_AND_CALL",
    barcode_standard: "Code 128",
    specimen_rejection_protocol: "STRICT",
    routine_tat_hours: "4",
    urgent_stat_tat_hours: "1",
    potassium_panic_low: "2.5",
    potassium_panic_high: "6.0",
    hemoglobin_panic_low: "7.0",
    platelet_panic_low: "40000",
    troponin_panic_high: "0.04"
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/config/settings?category=laboratory&map=true");
      const data = await res.json();
      if (data.success && data.data && Object.keys(data.data).length > 0) {
        setFormData((prev) => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error("Failed to load laboratory settings:", err);
      toast("Failed to load laboratory settings from server.", "error");
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
        body: JSON.stringify({ category: "laboratory", settings: settingsPayload })
      });

      const data = await res.json();
      if (data.success) {
        toast("Diagnostic Laboratory panic thresholds & TAT rules updated successfully!", "success");
      } else {
        toast(data.message || "Failed to update laboratory settings.", "error");
      }
    } catch (err) {
      console.error("Error saving laboratory settings:", err);
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <FlaskConical className="h-3.5 w-3.5 text-purple-600" />
              NABL Diagnostic Quality Standards
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Diagnostic Laboratory & Panic Value Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure life-threatening panic critical value boundaries, automated clinician alerting protocols, barcode standards, and turnaround times (TAT).
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
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5"
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
            {/* Laboratory Protocols & Barcodes */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Barcode className="h-4 w-4 text-purple-600" />
                  Specimen Handling & Turnaround Standards
                </CardTitle>
                <CardDescription className="text-xs">
                  Barcoding standards for vacuum specimen vials, sample rejection policies, and target turnaround times.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="barcode_standard" className="text-xs font-semibold">
                      Vial Barcode Standard *
                    </Label>
                    <Select
                      id="barcode_standard"
                      value={formData.barcode_standard}
                      onChange={(e) => setFormData({ ...formData, barcode_standard: e.target.value })}
                      className="h-9 text-xs font-mono"
                    >
                      <option value="Code 128">Code 128 (Linear Standard)</option>
                      <option value="DataMatrix">DataMatrix 2D (Microtainers)</option>
                      <option value="QR">QR Code (High Density)</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="routine_tat_hours" className="text-xs font-semibold">
                      Routine TAT Target (Hours)
                    </Label>
                    <Input
                      id="routine_tat_hours"
                      type="number"
                      min="1"
                      max="48"
                      value={formData.routine_tat_hours}
                      onChange={(e) => setFormData({ ...formData, routine_tat_hours: e.target.value })}
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="urgent_stat_tat_hours" className="text-xs font-semibold text-rose-600">
                      Emergency STAT TAT (Hours)
                    </Label>
                    <Input
                      id="urgent_stat_tat_hours"
                      type="number"
                      min="0.5"
                      max="4"
                      step="0.5"
                      value={formData.urgent_stat_tat_hours}
                      onChange={(e) => setFormData({ ...formData, urgent_stat_tat_hours: e.target.value })}
                      className="h-9 text-xs font-mono font-bold text-rose-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="panic_critical_notification" className="text-xs font-semibold">
                      Panic Alert Escalation Protocol *
                    </Label>
                    <Select
                      id="panic_critical_notification"
                      value={formData.panic_critical_notification}
                      onChange={(e) => setFormData({ ...formData, panic_critical_notification: e.target.value })}
                      className="h-9 text-xs font-semibold text-rose-600"
                    >
                      <option value="IMMEDIATE_SMS_AND_CALL">Immediate SMS + Phone Call to Consultant</option>
                      <option value="SMS_ONLY">SMS Broadcast to Ward Nursing Station</option>
                      <option value="IN_APP_URGENT">In-App Pop-up Only</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="specimen_rejection_protocol" className="text-xs font-semibold">
                      Specimen Rejection Policy
                    </Label>
                    <Select
                      id="specimen_rejection_protocol"
                      value={formData.specimen_rejection_protocol}
                      onChange={(e) => setFormData({ ...formData, specimen_rejection_protocol: e.target.value })}
                      className="h-9 text-xs"
                    >
                      <option value="STRICT">Strict (Auto-reject hemolyzed, clotted, or mislabeled)</option>
                      <option value="PATHOLOGIST_DISCRETION">Pathologist Discretion with Advisory Note</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Critical Panic Thresholds */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <AlertOctagon className="h-4 w-4 text-rose-600" />
                  NABL Panic Critical Value Thresholds
                </CardTitle>
                <CardDescription className="text-xs">
                  Extreme laboratory results requiring immediate statutory telephone communication to the treating physician within 15 minutes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {/* Potassium */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="potassium_panic_low" className="text-xs font-semibold text-rose-600">
                      Potassium (K+) Panic Floor (mmol/L)
                    </Label>
                    <Input
                      id="potassium_panic_low"
                      value={formData.potassium_panic_low}
                      onChange={(e) => setFormData({ ...formData, potassium_panic_low: e.target.value })}
                      className="h-9 text-xs font-mono font-bold text-rose-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="potassium_panic_high" className="text-xs font-semibold text-rose-600">
                      Potassium (K+) Panic Ceiling (mmol/L)
                    </Label>
                    <Input
                      id="potassium_panic_high"
                      value={formData.potassium_panic_high}
                      onChange={(e) => setFormData({ ...formData, potassium_panic_high: e.target.value })}
                      className="h-9 text-xs font-mono font-bold text-rose-600"
                    />
                  </div>
                </div>

                {/* Hemoglobin & Platelets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="hemoglobin_panic_low" className="text-xs font-semibold text-rose-600">
                      Hemoglobin Panic Low (g/dL)
                    </Label>
                    <Input
                      id="hemoglobin_panic_low"
                      value={formData.hemoglobin_panic_low}
                      onChange={(e) => setFormData({ ...formData, hemoglobin_panic_low: e.target.value })}
                      className="h-9 text-xs font-mono font-bold text-rose-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="platelet_panic_low" className="text-xs font-semibold text-rose-600">
                      Platelets Panic Floor (/mcL)
                    </Label>
                    <Input
                      id="platelet_panic_low"
                      value={formData.platelet_panic_low}
                      onChange={(e) => setFormData({ ...formData, platelet_panic_low: e.target.value })}
                      className="h-9 text-xs font-mono font-bold text-rose-600"
                    />
                  </div>
                </div>

                {/* Troponin */}
                <div className="space-y-1.5">
                  <Label htmlFor="troponin_panic_high" className="text-xs font-semibold text-rose-600">
                    Troponin I Critical Infarction Cutoff (ng/mL)
                  </Label>
                  <Input
                    id="troponin_panic_high"
                    value={formData.troponin_panic_high}
                    onChange={(e) => setFormData({ ...formData, troponin_panic_high: e.target.value })}
                    className="h-9 text-xs font-mono font-bold text-rose-600 max-w-xs"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Panic Protocol Summary */}
          <div className="space-y-5">
            <Card className="border shadow-sm bg-gradient-to-br from-purple-50/50 to-slate-50 dark:from-slate-900 dark:to-purple-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <PhoneCall className="h-4 w-4 text-purple-600" />
                  Statutory Panic Dispatch
                </CardTitle>
                <CardDescription className="text-xs">
                  Active alert dispatch matrix
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Potassium Bounds:</span>
                  <Badge variant="outline" className="font-mono text-xs font-bold text-rose-600">
                    &lt; {formData.potassium_panic_low} or &gt; {formData.potassium_panic_high}
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Severe Anemia:</span>
                  <Badge variant="outline" className="font-mono text-xs font-bold text-rose-600">
                    Hb &lt; {formData.hemoglobin_panic_low} g/dL
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Severe Thrombocytopenia:</span>
                  <Badge variant="outline" className="font-mono text-xs font-bold text-rose-600">
                    &lt; {parseInt(formData.platelet_panic_low).toLocaleString("en-IN")}/mcL
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Myocardial Infarction:</span>
                  <Badge variant="outline" className="font-mono text-xs font-bold text-rose-600">
                    Trop I &gt; {formData.troponin_panic_high} ng/mL
                  </Badge>
                </div>

                <div className="p-3 rounded-md bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-[11px] text-purple-800 dark:text-purple-300 flex items-start gap-2 mt-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">NABL 112 Standard Compliant</span>
                    All critical values trigger immediate automated telephonic escalation to attending physicians with audit log timestamps.
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
