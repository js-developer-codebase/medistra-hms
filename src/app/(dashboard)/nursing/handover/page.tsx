"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
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
  ArrowLeftRight,
  Search,
  Plus,
  RefreshCw,
  Download,
  Trash2,
  Calendar,
  User,
  Loader2,
  CheckCircle2,
  Eye,
  FileCheck,
  Printer
} from "lucide-react";

export default function NursingHandoverPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <NursingHandoverContent />
    </Suspense>
  );
}

function NursingHandoverContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [handovers, setHandovers] = useState<any[]>([]);
  const [inpatients, setInpatients] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [shiftFilter, setShiftFilter] = useState("ALL");

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    ward: "",
    shiftType: "MORNING",
    handoverDate: new Date().toISOString().slice(0, 10),
    generalWardRemarks: "",
    patientHandovers: [
      {
        patient: "",
        bedNumber: "",
        situation: "",
        background: "",
        assessment: "",
        recommendation: ""
      }
    ]
  });

  // View Handover Modal
  const [viewHandover, setViewHandover] = useState<any>(null);

  const loadData = async () => {
    try {
      const [handRes, ptsRes, wardsRes] = await Promise.all([
        fetch("/api/nursing/handover"),
        fetch("/api/nursing/my-patients"),
        fetch("/api/ward")
      ]);

      const [handData, ptsData, wardsData] = await Promise.all([
        handRes.json(),
        ptsRes.json(),
        wardsRes.json()
      ]);

      if (handData.success) setHandovers(handData.data || []);
      if (ptsData.success) setInpatients(ptsData.data || []);
      if (wardsData.success) {
        setWards(wardsData.data || []);
        if (wardsData.data?.length > 0 && !formData.ward) {
          setFormData((prev) => ({ ...prev, ward: wardsData.data[0]._id }));
        }
      }
    } catch (err) {
      toast("Failed to load shift handovers", "error");
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

  const handleAddPatientRow = () => {
    setFormData((prev) => ({
      ...prev,
      patientHandovers: [
        ...prev.patientHandovers,
        {
          patient: "",
          bedNumber: "",
          situation: "",
          background: "",
          assessment: "",
          recommendation: ""
        }
      ]
    }));
  };

  const handleRemovePatientRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      patientHandovers: prev.patientHandovers.filter((_, i) => i !== index)
    }));
  };

  const handlePatientRowChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.patientHandovers];
      updated[index] = { ...updated[index], [field]: value };

      if (field === "patient") {
        const found = inpatients.find((p) => p.patientId === value);
        if (found) {
          updated[index].bedNumber = found.bedNumber;
          updated[index].background = `Admitted for ${found.diagnosis}. Dr. ${found.doctorName}.`;
        }
      }

      return { ...prev, patientHandovers: updated };
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ward) {
      toast("Please select a ward", "error");
      return;
    }

    const validPatients = formData.patientHandovers.filter((p) => p.patient && p.situation);
    if (validPatients.length === 0) {
      toast("Please add at least one patient with Situation notes", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ward: formData.ward,
        shiftType: formData.shiftType,
        handoverDate: new Date(formData.handoverDate).toISOString(),
        generalWardRemarks: formData.generalWardRemarks,
        patientHandovers: validPatients,
        status: "SUBMITTED"
      };

      const res = await fetch("/api/nursing/handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Shift handover submitted successfully!", "success");
        setCreateOpen(false);
        setFormData({
          ward: wards[0]?._id || "",
          shiftType: "MORNING",
          handoverDate: new Date().toISOString().slice(0, 10),
          generalWardRemarks: "",
          patientHandovers: [
            {
              patient: "",
              bedNumber: "",
              situation: "",
              background: "",
              assessment: "",
              recommendation: ""
            }
          ]
        });
        loadData();
      } else {
        toast(data.message || "Failed to submit handover", "error");
      }
    } catch (err) {
      toast("An error occurred while submitting handover", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      const res = await fetch(`/api/nursing/handover/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACKNOWLEDGED" })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Handover acknowledged by incoming nurse", "success");
        loadData();
      } else {
        toast(data.message || "Failed to acknowledge handover", "error");
      }
    } catch (err) {
      toast("Error acknowledging handover", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this handover record?")) return;
    try {
      const res = await fetch(`/api/nursing/handover/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Handover record deleted", "success");
        loadData();
      } else {
        toast(data.message || "Failed to delete handover", "error");
      }
    } catch (err) {
      toast("Error deleting handover", "error");
    }
  };

  const filteredHandovers = useMemo(() => {
    return handovers.filter((h) => {
      const q = searchQuery.toLowerCase().trim();
      const wardName = (h.ward?.wardName || "").toLowerCase();
      const remarks = (h.generalWardRemarks || "").toLowerCase();

      const matchesSearch = !q || wardName.includes(q) || remarks.includes(q);

      let matchesShift = true;
      if (shiftFilter !== "ALL") {
        matchesShift = h.shiftType === shiftFilter;
      }

      return matchesSearch && matchesShift;
    });
  }, [handovers, searchQuery, shiftFilter]);

  const exportCSV = () => {
    if (filteredHandovers.length === 0) {
      toast("No handovers to export", "error");
      return;
    }

    const headers = [
      "Handover Date",
      "Ward",
      "Shift Type",
      "Patients Count",
      "Status",
      "General Remarks"
    ];

    const rows = filteredHandovers.map((h) => [
      `"${new Date(h.handoverDate).toLocaleDateString()}"`,
      `"${h.ward?.wardName || "Ward"}"`,
      h.shiftType || "MORNING",
      h.patientHandovers?.length || 0,
      h.status || "SUBMITTED",
      `"${(h.generalWardRemarks || "").replace(/"/g, '""')}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Shift_Handovers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Handovers exported successfully", "success");
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
            <ArrowLeftRight className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Clinical Shift Handover (SBAR)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Structured Situation-Background-Assessment-Recommendation handoff protocol between outgoing and incoming ward shifts.
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Shift Handover
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
                placeholder="Search ward, remarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="w-full sm:w-48">
              <Select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="ALL">All Shifts</option>
                <option value="MORNING">Morning Shift</option>
                <option value="EVENING">Evening Shift</option>
                <option value="NIGHT">Night Shift</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Handover Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Ward Handover Ledger</CardTitle>
          <CardDescription>
            Showing {filteredHandovers.length} of {handovers.length} documented shift handovers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Ward Location</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Inpatients Handed Over</TableHead>
                  <TableHead>General Remarks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHandovers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No shift handovers logged. Click "New Shift Handover" to initiate SBAR handoff.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHandovers.map((h) => {
                    const isAck = h.status === "ACKNOWLEDGED";
                    return (
                      <TableRow key={h._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <TableCell className="font-mono text-slate-500 whitespace-nowrap">
                          {new Date(h.handoverDate).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="font-semibold text-slate-900 dark:text-white">
                          {h.ward?.wardName || "General Ward"}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {h.shiftType}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <span className="font-bold text-indigo-600">
                            {h.patientHandovers?.length || 0}
                          </span>{" "}
                          patients
                        </TableCell>

                        <TableCell className="max-w-xs truncate text-slate-500">
                          {h.generalWardRemarks || "Routine shift completion without critical incidents."}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              isAck
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                            }
                          >
                            {h.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                              onClick={() => setViewHandover(h)}
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>

                            {!isAck && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50 flex items-center gap-1"
                                onClick={() => handleAcknowledge(h._id)}
                              >
                                <FileCheck className="h-3 w-3" />
                                Sign-off
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700"
                              onClick={() => handleDelete(h._id)}
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

      {/* New Handover Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-indigo-600" />
                Initiate Clinical Shift Handover (SBAR)
              </DialogTitle>
              <DialogDescription>
                Transfer inpatient care responsibility with structured SBAR communication.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ward" className="text-xs font-semibold">
                    Ward *
                  </Label>
                  <Select
                    id="ward"
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    required
                    className="h-9 text-xs"
                  >
                    <option value="">-- Choose Ward --</option>
                    {wards.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.wardName} (Fl {w.floor})
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="shift" className="text-xs font-semibold">
                    Shift Type *
                  </Label>
                  <Select
                    id="shift"
                    value={formData.shiftType}
                    onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="MORNING">Morning (07:00 - 15:00)</option>
                    <option value="EVENING">Evening (15:00 - 23:00)</option>
                    <option value="NIGHT">Night (23:00 - 07:00)</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="date" className="text-xs font-semibold">
                    Handover Date *
                  </Label>
                  <Input
                    type="date"
                    id="date"
                    value={formData.handoverDate}
                    onChange={(e) => setFormData({ ...formData, handoverDate: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="remarks" className="text-xs font-semibold">
                  General Ward Remarks & Census Status
                </Label>
                <Input
                  id="remarks"
                  placeholder="e.g. All beds occupied, code cart verified, oxygen supply normal..."
                  value={formData.generalWardRemarks}
                  onChange={(e) => setFormData({ ...formData, generalWardRemarks: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              {/* Patient Handover Rows */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Patient SBAR Handover Cards ({formData.patientHandovers.length})
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleAddPatientRow}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Inpatient Card
                  </Button>
                </div>

                {formData.patientHandovers.map((row, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border space-y-2.5 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-full sm:w-1/2">
                        <Label className="text-[10px] text-slate-500">Inpatient *</Label>
                        <Select
                          value={row.patient}
                          onChange={(e) => handlePatientRowChange(idx, "patient", e.target.value)}
                          className="h-8 text-xs"
                        >
                          <option value="">-- Select Inpatient --</option>
                          {inpatients.map((p) => (
                            <option key={p.patientId} value={p.patientId}>
                              Bed {p.bedNumber} - {p.name}
                            </option>
                          ))}
                        </Select>
                      </div>

                      {formData.patientHandovers.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-rose-500 hover:text-rose-700"
                          onClick={() => handleRemovePatientRow(idx)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400">
                          [S] Situation (Current Condition) *
                        </Label>
                        <Input
                          placeholder="e.g. Day 2 post-appendectomy, stable, pain well controlled"
                          value={row.situation}
                          onChange={(e) => handlePatientRowChange(idx, "situation", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div>
                        <Label className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400">
                          [B] Background (Admitting History)
                        </Label>
                        <Input
                          placeholder="e.g. Admitted 02/09, HTN, allergic to Penicillin"
                          value={row.background}
                          onChange={(e) => handlePatientRowChange(idx, "background", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400">
                          [A] Assessment (Vitals & Labs)
                        </Label>
                        <Input
                          placeholder="e.g. BP 124/82, Pulse 76, SpO2 98%, Urine output 700ml"
                          value={row.assessment}
                          onChange={(e) => handlePatientRowChange(idx, "assessment", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div>
                        <Label className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400">
                          [R] Recommendation (Actions for Next Shift)
                        </Label>
                        <Input
                          placeholder="e.g. Check CBC in morning, redress wound if soaked"
                          value={row.recommendation}
                          onChange={(e) => handlePatientRowChange(idx, "recommendation", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Submit Handover
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View SBAR Handover Sheet Modal */}
      <Dialog open={!!viewHandover} onOpenChange={() => setViewHandover(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewHandover && (
            <div className="space-y-4 text-xs">
              <DialogHeader>
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <DialogTitle className="text-base font-bold flex items-center gap-2">
                      <ArrowLeftRight className="h-5 w-5 text-indigo-600" />
                      Shift Handover Report — {viewHandover.ward?.wardName || "Ward"}
                    </DialogTitle>
                    <DialogDescription>
                      Date: {new Date(viewHandover.handoverDate).toLocaleDateString()} • Shift: {viewHandover.shiftType}
                    </DialogDescription>
                  </div>
                  <Badge className="bg-indigo-100 text-indigo-800 text-xs">
                    {viewHandover.status}
                  </Badge>
                </div>
              </DialogHeader>

              {viewHandover.generalWardRemarks && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px] uppercase">
                    Ward Remarks & General Census
                  </span>
                  <p className="mt-0.5 text-slate-800 dark:text-slate-200">
                    {viewHandover.generalWardRemarks}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <span className="font-bold text-slate-900 dark:text-white text-xs block">
                  Patient SBAR Breakdowns:
                </span>

                {viewHandover.patientHandovers?.map((p: any, idx: number) => (
                  <div key={idx} className="p-3.5 border rounded-xl space-y-2">
                    <div className="flex items-center justify-between border-b pb-1.5">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {p.patient?.name || "Patient"}
                      </span>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        Bed {p.bedNumber || "Assigned"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="font-bold text-indigo-600 block">[S] SITUATION</span>
                        <p className="text-slate-700 dark:text-slate-300">{p.situation}</p>
                      </div>

                      <div>
                        <span className="font-bold text-indigo-600 block">[B] BACKGROUND</span>
                        <p className="text-slate-700 dark:text-slate-300">{p.background || "N/A"}</p>
                      </div>

                      <div>
                        <span className="font-bold text-indigo-600 block">[A] ASSESSMENT</span>
                        <p className="text-slate-700 dark:text-slate-300">{p.assessment || "Stable"}</p>
                      </div>

                      <div>
                        <span className="font-bold text-indigo-600 block">[R] RECOMMENDATION</span>
                        <p className="text-slate-700 dark:text-slate-300">{p.recommendation || "Continue plan"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter className="flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="flex items-center gap-1">
                  <Printer className="h-3.5 w-3.5" />
                  Print Sheet
                </Button>
                <Button variant="outline" size="sm" onClick={() => setViewHandover(null)}>
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
