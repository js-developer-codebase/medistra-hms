"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { 
  ShieldCheck, 
  BedDouble, 
  Activity, 
  Save, 
  RefreshCw, 
  Clock, 
  Phone, 
  FileCheck2, 
  CheckCircle2, 
  HeartPulse, 
  Stethoscope,
  Scissors
} from "lucide-react";

export default function HospitalSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    nabhAccredited: true,
    nabhCode: "NABH-2024-HOSP-0982",
    jciAccredited: true,
    totalBeds: 450,
    icuBeds: 60,
    nicuBeds: 24,
    otSuites: 12,
    bloodBankLicense: "DL-BB-WB-2022-04",
    pharmacyLicense: "WB/KOL/20/21B/4921",
    ambulanceHotline: "+91 33 2345 6789",
    casualtyPhone: "+91 33 2345 6701",
    visitingHours: "04:30 PM - 07:00 PM",
    dischargeCheckTime: "11:00 AM",
  });

  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/organization/hospital-settings");
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to load hospital settings", variant: "destructive" });
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
      const res = await fetch("/api/organization/hospital-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Settings Saved", description: "Hospital unit operational parameters updated successfully." });
      } else {
        toast({ title: "Save Failed", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to save hospital settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const criticalBedsTotal = (settings.icuBeds || 0) + (settings.nicuBeds || 0);
  const generalWardBeds = Math.max(0, (settings.totalBeds || 0) - criticalBedsTotal);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl dark:bg-rose-950/50">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Hospital Unit Operations & NABH</h1>
              <p className="text-muted-foreground text-sm">
                NABH/JCI Accreditation, Critical Care Bed Distribution, Statutory Drug Licenses & Emergency Hotlines
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSettings} disabled={loading || saving}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleSave} disabled={loading || saving}>
            {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Operational Settings
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" /> Loading Hospital Settings...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Accreditation & Compliance */}
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" /> Hospital Accreditation & Certification
              </CardTitle>
              <CardDescription className="text-xs">
                Quality standards and accreditation compliance verified by external governing bodies.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2 p-4 rounded-xl border bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold cursor-pointer">NABH Accreditation</Label>
                  <input
                    type="checkbox"
                    checked={settings.nabhAccredited}
                    onChange={(e) => setSettings({ ...settings, nabhAccredited: e.target.checked })}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                </div>
                <Input
                  placeholder="e.g. NABH-2024-HOSP-0982"
                  value={settings.nabhCode}
                  onChange={(e) => setSettings({ ...settings, nabhCode: e.target.value })}
                  className="font-mono text-xs uppercase"
                />
                <p className="text-[11px] text-muted-foreground">National Board for Hospitals & Healthcare</p>
              </div>

              <div className="space-y-2 p-4 rounded-xl border bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold cursor-pointer">JCI International Accreditation</Label>
                  <input
                    type="checkbox"
                    checked={settings.jciAccredited}
                    onChange={(e) => setSettings({ ...settings, jciAccredited: e.target.checked })}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                </div>
                <div className="text-xs text-muted-foreground pt-2">
                  Joint Commission International (JCI Gold Seal of Approval for Patient Safety)
                </div>
                <Badge variant={settings.jciAccredited ? "default" : "secondary"} className="text-[10px]">
                  {settings.jciAccredited ? "JCI Accredited" : "Not Enrolled"}
                </Badge>
              </div>

              <div className="space-y-2 p-4 rounded-xl border bg-muted/20">
                <span className="text-xs font-semibold uppercase text-muted-foreground">Accreditation Summary</span>
                <div className="pt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> Full Tertiary Care Certification
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Audits valid for active cycle 2024–2027 with continuous clinical quality indicators.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Bed Allocations & OT Suites */}
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-blue-600" /> Inpatient Bed Capacity & Surgical Suites
              </CardTitle>
              <CardDescription className="text-xs">
                Operational bed quotas for critical intensive care, pediatrics, and surgical suites.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5 p-3 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 dark:text-blue-300">
                    <BedDouble className="w-4 h-4 text-blue-600" /> Total Operational Beds
                  </div>
                  <Input
                    type="number"
                    value={settings.totalBeds}
                    onChange={(e) => setSettings({ ...settings, totalBeds: parseInt(e.target.value) || 0 })}
                    className="font-bold text-lg"
                  />
                  <p className="text-[10px] text-muted-foreground">Authorized capacity</p>
                </div>

                <div className="space-y-1.5 p-3 rounded-lg border bg-rose-50/50 dark:bg-rose-950/20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-900 dark:text-rose-300">
                    <HeartPulse className="w-4 h-4 text-rose-600" /> ICU Critical Beds
                  </div>
                  <Input
                    type="number"
                    value={settings.icuBeds}
                    onChange={(e) => setSettings({ ...settings, icuBeds: parseInt(e.target.value) || 0 })}
                    className="font-bold text-lg"
                  />
                  <p className="text-[10px] text-muted-foreground">Adult Intensive Care Units</p>
                </div>

                <div className="space-y-1.5 p-3 rounded-lg border bg-purple-50/50 dark:bg-purple-950/20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-900 dark:text-purple-300">
                    <Stethoscope className="w-4 h-4 text-purple-600" /> NICU / PICU Beds
                  </div>
                  <Input
                    type="number"
                    value={settings.nicuBeds}
                    onChange={(e) => setSettings({ ...settings, nicuBeds: parseInt(e.target.value) || 0 })}
                    className="font-bold text-lg"
                  />
                  <p className="text-[10px] text-muted-foreground">Neonatal & Pediatric Care</p>
                </div>

                <div className="space-y-1.5 p-3 rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                    <Scissors className="w-4 h-4 text-emerald-600" /> Modular OT Suites
                  </div>
                  <Input
                    type="number"
                    value={settings.otSuites}
                    onChange={(e) => setSettings({ ...settings, otSuites: parseInt(e.target.value) || 0 })}
                    className="font-bold text-lg"
                  />
                  <p className="text-[10px] text-muted-foreground">Laminar flow operating rooms</p>
                </div>
              </div>

              {/* Visual Bed Distribution Overview */}
              <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-foreground">
                  <span>Bed Allocation Ratio</span>
                  <span>{settings.totalBeds} Total Beds</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 flex overflow-hidden">
                  <div
                    style={{ width: `${((settings.icuBeds || 0) / (settings.totalBeds || 1)) * 100}%` }}
                    className="bg-rose-500"
                    title={`ICU: ${settings.icuBeds} beds`}
                  />
                  <div
                    style={{ width: `${((settings.nicuBeds || 0) / (settings.totalBeds || 1)) * 100}%` }}
                    className="bg-purple-500"
                    title={`NICU: ${settings.nicuBeds} beds`}
                  />
                  <div
                    style={{ width: `${(generalWardBeds / (settings.totalBeds || 1)) * 100}%` }}
                    className="bg-blue-500"
                    title={`General / Semi-Private / HDU: ${generalWardBeds} beds`}
                  />
                </div>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> ICU ({settings.icuBeds})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> NICU ({settings.nicuBeds})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Wards / Cabins ({generalWardBeds})
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statutory Licenses & Emergency Helplines */}
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-600" /> Regulatory Licenses & 24x7 Casualty Hotlines
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Blood Bank License Number</Label>
                <Input
                  className="font-mono text-xs uppercase"
                  value={settings.bloodBankLicense}
                  onChange={(e) => setSettings({ ...settings, bloodBankLicense: e.target.value.toUpperCase() })}
                />
                <p className="text-[11px] text-muted-foreground">State Drug Control Authority License</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Hospital In-house Pharmacy Drug License</Label>
                <Input
                  className="font-mono text-xs uppercase"
                  value={settings.pharmacyLicense}
                  onChange={(e) => setSettings({ ...settings, pharmacyLicense: e.target.value.toUpperCase() })}
                />
                <p className="text-[11px] text-muted-foreground">Form 20/21B Commercial License</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">24x7 Ambulance Dispatch Hotline</Label>
                <Input
                  value={settings.ambulanceHotline}
                  onChange={(e) => setSettings({ ...settings, ambulanceHotline: e.target.value })}
                />
                <p className="text-[11px] text-muted-foreground">Direct fleet response controller</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Casualty & Trauma CMO Desk Phone</Label>
                <Input
                  value={settings.casualtyPhone}
                  onChange={(e) => setSettings({ ...settings, casualtyPhone: e.target.value })}
                />
                <p className="text-[11px] text-muted-foreground">Emergency room attending physician</p>
              </div>
            </CardContent>
          </Card>

          {/* Hospital Timings & Discharge Policies */}
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" /> Patient Visiting Hours & Discharge Protocols
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Inpatient Ward Visiting Hours</Label>
                <Input
                  value={settings.visitingHours}
                  onChange={(e) => setSettings({ ...settings, visitingHours: e.target.value })}
                  placeholder="04:30 PM - 07:00 PM"
                />
                <p className="text-[11px] text-muted-foreground">Strict visitor pass admittance window</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Standard Inpatient Discharge Cutoff Time</Label>
                <Input
                  value={settings.dischargeCheckTime}
                  onChange={(e) => setSettings({ ...settings, dischargeCheckTime: e.target.value })}
                  placeholder="11:00 AM"
                />
                <p className="text-[11px] text-muted-foreground">Billing final clearance benchmark time</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={fetchSettings} disabled={saving}>
              Cancel Changes
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Hospital Operations
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
