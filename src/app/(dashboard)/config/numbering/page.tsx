"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Hash,
  Save,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  FileText,
  Eye,
  Sliders,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function NumberingConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    uhid_prefix: "MED-UHID-",
    uhid_digits: "6",
    ipd_prefix: "MED-IPD-",
    ipd_digits: "6",
    opd_prefix: "OPD-",
    opd_digits: "4",
    invoice_prefix: "INV-2026-",
    invoice_digits: "6",
    prescription_prefix: "RX-",
    prescription_digits: "6",
    lab_prefix: "LAB-",
    lab_digits: "6",
    po_prefix: "PO-2026-",
    po_digits: "5"
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/config/settings?category=numbering&map=true");
      const data = await res.json();
      if (data.success && data.data && Object.keys(data.data).length > 0) {
        setFormData((prev) => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error("Failed to load numbering settings:", err);
      toast("Failed to load numbering settings from server.", "error");
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
        body: JSON.stringify({ category: "numbering", settings: settingsPayload })
      });

      const data = await res.json();
      if (data.success) {
        toast("Auto-numbering sequences updated successfully!", "success");
      } else {
        toast(data.message || "Failed to update numbering sequences.", "error");
      }
    } catch (err) {
      console.error("Error saving numbering settings:", err);
      toast("Error saving settings to database.", "error");
    } finally {
      setSaving(false);
    }
  };

  const sampleFormat = (prefix: string, digits: string, sampleNum: number) => {
    const pad = parseInt(digits) || 6;
    return `${prefix}${String(sampleNum).padStart(pad, "0")}`;
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <Hash className="h-3.5 w-3.5 text-teal-600" />
              Identifier Architecture
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Auto-Numbering Sequences & Document Prefixes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Define unique alphanumeric series, zero-padded padding lengths, and fiscal year stamps for patients, admissions, and financial vouchers.
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
            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5"
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
            {/* Patient & Clinical Identifiers */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Hash className="h-4 w-4 text-teal-600" />
                  Patient & Clinical Case Sequences
                </CardTitle>
                <CardDescription className="text-xs">
                  Universal Health ID (UHID), Inpatient Admissions (IPD), and Daily OPD Queue Tokens.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {/* UHID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="uhid_prefix" className="text-xs font-semibold">
                      Patient Master UHID Prefix *
                    </Label>
                    <Input
                      id="uhid_prefix"
                      value={formData.uhid_prefix}
                      onChange={(e) => setFormData({ ...formData, uhid_prefix: e.target.value })}
                      required
                      className="h-9 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="uhid_digits" className="text-xs font-semibold">
                      Zero-Pad Digits
                    </Label>
                    <Input
                      id="uhid_digits"
                      type="number"
                      min="4"
                      max="10"
                      value={formData.uhid_digits}
                      onChange={(e) => setFormData({ ...formData, uhid_digits: e.target.value })}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* IPD */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ipd_prefix" className="text-xs font-semibold">
                      Inpatient Admission (IPD) Prefix *
                    </Label>
                    <Input
                      id="ipd_prefix"
                      value={formData.ipd_prefix}
                      onChange={(e) => setFormData({ ...formData, ipd_prefix: e.target.value })}
                      required
                      className="h-9 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ipd_digits" className="text-xs font-semibold">
                      Zero-Pad Digits
                    </Label>
                    <Input
                      id="ipd_digits"
                      type="number"
                      min="4"
                      max="10"
                      value={formData.ipd_digits}
                      onChange={(e) => setFormData({ ...formData, ipd_digits: e.target.value })}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* OPD */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="opd_prefix" className="text-xs font-semibold">
                      Outpatient (OPD) Daily Token Prefix *
                    </Label>
                    <Input
                      id="opd_prefix"
                      value={formData.opd_prefix}
                      onChange={(e) => setFormData({ ...formData, opd_prefix: e.target.value })}
                      required
                      className="h-9 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="opd_digits" className="text-xs font-semibold">
                      Zero-Pad Digits
                    </Label>
                    <Input
                      id="opd_digits"
                      type="number"
                      min="3"
                      max="8"
                      value={formData.opd_digits}
                      onChange={(e) => setFormData({ ...formData, opd_digits: e.target.value })}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial & Diagnostic Orders */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Financial & Diagnostic Order Sequences
                </CardTitle>
                <CardDescription className="text-xs">
                  Statutory Tax Invoices, Digital Prescriptions (RX), Lab Test Barcodes (LAB), and Purchase Orders (PO).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {/* Invoice */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="invoice_prefix" className="text-xs font-semibold">
                      Statutory GST Invoice Prefix *
                    </Label>
                    <Input
                      id="invoice_prefix"
                      value={formData.invoice_prefix}
                      onChange={(e) => setFormData({ ...formData, invoice_prefix: e.target.value })}
                      required
                      className="h-9 text-xs font-mono font-bold text-emerald-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="invoice_digits" className="text-xs font-semibold">
                      Zero-Pad Digits
                    </Label>
                    <Input
                      id="invoice_digits"
                      type="number"
                      min="4"
                      max="10"
                      value={formData.invoice_digits}
                      onChange={(e) => setFormData({ ...formData, invoice_digits: e.target.value })}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Prescription & Lab */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="prescription_prefix" className="text-xs font-semibold">
                      Prescription Prefix *
                    </Label>
                    <Input
                      id="prescription_prefix"
                      value={formData.prescription_prefix}
                      onChange={(e) => setFormData({ ...formData, prescription_prefix: e.target.value })}
                      required
                      className="h-9 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lab_prefix" className="text-xs font-semibold">
                      Laboratory Order Prefix *
                    </Label>
                    <Input
                      id="lab_prefix"
                      value={formData.lab_prefix}
                      onChange={(e) => setFormData({ ...formData, lab_prefix: e.target.value })}
                      required
                      className="h-9 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                {/* PO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="po_prefix" className="text-xs font-semibold">
                      Procurement Purchase Order Prefix *
                    </Label>
                    <Input
                      id="po_prefix"
                      value={formData.po_prefix}
                      onChange={(e) => setFormData({ ...formData, po_prefix: e.target.value })}
                      required
                      className="h-9 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="po_digits" className="text-xs font-semibold">
                      Zero-Pad Digits
                    </Label>
                    <Input
                      id="po_digits"
                      type="number"
                      min="3"
                      max="8"
                      value={formData.po_digits}
                      onChange={(e) => setFormData({ ...formData, po_digits: e.target.value })}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Live Sequences Preview */}
          <div className="space-y-5">
            <Card className="border shadow-sm bg-gradient-to-br from-teal-50/50 to-slate-50 dark:from-slate-900 dark:to-teal-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-teal-600" />
                  Live Identifier Previews
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time rendering of generated sequence IDs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Patient UHID</div>
                    <div className="text-[10px] text-slate-400">Master Life Record</div>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs font-bold text-teal-600">
                    {sampleFormat(formData.uhid_prefix, formData.uhid_digits, 1042)}
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Inpatient (IPD)</div>
                    <div className="text-[10px] text-slate-400">Admission Episode</div>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs font-bold text-blue-600">
                    {sampleFormat(formData.ipd_prefix, formData.ipd_digits, 512)}
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">OPD Queue Token</div>
                    <div className="text-[10px] text-slate-400">Clinic Daily Counter</div>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs font-bold text-amber-600">
                    {sampleFormat(formData.opd_prefix, formData.opd_digits, 24)}
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Statutory Tax Invoice</div>
                    <div className="text-[10px] text-slate-400">GST Official Bill</div>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs font-bold text-emerald-600">
                    {sampleFormat(formData.invoice_prefix, formData.invoice_digits, 8190)}
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Lab Barcode</div>
                    <div className="text-[10px] text-slate-400">Code 128 Specimen</div>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs font-bold text-purple-600">
                    {sampleFormat(formData.lab_prefix, formData.lab_digits, 304)}
                  </Badge>
                </div>

                <div className="p-3 rounded-md bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-800 dark:text-teal-300 flex items-start gap-2 mt-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Unique Collision Protection</span>
                    Database enforces atomic sequential increments to guarantee zero duplicate invoice numbers or UHIDs across branches.
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
