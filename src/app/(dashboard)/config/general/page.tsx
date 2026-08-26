"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const defaultKeys = [
    { key: "hospital_name", label: "Hospital Name", defaultVal: "Medistra HMS" },
    { key: "hospital_email", label: "Contact Email", defaultVal: "contact@medistra.com" },
    { key: "hospital_phone", label: "Contact Phone", defaultVal: "+1 234 567 8900" },
    { key: "hospital_address", label: "Address", defaultVal: "123 Medical Drive, Health City" },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/config/settings");
      const data = await res.json();
      if (data.success) {
        const genSettings = data.data.filter((s: any) => s.category === "general");
        setSettings(genSettings);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getSettingValue = (key: string) => {
    const s = settings.find(s => s.key === key);
    return s ? s.value : "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      
      for (const item of defaultKeys) {
        const val = formData.get(item.key) as string;
        const existing = settings.find(s => s.key === item.key);
        
        if (existing) {
          if (existing.value !== val) {
            await fetch(`/api/config/settings/${existing._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ value: val })
            });
          }
        } else {
          await fetch('/api/config/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: 'general', key: item.key, value: val })
          });
        }
      }
      
      toast({ title: "Success", description: "Settings updated successfully" });
      fetchSettings();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Hospital Information</CardTitle>
          <CardDescription>Update your general hospital details and contact information.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {defaultKeys.map((item) => (
                <div key={item.key} className="space-y-2">
                  <Label htmlFor={item.key}>{item.label}</Label>
                  <Input 
                    id={item.key} 
                    name={item.key} 
                    defaultValue={getSettingValue(item.key) || item.defaultVal} 
                  />
                </div>
              ))}
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
