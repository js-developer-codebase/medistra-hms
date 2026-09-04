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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  Pill,
  Search,
  Plus,
  RefreshCw,
  Download,
  CheckCircle2,
  Trash2,
  Calendar,
  User,
  Loader2,
  AlertOctagon,
  Clock,
  XCircle
} from "lucide-react";

export default function MedicationAdministrationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <MedicationAdministrationContent />
    </Suspense>
  );
}

function MedicationAdministrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patientId") || "";
  const { toast } = useToast();

  const [medications, setMedications] = useState<any[]>([]);
  const [inpatients, setInpatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedPatientFilter, setSelectedPatientFilter] = useState(initialPatientId || "ALL");

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patient: initialPatientId,
    medicationName: "",
    dosage: "1 Tab",
    route: "ORAL",
    scheduledTime: new Date().toISOString().slice(0, 16),
    status: "PENDING",
    notes: ""
  });

  // Withhold Modal
  const [withholdTarget, setWithholdTarget] = useState<any>(null);
  const [withholdReason, setWithholdReason] = useState("");

  const loadData = async () => {
    try {
      const [medsRes, ptsRes] = await Promise.all([
        fetch("/api/nursing/medications"),
        fetch("/api/nursing/my-patients")
      ]);

      const [medsData, ptsData] = await Promise.all([
        medsRes.json(),
        ptsRes.json()
      ]);

      if (medsData.success) setMedications(medsData.data || []);
      if (ptsData.success) {
        setInpatients(ptsData.data || []);
        if (initialPatientId) setCreateOpen(true);
      }
    } catch (err) {
      toast("Failed to load medication records", "error");
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
    if (!formData.patient || !formData.medicationName || !formData.dosage) {
      toast("Please select a patient, drug name, and dosage", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patient: formData.patient,
        medicationName: formData.medicationName,
        dosage: formData.dosage,
        route: formData.route,
        scheduledTime: new Date(formData.scheduledTime).toISOString(),
        status: formData.status,
        notes: formData.notes
      };

      const res = await fetch("/api/nursing/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Medication scheduled on eMAR successfully!", "success");
        setCreateOpen(false);
        setFormData({
          patient: selectedPatientFilter !== "ALL" ? selectedPatientFilter : "",
          medicationName: "",
          dosage: "1 Tab",
          route: "ORAL",
          scheduledTime: new Date().toISOString().slice(0, 16),
          status: "PENDING",
          notes: ""
        });
        loadData();
      } else {
        toast(data.message || "Failed to schedule medication", "error");
      }
    } catch (err) {
      toast("An error occurred while saving medication", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminister = async (med: any) => {
    try {
      const res = await fetch(`/api/nursing/medications/${med._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "GIVEN",
          administeredTime: new Date().toISOString()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Administered ${med.medicationName} successfully!`, "success");
        loadData();
      } else {
        toast(data.message || "Failed to record administration", "error");
      }
    } catch (err) {
      toast("Error recording administration", "error");
    }
  };

  const handleWithholdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withholdTarget) return;

    try {
      const res = await fetch(`/api/nursing/medications/${withholdTarget._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "WITHHELD",
          withheldReason: withholdReason
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Dose marked as withheld", "success");
        setWithholdTarget(null);
        setWithholdReason("");
        loadData();
      } else {
        toast(data.message || "Failed to withhold medication", "error");
      }
    } catch (err) {
      toast("Error withholding medication", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medication schedule?")) return;
    try {
      const res = await fetch(`/api/nursing/medications/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Medication schedule removed", "success");
        loadData();
      } else {
        toast(data.message || "Failed to remove medication", "error");
      }
    } catch (err) {
      toast("Error deleting medication", "error");
    }
  };

  const filteredMedications = useMemo(() => {
    return medications.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const patName = (m.patient?.name || "").toLowerCase();
      const uhid = (m.patient?.uhid || "").toLowerCase();
      const drug = (m.medicationName || "").toLowerCase();

      const matchesSearch = !q || patName.includes(q) || uhid.includes(q) || drug.includes(q);

      let matchesStatus = true;
      if (statusFilter !== "ALL") {
        matchesStatus = m.status === statusFilter;
      }

      let matchesPatient = true;
      if (selectedPatientFilter !== "ALL") {
        const pId = m.patient?._id || m.patient;
        matchesPatient = pId === selectedPatientFilter;
      }

      return matchesSearch && matchesStatus && matchesPatient;
    });
  }, [medications, searchQuery, statusFilter, selectedPatientFilter]);

  const statsCount = useMemo(() => {
    let given = 0;
    let pending = 0;
    let withheld = 0;
    medications.forEach((m) => {
      if (m.status === "GIVEN") given++;
      else if (m.status === "PENDING") pending++;
      else if (m.status === "WITHHELD" || m.status === "REFUSED") withheld++;
    });
    return { total: medications.length, given, pending, withheld };
  }, [medications]);

  const exportCSV = () => {
    if (filteredMedications.length === 0) {
      toast("No medication records to export", "error");
      return;
    }

    const headers = [
      "Scheduled Time",
      "Patient Name",
      "UHID",
      "Medication Name",
      "Dosage",
      "Route",
      "Status",
      "Administered At",
      "Withheld Reason"
    ];

    const rows = filteredMedications.map((m) => [
      `"${new Date(m.scheduledTime).toLocaleString()}"`,
      `"${m.patient?.name || ""}"`,
      `"${m.patient?.uhid || ""}"`,
      `"${(m.medicationName || "").replace(/"/g, '""')}"`,
      `"${m.dosage || ""}"`,
      m.route || "ORAL",
      m.status || "PENDING",
      m.administeredTime ? `"${new Date(m.administeredTime).toLocaleString()}"` : "N/A",
      `"${(m.withheldReason || "").replace(/"/g, '""')}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `eMAR_Medications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("eMAR records exported successfully", "success");
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
            <Pill className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Electronic Medication Administration Record (eMAR)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Bedside barcode/patient medication checklist, dosage verification, administration times, and sign-offs.
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
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Schedule Medication
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Total Doses</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
            {statsCount.total}
          </span>
          <span className="text-[10px] text-slate-400">Active eMAR schedule</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Pending Doses</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {statsCount.pending}
          </span>
          <span className="text-[10px] text-amber-600 font-medium">Due for administration</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Given & Verified</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {statsCount.given}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">Successfully administered</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Withheld / Refused</span>
          <span className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
            {statsCount.withheld}
          </span>
          <span className="text-[10px] text-rose-600 font-medium">Clinical exceptions</span>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search drug, patient name, UHID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div>
              <Select
                value={selectedPatientFilter}
                onChange={(e) => setSelectedPatientFilter(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Inpatients</option>
                {inpatients.map((p) => (
                  <option key={p.patientId} value={p.patientId}>
                    Bed {p.bedNumber} - {p.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending / Due</option>
                <option value="GIVEN">Given</option>
                <option value="WITHHELD">Withheld / Refused</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medications Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">eMAR Administration Worklist</CardTitle>
          <CardDescription>
            Showing {filteredMedications.length} of {medications.length} scheduled medication doses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scheduled Time</TableHead>
                  <TableHead>Inpatient Particulars</TableHead>
                  <TableHead>Medication & Strength</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Administration Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No medication administration records found. Click "Schedule Medication" to add doses.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMedications.map((m) => {
                    const isPending = m.status === "PENDING";
                    const isGiven = m.status === "GIVEN";
                    return (
                      <TableRow key={m._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <TableCell className="font-mono text-slate-500 whitespace-nowrap">
                          {new Date(m.scheduledTime).toLocaleString([], {
                            dateStyle: "short",
                            timeStyle: "short"
                          })}
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {m.patient?.name || "Unknown"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {m.patient?.uhid}
                          </div>
                        </TableCell>

                        <TableCell className="font-bold text-slate-900 dark:text-white">
                          {m.medicationName}
                          {m.withheldReason && (
                            <span className="text-[10px] text-rose-500 font-normal block mt-0.5">
                              Withheld: {m.withheldReason}
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                          {m.dosage}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {m.route}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              isGiven
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                                : isPending
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300"
                            }
                          >
                            {m.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isPending && (
                              <>
                                <Button
                                  size="sm"
                                  className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                                  onClick={() => handleAdminister(m)}
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Give
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 flex items-center gap-1"
                                  onClick={() => setWithholdTarget(m)}
                                >
                                  <XCircle className="h-3 w-3" />
                                  Withhold
                                </Button>
                              </>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700"
                              onClick={() => handleDelete(m._id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Medication Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Pill className="h-5 w-5 text-purple-600" />
                Schedule Medication Dose (eMAR)
              </DialogTitle>
              <DialogDescription>
                Add scheduled drug dose to the patient bedside medication checklist.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="patient" className="text-xs font-semibold">
                  Inpatient *
                </Label>
                <Select
                  id="patient"
                  value={formData.patient}
                  onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                  required
                  className="h-9 text-xs"
                >
                  <option value="">-- Choose Inpatient --</option>
                  {inpatients.map((p) => (
                    <option key={p.patientId} value={p.patientId}>
                      Bed {p.bedNumber} - {p.name} ({p.uhid})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="med" className="text-xs font-semibold">
                  Medication Name & Strength *
                </Label>
                <Input
                  id="med"
                  placeholder="e.g. Inj Ceftriaxone 1g, Tab Paracetamol 650mg, IV Normal Saline"
                  value={formData.medicationName}
                  onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="dosage" className="text-xs font-semibold">
                    Dosage *
                  </Label>
                  <Input
                    id="dosage"
                    placeholder="e.g. 1g, 500mg, 1 Tab, 10ml"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="route" className="text-xs font-semibold">
                    Route of Administration
                  </Label>
                  <Select
                    id="route"
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value as any })}
                    className="h-9 text-xs"
                  >
                    <option value="ORAL">Oral (PO)</option>
                    <option value="IV">Intravenous (IV)</option>
                    <option value="IM">Intramuscular (IM)</option>
                    <option value="SC">Subcutaneous (SC)</option>
                    <option value="TOPICAL">Topical</option>
                    <option value="INHALATION">Inhalation / Nebulizer</option>
                    <option value="OTHER">Other</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="time" className="text-xs font-semibold">
                  Scheduled Dose Time *
                </Label>
                <Input
                  type="datetime-local"
                  id="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-semibold">
                  Special Administration Instructions
                </Label>
                <Input
                  id="notes"
                  placeholder="e.g. Administer slowly over 30 minutes, check BP prior to dose..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Schedule Dose
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Withhold Modal */}
      <Dialog open={!!withholdTarget} onOpenChange={() => setWithholdTarget(null)}>
        <DialogContent className="max-w-sm">
          <form onSubmit={handleWithholdSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-600">
                <AlertOctagon className="h-5 w-5" />
                Withhold Medication Dose
              </DialogTitle>
              <DialogDescription>
                State the clinical reason for withholding {withholdTarget?.medicationName}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="reason" className="text-xs font-semibold">
                  Clinical Reason / Contraindication *
                </Label>
                <Select
                  id="reason"
                  value={withholdReason}
                  onChange={(e) => setWithholdReason(e.target.value)}
                  required
                  className="h-9 text-xs"
                >
                  <option value="">-- Choose Reason --</option>
                  <option value="Patient NPO for procedure">Patient NPO for procedure</option>
                  <option value="Low Blood Pressure (Hypotension)">Low Blood Pressure (Hypotension)</option>
                  <option value="Low Heart Rate (Bradycardia)">Low Heart Rate (Bradycardia)</option>
                  <option value="Patient Refused">Patient Refused</option>
                  <option value="Doctor verbally held dose">Doctor verbally held dose</option>
                  <option value="Adverse reaction suspected">Adverse reaction suspected</option>
                </Select>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setWithholdTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">
                Confirm Withhold
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
