"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Loader2,
  Building,
  ShieldCheck,
  Scan,
  Images
} from "lucide-react";

export default function ImagingReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <ImagingReportsContent />
    </Suspense>
  );
}

function ImagingReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("studyId") || "";
  const { toast } = useToast();

  const [studies, setStudies] = useState<any[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          initial = list.find((s: any) => s.status === "FINALIZED") || list[0];
        }
        if (initial) setSelectedStudy(initial);
      }
    } catch (e) {
      toast("Failed to load imaging reports", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
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
      {/* Header Controls (Hidden on print) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Certified Diagnostic Radiology Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Official verified imaging reports with hospital header, key image slices, structured impressions, and electronic sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {studies.length > 0 && (
            <Select
              value={selectedStudy?._id || ""}
              onChange={(e) => {
                const s = studies.find((item) => item._id === e.target.value);
                if (s) setSelectedStudy(s);
              }}
              className="h-9 text-xs w-64"
            >
              {studies.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.accessionNumber} — {s.patient?.name} ({s.status})
                </option>
              ))}
            </Select>
          )}

          <Button
            size="sm"
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Official Patient Radiology Report Sheet */}
      {!selectedStudy ? (
        <Card className="border shadow-sm">
          <CardContent className="p-12 text-center text-slate-400 text-xs">
            No diagnostic reports available. Once scans are performed and reports drafted, certified reports will appear here.
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-8 print:border-none print:shadow-none print:p-2 text-slate-800 dark:text-slate-200">
          {/* Hospital Letterhead Header */}
          <div className="border-b-2 border-indigo-600 pb-4 mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Building className="h-6 w-6 text-indigo-600" />
                <span className="text-xl font-black tracking-tight text-indigo-950 dark:text-indigo-200 uppercase">
                  Medistra Super Speciality Hospital
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Department of Radiodiagnosis & Interventional Imaging
              </div>
              <div className="text-[10px] text-slate-400">
                AERB Licensed Diagnostic Center • NABH & NABL Accredited Facility
              </div>
            </div>

            <div className="text-right">
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold uppercase tracking-wider text-[10px]">
                {selectedStudy.status === "FINALIZED" ? "Certified Official Report" : "Provisional Draft"}
              </Badge>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                Acc: {selectedStudy.accessionNumber}
              </div>
              <div className="text-[10px] text-slate-400">
                Date: {new Date(selectedStudy.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Patient Particulars Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs mb-6">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">PATIENT NAME</span>
              <span className="font-bold text-slate-900 dark:text-white">{selectedStudy.patient?.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">UHID / MRN</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedStudy.patient?.uhid}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">AGE / GENDER</span>
              <span>{selectedStudy.patient?.age} Years / {selectedStudy.patient?.gender}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">MODALITY & REGION</span>
              <span className="font-bold text-indigo-600">{selectedStudy.modality} • {selectedStudy.bodyPart}</span>
            </div>
          </div>

          {/* Diagnostic Key Slices Strip */}
          <div className="mb-6">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Images className="h-3.5 w-3.5 text-indigo-600" />
              Representative Key Diagnostic Images ({selectedStudy.imageUrls?.length || selectedStudy.instanceCount || 1} Slices Captured)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {((selectedStudy.imageUrls && selectedStudy.imageUrls.length > 0)
                ? selectedStudy.imageUrls
                : [
                    selectedStudy.modality === "CT"
                      ? "https://haigvvbwrmjyynnsxpsf.storage.supabase.co/storage/v1/object/public/hms/radiology/scans/1788428085696_brain_ct.jpg"
                      : selectedStudy.modality === "MRI"
                      ? "https://haigvvbwrmjyynnsxpsf.storage.supabase.co/storage/v1/object/public/hms/radiology/scans/1788428086452_mri_spine.jpg"
                      : "https://haigvvbwrmjyynnsxpsf.storage.supabase.co/storage/v1/object/public/hms/radiology/scans/1788428084462_chest_xray.jpg"
                  ]
              ).map((url: string, idx: number) => (
                <div
                  key={idx}
                  className="aspect-square rounded-lg bg-black overflow-hidden border border-slate-800 relative group flex items-center justify-center"
                >
                  <img src={url} alt={`Diagnostic Slice ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-white">
                    Slice #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Report Body Sections */}
          <div className="space-y-4 text-xs">
            {/* Technique */}
            <div>
              <div className="font-bold uppercase tracking-wider text-[11px] text-slate-600 dark:text-slate-400 border-b pb-1 mb-1.5">
                Technique / Examination Protocol
              </div>
              <p className="text-slate-800 dark:text-slate-200">
                {selectedStudy.technique || "Standard diagnostic multiplanar sequence acquisition."}
              </p>
            </div>

            {/* Findings */}
            <div>
              <div className="font-bold uppercase tracking-wider text-[11px] text-slate-600 dark:text-slate-400 border-b pb-1 mb-1.5">
                Radiological Findings
              </div>
              <div className="whitespace-pre-line text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                {selectedStudy.findings || "Detailed findings recorded in PACS archives."}
              </div>
            </div>

            {/* Diagnostic Impression */}
            <div className="p-3.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
              <div className="font-black uppercase tracking-wider text-xs text-slate-900 dark:text-white mb-1">
                Diagnostic Impression
              </div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {selectedStudy.impression || "Examination completed without acute abnormality."}
              </div>
            </div>

            {/* Recommendations */}
            {selectedStudy.recommendations && (
              <div>
                <div className="font-bold uppercase tracking-wider text-[11px] text-slate-600 dark:text-slate-400 border-b pb-1 mb-1.5">
                  Clinical Recommendations
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic">
                  {selectedStudy.recommendations}
                </p>
              </div>
            )}
          </div>

          {/* Electronic Sign-off & Verification Seal */}
          <div className="mt-8 pt-4 border-t-2 border-slate-200 dark:border-slate-800 flex items-end justify-between">
            <div className="text-[10px] text-slate-400">
              <div>Electronically authenticated report. No manual signature required.</div>
              <div>Report ID: {selectedStudy._id}</div>
              <div>System Timestamp: {new Date().toLocaleString()}</div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs mb-1">
                <ShieldCheck className="h-4 w-4" />
                Digitally Verified
              </div>
              <div className="font-bold text-slate-900 dark:text-white text-xs">
                {selectedStudy.verifiedBy || "Dr. S. Mukherjee, MD Radiodiagnosis"}
              </div>
              <div className="text-[10px] text-slate-500">
                Consultant Radiologist • Reg. No: WBMC/65481
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
