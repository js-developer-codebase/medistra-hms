"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Save,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Globe,
  Award,
  FileText,
  AlertCircle,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function GeneralConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    hospital_name: "Medistra Super Speciality Hospital",
    hospital_tagline: "Excellence in Tertiary Healthcare & Clinical Research",
    hospital_email: "contact@medistra.in",
    hospital_phone: "+91 11 4982 5000",
    hospital_emergency: "1066 / +91 11 4982 5099",
    hospital_address: "Plot 12, Institutional Area, Sector 62, New Delhi - 110092, India",
    hospital_website: "https://medistra.in",
    hospital_cin: "U85110DL2018PTC321456",
    hospital_nabh: "NABH-2024-HOSP-0842"
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/config/settings?category=general&map=true");
      const data = await res.json();
      if (data.success && data.data && Object.keys(data.data).length > 0) {
        setFormData((prev) => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error("Failed to load general settings:", err);
      toast("Failed to load general settings from server.", "error");
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
        body: JSON.stringify({ category: "general", settings: settingsPayload })
      });

      const data = await res.json();
      if (data.success) {
        toast("Hospital identity and contact configuration updated successfully!", "success");
      } else {
        toast(data.message || "Failed to update general settings.", "error");
      }
    } catch (err) {
      console.error("Error saving general settings:", err);
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Building2 className="h-3.5 w-3.5 text-blue-600" />
              Hospital Master Record
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            General & Hospital Identity Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Define legal entity naming, registration codes, accreditation identifiers, 24x7 emergency contacts, and campus premises.
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
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving Changes..." : "Save Configuration"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Legal Entity & Brand */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  Hospital Nomenclature & Branding
                </CardTitle>
                <CardDescription className="text-xs">
                  Official registered entity name and brand motto printed on patient documents, receipts, and clinical reports.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="hospital_name" className="text-xs font-semibold">
                    Registered Hospital Legal Name *
                  </Label>
                  <Input
                    id="hospital_name"
                    value={formData.hospital_name}
                    onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                    required
                    className="h-9 text-xs font-medium"
                    placeholder="e.g. Medistra Super Speciality Hospital"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="hospital_tagline" className="text-xs font-semibold">
                    Public Tagline / Clinical Vision
                  </Label>
                  <Input
                    id="hospital_tagline"
                    value={formData.hospital_tagline}
                    onChange={(e) => setFormData({ ...formData, hospital_tagline: e.target.value })}
                    className="h-9 text-xs"
                    placeholder="e.g. Excellence in Tertiary Healthcare & Clinical Research"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="hospital_cin" className="text-xs font-semibold">
                      Corporate Identity Number (CIN / ROC)
                    </Label>
                    <Input
                      id="hospital_cin"
                      value={formData.hospital_cin}
                      onChange={(e) => setFormData({ ...formData, hospital_cin: e.target.value })}
                      className="h-9 text-xs font-mono"
                      placeholder="e.g. U85110DL2018PTC321456"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="hospital_nabh" className="text-xs font-semibold">
                      NABH Accreditation ID
                    </Label>
                    <Input
                      id="hospital_nabh"
                      value={formData.hospital_nabh}
                      onChange={(e) => setFormData({ ...formData, hospital_nabh: e.target.value })}
                      className="h-9 text-xs font-mono font-semibold text-blue-600"
                      placeholder="e.g. NABH-2024-HOSP-0842"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Official Contact & Communications */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  Official Telephony & Helplines
                </CardTitle>
                <CardDescription className="text-xs">
                  Contact channels displayed on discharge summaries, patient appointment confirmation SMS, and emergency cards.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="hospital_phone" className="text-xs font-semibold">
                      Primary Hospital Reception / Desk *
                    </Label>
                    <Input
                      id="hospital_phone"
                      value={formData.hospital_phone}
                      onChange={(e) => setFormData({ ...formData, hospital_phone: e.target.value })}
                      required
                      className="h-9 text-xs font-mono"
                      placeholder="+91 11 4982 5000"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="hospital_emergency" className="text-xs font-semibold text-rose-600">
                      24x7 Trauma & Emergency Hotline *
                    </Label>
                    <Input
                      id="hospital_emergency"
                      value={formData.hospital_emergency}
                      onChange={(e) => setFormData({ ...formData, hospital_emergency: e.target.value })}
                      required
                      className="h-9 text-xs font-mono font-bold text-rose-600"
                      placeholder="1066 / +91 11 4982 5099"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="hospital_email" className="text-xs font-semibold">
                      Official Contact Email Address *
                    </Label>
                    <Input
                      id="hospital_email"
                      type="email"
                      value={formData.hospital_email}
                      onChange={(e) => setFormData({ ...formData, hospital_email: e.target.value })}
                      required
                      className="h-9 text-xs"
                      placeholder="contact@medistra.in"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="hospital_website" className="text-xs font-semibold">
                      Official Web Portal URL
                    </Label>
                    <Input
                      id="hospital_website"
                      value={formData.hospital_website}
                      onChange={(e) => setFormData({ ...formData, hospital_website: e.target.value })}
                      className="h-9 text-xs"
                      placeholder="https://medistra.in"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Physical Location */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-600" />
                  Campus Physical Address
                </CardTitle>
                <CardDescription className="text-xs">
                  Full postal location incorporated into statutory billing invoices, state GST filings, and patient registrations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="hospital_address" className="text-xs font-semibold">
                    Complete Postal Address *
                  </Label>
                  <Textarea
                    id="hospital_address"
                    rows={3}
                    value={formData.hospital_address}
                    onChange={(e) => setFormData({ ...formData, hospital_address: e.target.value })}
                    required
                    className="text-xs leading-relaxed resize-none"
                    placeholder="Plot 12, Institutional Area, Sector 62, New Delhi - 110092, India"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar / Preview & Regulatory */}
          <div className="space-y-5">
            <Card className="border shadow-sm bg-gradient-to-br from-blue-50/50 to-slate-50 dark:from-slate-900 dark:to-blue-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-blue-600" />
                  Live Letterhead Preview
                </CardTitle>
                <CardDescription className="text-xs">
                  Sample header appearance on prescriptions & bills
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border shadow-xs text-center space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white text-sm tracking-tight uppercase">
                    {formData.hospital_name || "Hospital Legal Name"}
                  </div>
                  <div className="text-[11px] text-blue-600 font-medium">
                    {formData.hospital_tagline || "Clinical Tagline"}
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1 leading-snug">
                    {formData.hospital_address || "Campus Address"}
                  </div>
                  <div className="flex items-center justify-center gap-3 text-[10px] text-slate-600 dark:text-slate-400 pt-1 font-mono">
                    <span>Ph: {formData.hospital_phone}</span>
                    <span>•</span>
                    <span className="text-rose-600 font-semibold">ER: {formData.hospital_emergency}</span>
                  </div>
                  <div className="pt-2">
                    <Badge variant="outline" className="text-[9px] font-mono border-blue-200 text-blue-700 bg-blue-50/50">
                      NABH ID: {formData.hospital_nabh}
                    </Badge>
                  </div>
                </div>

                <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Regulatory Sync Active</span>
                    All OPD tokens, digital prescriptions, and discharge summaries automatically inherit these verified legal parameters.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  Statutory Registrations
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-500 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span>Clinical Establishment Act</span>
                  <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Registered</Badge>
                </div>
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span>NABH 5th Edition Standard</span>
                  <Badge className="bg-blue-100 text-blue-800 text-[10px]">Accredited</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Atomic Energy Regulatory (AERB)</span>
                  <Badge className="bg-purple-100 text-purple-800 text-[10px]">Certified</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
