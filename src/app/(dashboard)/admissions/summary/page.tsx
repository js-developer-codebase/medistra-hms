"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import {
  FileText,
  Printer,
  ArrowLeft,
  Share2,
  Calendar,
  Bed,
  User,
  Activity,
  CheckCircle2,
  Shield,
  Phone,
  Building,
  Loader2
} from "lucide-react";

export default function DischargeSummaryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <DischargeSummaryContent />
    </Suspense>
  );
}

function DischargeSummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlId = searchParams.get("id") || "";
  const { toast } = useToast();

  const [dischargedAdmissions, setDischargedAdmissions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState(urlId);
  const [admission, setAdmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingDetail, setFetchingDetail] = useState(false);

  // Fetch list of discharged admissions
  useEffect(() => {
    async function loadDischarged() {
      try {
        const res = await fetch("/api/admission?status=DISCHARGED");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setDischargedAdmissions(data.data);
          // If no id in URL, pick the first one
          if (!urlId && data.data.length > 0) {
            setSelectedId(data.data[0]._id);
          }
        }
      } catch (err) {
        toast("Failed to load discharged patient records", "error");
      } finally {
        setLoading(false);
      }
    }
    loadDischarged();
  }, [urlId]);

  // Fetch full details of the selected admission
  useEffect(() => {
    if (!selectedId) return;
    async function fetchAdmissionDetail() {
      setFetchingDetail(true);
      try {
        const res = await fetch(`/api/admission/${selectedId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setAdmission(data.data);
        } else {
          toast("Failed to load admission details", "error");
        }
      } catch (err) {
        toast("An error occurred while loading summary", "error");
      } finally {
        setFetchingDetail(false);
      }
    }
    fetchAdmissionDetail();
  }, [selectedId]);

  const handlePrint = () => {
    window.print();
  };

  const getDurationText = (admissionDate: string, dischargeDate?: string) => {
    if (!admissionDate) return "N/A";
    const start = new Date(admissionDate).getTime();
    const end = dischargeDate ? new Date(dischargeDate).getTime() : Date.now();
    const diffHours = Math.max(0, Math.floor((end - start) / (1000 * 60 * 60)));
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;
    if (days === 0) return `${hours} hours`;
    return `${days} days, ${hours} hours`;
  };

  if (loading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Top Action Bar (hidden during printing) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-slate-500"
              onClick={() => router.push("/admissions/discharge-history")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Discharge History
            </Button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 mt-1">
            <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Clinical Discharge Summary
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Official patient discharge summary sheet ready for review, export, and clean printing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {admission && (
            <Button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              Print Summary
            </Button>
          )}
        </div>
      </div>

      {/* Patient Selector Card (hidden during printing) */}
      <div className="print:hidden">
        <Card className="border shadow-sm p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Discharged Patient
              </span>
              <p className="text-xs text-slate-500">
                Choose from recently discharged patients to preview or print summary.
              </p>
            </div>
            <div className="w-full sm:w-80">
              <Select
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  router.push(`/admissions/summary?id=${e.target.value}`);
                }}
              >
                <option value="">-- Choose Discharged Patient --</option>
                {dischargedAdmissions.map((adm) => (
                  <option key={adm._id} value={adm._id}>
                    {adm.patientId?.name} ({adm.patientId?.uhid || "No UHID"}) —{" "}
                    {adm.dischargeDate ? new Date(adm.dischargeDate).toLocaleDateString() : ""}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Card>
      </div>

      {fetchingDetail ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : !admission ? (
        <Card className="p-12 text-center border">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 dark:text-white">
            No Discharge Record Selected
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Please select a discharged patient from the dropdown above to view their clinical discharge summary.
          </p>
        </Card>
      ) : (
        /* THE PRINTABLE DISCHARGE SUMMARY SHEET */
        <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-8 sm:p-10 space-y-6 print:border-none print:shadow-none print:p-0 print:m-0 print:text-black">
          {/* 1. Hospital Letterhead Header */}
          <div className="border-b-2 border-emerald-600 pb-4 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg print:bg-black">
                  M
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white print:text-black uppercase">
                    Medistra Healthcare & Research Institute
                  </h2>
                  <p className="text-xs text-slate-500 print:text-gray-600">
                    Tertiary Care & Multispecialty Inpatient Hospital • Reg No: MHRI-2026-9842
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 print:text-gray-600 mt-1">
                124 Healthcare Boulevard, Medical District • Phone: +1 (800) 555-0199 • Emergency: +1 (800) 555-911
              </p>
            </div>

            <div className="text-right">
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 text-xs font-bold px-3 py-1 print:border print:border-black print:text-black">
                DISCHARGE SUMMARY
              </Badge>
              <div className="text-[10px] text-slate-400 print:text-gray-500 mt-1 font-mono">
                Doc ID: {admission._id.slice(-8).toUpperCase()}
              </div>
            </div>
          </div>

          {/* 2. Patient Demographics & Admission Particulars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs print:bg-transparent print:border-gray-300">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-500 block">
                Patient Name
              </span>
              <span className="font-bold text-sm text-slate-900 dark:text-white print:text-black">
                {admission.patientId?.name}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-500 block">
                UHID / Medical Record #
              </span>
              <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400 print:text-black">
                {admission.patientId?.uhid || "N/A"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-500 block">
                Age / Gender
              </span>
              <span className="font-medium">
                {admission.patientId?.age} yrs / {admission.patientId?.gender}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-500 block">
                Blood Group
              </span>
              <span className="font-medium">{admission.patientId?.bloodGroup || "Not recorded"}</span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-500 block">
                Attending Consultant
              </span>
              <span className="font-semibold text-slate-900 dark:text-white print:text-black">
                Dr. {admission.doctorId?.name}
              </span>
              <span className="text-[11px] text-slate-500 print:text-gray-600 block">
                Inpatient Clinical Services ({admission.doctorId?.email})
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-500 block">
                Ward & Bed Vacated
              </span>
              <span className="font-medium">
                Bed {admission.bedId?.bedNumber} • Room {admission.bedId?.roomId?.roomNumber || "N/A"}
              </span>
              <span className="text-[10px] text-slate-500 print:text-gray-600 block">
                {admission.bedId?.roomId?.wardId?.wardName || "General Ward"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-500 block">
                Contact Phone
              </span>
              <span className="font-medium">{admission.patientId?.contact || "N/A"}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-500 block">
                Date of Admission
              </span>
              <span className="font-medium">
                {new Date(admission.admissionDate).toLocaleDateString()} at{" "}
                {new Date(admission.admissionDate).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-500 block">
                Date of Discharge
              </span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400 print:text-black font-semibold">
                {admission.dischargeDate
                  ? new Date(admission.dischargeDate).toLocaleDateString() +
                    " at " +
                    new Date(admission.dischargeDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : "N/A"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-500 block">
                Total Length of Stay
              </span>
              <span className="font-medium font-mono">
                {getDurationText(admission.admissionDate, admission.dischargeDate)}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-500 block">
                Condition at Discharge
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 print:text-black">
                {admission.dischargeCondition || "RECOVERED"}
              </span>
            </div>
          </div>

          {/* 3. Diagnoses Block */}
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg print:border-gray-400 print:bg-gray-50">
              <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 print:text-black uppercase tracking-wider">
                Final Confirmed Diagnosis
              </div>
              <div className="font-bold text-base text-slate-900 dark:text-white print:text-black mt-0.5">
                {admission.finalDiagnosis || admission.initialDiagnosis || "Not recorded"}
              </div>
            </div>

            {admission.initialDiagnosis && admission.finalDiagnosis !== admission.initialDiagnosis && (
              <div className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold">Provisional / Admitting Diagnosis: </span>
                {admission.initialDiagnosis}
              </div>
            )}

            {admission.reasonForAdmission && (
              <div className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold">Chief Complaints / Presenting Symptoms: </span>
                {admission.reasonForAdmission}
              </div>
            )}
          </div>

          {/* 4. Clinical Course & Treatment Summary */}
          {admission.dischargeSummary && (
            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-800 dark:text-slate-200 border-b pb-1 print:border-black">
                Hospital Treatment Summary & Clinical Course
              </h4>
              <p className="whitespace-pre-line text-slate-700 dark:text-slate-300 print:text-black leading-relaxed">
                {admission.dischargeSummary}
              </p>
            </div>
          )}

          {/* 5. Discharge Medications Table */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-800 dark:text-slate-200 border-b pb-1 print:border-black">
              Discharge Medications & Prescriptions
            </h4>
            {admission.dischargeMedications && admission.dischargeMedications.length > 0 ? (
              <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden print:border-gray-400">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/60 print:bg-gray-100">
                      <TableHead className="w-10 text-center font-bold">#</TableHead>
                      <TableHead className="font-bold">Medication Name</TableHead>
                      <TableHead className="font-bold">Dosage</TableHead>
                      <TableHead className="font-bold">Frequency</TableHead>
                      <TableHead className="font-bold">Duration</TableHead>
                      <TableHead className="font-bold">Special Instructions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admission.dischargeMedications.map((med: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="text-center font-mono text-[11px]">{idx + 1}</TableCell>
                        <TableCell className="font-semibold text-slate-900 dark:text-white print:text-black">
                          {med.medicineName}
                        </TableCell>
                        <TableCell>{med.dosage || "1 dose"}</TableCell>
                        <TableCell>{med.frequency || "Daily"}</TableCell>
                        <TableCell>{med.duration || "5 days"}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-300 print:text-black">
                          {med.instructions || "After meals"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No discharge medications prescribed.</p>
            )}
          </div>

          {/* 6. Advice & Lifestyle Instructions */}
          {admission.dischargeAdvice && (
            <div className="space-y-1 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-800 dark:text-slate-200 border-b pb-1 print:border-black">
                Dietary & Activity Advice
              </h4>
              <p className="whitespace-pre-line text-slate-700 dark:text-slate-300 print:text-black leading-relaxed">
                {admission.dischargeAdvice}
              </p>
            </div>
          )}

          {/* 7. Follow-up & Emergency Warning Signs */}
          <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg text-xs space-y-1 print:border-gray-400 print:bg-gray-50">
            <div className="font-bold text-amber-900 dark:text-amber-300 print:text-black uppercase text-[11px]">
              Follow-Up & Review Instructions
            </div>
            {admission.followUpDate && (
              <div className="font-semibold text-slate-900 dark:text-white print:text-black">
                Scheduled Follow-up Date: {new Date(admission.followUpDate).toLocaleDateString()}
              </div>
            )}
            <div className="text-slate-700 dark:text-slate-300 print:text-black">
              {admission.followUpInstructions ||
                "Review in OPD within 7 days. Return to emergency immediately if high fever, acute pain, or bleeding occurs."}
            </div>
          </div>

          {/* 8. Doctor Signature Line */}
          <div className="pt-12 grid grid-cols-2 gap-8 text-xs border-t mt-8 print:border-black">
            <div className="space-y-1">
              <div className="w-48 border-b border-slate-400 dark:border-slate-600 pb-8 print:border-black"></div>
              <span className="font-bold block text-slate-900 dark:text-white print:text-black">
                Dr. {admission.doctorId?.name}
              </span>
              <span className="text-[10px] text-slate-500 print:text-gray-600 block">
                Attending Physician / Consultant
              </span>
            </div>

            <div className="space-y-1 text-right">
              <div className="w-48 ml-auto border-b border-slate-400 dark:border-slate-600 pb-8 print:border-black"></div>
              <span className="font-bold block text-slate-900 dark:text-white print:text-black">
                Authorized Hospital Medical Superintendent
              </span>
              <span className="text-[10px] text-slate-500 print:text-gray-600 block">
                Official Hospital Stamp & Seal
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
