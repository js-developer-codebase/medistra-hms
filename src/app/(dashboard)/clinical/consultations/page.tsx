"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  Stethoscope,
  Search,
  Plus,
  RefreshCw,
  Download,
  FileText,
  User,
  Calendar,
  CheckCircle2,
  Loader2,
  Eye
} from "lucide-react";

export default function ConsultationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <ConsultationsContent />
    </Suspense>
  );
}

function ConsultationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patientId") || "";
  const { toast } = useToast();

  const [records, setRecords] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState("ALL");

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patient: initialPatientId,
    doctor: "",
    chiefComplaint: "",
    historyOfPresentIllness: "",
    objectiveFindings: "",
    assessment: "",
    plan: "",
    status: "Final"
  });

  // View Details Modal
  const [viewRecord, setViewRecord] = useState<any>(null);

  const loadData = async () => {
    try {
      const [recRes, patRes, docRes] = await Promise.all([
        fetch("/api/clinical/records?recordType=Consultation"),
        fetch("/api/patient"),
        fetch("/api/user")
      ]);

      const [recData, patData, docData] = await Promise.all([
        recRes.json(),
        patRes.json(),
        docRes.json()
      ]);

      if (recData.success) setRecords(recData.data || []);
      if (patData.success) {
        setPatients(patData.data || []);
        if (initialPatientId) {
          setCreateOpen(true);
        }
      }
      if (docData.success) setDoctors(docData.data || []);
    } catch (err) {
      toast("Failed to load consultations data", "error");
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

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient || !formData.chiefComplaint) {
      toast("Please select a patient and enter chief complaint", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        recordType: "Consultation",
        dateRecorded: new Date().toISOString()
      };

      const res = await fetch("/api/clinical/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Clinical consultation documented successfully!", "success");
        setCreateOpen(false);
        setFormData({
          patient: "",
          doctor: "",
          chiefComplaint: "",
          historyOfPresentIllness: "",
          objectiveFindings: "",
          assessment: "",
          plan: "",
          status: "Final"
        });
        loadData();
      } else {
        toast(data.error || "Failed to save consultation", "error");
      }
    } catch (err) {
      toast("An error occurred while saving consultation", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const patName = (r.patient?.name || "").toLowerCase();
      const uhid = (r.patient?.uhid || "").toLowerCase();
      const complaint = (r.chiefComplaint || "").toLowerCase();
      const assessment = (r.assessment || "").toLowerCase();
      const docName = (r.doctor?.name || "").toLowerCase();

      const matchesSearch =
        !q ||
        patName.includes(q) ||
        uhid.includes(q) ||
        complaint.includes(q) ||
        assessment.includes(q) ||
        docName.includes(q);

      let matchesDoctor = true;
      if (selectedDoctorFilter !== "ALL") {
        const dId = r.doctor?._id || r.doctor;
        matchesDoctor = dId === selectedDoctorFilter;
      }

      return matchesSearch && matchesDoctor;
    });
  }, [records, searchQuery, selectedDoctorFilter]);

  const exportCSV = () => {
    if (filteredRecords.length === 0) {
      toast("No consultations to export", "error");
      return;
    }

    const headers = [
      "Date",
      "Patient Name",
      "UHID",
      "Age",
      "Gender",
      "Attending Doctor",
      "Chief Complaint",
      "Assessment",
      "Plan",
      "Status"
    ];

    const rows = filteredRecords.map((r) => [
      `"${new Date(r.dateRecorded || r.createdAt).toLocaleDateString()}"`,
      `"${r.patient?.name || ""}"`,
      `"${r.patient?.uhid || ""}"`,
      r.patient?.age || "",
      r.patient?.gender || "",
      `"Dr. ${r.doctor?.name || ""}"`,
      `"${(r.chiefComplaint || "").replace(/"/g, '""')}"`,
      `"${(r.assessment || "").replace(/"/g, '""')}"`,
      `"${(r.plan || "").replace(/"/g, '""')}"`,
      r.status || "Final"
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Consultations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Consultations exported successfully", "success");
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
            <Stethoscope className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Clinical Consultations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Document and review patient clinical encounters, history of present illness, physical exams, and care plans.
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Consultation
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search patient name, UHID, chief complaint, doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="w-full sm:w-64">
              <Select
                value={selectedDoctorFilter}
                onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="ALL">All Attending Doctors</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    Dr. {d.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultations Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Consultation Encounters</CardTitle>
          <CardDescription>
            Showing {filteredRecords.length} of {records.length} clinical consultation documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Chief Complaint</TableHead>
                  <TableHead>Clinical Assessment</TableHead>
                  <TableHead>Attending Doctor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No consultation encounters found matching filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((r) => (
                    <TableRow key={r._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono text-slate-500 whitespace-nowrap">
                        {new Date(r.dateRecorded || r.createdAt).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short"
                        })}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {r.patient?.name || "Unknown"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {r.patient?.uhid} • {r.patient?.gender}, {r.patient?.age}y
                        </div>
                      </TableCell>

                      <TableCell className="max-w-xs font-medium text-slate-800 dark:text-slate-200">
                        {r.chiefComplaint || "Routine Checkup"}
                      </TableCell>

                      <TableCell className="max-w-xs truncate text-slate-600 dark:text-slate-400">
                        {r.assessment || "Pending Assessment"}
                      </TableCell>

                      <TableCell className="font-medium">
                        Dr. {r.doctor?.name || "Attending"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            r.status === "Final"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }
                        >
                          {r.status || "Final"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs flex items-center gap-1 text-emerald-600 hover:text-emerald-700 ml-auto"
                          onClick={() => setViewRecord(r)}
                        >
                          <Eye className="h-3 w-3" />
                          View
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

      {/* Create Consultation Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-emerald-600" />
                Document New Clinical Consultation
              </DialogTitle>
              <DialogDescription>
                Record patient symptoms, history of present illness, examination findings, and therapeutic plan.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              {/* Patient & Doctor Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="patientSelect" className="text-xs font-semibold">
                    Select Patient *
                  </Label>
                  <Select
                    id="patientSelect"
                    value={formData.patient}
                    onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
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
                  <Label htmlFor="doctorSelect" className="text-xs font-semibold">
                    Attending Physician
                  </Label>
                  <Select
                    id="doctorSelect"
                    value={formData.doctor}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map((d) => (
                      <option key={d._id} value={d._id}>
                        Dr. {d.name} ({d.email})
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Chief Complaint */}
              <div className="space-y-1.5">
                <Label htmlFor="chiefComplaint" className="text-xs font-semibold">
                  Chief Complaint / Reason for Encounter *
                </Label>
                <Input
                  id="chiefComplaint"
                  placeholder="e.g. Acute chest pain radiating to left arm for 2 hours, shortness of breath..."
                  value={formData.chiefComplaint}
                  onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>

              {/* History of Present Illness (HPI) */}
              <div className="space-y-1.5">
                <Label htmlFor="hpi" className="text-xs font-semibold">
                  History of Present Illness (HPI)
                </Label>
                <Textarea
                  id="hpi"
                  rows={2}
                  placeholder="Onset, duration, character, aggravating and relieving factors, associated symptoms..."
                  value={formData.historyOfPresentIllness}
                  onChange={(e) => setFormData({ ...formData, historyOfPresentIllness: e.target.value })}
                  className="text-xs"
                />
              </div>

              {/* Objective Findings */}
              <div className="space-y-1.5">
                <Label htmlFor="objectiveFindings" className="text-xs font-semibold">
                  Objective & Physical Examination Findings
                </Label>
                <Textarea
                  id="objectiveFindings"
                  rows={2}
                  placeholder="General condition, chest auscultation, abdominal palpation, neurological exam..."
                  value={formData.objectiveFindings}
                  onChange={(e) => setFormData({ ...formData, objectiveFindings: e.target.value })}
                  className="text-xs"
                />
              </div>

              {/* Assessment & Diagnosis */}
              <div className="space-y-1.5">
                <Label htmlFor="assessment" className="text-xs font-semibold">
                  Clinical Assessment & Working Diagnosis
                </Label>
                <Input
                  id="assessment"
                  placeholder="e.g. Suspected Acute Coronary Syndrome (NSTEMI) / Unstable Angina"
                  value={formData.assessment}
                  onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              {/* Treatment Plan */}
              <div className="space-y-1.5">
                <Label htmlFor="plan" className="text-xs font-semibold">
                  Management Plan / Therapeutic Orders
                </Label>
                <Textarea
                  id="plan"
                  rows={2}
                  placeholder="Diagnostic orders (ECG, Troponin-I), medications prescribed, observation instructions..."
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs font-semibold">
                  Document Status
                </Label>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="h-9 text-xs w-48"
                >
                  <option value="Final">Final (Signed / Completed)</option>
                  <option value="Draft">Draft (In Progress)</option>
                </Select>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Save Consultation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={!!viewRecord} onOpenChange={() => setViewRecord(null)}>
        <DialogContent className="max-w-xl">
          {viewRecord && (
            <div className="space-y-4 text-xs">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Clinical Consultation Record
                </DialogTitle>
                <DialogDescription>
                  Recorded on {new Date(viewRecord.dateRecorded || viewRecord.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-1">
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {viewRecord.patient?.name}
                </div>
                <div className="text-slate-500 text-[11px]">
                  UHID: {viewRecord.patient?.uhid} • {viewRecord.patient?.gender},{" "}
                  {viewRecord.patient?.age} years old
                </div>
                <div className="text-slate-500 text-[11px]">
                  Attending: Dr. {viewRecord.doctor?.name || "Physician"}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase">
                    Chief Complaint
                  </span>
                  <p className="text-slate-900 dark:text-white mt-0.5">
                    {viewRecord.chiefComplaint || "None"}
                  </p>
                </div>

                {viewRecord.historyOfPresentIllness && (
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase">
                      History of Present Illness (HPI)
                    </span>
                    <p className="text-slate-900 dark:text-white mt-0.5 whitespace-pre-wrap">
                      {viewRecord.historyOfPresentIllness}
                    </p>
                  </div>
                )}

                {viewRecord.objectiveFindings && (
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase">
                      Physical Exam Findings
                    </span>
                    <p className="text-slate-900 dark:text-white mt-0.5 whitespace-pre-wrap">
                      {viewRecord.objectiveFindings}
                    </p>
                  </div>
                )}

                {viewRecord.assessment && (
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase">
                      Assessment & Working Diagnosis
                    </span>
                    <p className="text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                      {viewRecord.assessment}
                    </p>
                  </div>
                )}

                {viewRecord.plan && (
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase">
                      Management Plan
                    </span>
                    <p className="text-slate-900 dark:text-white mt-0.5 whitespace-pre-wrap">
                      {viewRecord.plan}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setViewRecord(null)}>
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
