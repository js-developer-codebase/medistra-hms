"use client";

import React, { useEffect, useState } from "react";
import {
  FileKey,
  Lock,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Network,
  Save,
  RefreshCw,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export default function AccessPoliciesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    passwordExpiryDays: 90,
    sessionTimeoutMinutes: 30,
    maxConcurrentSessions: 3,
    maxFailedAttempts: 5,
    lockoutDurationMinutes: 15,
    mfaPolicy: "ADMIN_ONLY" as "DISABLED" | "ADMIN_ONLY" | "ALL_USERS",
    ipWhitelist: ["192.168.1.0/24", "10.0.0.0/16", "127.0.0.1"],
    auditLevel: "DETAILED" as "BASIC" | "DETAILED" | "FORENSIC",
  });

  const [ipInput, setIpInput] = useState("");

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/policies");
      const json = await res.json();
      if (json.success && json.data) {
        setForm(json.data);
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load access policies", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/admin/policies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Policies Saved", description: json.message });
      } else {
        toast({ title: "Save Failed", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddIp = () => {
    if (!ipInput.trim()) return;
    if (form.ipWhitelist.includes(ipInput.trim())) return;
    setForm((prev) => ({ ...prev, ipWhitelist: [...prev.ipWhitelist, ipInput.trim()] }));
    setIpInput("");
  };

  const handleRemoveIp = (ip: string) => {
    setForm((prev) => ({
      ...prev,
      ipWhitelist: prev.ipWhitelist.filter((i) => i !== ip),
    }));
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-lg">
              <FileKey className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Security & Access Policies</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Institutional credential standards, session security, multi-factor enforcement, and intranet whitelists.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchPolicies} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? "Saving..." : "Save Policies"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Password Complexity & Expiration */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Password Complexity & Rotation Policy
            </CardTitle>
            <CardDescription className="text-xs">
              Enforce cryptographic password strength and regular rotation for hospital accounts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Minimum Password Length</Label>
                <Input
                  type="number"
                  min={6}
                  max={32}
                  className="h-9"
                  value={form.passwordMinLength}
                  onChange={(e) =>
                    setForm({ ...form, passwordMinLength: parseInt(e.target.value, 10) || 8 })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Password Expiry (Days)</Label>
                <Input
                  type="number"
                  min={30}
                  max={365}
                  className="h-9"
                  value={form.passwordExpiryDays}
                  onChange={(e) =>
                    setForm({ ...form, passwordExpiryDays: parseInt(e.target.value, 10) || 90 })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-muted/30 border rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-semibold block">Require Uppercase</span>
                  <span className="text-[11px] text-muted-foreground">At least 1 (A-Z)</span>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded text-primary"
                  checked={form.passwordRequireUppercase}
                  onChange={(e) =>
                    setForm({ ...form, passwordRequireUppercase: e.target.checked })
                  }
                />
              </div>

              <div className="p-3 bg-muted/30 border rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-semibold block">Require Numbers</span>
                  <span className="text-[11px] text-muted-foreground">At least 1 digit (0-9)</span>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded text-primary"
                  checked={form.passwordRequireNumbers}
                  onChange={(e) =>
                    setForm({ ...form, passwordRequireNumbers: e.target.checked })
                  }
                />
              </div>

              <div className="p-3 bg-muted/30 border rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-semibold block">Require Special Chars</span>
                  <span className="text-[11px] text-muted-foreground">e.g. !@#$%^&*</span>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded text-primary"
                  checked={form.passwordRequireSpecial}
                  onChange={(e) =>
                    setForm({ ...form, passwordRequireSpecial: e.target.checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Session Inactivity & Lockout */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              Session Inactivity & Brute-force Lockout
            </CardTitle>
            <CardDescription className="text-xs">
              Prevent unauthorized terminal hijacking by terminating idle sessions and locking accounts after failed attempts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Inactivity Session Timeout (Minutes)</Label>
                <select
                  className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                  value={form.sessionTimeoutMinutes}
                  onChange={(e) =>
                    setForm({ ...form, sessionTimeoutMinutes: parseInt(e.target.value, 10) })
                  }
                >
                  <option value={15}>15 Minutes (Strict Clinical Mode)</option>
                  <option value={30}>30 Minutes (Standard Hospital)</option>
                  <option value={60}>60 Minutes (Administrative)</option>
                  <option value={120}>120 Minutes (Extended)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Max Concurrent Sessions Per User</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  className="h-9"
                  value={form.maxConcurrentSessions}
                  onChange={(e) =>
                    setForm({ ...form, maxConcurrentSessions: parseInt(e.target.value, 10) || 3 })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Max Failed Login Attempts</Label>
                <Input
                  type="number"
                  min={3}
                  max={10}
                  className="h-9"
                  value={form.maxFailedAttempts}
                  onChange={(e) =>
                    setForm({ ...form, maxFailedAttempts: parseInt(e.target.value, 10) || 5 })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Account Lockout Duration (Minutes)</Label>
                <Input
                  type="number"
                  min={5}
                  max={60}
                  className="h-9"
                  value={form.lockoutDurationMinutes}
                  onChange={(e) =>
                    setForm({ ...form, lockoutDurationMinutes: parseInt(e.target.value, 10) || 15 })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: MFA & Intranet Whitelisting */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Multi-Factor Authentication & Network Restrictions
            </CardTitle>
            <CardDescription className="text-xs">
              Enforce two-factor verification tiers and limit login origins to trusted hospital CIDR subnets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">MFA Enforcement Policy</Label>
                <select
                  className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                  value={form.mfaPolicy}
                  onChange={(e) =>
                    setForm({ ...form, mfaPolicy: e.target.value as any })
                  }
                >
                  <option value="ADMIN_ONLY">Admins & Super-Admins Only (Recommended)</option>
                  <option value="ALL_USERS">Enforced for All Hospital Staff</option>
                  <option value="DISABLED">Disabled (Development / Local Only)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Audit Logging Level</Label>
                <select
                  className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                  value={form.auditLevel}
                  onChange={(e) =>
                    setForm({ ...form, auditLevel: e.target.value as any })
                  }
                >
                  <option value="DETAILED">Detailed (Record logins, writes, updates)</option>
                  <option value="FORENSIC">Forensic (Log read queries & data exports)</option>
                  <option value="BASIC">Basic (Logins only)</option>
                </select>
              </div>
            </div>

            {/* IP Whitelist */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs">Trusted Hospital Subnets & IP Whitelist (CIDR / IPv4)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. 192.168.1.0/24 or 10.0.1.50"
                  className="h-9 font-mono text-xs"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleAddIp}>
                  Add Subnet
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {form.ipWhitelist.map((ip) => (
                  <span
                    key={ip}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-muted border"
                  >
                    <Network className="w-3 h-3 text-muted-foreground" />
                    {ip}
                    <button
                      type="button"
                      className="ml-1 text-muted-foreground hover:text-rose-600"
                      onClick={() => handleRemoveIp(ip)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Footer */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" size="sm" disabled={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? "Saving Policies..." : "Save & Apply Security Policies"}
          </Button>
        </div>
      </form>
    </div>
  );
}
