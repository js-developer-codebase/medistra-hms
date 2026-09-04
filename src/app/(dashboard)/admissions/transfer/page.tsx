"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  Bed,
  User,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Loader2,
  AlertCircle
} from "lucide-react";

export default function PatientTransferPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <PatientTransferContent />
    </Suspense>
  );
}

function PatientTransferContent() {
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
      const bRes = await fetch("/api/bed");
      const bData = await bRes.json();
      if (bData.success && Array.isArray(bData.data)) {
        setAvailableBeds(bData.data.filter((b: any) => b.status === "AVAILABLE"));
      }

      // 3. Fetch doctors
      const dRes = await fetch("/api/user");
      const dData = await dRes.json();
      if (dData.success && Array.isArray(dData.data)) {
        setDoctors(dData.data);
      }

      // 4. Fetch all admissions to extract recent transfer logs
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
      toast("Failed to load transfer data", "error");
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
      toast("Please select an admitted patient to transfer", "error");
      return;
    }
    if (!targetBedId) {
      toast("Please select a destination bed", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        admissionId: selectedAdmissionId,
        newBedId: targetBedId,
        reason: transferReason,
        transferDate: new Date(transferDate).toISOString(),
        notes
      };

      if (targetDoctorId) {
        payload.newDoctorId = targetDoctorId;
      }

      const res = await fetch("/api/admission/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok && result.success) {
        toast("Patient transferred successfully. Beds have been updated.", "success");
        // Reset form
        setSelectedAdmissionId("");
        setTargetBedId("");
        setNotes("");
        // Reload data
        loadData();
      } else {
        toast(result.message || "Failed to transfer patient", "error");
      }
    } catch (err: any) {
      toast(err.message || "An error occurred during transfer", "error");
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
            <ArrowRightLeft className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Patient Transfer Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Transfer active inpatients between beds, rooms, wards, or reassign attending physicians.
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

      <form onSubmit={handleTransferSubmit} className="space-y-6">
        {/* Section 1: Patient Selection */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" />
              1. Select Inpatient to Transfer
            </CardTitle>
            <CardDescription>
              Choose from currently admitted inpatients ({activeAdmissions.length} active).
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admissionSelect">Select Admitted Patient *</Label>
              <Select
                id="admissionSelect"
                value={selectedAdmissionId}
                onChange={(e) => handlePatientSelect(e.target.value)}
                required
              >
                <option value="">-- Choose Patient Currently in Hospital Bed --</option>
                {activeAdmissions.map((adm) => (
                  <option key={adm._id} value={adm._id}>
                    {adm.patientId?.name} ({adm.patientId?.uhid || "No UHID"}) — Currently in Bed{" "}
                    {adm.bedId?.bedNumber || "N/A"} [
                    {adm.bedId?.roomId?.wardId?.wardName || "General Ward"}]
                  </option>
                ))}
              </Select>
            </div>

            {/* Current Assignment Card */}
            {currentAdmission && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Patient</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {currentAdmission.patientId?.name}
                  </span>
                  <div className="text-slate-500">
                    {currentAdmission.patientId?.uhid} • {currentAdmission.patientId?.gender},{" "}
                    {currentAdmission.patientId?.age}y
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block">Current Location</span>
                  <span className="font-bold text-sm text-rose-600 dark:text-rose-400">
                    Bed {currentAdmission.bedId?.bedNumber || "N/A"} ({currentAdmission.bedId?.bedType || "Normal"})
                  </span>
                  <div className="text-slate-500">
                    Room {currentAdmission.bedId?.roomId?.roomNumber || "N/A"} •{" "}
                    {currentAdmission.bedId?.roomId?.wardId?.wardName || "General Ward"}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block">Current Attending Doctor</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    Dr. {currentAdmission.doctorId?.name || "Attending"}
                  </span>
                  <div className="text-slate-500">
                    Admitted: {new Date(currentAdmission.admissionDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Destination Bed & Doctor */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building className="h-4 w-4 text-emerald-600" />
              2. Destination Bed & Physician Assignment
            </CardTitle>
            <CardDescription>
              Select the new hospital bed to occupy and optional doctor re-assignment.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Destination Bed */}
              <div className="space-y-1.5">
                <Label htmlFor="targetBedId">
                  Destination Bed * ({availableBeds.length} available beds)
                </Label>
                <Select
                  id="targetBedId"
                  value={targetBedId}
                  onChange={(e) => setTargetBedId(e.target.value)}
                  required
                >
                  <option value="">-- Select Destination Bed --</option>
                  {availableBeds.map((b) => (
                    <option key={b._id} value={b._id}>
                      Bed {b.bedNumber} ({b.bedType}) - Room{" "}
                      {b.roomId?.roomNumber || "General"} [
                      {b.roomId?.wardId?.wardName || "General Ward"}]
                    </option>
                  ))}
                </Select>
                {availableBeds.length === 0 && (
                  <p className="text-xs text-rose-500 mt-1">
                    ⚠️ No beds currently marked as AVAILABLE. Please free a bed first.
                  </p>
                )}
              </div>

              {/* Doctor Reassignment */}
              <div className="space-y-1.5">
                <Label htmlFor="targetDoctorId">Attending Doctor (keep or reassign)</Label>
                <Select
                  id="targetDoctorId"
                  value={targetDoctorId}
                  onChange={(e) => setTargetDoctorId(e.target.value)}
                >
                  <option value="">-- Keep Current Attending Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      Dr. {d.name} ({d.email})
                    </option>
                  ))}
                </Select>
              </div>

              {/* Transfer Reason */}
              <div className="space-y-1.5">
                <Label htmlFor="transferReason">Reason for Transfer *</Label>
                <Select
                  id="transferReason"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  required
                >
                  <option value="Condition Improved - Step Down">Condition Improved - Step Down to General</option>
                  <option value="Condition Deteriorated - ICU Escalation">Condition Deteriorated - ICU Escalation</option>
                  <option value="Post-Operative Recovery Transfer">Post-Operative Recovery Transfer</option>
                  <option value="Ward Reassignment">Ward Reassignment</option>
                  <option value="Room Upgrade / Downgrade">Room Upgrade / Downgrade</option>
                  <option value="Patient / Family Request">Patient / Family Request</option>
                  <option value="Bed / Room Maintenance">Bed / Room Maintenance</option>
                  <option value="Attending Doctor Change">Attending Doctor Change</option>
                </Select>
              </div>

              {/* Transfer Date & Time */}
              <div className="space-y-1.5">
                <Label htmlFor="transferDate">Transfer Date & Time *</Label>
                <Input
                  type="datetime-local"
                  id="transferDate"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Handover Notes */}
            <div className="space-y-1.5 pt-2">
              <Label htmlFor="notes">Clinical Handover Notes / Transfer Instructions</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Reason for transfer, current patient condition, nursing handover notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admissions/current")}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={submitting || !selectedAdmissionId || !targetBedId}
            className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[160px]"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Process Transfer
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Recent Transfers Audit Log */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-600" />
            Recent Patient Transfers
          </CardTitle>
          <CardDescription>
            Audit log of patient transfers across hospital rooms and beds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Patient</TableHead>
                  <TableHead className="text-xs">From Bed</TableHead>
                  <TableHead className="text-xs"></TableHead>
                  <TableHead className="text-xs">To Bed</TableHead>
                  <TableHead className="text-xs">Reason</TableHead>
                  <TableHead className="text-xs">Transferred At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-8 text-xs">
                      No patient transfers recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentTransfers.map((t, idx) => (
                    <TableRow key={idx} className="text-xs">
                      <TableCell className="font-semibold text-slate-900 dark:text-white">
                        {t.patientName}
                        <div className="text-[10px] text-slate-500">{t.patientUhid}</div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-200">
                          Bed {t.fromBedId?.bedNumber || "Prior"}
                        </Badge>
                      </TableCell>

                      <TableCell className="w-6 text-center text-slate-400">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </TableCell>

                      <TableCell>
                        <Badge className="text-[10px] bg-emerald-100 text-emerald-800 border-emerald-300">
                          Bed {t.toBedId?.bedNumber || "New"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {t.reason}
                        </span>
                        {t.notes && (
                          <div className="text-[10px] text-slate-500 truncate max-w-xs">
                            {t.notes}
                          </div>
                        )}
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
