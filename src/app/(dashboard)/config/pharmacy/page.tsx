"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Pill,
  Save,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Package,
  Calendar,
  Lock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function PharmacyConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    dispensing_mode: "FEFO",
    schedule_h_prescription_mandatory: "true",
    schedule_x_dual_signoff: "true",
    default_reorder_level: "50",
    low_stock_threshold: "20",
    auto_po_trigger: "true",
    expiry_warning_days: "90"
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/config/settings?category=pharmacy&map=true");
      const data = await res.json();
      if (data.success && data.data && Object.keys(data.data).length > 0) {
        setFormData((prev) => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error("Failed to load pharmacy settings:", err);
      toast("Failed to load pharmacy settings from server.", "error");
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
        body: JSON.stringify({ category: "pharmacy", settings: settingsPayload })
      });

      const data = await res.json();
      if (data.success) {
        toast("Pharmacy dispensing regulations & Schedule H/X rules updated successfully!", "success");
      } else {
        toast(data.message || "Failed to update pharmacy settings.", "error");
      }
    } catch (err) {
      console.error("Error saving pharmacy settings:", err);
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
              <Pill className="h-3.5 w-3.5 text-pink-600" />
              Drugs & Cosmetics Act Compliance
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Pharmacy & Scheduled Drug Regulations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enforce FEFO stock rotation, statutory Schedule H/H1 prescription mandates, Schedule X dual pharmacist sign-offs, and automated purchase requisitions.
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
            className="bg-pink-600 hover:bg-pink-700 text-white flex items-center gap-1.5"
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
            {/* Dispensing Policies & Statutory Controls */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-pink-600" />
                  Statutory Scheduled Drug Dispensing Regulations
                </CardTitle>
                <CardDescription className="text-xs">
                  Compliance with Indian Drugs and Cosmetics Act & NDPS regulations for controlled pharmaceuticals.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="dispensing_mode" className="text-xs font-semibold">
                      Inventory Dispensing Valuation *
                    </Label>
                    <Select
                      id="dispensing_mode"
                      value={formData.dispensing_mode}
                      onChange={(e) => setFormData({ ...formData, dispensing_mode: e.target.value })}
                      className="h-9 text-xs font-semibold text-pink-600"
                    >
                      <option value="FEFO">FEFO (First Expired, First Out — Regulatory Standard)</option>
                      <option value="FIFO">FIFO (First In, First Out)</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="schedule_h_prescription_mandatory" className="text-xs font-semibold">
                      Schedule H / H1 Prescription Validation *
                    </Label>
                    <Select
                      id="schedule_h_prescription_mandatory"
                      value={formData.schedule_h_prescription_mandatory}
                      onChange={(e) => setFormData({ ...formData, schedule_h_prescription_mandatory: e.target.value })}
                      className="h-9 text-xs"
                    >
                      <option value="true">Mandatory (Requires Registered Medical Practitioner Number)</option>
                      <option value="false">Warning Only (Emergency Counter Sale)</option>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="schedule_x_dual_signoff" className="text-xs font-semibold text-rose-600">
                      Schedule X (Narcotics) Dual Sign-off *
                    </Label>
                    <Select
                      id="schedule_x_dual_signoff"
                      value={formData.schedule_x_dual_signoff}
                      onChange={(e) => setFormData({ ...formData, schedule_x_dual_signoff: e.target.value })}
                      className="h-9 text-xs font-semibold text-rose-600"
                    >
                      <option value="true">Enforced (Dual Registered Pharmacist Authorization Required)</option>
                      <option value="false">Single Pharmacist Authorization</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="expiry_warning_days" className="text-xs font-semibold">
                      Near-Expiry Quarantine Threshold (Days)
                    </Label>
                    <Select
                      id="expiry_warning_days"
                      value={formData.expiry_warning_days}
                      onChange={(e) => setFormData({ ...formData, expiry_warning_days: e.target.value })}
                      className="h-9 text-xs font-mono"
                    >
                      <option value="30">30 Days</option>
                      <option value="60">60 Days</option>
                      <option value="90">90 Days (Hospital Recommended Buffer)</option>
                      <option value="180">180 Days (Long-Horizon Quarantine)</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Thresholds & Automation */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  Inventory Thresholds & Auto-Procurement
                </CardTitle>
                <CardDescription className="text-xs">
                  Automated reorder triggers to prevent stockouts of critical ICU medications and surgical consumables.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="default_reorder_level" className="text-xs font-semibold">
                      Safety Reorder Quantity (Packs)
                    </Label>
                    <Input
                      id="default_reorder_level"
                      type="number"
                      min="5"
                      max="1000"
                      value={formData.default_reorder_level}
                      onChange={(e) => setFormData({ ...formData, default_reorder_level: e.target.value })}
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="low_stock_threshold" className="text-xs font-semibold text-rose-600">
                      Low Stock Alarm Threshold (Packs)
                    </Label>
                    <Input
                      id="low_stock_threshold"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.low_stock_threshold}
                      onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                      className="h-9 text-xs font-mono font-bold text-rose-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="auto_po_trigger" className="text-xs font-semibold">
                      Auto-Generate Purchase Requisition
                    </Label>
                    <Select
                      id="auto_po_trigger"
                      value={formData.auto_po_trigger}
                      onChange={(e) => setFormData({ ...formData, auto_po_trigger: e.target.value })}
                      className="h-9 text-xs"
                    >
                      <option value="true">Enabled (Draft PO to Procurement Team)</option>
                      <option value="false">Disabled (Manual Requisition Only)</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Regulatory Checklist */}
          <div className="space-y-5">
            <Card className="border shadow-sm bg-gradient-to-br from-pink-50/50 to-slate-50 dark:from-slate-900 dark:to-pink-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-pink-600" />
                  Statutory Controls Active
                </CardTitle>
                <CardDescription className="text-xs">
                  Legal compliance status for state drug inspectorate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Valuation Method:</span>
                  <Badge className="bg-pink-100 text-pink-800 font-mono text-xs font-bold">
                    {formData.dispensing_mode}
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Schedule H / H1:</span>
                  <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                    {formData.schedule_h_prescription_mandatory === "true" ? "Mandatory Rx" : "Warning"}
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Schedule X Narcotics:</span>
                  <Badge className="bg-rose-100 text-rose-800 text-xs">
                    {formData.schedule_x_dual_signoff === "true" ? "Dual Sign-off" : "Single Sign-off"}
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Near-Expiry Alert:</span>
                  <Badge variant="outline" className="font-mono text-xs text-amber-600">
                    &lt; {formData.expiry_warning_days} Days
                  </Badge>
                </div>

                <div className="p-3 rounded-md bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 text-[11px] text-pink-800 dark:text-pink-300 flex items-start gap-2 mt-2">
                  <CheckCircle2 className="h-4 w-4 text-pink-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">State Pharmacy Council Audit Ready</span>
                    Maintains electronic narcotic register (Form 20B/21B) and prevents dispensing of expired batches.
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
