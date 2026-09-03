"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  Pill,
  Search,
  Plus,
  RefreshCw,
  Download,
  Eye,
  Trash2,
  Printer,
  Calendar,
  CheckCircle2,
  Loader2
} from "lucide-react";

interface MedicationRow {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function ClinicalPrescriptionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <ClinicalPrescriptionsContent />
    </Suspense>
  );
}

function ClinicalPrescriptionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patientId") || "";
  const { toast } = useToast();

  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: initialPatientId,
    doctorId: "",
    visitDate: new Date().toISOString().slice(0, 10),
    symptoms: "",
    diagnosis: "",
    followUpDate: "",
    notes: ""
  });

  const [medications, setMedications] = useState<MedicationRow[]>([
    { name: "", dosage: "1 Tablet", frequency: "Twice daily (BD)", duration: "5 days", instructions: "Take after meals" }
  ]);

  // View Rx Modal
  const [selectedRx, setSelectedRx] = useState<any>(null);

  const loadData = async () => {
    try {
      const [rxRes, patRes, docRes] = await Promise.all([
        fetch("/api/prescription"),
        fetch("/api/patient"),
        fetch("/api/user")
      ]);

      const [rxData, patData, docData] = await Promise.all([
        rxRes.json(),
        patRes.json(),
        docRes.json()
      ]);

      if (rxData.success) setPrescriptions(rxData.data || []);
      if (patData.success) {
        setPatients(patData.data || []);
        if (initialPatientId) setCreateOpen(true);
      }
      if (docData.success) setDoctors(docData.data || []);
    } catch (err) {
      toast("Failed to load prescriptions", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      { name: "", dosage: "1 Tablet", frequency: "Twice daily (BD)", duration: "5 days", instructions: "Take after meals" }
    ]);
  };

  const handleRemoveMedication = (index: number) => {
    if (medications.length === 1) return;
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedChange = (index: number, field: keyof MedicationRow, val: string) => {
    const updated = [...medications];
    updated[index][field] = val;
    setMedications(updated);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId) {
      toast("Please select both a patient and an attending doctor", "error");
      return;
    }

    const validMeds = medications.filter((m) => m.name.trim() !== "");
    if (validMeds.length === 0) {
      toast("Please specify at least one medication with a valid name", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        visitDate: new Date(formData.visitDate).toISOString(),
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : undefined,
        notes: formData.notes,
        medications: validMeds
      };

      const res = await fetch("/api/prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Electronic prescription created successfully!", "success");
        setCreateOpen(false);
        setFormData({
          patientId: "",
          doctorId: "",
          visitDate: new Date().toISOString().slice(0, 10),
          symptoms: "",
          diagnosis: "",
          followUpDate: "",
          notes: ""
        });
        setMedications([
          { name: "", dosage: "1 Tablet", frequency: "Twice daily (BD)", duration: "5 days", instructions: "Take after meals" }
        ]);
        loadData();
      } else {
        toast(data.message || "Failed to create prescription", "error");
      }
    } catch (err) {
      toast("An error occurred while saving prescription", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prescription?")) return;
    try {
      const res = await fetch(`/api/prescription/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Prescription deleted successfully", "success");
        loadData();
      } else {
        toast(data.message || "Failed to delete prescription", "error");
      }
    } catch (err) {
      toast("Error deleting prescription", "error");
    }
  };

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((rx) => {
      const q = searchQuery.toLowerCase().trim();
      const patName = (rx.patientId?.name || "").toLowerCase();
      const uhid = (rx.patientId?.uhid || "").toLowerCase();
      const diagnosis = (rx.diagnosis || "").toLowerCase();
      const docName = (rx.doctorId?.name || "").toLowerCase();
      const medMatch = rx.medications?.some((m: any) => m.name?.toLowerCase().includes(q));

      return (
        !q ||
        patName.includes(q) ||
        uhid.includes(q) ||
        diagnosis.includes(q) ||
        docName.includes(q) ||
        medMatch
      );
    });
  }, [prescriptions, searchQuery]);

  const exportCSV = () => {
    if (filteredPrescriptions.length === 0) {
      toast("No prescriptions to export", "error");
      return;
    }

    const headers = [
      "Visit Date",
      "Patient Name",
      "UHID",
      "Diagnosis",
      "Medications Count",
      "Attending Doctor",
      "Follow-Up Date"
    ];

    const rows = filteredPrescriptions.map((rx) => [
      `"${new Date(rx.visitDate).toLocaleDateString()}"`,
      `"${rx.patientId?.name || ""}"`,
      `"${rx.patientId?.uhid || ""}"`,
      `"${(rx.diagnosis || "").replace(/"/g, '""')}"`,
      rx.medications?.length || 0,
      `"Dr. ${rx.doctorId?.name || ""}"`,
      rx.followUpDate ? `"${new Date(rx.followUpDate).toLocaleDateString()}"` : "N/A"
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Prescriptions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Prescriptions exported successfully", "success");
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
            <Pill className="h-6 w-6 text-sky-600 dark:text-sky-400" />
            EMR Prescriptions & Medication Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Electronic prescription writing, dosage schedules, patient Rx history, and print-ready medication orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          <Button
            size="sm"
            className="bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Write Prescription
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search patient, UHID, diagnosis, medication name, doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Prescriptions Ledger</CardTitle>
          <CardDescription>
            Showing {filteredPrescriptions.length} of {prescriptions.length} issued prescriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visit Date</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Clinical Diagnosis</TableHead>
                  <TableHead>Prescribed Medications</TableHead>
                  <TableHead>Attending Doctor</TableHead>
                  <TableHead>Follow-Up</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No prescriptions found. Click "Write Prescription" to generate an Rx.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrescriptions.map((rx) => (
                    <TableRow key={rx._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono text-slate-500 whitespace-nowrap">
                        {new Date(rx.visitDate).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {rx.patientId?.name || "Unknown"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {rx.patientId?.uhid} • {rx.patientId?.gender}, {rx.patientId?.age}y
                        </div>
                      </TableCell>

                      <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                        {rx.diagnosis || "Clinical Review"}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {rx.medications?.length || 0} Drugs
                          </Badge>
                          <span className="text-[11px] text-slate-500 truncate max-w-xs">
                            {rx.medications?.map((m: any) => m.name).join(", ")}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="font-medium">
                        Dr. {rx.doctorId?.name || "Attending"}
                      </TableCell>

                      <TableCell className="font-mono text-slate-500">
                        {rx.followUpDate ? new Date(rx.followUpDate).toLocaleDateString() : "None"}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs flex items-center gap-1 text-sky-600 hover:text-sky-700"
                            onClick={() => setSelectedRx(rx)}
                          >
                            <Eye className="h-3 w-3" />
                            Rx Sheet
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700"
                            onClick={() => handleDelete(rx._id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Write Prescription Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Pill className="h-5 w-5 text-sky-600" />
                Write Electronic Prescription (Rx)
              </DialogTitle>
              <DialogDescription>
                Prescribe medications with specific dosage schedules, route, duration, and patient instructions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              {/* Patient, Doctor, Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="patient" className="text-xs font-semibold">
                    Patient *
                  </Label>
                  <Select
                    id="patient"
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    required
                    className="h-9 text-xs"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.uhid || p.contact})
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="doctor" className="text-xs font-semibold">
                    Attending Physician *
                  </Label>
                  <Select
                    id="doctor"
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    required
                    className="h-9 text-xs"
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map((d) => (
                      <option key={d._id} value={d._id}>
                        Dr. {d.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="visitDate" className="text-xs font-semibold">
                    Encounter Date *
                  </Label>
                  <Input
                    type="date"
                    id="visitDate"
                    value={formData.visitDate}
                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                    required
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Diagnosis & Symptoms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="diagnosis" className="text-xs font-semibold">
                    Diagnosis / Clinical Indication
                  </Label>
                  <Input
                    id="diagnosis"
                    placeholder="e.g. Upper Respiratory Tract Infection, Essential Hypertension"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="symptoms" className="text-xs font-semibold">
                    Presenting Symptoms
                  </Label>
                  <Input
                    id="symptoms"
                    placeholder="e.g. Productive cough, fever for 3 days, sore throat"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Dynamic Medications Table */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-sky-700 dark:text-sky-400">
                    Prescribed Medications & Dosages *
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs flex items-center gap-1 text-sky-600"
                    onClick={handleAddMedication}
                  >
                    <Plus className="h-3 w-3" />
                    Add Drug
                  </Button>
                </div>

                <div className="space-y-2">
                  {medications.map((med, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border items-end"
                    >
                      <div className="sm:col-span-4 space-y-1">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase">
                          Drug Name & Strength *
                        </span>
                        <Input
                          placeholder="e.g. Amoxicillin 500mg"
                          value={med.name}
                          onChange={(e) => handleMedChange(idx, "name", e.target.value)}
                          required
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase">
                          Dosage
                        </span>
                        <Input
                          placeholder="1 Tab / 5ml"
                          value={med.dosage}
                          onChange={(e) => handleMedChange(idx, "dosage", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase">
                          Frequency
                        </span>
                        <Input
                          placeholder="BD / TDS"
                          value={med.frequency}
                          onChange={(e) => handleMedChange(idx, "frequency", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase">
                          Duration
                        </span>
                        <Input
                          placeholder="5 days"
                          value={med.duration}
                          onChange={(e) => handleMedChange(idx, "duration", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center gap-1">
                        <Input
                          placeholder="Instructions"
                          value={med.instructions}
                          onChange={(e) => handleMedChange(idx, "instructions", e.target.value)}
                          className="h-8 text-xs"
                        />
                        {medications.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 shrink-0"
                            onClick={() => handleRemoveMedication(idx)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-up & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
                <div className="space-y-1.5">
                  <Label htmlFor="followUp" className="text-xs font-semibold">
                    Scheduled Follow-Up Date
                  </Label>
                  <Input
                    type="date"
                    id="followUp"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-semibold">
                    Special Advice / Dietary Precautions
                  </Label>
                  <Input
                    id="notes"
                    placeholder="e.g. Plenty of oral fluids, steam inhalation twice daily..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Rx...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Issue Prescription
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View / Print Rx Sheet Modal */}
      <Dialog open={!!selectedRx} onOpenChange={() => setSelectedRx(null)}>
        <DialogContent className="max-w-2xl">
          {selectedRx && (
            <div className="space-y-4 text-xs">
              <DialogHeader>
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      MEDISTRA HOSPITAL EMR
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Official Medical Prescription & Outpatient Advice
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs text-slate-500 block">
                      Rx #{selectedRx._id?.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Date: {new Date(selectedRx.visitDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </DialogHeader>

              {/* Patient & Doctor Header */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Patient Details
                  </span>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedRx.patientId?.name}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    UHID: {selectedRx.patientId?.uhid} • Age/Gender: {selectedRx.patientId?.age}y /{" "}
                    {selectedRx.patientId?.gender}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Contact: {selectedRx.patientId?.contact}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Prescribing Physician
                  </span>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    Dr. {selectedRx.doctorId?.name || "Medical Officer"}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Diagnosis: {selectedRx.diagnosis || "Clinical Condition"}
                  </div>
                </div>
              </div>

              {/* Medications List */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block text-sm flex items-center gap-1 text-sky-600">
                  <Pill className="h-4 w-4" /> ℞ Medications Prescribed
                </span>

                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/60 text-[11px]">
                        <TableHead>#</TableHead>
                        <TableHead>Medication Name</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Special Instructions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRx.medications?.map((m: any, idx: number) => (
                        <TableRow key={idx} className="text-xs">
                          <TableCell className="font-mono text-slate-400">{idx + 1}</TableCell>
                          <TableCell className="font-bold text-slate-900 dark:text-white">
                            {m.name}
                          </TableCell>
                          <TableCell className="font-medium">{m.dosage || "1 Tab"}</TableCell>
                          <TableCell>{m.frequency || "BD"}</TableCell>
                          <TableCell className="font-mono">{m.duration || "5d"}</TableCell>
                          <TableCell className="text-slate-500">{m.instructions || "After food"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Advice & Follow-up */}
              {(selectedRx.notes || selectedRx.followUpDate) && (
                <div className="p-3 border rounded-lg space-y-1 bg-sky-50/30 dark:bg-sky-950/20">
                  {selectedRx.notes && (
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Physician Advice:{" "}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">{selectedRx.notes}</span>
                    </div>
                  )}
                  {selectedRx.followUpDate && (
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Next Review / Follow-Up:{" "}
                      </span>
                      <span className="font-mono font-bold text-sky-700 dark:text-sky-300">
                        {new Date(selectedRx.followUpDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Doctor Signature Line */}
              <div className="flex justify-end pt-6">
                <div className="text-center w-48 border-t border-slate-300 dark:border-slate-700 pt-2">
                  <div className="font-bold text-slate-900 dark:text-white">
                    Dr. {selectedRx.doctorId?.name}
                  </div>
                  <div className="text-[10px] text-slate-400">Authorized Physician Signature</div>
                </div>
              </div>

              <DialogFooter className="flex justify-between items-center sm:justify-between pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5"
                  onClick={() => window.print()}
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Prescription
                </Button>

                <Button variant="outline" size="sm" onClick={() => setSelectedRx(null)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
