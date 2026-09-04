"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Network,
  Save,
  Shield,
  Server,
  Radio,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Cpu,
  Layers,
  FileCode,
  HardDrive
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function IntegrationsConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    abdm_enabled: "true",
    abdm_environment: "PRODUCTION_SANDBOX",
    abdm_hip_id: "IN0710000042",
    abdm_hiu_id: "HIU0710000042",
    hl7_fhir_endpoint: "https://fhir.medistra.in/r4",
    hl7_version: "FHIR R4",
    pacs_dicom_server: "pacs.medistra.in:104",
    pacs_ae_title: "MEDISTRA_PACS"
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/config/settings?category=integrations&map=true");
      const data = await res.json();
      if (data.success && data.data && Object.keys(data.data).length > 0) {
        setFormData((prev) => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error("Failed to load integrations settings:", err);
      toast("Failed to load integrations settings from server.", "error");
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
        body: JSON.stringify({ category: "integrations", settings: settingsPayload })
      });

      const data = await res.json();
      if (data.success) {
        toast("ABDM Digital Health, HL7/FHIR, and PACS DICOM settings updated successfully!", "success");
      } else {
        toast(data.message || "Failed to update integration settings.", "error");
      }
    } catch (err) {
      console.error("Error saving integration settings:", err);
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              <Network className="h-3.5 w-3.5 text-sky-600" />
              National Health Interoperability
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Integration Settings (ABDM, HL7/FHIR, PACS)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure Ayushman Bharat Digital Mission (ABDM M1/M2/M3) gateways, Health Information Provider/User IDs, HL7 FHIR R4 APIs, and Radiology DICOM PACS servers.
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
            className="bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5"
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
            {/* Ayushman Bharat Digital Mission (ABDM) */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-sky-600" />
                  Ayushman Bharat Digital Mission (ABDM) Gateway
                </CardTitle>
                <CardDescription className="text-xs">
                  National Health Authority (NHA) gateway connection for ABHA generation (M1), Health Information Provider HIP (M2), and HIU (M3).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="abdm_enabled" className="text-xs font-semibold">
                      ABDM National Gateway Integration
                    </Label>
                    <Select
                      id="abdm_enabled"
                      value={formData.abdm_enabled}
                      onChange={(e) => setFormData({ ...formData, abdm_enabled: e.target.value })}
                      className="h-9 text-xs"
                    >
                      <option value="true">Enabled (ABHA Linking & Consent Processing Active)</option>
                      <option value="false">Disabled (Standalone HMS Mode)</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="abdm_environment" className="text-xs font-semibold">
                      NHA Gateway Environment
                    </Label>
                    <Select
                      id="abdm_environment"
                      value={formData.abdm_environment}
                      onChange={(e) => setFormData({ ...formData, abdm_environment: e.target.value })}
                      className="h-9 text-xs font-mono"
                    >
                      <option value="PRODUCTION_SANDBOX">Production Sandbox (NHA Testing)</option>
                      <option value="PRODUCTION_LIVE">Live Production Gateway (Govt of India)</option>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="abdm_hip_id" className="text-xs font-semibold">
                      Health Facility Registry (HIP ID) *
                    </Label>
                    <Input
                      id="abdm_hip_id"
                      value={formData.abdm_hip_id}
                      onChange={(e) => setFormData({ ...formData, abdm_hip_id: e.target.value })}
                      required
                      className="h-9 text-xs font-mono font-bold text-sky-600"
                      placeholder="IN0710000042"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="abdm_hiu_id" className="text-xs font-semibold">
                      Health Information User (HIU ID) *
                    </Label>
                    <Input
                      id="abdm_hiu_id"
                      value={formData.abdm_hiu_id}
                      onChange={(e) => setFormData({ ...formData, abdm_hiu_id: e.target.value })}
                      required
                      className="h-9 text-xs font-mono font-bold text-indigo-600"
                      placeholder="HIU0710000042"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* HL7 FHIR Interoperability */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-emerald-600" />
                  HL7 / FHIR R4 Interoperability Server
                </CardTitle>
                <CardDescription className="text-xs">
                  Standards-compliant diagnostic report and discharge summary bundle repository.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="hl7_fhir_endpoint" className="text-xs font-semibold">
                      FHIR Server Base URL *
                    </Label>
                    <Input
                      id="hl7_fhir_endpoint"
                      value={formData.hl7_fhir_endpoint}
                      onChange={(e) => setFormData({ ...formData, hl7_fhir_endpoint: e.target.value })}
                      required
                      className="h-9 text-xs font-mono"
                      placeholder="https://fhir.medistra.in/r4"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="hl7_version" className="text-xs font-semibold">
                      FHIR Release Version
                    </Label>
                    <Select
                      id="hl7_version"
                      value={formData.hl7_version}
                      onChange={(e) => setFormData({ ...formData, hl7_version: e.target.value })}
                      className="h-9 text-xs font-mono font-bold"
                    >
                      <option value="FHIR R4">FHIR Release 4 (Standard Specification)</option>
                      <option value="FHIR R5">FHIR Release 5 (Draft Beta)</option>
                      <option value="HL7 v2.7">HL7 v2.7 Legacy Pipeline</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Radiology DICOM PACS */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-purple-600" />
                  Radiology DICOM PACS Archive
                </CardTitle>
                <CardDescription className="text-xs">
                  Picture Archiving and Communication System connection for CT, MRI, and X-ray studies.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="pacs_dicom_server" className="text-xs font-semibold">
                      PACS Server Host & Port (TCP) *
                    </Label>
                    <Input
                      id="pacs_dicom_server"
                      value={formData.pacs_dicom_server}
                      onChange={(e) => setFormData({ ...formData, pacs_dicom_server: e.target.value })}
                      required
                      className="h-9 text-xs font-mono"
                      placeholder="pacs.medistra.in:104"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pacs_ae_title" className="text-xs font-semibold">
                      Application Entity (AE) Title *
                    </Label>
                    <Input
                      id="pacs_ae_title"
                      value={formData.pacs_ae_title}
                      onChange={(e) => setFormData({ ...formData, pacs_ae_title: e.target.value.toUpperCase() })}
                      required
                      className="h-9 text-xs font-mono font-bold"
                      placeholder="MEDISTRA_PACS"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Interoperability Posture */}
          <div className="space-y-5">
            <Card className="border shadow-sm bg-gradient-to-br from-sky-50/50 to-slate-50 dark:from-slate-900 dark:to-sky-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Network className="h-4 w-4 text-sky-600" />
                  Ecosystem Topology
                </CardTitle>
                <CardDescription className="text-xs">
                  Active external interface bridges
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>ABDM HIP Node:</span>
                  <Badge className="bg-sky-100 text-sky-800 font-mono text-xs font-bold">
                    {formData.abdm_hip_id}
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>FHIR Standard:</span>
                  <Badge variant="outline" className="font-mono text-xs text-emerald-600">
                    {formData.hl7_version}
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border flex items-center justify-between">
                  <span>DICOM AE Title:</span>
                  <Badge variant="outline" className="font-mono text-xs text-purple-600 font-bold">
                    {formData.pacs_ae_title}
                  </Badge>
                </div>

                <div className="p-3 rounded-md bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[11px] text-sky-800 dark:text-sky-300 flex items-start gap-2 mt-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">NHA Milestone 3 Certified</span>
                    Enables patient discovery, electronic health locker linking, and secure consent manager data flows across Indian healthcare providers.
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
