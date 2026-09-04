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
  Clock, 
  Truck, 
  Save, 
  RefreshCw, 
  Building2, 
  BedDouble, 
  Pill, 
  TestTube, 
  Video, 
  Phone, 
  UserCheck, 
  CheckCircle2,
  Network
} from "lucide-react";

export default function BranchSettingsPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    branchId: "",
    branchCode: "BR-SL-01",
    operatingHours: "07:00 AM - 09:00 PM (All 7 Days)",
    consultationRooms: 8,
    dayCareBeds: 10,
    hasPharmacy: true,
    hasSampleCollection: true,
    sampleCourierSchedule: "Twice Daily (11:30 AM & 04:30 PM)",
    teleconsultationEnabled: true,
    branchManager: "Mr. Debabrata Sen",
    branchManagerPhone: "+91 98310 99881",
  });

  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [branchesRes, settingsRes] = await Promise.all([
        fetch("/api/organization/branches"),
        fetch("/api/organization/branch-settings")
      ]);
      const branchesData = await branchesRes.json();
      const settingsData = await settingsRes.json();

      if (branchesData.success && branchesData.data.length > 0) {
        setBranches(branchesData.data);
        const initialId = branchesData.data[0]._id;
        setSelectedBranchId(initialId);
      }
      if (settingsData.success && settingsData.data) {
        setSettings(settingsData.data);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to load branch settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBranchChange = async (branchId: string) => {
    setSelectedBranchId(branchId);
    try {
      setLoading(true);
      const res = await fetch(`/api/organization/branch-settings?branchId=${branchId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (error) {
      // Continue with current defaults
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/organization/branch-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          branchId: selectedBranchId || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Settings Saved", description: "Branch logistics and operational timings updated successfully." });
      } else {
        toast({ title: "Save Failed", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to save branch settings", variant: "destructive" });
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
            <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl dark:bg-cyan-950/50">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Satellite Branch Logistics & Timings</h1>
              <p className="text-muted-foreground text-sm">
                Clinic Operating Schedules, Specimen Courier Logistics to Central Lab & Day Care Capacity
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading || saving}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleSave} disabled={loading || saving}>
            {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Branch Settings
          </Button>
        </div>
      </div>

      {/* Branch Selector Toolbar */}
      {branches.length > 0 && (
        <Card className="bg-muted/30 border shadow-xs">
          <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Network className="w-4 h-4 text-cyan-600" />
              <span>Select Active Satellite Facility:</span>
            </div>
            <select
              className="flex h-9 w-full sm:w-80 rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-medium"
              value={selectedBranchId}
              onChange={(e) => handleBranchChange(e.target.value)}
            >
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.organizationName} ({b.organizationId})
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="py-16 text-center text-muted-foreground flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" /> Loading Branch Logistics...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Operating Hours & Identifiers */}
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" /> Clinic Timings & Station Code
              </CardTitle>
              <CardDescription className="text-xs">
                General outpatient consultation and clinic access schedule.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Station / Branch Code</Label>
                <Input
                  className="font-mono text-xs uppercase"
                  value={settings.branchCode}
                  onChange={(e) => setSettings({ ...settings, branchCode: e.target.value.toUpperCase() })}
                />
                <p className="text-[11px] text-muted-foreground">Internal satellite routing code</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Clinic Operating Hours</Label>
                <Input
                  value={settings.operatingHours}
                  onChange={(e) => setSettings({ ...settings, operatingHours: e.target.value })}
                  placeholder="07:00 AM - 09:00 PM (All 7 Days)"
                />
                <p className="text-[11px] text-muted-foreground">Patient entry and diagnostic window</p>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Chambers & Daycare Beds */}
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-blue-600" /> Outpatient Chambers & Day Care Beds
              </CardTitle>
              <CardDescription className="text-xs">
                Consultant doctor suites and short-stay observation beds.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Consultation Rooms Count</Label>
                <Input
                  type="number"
                  value={settings.consultationRooms}
                  onChange={(e) => setSettings({ ...settings, consultationRooms: parseInt(e.target.value) || 0 })}
                />
                <p className="text-[11px] text-muted-foreground">Multi-specialty rotation chambers</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Day Care Observation Beds</Label>
                <Input
                  type="number"
                  value={settings.dayCareBeds}
                  onChange={(e) => setSettings({ ...settings, dayCareBeds: parseInt(e.target.value) || 0 })}
                />
                <p className="text-[11px] text-muted-foreground">Dialysis chairs, IV infusion, post-OP recovery</p>
              </div>
            </CardContent>
          </Card>

          {/* Logistics & Service Capabilities */}
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" /> Specimen Logistics & Service Modules
              </CardTitle>
              <CardDescription className="text-xs">
                Diagnostic sample transport schedule to central hospital laboratory and digital OPD setup.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Scheduled Courier Dispatch to Central Lab</Label>
                <Input
                  value={settings.sampleCourierSchedule}
                  onChange={(e) => setSettings({ ...settings, sampleCourierSchedule: e.target.value })}
                  placeholder="Twice Daily (11:30 AM & 04:30 PM)"
                />
                <p className="text-[11px] text-muted-foreground">Cold-chain pathology sample transfer timings</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3 rounded-xl border bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Pill className="w-4 h-4 text-emerald-600" />
                    <span>On-Site Pharmacy</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.hasPharmacy}
                    onChange={(e) => setSettings({ ...settings, hasPharmacy: e.target.checked })}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                </div>

                <div className="p-3 rounded-xl border bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <TestTube className="w-4 h-4 text-purple-600" />
                    <span>Sample Collection</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.hasSampleCollection}
                    onChange={(e) => setSettings({ ...settings, hasSampleCollection: e.target.checked })}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                </div>

                <div className="p-3 rounded-xl border bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Video className="w-4 h-4 text-blue-600" />
                    <span>Teleconsultation Suite</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.teleconsultationEnabled}
                    onChange={(e) => setSettings({ ...settings, teleconsultationEnabled: e.target.checked })}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branch Governance & Emergency Contact */}
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" /> Branch Administration & On-Call Manager
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Branch Administrator / Manager</Label>
                <Input
                  value={settings.branchManager}
                  onChange={(e) => setSettings({ ...settings, branchManager: e.target.value })}
                  placeholder="e.g. Mr. Debabrata Sen"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Manager Direct Emergency Phone</Label>
                <Input
                  value={settings.branchManagerPhone}
                  onChange={(e) => setSettings({ ...settings, branchManagerPhone: e.target.value })}
                  placeholder="+91 98310 99881"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={loadData} disabled={saving}>
              Cancel Changes
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Branch Settings
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
