"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Save,
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  ShieldAlert,
  FileCheck2,
  Thermometer,
  Droplet
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function ClinicalConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    diagnostic_coding: "ICD-10-CM",
    procedure_coding: "ICD-10-PCS",
    bp_systolic_high: "140",
    bp_systolic_low: "90",
    bp_diastolic_high: "90",
    bp_diastolic_low: "60",
    heart_rate_high: "100",
    heart_rate_low: "50",
    spo2_critical_low: "92",
    blood_glucose_high: "200",
    blood_glucose_low: "70",
    allergy_interaction_check: "STRICT_BLOCK",
    mandatory_clinician_signoff: "true"
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/config/settings?category=clinical&map=true");
      const data = await res.json();
      if (data.success && data.data && Object.keys(data.data).length > 0) {
        setFormData((prev) => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error("Failed to load clinical settings:", err);
      toast("Failed to load clinical settings from server.", "error");
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
        body: JSON.stringify({ category: "clinical", settings: settingsPayload })
      });

      const data = await res.json();
      if (data.success) {
        toast("Clinical governance and vital sign panic thresholds updated successfully!", "success");
      } else {
        toast(data.message || "Failed to update clinical settings.", "error");
      }
    } catch (err) {
      console.error("Error saving clinical settings:", err);
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              <Stethoscope className="h-3.5 w-3.5 text-rose-600" />
              Clinical Governance & Patient Safety
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Clinical Settings & Vital Alert Thresholds
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Define ICD-10 diagnostic classifications, vital sign alert boundaries (BP, Heart Rate, SpO2, Sugar), and drug-drug allergy contraindication checking.
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
            className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5"
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
            {/* Coding Standards & Decision Support */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-blue-600" />
                  Clinical Coding & Decision Support Rules
                </CardTitle>
                <CardDescription className="text-xs">
                  Standards applied during patient encounter documentation and prescription generation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="diagnostic_coding" className="text-xs font-semibold">
                      Diagnostic Nomenclature *
                    </Label>
                    <Select
                      id="diagnostic_coding"
                      value={formData.diagnostic_coding}
                      onChange={(e) => setFormData({ ...formData, diagnostic_coding: e.target.value })}
                      className="h-9 text-xs font-mono font-bold"
                    >
                      <option value="ICD-10-CM">ICD-10-CM (Clinical Modification — Default)</option>
                      <option value="ICD-11">ICD-11 (WHO Latest Standard)</option>
                      <option value="SNOMED-CT">SNOMED-CT (Comprehensive Medical Terminology)</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="procedure_coding" className="text-xs font-semibold">
                      Surgical / Procedure Nomenclature *
                    </Label>
                    <Select
                      id="procedure_coding"
                      value={formData.procedure_coding}
                      onChange={(e) => setFormData({ ...formData, procedure_coding: e.target.value })}
                      className="h-9 text-xs font-mono font-bold"
                    >
                      <option value="ICD-10-PCS">ICD-10-PCS (Inpatient Procedure Coding)</option>
                      <option value="CPT">CPT (Current Procedural Terminology)</option>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="allergy_interaction_check" className="text-xs font-semibold">
                      Drug-Allergy Interaction Policy *
                    </Label>
                    <Select
                      id="allergy_interaction_check"
                      value={formData.allergy_interaction_check}
                      onChange={(e) => setFormData({ ...formData, allergy_interaction_check: e.target.value })}
                      className="h-9 text-xs font-semibold text-rose-600"
                    >
                      <option value="STRICT_BLOCK">STRICT BLOCK (Hard stop, requires CMO override)</option>
                      <option value="WARNING_ONLY">WARNING ONLY (Clinician can dismiss with note)</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="mandatory_clinician_signoff" className="text-xs font-semibold">
                      Mandatory Clinician Digital Signature
                    </Label>
                    <Select
                      id="mandatory_clinician_signoff"
                      value={formData.mandatory_clinician_signoff}
                      onChange={(e) => setFormData({ ...formData, mandatory_clinician_signoff: e.target.value })}
                      className="h-9 text-xs"
                    >
                      <option value="true">Enforced (Discharge notes lock until signed)</option>
                      <option value="false">Optional (Draft status allowed)</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vital Signs Critical Thresholds */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-rose-600" />
                  Vital Signs Panic & Alert Boundaries
                </CardTitle>
                <CardDescription className="text-xs">
                  Automated visual alerts and nursing station audible warnings triggered when patient telemetry falls outside these safe physiological limits.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {/* Blood Pressure */}
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-rose-600" />
                    Blood Pressure Limits (mmHg)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="bp_systolic_high" className="text-[11px] text-slate-500">Systolic High</Label>
                      <Input
                        id="bp_systolic_high"
                        type="number"
                        value={formData.bp_systolic_high}
                        onChange={(e) => setFormData({ ...formData, bp_systolic_high: e.target.value })}
                        className="h-8 text-xs font-mono font-bold text-rose-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="bp_systolic_low" className="text-[11px] text-slate-500">Systolic Low</Label>
                      <Input
                        id="bp_systolic_low"
                        type="number"
                        value={formData.bp_systolic_low}
                        onChange={(e) => setFormData({ ...formData, bp_systolic_low: e.target.value })}
                        className="h-8 text-xs font-mono font-bold text-blue-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="bp_diastolic_high" className="text-[11px] text-slate-500">Diastolic High</Label>
                      <Input
                        id="bp_diastolic_high"
                        type="number"
                        value={formData.bp_diastolic_high}
                        onChange={(e) => setFormData({ ...formData, bp_diastolic_high: e.target.value })}
                        className="h-8 text-xs font-mono font-bold text-rose-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="bp_diastolic_low" className="text-[11px] text-slate-500">Diastolic Low</Label>
                      <Input
                        id="bp_diastolic_low"
                        type="number"
                        value={formData.bp_diastolic_low}
                        onChange={(e) => setFormData({ ...formData, bp_diastolic_low: e.target.value })}
                        className="h-8 text-xs font-mono font-bold text-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Heart Rate & SpO2 */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="heart_rate_high" className="text-xs font-semibold">
                        Tachycardia Cutoff (BPM)
                      </Label>
                      <Input
                        id="heart_rate_high"
                        type="number"
                        value={formData.heart_rate_high}
                        onChange={(e) => setFormData({ ...formData, heart_rate_high: e.target.value })}
                        className="h-9 text-xs font-mono font-bold text-rose-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="heart_rate_low" className="text-xs font-semibold">
                        Bradycardia Cutoff (BPM)
                      </Label>
                      <Input
                        id="heart_rate_low"
                        type="number"
                        value={formData.heart_rate_low}
                        onChange={(e) => setFormData({ ...formData, heart_rate_low: e.target.value })}
                        className="h-9 text-xs font-mono font-bold text-blue-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="spo2_critical_low" className="text-xs font-semibold text-rose-600">
                        Critical SpO2 Floor (%)
                      </Label>
                      <Input
                        id="spo2_critical_low"
                        type="number"
                        value={formData.spo2_critical_low}
                        onChange={(e) => setFormData({ ...formData, spo2_critical_low: e.target.value })}
                        className="h-9 text-xs font-mono font-bold text-rose-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Blood Glucose */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="blood_glucose_high" className="text-xs font-semibold">
                        Hyperglycemia Ceiling (mg/dL)
                      </Label>
                      <Input
                        id="blood_glucose_high"
                        type="number"
                        value={formData.blood_glucose_high}
                        onChange={(e) => setFormData({ ...formData, blood_glucose_high: e.target.value })}
                        className="h-9 text-xs font-mono font-bold text-rose-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="blood_glucose_low" className="text-xs font-semibold">
                        Hypoglycemia Floor (mg/dL)
                      </Label>
                      <Input
                        id="blood_glucose_low"
                        type="number"
                        value={formData.blood_glucose_low}
                        onChange={(e) => setFormData({ ...formData, blood_glucose_low: e.target.value })}
                        className="h-9 text-xs font-mono font-bold text-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Patient Safety Scorecard */}
          <div className="space-y-5">
            <Card className="border shadow-sm bg-gradient-to-br from-rose-50/50 to-slate-50 dark:from-slate-900 dark:to-rose-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-rose-600" />
                  Clinical Alert Summary
                </CardTitle>
                <CardDescription className="text-xs">
                  Panic flags broadcast to ward nursing stations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Systolic Range:</span>
                  <Badge variant="outline" className="font-mono text-xs font-bold text-rose-600">
                    {formData.bp_systolic_low} - {formData.bp_systolic_high} mmHg
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Heart Rate Range:</span>
                  <Badge variant="outline" className="font-mono text-xs font-bold text-rose-600">
                    {formData.heart_rate_low} - {formData.heart_rate_high} BPM
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Critical SpO2:</span>
                  <Badge className="bg-rose-100 text-rose-800 font-mono text-xs font-bold">
                    &lt; {formData.spo2_critical_low}% (Hypoxia)
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Blood Glucose:</span>
                  <Badge variant="outline" className="font-mono text-xs font-bold text-amber-600">
                    {formData.blood_glucose_low} - {formData.blood_glucose_high} mg/dL
                  </Badge>
                </div>

                <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-800 dark:text-rose-300 flex items-start gap-2 mt-2">
                  <CheckCircle2 className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">NABH COP (Care of Patients) Compliance</span>
                    Critical physiological bounds trigger instant visual telemetry alarms on bedside monitors and ward dashboards.
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
