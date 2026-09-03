"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import {
  ArrowRightLeft,
  BedDouble,
  User,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Loader2,
  AlertCircle
} from "lucide-react";

export default function WardBedTransferPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <WardBedTransferContent />
    </Suspense>
  );
}

function WardBedTransferContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAdmissionId = searchParams.get("admissionId") || "";
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeAdmissions, setActiveAdmissions] = useState<any[]>([]);
  const [availableBeds, setAvailableBeds] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [recentTransfers, setRecentTransfers] = useState<any[]>([]);

  // Form state
  const [selectedAdmissionId, setSelectedAdmissionId] = useState(initialAdmissionId);
  const [targetBedId, setTargetBedId] = useState("");
  const [targetDoctorId, setTargetDoctorId] = useState("");
  const [transferReason, setTransferReason] = useState("Condition Improved - Step Down");
  const [transferDate, setTransferDate] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState("");

  const loadData = async () => {
    try {
      // 1. Fetch active admissions
      const aRes = await fetch("/api/admission?status=ACTIVE");
      const aData = await aRes.json();
      if (aData.success && Array.isArray(aData.data)) {
        setActiveAdmissions(aData.data);
        if (initialAdmissionId) {
          const match = aData.data.find((a: any) => a._id === initialAdmissionId);
          if (match) {
            setSelectedAdmissionId(match._id);
            setTargetDoctorId(match.doctorId?._id || match.doctorId || "");
          }
        }
      }

      // 2. Fetch available beds
      const bRes = await fetch("/api/bed?status=AVAILABLE");
      const bData = await bRes.json();
      if (bData.success && Array.isArray(bData.data)) {
        setAvailableBeds(bData.data);
      }

      // 3. Fetch doctors
      const dRes = await fetch("/api/user");
      const dData = await dRes.json();
      if (dData.success && Array.isArray(dData.data)) {
        setDoctors(dData.data);
      }

      // 4. Fetch recent transfers from all admissions
      const allRes = await fetch("/api/admission");
      const allData = await allRes.json();
      if (allData.success && Array.isArray(allData.data)) {
        const transfers: any[] = [];
        allData.data.forEach((adm: any) => {
          if (adm.transferHistory && Array.isArray(adm.transferHistory)) {
            adm.transferHistory.forEach((t: any) => {
              transfers.push({
                ...t,
                patientName: adm.patientId?.name || "Unknown",
                patientUhid: adm.patientId?.uhid || "N/A",
                admissionId: adm._id
              });
            });
          }
        });
        transfers.sort(
          (a, b) => new Date(b.transferDate).getTime() - new Date(a.transferDate).getTime()
        );
        setRecentTransfers(transfers.slice(0, 10));
      }
    } catch (err) {
      toast("Failed to load bed transfer data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentAdmission = useMemo(() => {
    return activeAdmissions.find((a) => a._id === selectedAdmissionId);
  }, [activeAdmissions, selectedAdmissionId]);

  const handlePatientSelect = (admissionId: string) => {
    setSelectedAdmissionId(admissionId);
    const adm = activeAdmissions.find((a) => a._id === admissionId);
    if (adm) {
      setTargetDoctorId(adm.doctorId?._id || adm.doctorId || "");
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmissionId) {
      toast("Please select a patient to transfer", "error");
      return;
    }
    if (!targetBedId) {
      toast("Please select a destination bed", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        admissionId: selectedAdmissionId,
        toBedId: targetBedId,
        toDoctorId: targetDoctorId || undefined,
        reason: transferReason,
        transferDate: new Date(transferDate).toISOString(),
        notes: notes.trim() || undefined
      };

      const res = await fetch("/api/admission/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok && result.success) {
        toast("Patient transferred to new bed successfully!", "success");
        setTargetBedId("");
        setNotes("");
        loadData();
      } else {
        toast(result.message || "Failed to transfer bed", "error");
      }
    } catch (err) {
      toast("An error occurred during bed transfer", "error");
    } finally {
      setSubmitting(false);
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
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeft className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Bed Transfer Workstation
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Transfer inpatients between hospital beds, wards, and rooms with automatic bed release and occupation.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loadData()}
          className="flex items-center gap-1.5"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Transfer Form Card */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Initiate Bed Transfer</CardTitle>
          <CardDescription>
            Select the inpatient, choose an available destination bed, and confirm the handover.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTransferSubmit} className="space-y-6 text-xs">
            {/* Step 1: Select Patient */}
            <div className="space-y-1.5">
              <Label htmlFor="admissionSelect" className="text-xs font-semibold">
                Select Active Inpatient to Transfer *
              </Label>
              <Select
                id="admissionSelect"
                value={selectedAdmissionId}
                onChange={(e) => handlePatientSelect(e.target.value)}
                required
                className="w-full text-xs h-9"
              >
                <option value="">-- Choose Admitted Patient --</option>
                {activeAdmissions.map((adm) => (
                  <option key={adm._id} value={adm._id}>
                    {adm.patientId?.name} ({adm.patientId?.uhid || "No UHID"}) — Currently in Bed{" "}
                    {adm.bedId?.bedNumber || "Unassigned"} ({adm.bedId?.roomId?.wardId?.wardName || "General"})
                  </option>
                ))}
              </Select>
            </div>

            {/* Current Bed & Location Summary Card */}
            {currentAdmission && (
              <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                    <span className="font-bold text-slate-900 dark:text-white">
                      {currentAdmission.patientId?.name}
                    </span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {currentAdmission.patientId?.uhid}
                    </Badge>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300">
                    Currently Admitted
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                      Current Bed
                    </span>
                    <span className="font-bold text-purple-700 dark:text-purple-300">
                      Bed {currentAdmission.bedId?.bedNumber || "None"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                      Ward & Room
                    </span>
                    <span className="font-medium">
                      {currentAdmission.bedId?.roomId?.wardId?.wardName || "General"} • Room{" "}
                      {currentAdmission.bedId?.roomId?.roomNumber || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                      Attending Doctor
                    </span>
                    <span className="font-medium">
                      Dr. {currentAdmission.doctorId?.name || "Attending"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                      Admitted On
                    </span>
                    <span className="font-medium">
                      {new Date(currentAdmission.admissionDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Destination Bed & Doctor Reassignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="targetBed" className="text-xs font-semibold flex items-center gap-1.5">
                  <BedDouble className="h-3.5 w-3.5 text-emerald-600" />
                  Target Destination Bed *
                </Label>
                <Select
                  id="targetBed"
                  value={targetBedId}
                  onChange={(e) => setTargetBedId(e.target.value)}
                  required
                  className="w-full text-xs h-9"
                >
                  <option value="">-- Choose Available Bed --</option>
                  {availableBeds.map((bed) => (
                    <option key={bed._id} value={bed._id}>
                      Bed {bed.bedNumber} — Room {bed.roomId?.roomNumber || "N/A"} (
                      {bed.roomId?.wardId?.wardName || "General Ward"}) • Type: {bed.bedType}
                    </option>
                  ))}
                </Select>
                <p className="text-[10px] text-slate-400">
                  {availableBeds.length} vacant beds ready for transfer.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="targetDoctor" className="text-xs font-semibold flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-blue-600" />
                  Attending Doctor (Optional Reassignment)
                </Label>
                <Select
                  id="targetDoctor"
                  value={targetDoctorId}
                  onChange={(e) => setTargetDoctorId(e.target.value)}
                  className="w-full text-xs h-9"
                >
                  <option value="">-- Keep Current Doctor --</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      Dr. {doc.name} ({doc.email})
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Step 3: Transfer Reason & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="transferReason" className="text-xs font-semibold">
                  Transfer Clinical Reason *
                </Label>
                <Select
                  id="transferReason"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  required
                  className="w-full text-xs h-9"
                >
                  <option value="Condition Improved - Step Down">Condition Improved - Step Down</option>
                  <option value="ICU / High Dependency Escalation">ICU / High Dependency Escalation</option>
                  <option value="Post-Operative Recovery">Post-Operative Recovery</option>
                  <option value="Patient / Family Request">Patient / Family Request</option>
                  <option value="Infection Control / Isolation">Infection Control / Isolation</option>
                  <option value="Ward Maintenance / Cleaning">Ward Maintenance / Cleaning</option>
                  <option value="Other Clinical Reason">Other Clinical Reason</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="transferDate" className="text-xs font-semibold">
                  Transfer Date & Time *
                </Label>
                <Input
                  type="datetime-local"
                  id="transferDate"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  required
                  className="text-xs h-9"
                />
              </div>
            </div>

            {/* Step 4: Handover Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="transferNotes" className="text-xs font-semibold">
                Clinical Handover Notes / Ward Instructions
              </Label>
              <Textarea
                id="transferNotes"
                rows={3}
                placeholder="Document patient vitals, oxygen support, IV lines, or special nursing requirements for receiving ward staff..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAdmissionId("");
                  setTargetBedId("");
                  setNotes("");
                }}
              >
                Reset
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-purple-600 hover:bg-purple-700 text-white min-w-[160px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirm Bed Transfer
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recent Transfers Audit Log */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Bed Transfers Log</CardTitle>
          <CardDescription>
            Audit ledger of patient movements across facility beds and wards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Details</TableHead>
                  <TableHead>Movement (From → To)</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Physician</TableHead>
                  <TableHead>Transfer Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 py-10 text-xs">
                      No recent bed transfers recorded.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentTransfers.map((t: any, idx: number) => (
                    <TableRow key={idx} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {t.patientName}
                        </div>
                        <div className="text-[10px] text-slate-500">{t.patientUhid}</div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 font-medium">
                          <span className="text-rose-600 font-mono">
                            Bed {t.fromBedId?.bedNumber || "Previous"}
                          </span>
                          <ArrowRight className="h-3 w-3 text-slate-400" />
                          <span className="text-emerald-600 font-mono">
                            Bed {t.toBedId?.bedNumber || "New"}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {t.toBedId?.roomId?.wardId?.wardName || "General Ward"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {t.reason || "Ward Transfer"}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                        Dr. {t.toDoctorId?.name || t.fromDoctorId?.name || "Attending"}
                      </TableCell>

                      <TableCell className="text-slate-500 text-[11px]">
                        {new Date(t.transferDate).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short"
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
