"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Select } from "@/components/ui/select";

export default function LocalizationSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/config/settings");
      const data = await res.json();
      if (data.success) {
        const locSettings = data.data.filter((s: any) => s.category === "localization");
        setSettings(locSettings);
        
        const lang = locSettings.find((s: any) => s.key === "language")?.value;
        const tz = locSettings.find((s: any) => s.key === "timezone")?.value;
        const df = locSettings.find((s: any) => s.key === "date_format")?.value;
        
        if (lang) setLanguage(lang);
        if (tz) setTimezone(tz);
        if (df) setDateFormat(df);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    const existing = settings.find(s => s.key === key);
    if (existing) {
      if (existing.value !== value) {
        await fetch(`/api/config/settings/${existing._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value })
        });
      }
    } else {
      await fetch('/api/config/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'localization', key, value })
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSetting("language", language);
      await saveSetting("timezone", timezone);
      await saveSetting("date_format", dateFormat);
      
      toast({ title: "Success", description: "Localization settings updated successfully" });
      fetchSettings();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Localization Settings</h1>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Regional Preferences</CardTitle>
          <CardDescription>Configure language, timezone, and formatting.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label>System Language</Label>
                <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="en">English (US)</option>
                  <option value="en-gb">English (UK)</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Chicago">Central Time (US & Canada)</option>
                  <option value="America/Denver">Mountain Time (US & Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="Asia/Kolkata">India Standard Time (IST)</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2026-08-26)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (26/08/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (08/26/2026)</option>
                  <option value="DD-MMM-YYYY">DD-MMM-YYYY (26-Aug-2026)</option>
                </Select>
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
