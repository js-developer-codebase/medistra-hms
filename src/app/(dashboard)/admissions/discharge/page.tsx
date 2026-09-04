"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  LogOut,
  Bed,
  Search,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  AlertCircle,
  RefreshCw,
  Loader2
} from "lucide-react";

interface MedicationItem {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function DischargePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <DischargeContent />
    </Suspense>
  );
}

function DischargeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAdmissionId = searchParams.get("admissionId") || "";
  const { toast } = useToast();

  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Discharge Dialog State
  const [dischargeOpen, setDischargeOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [dischargeDate, setDischargeDate] = useState(new Date().toISOString().slice(0, 16));
  const [dischargeCondition, setDischargeCondition] = useState("RECOVERED");
  const [finalDiagnosis, setFinalDiagnosis] = useState("");
  const [dischargeSummary, setDischargeSummary] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpInstructions, setFollowUpInstructions] = useState("");
  const [dischargeAdvice, setDischargeAdvice] = useState("");
  const [medications, setMedications] = useState<MedicationItem[]>([
    { medicineName: "", dosage: "", frequency: "Once daily", duration: "5 days", instructions: "After meals" }
  ]);

  // Post-discharge Success Modal
  const [completedAdmissionId, setCompletedAdmissionId] = useState<string | null>(null);

  const fetchAdmissions = async () => {
    try {
      const res = await fetch("/api/admission?status=ACTIVE");
      const result = await res.json();
      if (res.ok && result.success) {
        const list = result.data || [];
        setAdmissions(list);
        if (initialAdmissionId) {
          const match = list.find((a: any) => a._id === initialAdmissionId);
          if (match) {
            handleDischargeClick(match);
          }
        }
      } else {
        toast(result.message || "Failed to fetch admissions", "error");
      }
    } catch (err: any) {
      toast("An error occurred while fetching admissions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const handleDischargeClick = (admission: any) => {
    setSelectedAdmission(admission);
    setDischargeDate(new Date().toISOString().slice(0, 16));
    setDischargeCondition("RECOVERED");
    setFinalDiagnosis(admission.initialDiagnosis || admission.reasonForAdmission || "");
    setDischargeSummary("");
    setFollowUpDate("");
    setFollowUpInstructions("Review in OPD after 1 week. Contact emergency immediately in case of severe pain, fever, or breathlessness.");
    setDischargeAdvice("Take normal light diet. Avoid heavy lifting and strenuous physical activities for 2 weeks.");
    setMedications([
      { medicineName: "Paracetamol 650mg", dosage: "1 tab", frequency: "SOS (when needed)", duration: "3 days", instructions: "After food for pain/fever" }
    ]);
    setDischargeOpen(true);
  };

  // Medication row management
  const addMedicationRow = () => {
    setMedications((prev) => [
      ...prev,
      { medicineName: "", dosage: "", frequency: "Twice daily", duration: "5 days", instructions: "After meals" }
    ]);
  };

  const removeMedicationRow = (index: number) => {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof MedicationItem, val: string) => {
    setMedications((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleDischargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmission) return;

    if (!finalDiagnosis.trim()) {
      toast("Please enter the final confirmed diagnosis", "error");
      return;
    }

    setSubmitting(true);
    try {
      const validMedications = medications.filter((m) => m.medicineName.trim() !== "");

      const payload: any = {
        admissionId: selectedAdmission._id,
        dischargeDate: new Date(dischargeDate).toISOString(),
        dischargeCondition,
        finalDiagnosis,
        dischargeSummary,
        dischargeMedications: validMedications,
        followUpInstructions,
        dischargeAdvice
      };

      if (followUpDate) {
        payload.followUpDate = new Date(followUpDate).toISOString();
      }

      const res = await fetch("/api/admission/discharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok && result.success) {
        toast("Patient discharged successfully. Bed is now available.", "success");
        setCompletedAdmissionId(selectedAdmission._id);
        setDischargeOpen(false);
        fetchAdmissions(); // Refresh active list
      } else {
        toast(result.message || "Failed to discharge patient", "error");
      }
    } catch (err: any) {
      toast("An error occurred while discharging patient", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAdmissions = useMemo(() => {
    if (!searchQuery.trim()) return admissions;
    const q = searchQuery.toLowerCase().trim();
    return admissions.filter(
      (a) =>
        a.patientId?.name?.toLowerCase().includes(q) ||
        a.patientId?.uhid?.toLowerCase().includes(q) ||
        a.bedId?.bedNumber?.toLowerCase().includes(q) ||
        a.doctorId?.name?.toLowerCase().includes(q)
    );
  }, [admissions, searchQuery]);

  const getDurationText = (admissionDate: string) => {
    const start = new Date(admissionDate).getTime();
    const now = Date.now();
    const diffHours = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60)));
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;
    if (days === 0) return `${hours} hrs`;
    return `${days}d ${hours}h`;
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
            <LogOut className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            Patient Discharge Processing
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Process patient discharges, record final diagnoses, prescribe discharge medications, and free hospital beds.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchAdmissions()}
          className="flex items-center gap-1.5"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Search & Active Patient Roster */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold">Active Patients Eligible for Discharge</CardTitle>
            <CardDescription>
              Select an admitted patient to initiate their clinical discharge workflow ({admissions.length} active).
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search name, UHID, bed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Details</TableHead>
                  <TableHead>Ward & Bed</TableHead>
                  <TableHead>Attending Doctor</TableHead>
                  <TableHead>Admitted</TableHead>
                  <TableHead>Length of Stay</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-12 text-xs">
                      No admitted patients found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmissions.map((adm) => (
                    <TableRow key={adm._id} className="text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {adm.patientId?.name || "Unknown"}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {adm.patientId?.uhid || adm.patientId?.contact} • {adm.patientId?.gender},{" "}
                          {adm.patientId?.age}y
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-emerald-600">
                          Bed {adm.bedId?.bedNumber || "N/A"}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {adm.bedId?.roomId?.wardId?.wardName || "General Ward"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          Dr. {adm.doctorId?.name || "Attending"}
                        </div>
                      </TableCell>

                      <TableCell className="text-slate-500">
                        {new Date(adm.admissionDate).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {getDurationText(adm.admissionDate)}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 px-3 text-xs"
                          onClick={() => handleDischargeClick(adm)}
                        >
                          <LogOut className="h-3 w-3 mr-1" />
                          Initiate Discharge
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Complete Discharge Processing Modal */}
      <Dialog open={dischargeOpen} onOpenChange={setDischargeOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedAdmission && (
            <form onSubmit={handleDischargeSubmit}>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <LogOut className="h-5 w-5 text-rose-600" />
                  Process Patient Discharge
                </DialogTitle>
                <DialogDescription>
                  Completing this form will mark the patient as discharged, free Bed{" "}
                  {selectedAdmission.bedId?.bedNumber}, and create the discharge record.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 text-xs">
                {/* Patient Summary Card */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-3 border">
                  <div>
                    <span className="text-slate-500 block">Patient</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedAdmission.patientId?.name}
                    </span>
                    <div className="text-[10px] text-slate-400">{selectedAdmission.patientId?.uhid}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Bed Vacated</span>
                    <span className="font-bold text-emerald-600">
                      Bed {selectedAdmission.bedId?.bedNumber}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {selectedAdmission.bedId?.roomId?.wardId?.wardName || "General"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Stay Duration</span>
                    <span className="font-bold font-mono">
                      {getDurationText(selectedAdmission.admissionDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Physician</span>
                    <span className="font-bold">Dr. {selectedAdmission.doctorId?.name}</span>
                  </div>
                </div>

                {/* Section 1: Discharge Date & Condition */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="dischargeDate" className="text-xs font-semibold">
                      Discharge Date & Time *
                    </Label>
                    <Input
                      type="datetime-local"
                      id="dischargeDate"
                      value={dischargeDate}
                      onChange={(e) => setDischargeDate(e.target.value)}
                      required
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="dischargeCondition" className="text-xs font-semibold">
                      Condition at Discharge *
                    </Label>
                    <Select
                      id="dischargeCondition"
                      value={dischargeCondition}
                      onChange={(e) => setDischargeCondition(e.target.value)}
                      required
                      className="h-8 text-xs"
                    >
                      <option value="RECOVERED">Recovered (Full recovery)</option>
                      <option value="IMPROVED">Improved (Significant clinical progress)</option>
                      <option value="STABLE">Stable (Discharge on oral medications)</option>
                      <option value="TRANSFERRED">Transferred to another facility</option>
                      <option value="LAMA">LAMA (Left Against Medical Advice)</option>
                      <option value="ON_REQUEST">Discharged on Family Request</option>
                      <option value="DECEASED">Deceased / Expired</option>
                    </Select>
                  </div>
                </div>

                {/* Section 2: Final Diagnosis */}
                <div className="space-y-1">
                  <Label htmlFor="finalDiagnosis" className="text-xs font-semibold">
                    Final Confirmed Diagnosis *
                  </Label>
                  <Input
                    id="finalDiagnosis"
                    placeholder="e.g. Acute appendicitis post laparoscopic appendectomy, resolved..."
                    value={finalDiagnosis}
                    onChange={(e) => setFinalDiagnosis(e.target.value)}
                    required
                    className="h-8 text-xs font-medium"
                  />
                </div>

                {/* Section 3: Summary of Hospital Treatment */}
                <div className="space-y-1">
                  <Label htmlFor="dischargeSummary" className="text-xs font-semibold">
                    Clinical Hospital Course & Treatment Summary
                  </Label>
                  <Textarea
                    id="dischargeSummary"
                    rows={3}
                    placeholder="Brief description of presenting symptoms, procedures performed, IV antibiotics administered, and clinical progress..."
                    value={dischargeSummary}
                    onChange={(e) => setDischargeSummary(e.target.value)}
                    className="text-xs"
                  />
                </div>

                {/* Section 4: Discharge Medications */}
                <div className="space-y-2 border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Discharge Medications & Prescriptions
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addMedicationRow}
                      className="h-7 text-xs flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add Medicine
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {medications.map((med, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-800/40 p-2 rounded border">
                        <div className="col-span-4">
                          <Input
                            placeholder="Medicine Name & Strength"
                            value={med.medicineName}
                            onChange={(e) => updateMedication(idx, "medicineName", e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            placeholder="Dosage (e.g. 1 tab)"
                            value={med.dosage}
                            onChange={(e) => updateMedication(idx, "dosage", e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            placeholder="Freq (e.g. BD)"
                            value={med.frequency}
                            onChange={(e) => updateMedication(idx, "frequency", e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            placeholder="Duration & Instructions"
                            value={med.instructions}
                            onChange={(e) => updateMedication(idx, "instructions", e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="col-span-1 text-center">
                          {medications.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700"
                              onClick={() => removeMedicationRow(idx)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 5: Advice & Follow-up */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="followUpDate" className="text-xs font-semibold">
                      Follow-up Appointment Date
                    </Label>
                    <Input
                      type="date"
                      id="followUpDate"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="followUpInstructions" className="text-xs font-semibold">
                      Follow-up & Emergency Warning Signs
                    </Label>
                    <Input
                      id="followUpInstructions"
                      placeholder="e.g. Review in OPD on Monday. Return if fever > 101F..."
                      value={followUpInstructions}
                      onChange={(e) => setFollowUpInstructions(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="dischargeAdvice" className="text-xs font-semibold">
                    Dietary & Lifestyle Advice
                  </Label>
                  <Textarea
                    id="dischargeAdvice"
                    rows={2}
                    placeholder="Dietary restrictions, wound dressing schedule, mobilization advice..."
                    value={dischargeAdvice}
                    onChange={(e) => setDischargeAdvice(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setDischargeOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={submitting} className="min-w-[150px]">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Discharging...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirm & Discharge
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Post-Discharge Success Dialog */}
      <Dialog open={!!completedAdmissionId} onOpenChange={() => setCompletedAdmissionId(null)}>
        <DialogContent className="max-w-md text-center">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <DialogTitle className="text-lg font-bold">Patient Discharged Successfully</DialogTitle>
            <DialogDescription className="mt-1">
              The admission has been finalized, the bed has been released to AVAILABLE, and the clinical discharge summary has been generated.
            </DialogDescription>

            <div className="flex flex-col sm:flex-row gap-2 mt-6 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCompletedAdmissionId(null)}
              >
                Done
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5"
                onClick={() => {
                  const id = completedAdmissionId;
                  setCompletedAdmissionId(null);
                  router.push(`/admissions/summary?id=${id}`);
                }}
              >
                <FileText className="h-4 w-4" />
                View & Print Summary
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
