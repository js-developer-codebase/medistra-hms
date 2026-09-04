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
  Sliders, 
  Save, 
  RefreshCw, 
  FileText, 
  Building2, 
  Phone, 
  Globe, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export default function OrganizationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    cinNumber: "U85110WB2018PTC224890",
    panNumber: "AAACM8912P",
    gstin: "19AAACM8912P1ZV",
    currency: "INR",
    currencySymbol: "₹",
    fiscalYearStart: "April",
    fiscalYearEnd: "March",
    tagline: "Centre of Excellence in Tertiary & Quaternary Healthcare",
    website: "https://medistra.hospital",
    emergencyHotline: "+91 33 2345 6780",
    letterheadHeader: "MEDISTRA HEALTHCARE SYSTEM - TRUSTED CLINICAL EXCELLENCE",
    letterheadFooter: "12 Medical Enclave, Central Avenue, Kolkata | 24x7 Helpline: 1800-200-8899",
  });

  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/organization/settings");
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to load settings", variant: "destructive" });
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
      const res = await fetch("/api/organization/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Settings Saved", description: "Organization legal and tax configurations updated successfully." });
      } else {
        toast({ title: "Save Failed", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl dark:bg-amber-950/50">
              <Sliders className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Organization Settings & Compliance</h1>
              <p className="text-muted-foreground text-sm">
                Statutory Identification, Indian Currency (₹ INR), Fiscal Year, and Official Letterhead Templates
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
            Save Settings
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" /> Loading Organization Settings...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Statutory Tax & Corporate Identity */}
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Corporate & Statutory Registration (India)
              </CardTitle>
              <CardDescription className="text-xs">
                Mandatory legal parameters required on all medical receipts, inpatient bills, and diagnostic reports.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Corporate Identity Number (CIN)</Label>
                <Input
                  className="font-mono text-sm uppercase"
                  placeholder="e.g. U85110WB2018PTC224890"
                  value={settings.cinNumber}
                  onChange={(e) => setSettings({ ...settings, cinNumber: e.target.value.toUpperCase() })}
                />
                <p className="text-[11px] text-muted-foreground">Ministry of Corporate Affairs 21-digit code</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Permanent Account Number (PAN)</Label>
                <Input
                  className="font-mono text-sm uppercase"
                  placeholder="e.g. AAACM8912P"
                  value={settings.panNumber}
                  onChange={(e) => setSettings({ ...settings, panNumber: e.target.value.toUpperCase() })}
                />
                <p className="text-[11px] text-muted-foreground">Income Tax Department India PAN</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">GSTIN (Goods & Services Tax)</Label>
                <Input
                  className="font-mono text-sm uppercase"
                  placeholder="e.g. 19AAACM8912P1ZV"
                  value={settings.gstin}
                  onChange={(e) => setSettings({ ...settings, gstin: e.target.value.toUpperCase() })}
                />
                <p className="text-[11px] text-muted-foreground">15-digit State GST Identification Number</p>
              </div>
            </CardContent>
          </Card>

          {/* Currency & Financial Calendar */}
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <span className="font-bold text-amber-600 text-lg">₹</span> Financial & Accounting Parameters
              </CardTitle>
              <CardDescription className="text-xs">
                System currency configuration strictly configured in Indian Rupees (₹).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Billing Currency Code</Label>
                <Input
                  disabled
                  value={settings.currency}
                  className="bg-muted font-bold text-sm"
                />
                <p className="text-[11px] text-muted-foreground">Standardized to INR</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Currency Symbol</Label>
                <Input
                  disabled
                  value={settings.currencySymbol}
                  className="bg-muted font-bold text-base text-amber-600"
                />
                <p className="text-[11px] text-muted-foreground">Indian Rupee Symbol (₹)</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Financial Year Start Month</Label>
                <Input
                  value={settings.fiscalYearStart}
                  onChange={(e) => setSettings({ ...settings, fiscalYearStart: e.target.value })}
                  placeholder="April"
                />
                <p className="text-[11px] text-muted-foreground">Indian standard: April</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Financial Year End Month</Label>
                <Input
                  value={settings.fiscalYearEnd}
                  onChange={(e) => setSettings({ ...settings, fiscalYearEnd: e.target.value })}
                  placeholder="March"
                />
                <p className="text-[11px] text-muted-foreground">Indian standard: March</p>
              </div>
            </CardContent>
          </Card>

          {/* Communications & Online Portal */}
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" /> Public Profile & 24x7 Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold">Corporate Tagline</Label>
                <Input
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  placeholder="e.g. Centre of Excellence in Tertiary & Quaternary Healthcare"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Official Website</Label>
                <Input
                  value={settings.website}
                  onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                  placeholder="https://medistra.hospital"
                />
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <Label className="text-xs font-semibold">24x7 Hospital Emergency Hotline</Label>
                <Input
                  value={settings.emergencyHotline}
                  onChange={(e) => setSettings({ ...settings, emergencyHotline: e.target.value })}
                  placeholder="+91 33 2345 6780 / 1066"
                />
              </div>
            </CardContent>
          </Card>

          {/* Letterhead & Diagnostic Print Templates */}
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" /> Letterhead & Document Banner Templates
              </CardTitle>
              <CardDescription className="text-xs">
                Headers and footers rendered on patient discharge summaries, prescriptions, and lab test results.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Official Document Letterhead Header</Label>
                <Input
                  value={settings.letterheadHeader}
                  onChange={(e) => setSettings({ ...settings, letterheadHeader: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Official Document Letterhead Footer</Label>
                <Input
                  value={settings.letterheadFooter}
                  onChange={(e) => setSettings({ ...settings, letterheadFooter: e.target.value })}
                />
              </div>

              {/* Live Preview Container */}
              <div className="mt-4 p-4 rounded-xl border border-dashed bg-muted/30 space-y-3">
                <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground block">
                  Document Print Preview Simulation
                </span>
                <div className="bg-background p-4 rounded-lg border shadow-xs space-y-6 text-center">
                  <div className="border-b pb-2">
                    <h4 className="font-bold text-xs uppercase tracking-wide text-foreground">
                      {settings.letterheadHeader}
                    </h4>
                    <p className="text-[10px] text-muted-foreground italic mt-0.5">
                      {settings.tagline}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      CIN: {settings.cinNumber} | PAN: {settings.panNumber} | GSTIN: {settings.gstin}
                    </p>
                  </div>
                  <div className="py-2 text-xs text-muted-foreground italic">
                    [ Clinical Consultation / Inpatient Discharge Summary / Laboratory Report Content Area ]
                  </div>
                  <div className="border-t pt-2 text-[10px] text-muted-foreground">
                    {settings.letterheadFooter}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={fetchSettings} disabled={saving}>
              Cancel Changes
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save All Settings
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
