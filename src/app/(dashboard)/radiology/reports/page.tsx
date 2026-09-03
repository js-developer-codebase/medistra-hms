"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  FileEdit,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Scan,
  ShieldCheck,
  RefreshCw,
  Images
} from "lucide-react";

export default function ReportEntryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <ReportEntryContent />
    </Suspense>
  );
}

function ReportEntryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("studyId") || "";
  const { toast } = useToast();

  const [studies, setStudies] = useState<any[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [reportData, setReportData] = useState({
    technique: "",
    findings: "",
    impression: "",
    recommendations: "",
    isCritical: false,
    criticalNotifiedTo: ""
  });

  const templates: Record<string, any> = {
    NORMAL_CHEST: {
      title: "Normal Chest Radiograph",
      technique: "PA view of the chest obtained in full inspiration.",
      findings:
        "Trachea is midline. Cardiothoracic ratio is within normal physiological limits.\nBilateral lung fields are clear without evidence of consolidation, pneumothorax, or pleural effusion.\nCostophrenic and cardiophrenic angles are sharp and clear.\nBony thoracic cage and soft tissues are unremarkable.",
      impression: "Normal chest radiograph. No acute cardiopulmonary pathology demonstrated."
    },
    NORMAL_BRAIN_MRI: {
      title: "Normal Brain MRI 3.0T",
      technique: "Axial T1, T2, FLAIR, DWI, ADC and coronal T2 weighted sequences of the brain.",
      findings:
        "No evidence of acute cerebral infarction, intracranial hemorrhage, or space-occupying lesion.\nVentricles, sulci, and basal cisterns are within normal age-appropriate limits.\nNo midline shift or herniation.\nMastoid air cells and paranasal sinuses are clear.",
      impression: "Normal MRI of the brain. No intracranial abnormality detected."
    },
    NORMAL_USG_ABDOMEN: {
      title: "Normal USG Whole Abdomen",
      technique: "High-resolution real-time B-mode and color Doppler ultrasonography of abdomen & pelvis.",
      findings:
        "Liver is normal in size and parenchymal echogenicity. No focal lesion.\nGallbladder is well-distended with thin, smooth walls. No calculi or sludge.\nPancreas and spleen are normal.\nBoth kidneys are normal in size, shape, and cortical thickness. No hydronephrosis or calculi.\nUrinary bladder is normal with smooth wall margins.",
      impression: "Normal ultrasonogram of the abdomen and pelvis."
    },
    PNEUMONIA_CHEST: {
      title: "Pneumonia / Consolidation",
      technique: "PA and lateral views of the chest.",
      findings:
        "Patchy alveolar consolidation with air bronchograms identified in the right middle and lower lobes.\nCardiothoracic ratio is normal.\nMinimal right reactive pleural effusion present.\nLeft lung field is clear without active infiltration.",
      impression: "Right lower and middle lobe consolidation consistent with acute lobar pneumonia.",
      recommendations: "Clinical correlation and follow-up radiograph post antibiotic therapy recommended."
    }
  };

  const loadData = async () => {
    try {
      const res = await fetch("/api/radiology/studies");
      const data = await res.json();
      if (data.success) {
        const list = data.data || [];
        setStudies(list);

        let initial = null;
        if (preselectedId) {
          initial = list.find((s: any) => s._id === preselectedId);
        }
        if (!initial && list.length > 0) {
          initial = list.find((s: any) => s.status !== "FINALIZED") || list[0];
        }

        if (initial) {
          setSelectedStudy(initial);
          setReportData({
            technique: initial.technique || "Standard diagnostic imaging protocol.",
            findings: initial.findings || "",
            impression: initial.impression || "",
            recommendations: initial.recommendations || "",
            isCritical: initial.isCritical || false,
            criticalNotifiedTo: initial.criticalNotifiedTo || ""
          });
        }
      }
    } catch (e) {
      toast("Failed to load studies for reporting", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyTemplate = (key: string) => {
    const tpl = templates[key];
    if (tpl) {
      setReportData((prev) => ({
        ...prev,
        technique: tpl.technique,
        findings: tpl.findings,
        impression: tpl.impression,
        recommendations: tpl.recommendations || prev.recommendations
      }));
      toast(`Applied "${tpl.title}" template!`, "info");
    }
  };

  const handleStudySelect = (studyId: string) => {
    const s = studies.find((item) => item._id === studyId);
    if (s) {
      setSelectedStudy(s);
      setReportData({
        technique: s.technique || "Standard diagnostic imaging protocol.",
        findings: s.findings || "",
        impression: s.impression || "",
        recommendations: s.recommendations || "",
        isCritical: s.isCritical || false,
        criticalNotifiedTo: s.criticalNotifiedTo || ""
      });
    }
  };

  const handleSaveReport = async (submitForVerify = false) => {
    if (!selectedStudy) return;
    if (!reportData.findings || !reportData.impression) {
      toast("Please enter both Findings and Diagnostic Impression", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...reportData,
        status: submitForVerify ? "REPORT_DRAFTED" : "REPORT_DRAFTED"
      };

      const res = await fetch(`/api/radiology/studies/${selectedStudy._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Diagnostic report saved successfully!", "success");
        if (submitForVerify) {
          router.push(`/radiology/verify`);
        } else {
          loadData();
        }
      } else {
        toast(data.message || "Failed to save report", "error");
      }
    } catch (e) {
      toast("Error saving report", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileEdit className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            Radiologist Diagnostic Reporting & Dictation
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Structured reporting desk with organ templates, critical finding alerts, and diagnostic impressions.
          </p>
        </div>

        {selectedStudy && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1.5"
              onClick={() => router.push(`/radiology/images?studyId=${selectedStudy._id}`)}
            >
              <Images className="h-4 w-4 text-indigo-600" />
              Open PACS Viewer
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={saving}
              onClick={() => handleSaveReport(false)}
              className="text-xs flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>

            <Button
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 text-xs"
              disabled={saving}
              onClick={() => handleSaveReport(true)}
            >
              <ShieldCheck className="h-4 w-4" />
              {saving ? "Submitting..." : "Send to Verification Desk"}
            </Button>
          </div>
        )}
      </div>

      {/* Main Grid: Selector & Dictation Form */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Study Selector & Quick Templates (1 Col) */}
        <div className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="p-3 pb-2 border-b">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Study for Reporting
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3 text-xs">
              <Select
                value={selectedStudy?._id || ""}
                onChange={(e) => handleStudySelect(e.target.value)}
                className="h-9 text-xs w-full"
              >
                {studies.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.accessionNumber} — {s.patient?.name} ({s.modality})
                  </option>
                ))}
              </Select>

              {selectedStudy && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border space-y-1.5 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {selectedStudy.patient?.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    UHID: {selectedStudy.patient?.uhid}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {selectedStudy.modality} • {selectedStudy.bodyPart}
                  </div>
                  <div className="pt-1">
                    <Badge variant="outline" className="text-[10px]">
                      {selectedStudy.status}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Structured Templates */}
          <Card className="border shadow-sm">
            <CardHeader className="p-3 pb-2 border-b">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                Structured Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleApplyTemplate("NORMAL_CHEST")}
              >
                Normal Chest X-Ray
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleApplyTemplate("NORMAL_BRAIN_MRI")}
              >
                Normal Brain MRI
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleApplyTemplate("NORMAL_USG_ABDOMEN")}
              >
                Normal USG Abdomen
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleApplyTemplate("PNEUMONIA_CHEST")}
              >
                Pneumonia Consolidation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Dictation Workstation (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Diagnostic Report Content</CardTitle>
              <CardDescription>
                Detailed observations, anatomic descriptions, conclusion, and critical alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="technique" className="text-xs font-semibold">
                  Examination Technique
                </Label>
                <Input
                  id="technique"
                  value={reportData.technique}
                  onChange={(e) => setReportData({ ...reportData, technique: e.target.value })}
                  placeholder="e.g. Standard PA view obtained in full inspiration..."
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="findings" className="text-xs font-semibold">
                  Radiological Findings *
                </Label>
                <Textarea
                  id="findings"
                  rows={6}
                  value={reportData.findings}
                  onChange={(e) => setReportData({ ...reportData, findings: e.target.value })}
                  placeholder="Detailed organ-by-organ radiological observations..."
                  className="text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="impression" className="text-xs font-semibold">
                  Diagnostic Impression (Conclusion) *
                </Label>
                <Textarea
                  id="impression"
                  rows={3}
                  value={reportData.impression}
                  onChange={(e) => setReportData({ ...reportData, impression: e.target.value })}
                  placeholder="Summary diagnostic interpretation..."
                  className="text-xs font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="recs" className="text-xs font-semibold">
                  Recommendations / Suggested Follow-up
                </Label>
                <Input
                  id="recs"
                  value={reportData.recommendations}
                  onChange={(e) => setReportData({ ...reportData, recommendations: e.target.value })}
                  placeholder="e.g. Follow-up CT scan recommended in 3 weeks if symptoms persist."
                  className="h-9 text-xs"
                />
              </div>

              {/* Critical Alert Escalation */}
              <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 dark:border-rose-900 space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="critCheck"
                    checked={reportData.isCritical}
                    onChange={(e) => setReportData({ ...reportData, isCritical: e.target.checked })}
                    className="rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                  />
                  <Label htmlFor="critCheck" className="text-xs font-bold text-rose-700 dark:text-rose-300 cursor-pointer flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                    Critical Finding / STAT Alert (Tension Pneumothorax, Acute Hemorrhage, Bowel Perforation)
                  </Label>
                </div>

                {reportData.isCritical && (
                  <div className="pt-2">
                    <Label htmlFor="critNotif" className="text-[11px] font-medium text-rose-600 block mb-1">
                      Critical Result Verbally Communicated To (Doctor Name / Ward Nurse):
                    </Label>
                    <Input
                      id="critNotif"
                      value={reportData.criticalNotifiedTo}
                      onChange={(e) => setReportData({ ...reportData, criticalNotifiedTo: e.target.value })}
                      placeholder="e.g. Dr. Roy (ER Resident) at 14:15 hrs"
                      className="h-8 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
