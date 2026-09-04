"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ReceiptText,
  Save,
  Coins,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  Percent,
  CreditCard,
  Building,
  ShieldCheck,
  Sliders
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function BillingConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    default_currency: "INR",
    currency_symbol: "₹",
    gst_medicine_rate: "12",
    gst_diagnostic_rate: "0",
    gst_consultation_rate: "0",
    gst_ward_high_rate: "5",
    gst_ward_exemption_cutoff: "5000",
    payment_modes: "CASH,UPI,CREDIT_DEBIT_CARD,NETBANKING,TPA_INSURANCE,NEFT_RTGS",
    credit_period_days: "30",
    grace_period_days: "7",
    invoice_roundoff: "true"
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/config/settings?category=billing&map=true");
      const data = await res.json();
      if (data.success && data.data && Object.keys(data.data).length > 0) {
        setFormData((prev) => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error("Failed to load billing settings:", err);
      toast("Failed to load billing settings from server.", "error");
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
        body: JSON.stringify({ category: "billing", settings: settingsPayload })
      });

      const data = await res.json();
      if (data.success) {
        toast("Statutory Indian GST and hospital billing settings updated successfully!", "success");
      } else {
        toast(data.message || "Failed to update billing settings.", "error");
      }
    } catch (err) {
      console.error("Error saving billing settings:", err);
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
              <ReceiptText className="h-3.5 w-3.5 text-green-600" />
              Statutory GST & Tariff Framework
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Hospital Billing & Statutory GST Configuration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure Indian Goods and Services Tax (GST) slabs, room rent tax rules, accepted payment gateways, and corporate credit terms strictly in Indian Rupees (₹).
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
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5"
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
            {/* Statutory Indian GST Slabs */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Percent className="h-4 w-4 text-green-600" />
                  Statutory Indian GST Slabs & HSN Categories
                </CardTitle>
                <CardDescription className="text-xs">
                  Statutory GST taxation rates applied across pharmaceuticals, inpatient rooms, diagnostic tests, and consultations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="gst_medicine_rate" className="text-xs font-semibold">
                      Pharmacy Medicines GST Rate (%)
                    </Label>
                    <Select
                      id="gst_medicine_rate"
                      value={formData.gst_medicine_rate}
                      onChange={(e) => setFormData({ ...formData, gst_medicine_rate: e.target.value })}
                      className="h-9 text-xs font-mono font-bold"
                    >
                      <option value="5">5% (Life-saving Drugs & Vaccines)</option>
                      <option value="12">12% (Standard Pharmaceuticals — Default)</option>
                      <option value="18">18% (Speciality Consumables & Reagents)</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="gst_consultation_rate" className="text-xs font-semibold">
                      Doctor Consultation GST Rate (%)
                    </Label>
                    <Select
                      id="gst_consultation_rate"
                      value={formData.gst_consultation_rate}
                      onChange={(e) => setFormData({ ...formData, gst_consultation_rate: e.target.value })}
                      className="h-9 text-xs font-mono"
                    >
                      <option value="0">0% (Statutorily Exempt — Healthcare Services)</option>
                      <option value="18">18% (Cosmetic / Non-Medical Procedures)</option>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="gst_diagnostic_rate" className="text-xs font-semibold">
                      Pathology & Radiology GST Rate (%)
                    </Label>
                    <Select
                      id="gst_diagnostic_rate"
                      value={formData.gst_diagnostic_rate}
                      onChange={(e) => setFormData({ ...formData, gst_diagnostic_rate: e.target.value })}
                      className="h-9 text-xs font-mono"
                    >
                      <option value="0">0% (Statutorily Exempt Diagnostic Investigation)</option>
                      <option value="12">12% (External B2B Reference Labs)</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="gst_ward_high_rate" className="text-xs font-semibold">
                      Inpatient Deluxe Room GST Rate (%)
                    </Label>
                    <Select
                      id="gst_ward_high_rate"
                      value={formData.gst_ward_high_rate}
                      onChange={(e) => setFormData({ ...formData, gst_ward_high_rate: e.target.value })}
                      className="h-9 text-xs font-mono"
                    >
                      <option value="5">5% (Without Input Tax Credit — Statutory)</option>
                      <option value="12">12% (With ITC)</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gst_ward_exemption_cutoff" className="text-xs font-semibold">
                    Room Rent GST Exemption Cutoff (₹ Per Day)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                    <Input
                      id="gst_ward_exemption_cutoff"
                      type="number"
                      value={formData.gst_ward_exemption_cutoff}
                      onChange={(e) => setFormData({ ...formData, gst_ward_exemption_cutoff: e.target.value })}
                      className="h-9 text-xs font-mono font-bold pl-7"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    As per Indian GST Council notification, non-ICU room tariffs exceeding ₹5,000/day attract 5% GST without ITC. ICU beds remain 0% exempt.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Modes & Settlement Terms */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  Payment Gateways & Credit Terms
                </CardTitle>
                <CardDescription className="text-xs">
                  Accepted settlement mechanisms, corporate insurance credit terms, and cash round-off rules in Indian Rupees (₹).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="payment_modes" className="text-xs font-semibold">
                    Supported Payment Modes (Comma-separated)
                  </Label>
                  <Input
                    id="payment_modes"
                    value={formData.payment_modes}
                    onChange={(e) => setFormData({ ...formData, payment_modes: e.target.value })}
                    className="h-9 text-xs font-mono font-medium"
                    placeholder="CASH,UPI,CREDIT_DEBIT_CARD,NETBANKING,TPA_INSURANCE,NEFT_RTGS"
                  />
                  <div className="flex flex-wrap gap-1 pt-1">
                    {["CASH", "UPI (PhonePe/GPay)", "Cards", "NetBanking", "TPA Insurance", "NEFT/RTGS"].map((m) => (
                      <Badge key={m} variant="secondary" className="text-[10px]">
                        {m}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="credit_period_days" className="text-xs font-semibold">
                      TPA Settlement Period (Days)
                    </Label>
                    <Input
                      id="credit_period_days"
                      type="number"
                      value={formData.credit_period_days}
                      onChange={(e) => setFormData({ ...formData, credit_period_days: e.target.value })}
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="grace_period_days" className="text-xs font-semibold">
                      Late Payment Grace (Days)
                    </Label>
                    <Input
                      id="grace_period_days"
                      type="number"
                      value={formData.grace_period_days}
                      onChange={(e) => setFormData({ ...formData, grace_period_days: e.target.value })}
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="invoice_roundoff" className="text-xs font-semibold">
                      Round Off to Nearest Rupee (₹)
                    </Label>
                    <Select
                      id="invoice_roundoff"
                      value={formData.invoice_roundoff}
                      onChange={(e) => setFormData({ ...formData, invoice_roundoff: e.target.value })}
                      className="h-9 text-xs font-medium"
                    >
                      <option value="true">Enabled (₹ 500.60 ➔ ₹ 501)</option>
                      <option value="false">Disabled (Exact Paise)</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: GST Tax Matrix Card */}
          <div className="space-y-5">
            <Card className="border shadow-sm bg-gradient-to-br from-green-50/50 to-slate-50 dark:from-slate-900 dark:to-green-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-green-600" />
                  Hospital GST Rate Matrix
                </CardTitle>
                <CardDescription className="text-xs">
                  Active tax rules applied on final invoices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Consultations (OPD):</span>
                  <Badge className="bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                    0% (Exempt)
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Lab & Imaging:</span>
                  <Badge className="bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                    0% (Exempt)
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Pharmacy Medicines:</span>
                  <Badge className="bg-blue-100 text-blue-800 text-xs font-mono font-bold">
                    {formData.gst_medicine_rate}% GST
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>Deluxe Bed (&gt;₹{formData.gst_ward_exemption_cutoff}):</span>
                  <Badge className="bg-amber-100 text-amber-800 text-xs font-mono font-bold">
                    {formData.gst_ward_high_rate}% GST
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>General Ward / ICU Beds:</span>
                  <Badge className="bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                    0% (Exempt)
                  </Badge>
                </div>

                <div className="p-3 rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-[11px] text-green-800 dark:text-green-300 flex items-start gap-2 mt-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Indian Ministry of Finance Aligned</span>
                    Fully complies with GST Council circulars for healthcare establishments and provides bifurcated CGST/SGST ledger printouts.
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
