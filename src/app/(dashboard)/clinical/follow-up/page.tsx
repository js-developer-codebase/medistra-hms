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
  CalendarCheck,
  Search,
  Plus,
  RefreshCw,
  Download,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  Loader2
} from "lucide-react";

export default function ClinicalFollowUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <ClinicalFollowUpContent />
    </Suspense>
  );
}

function ClinicalFollowUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patientId") || "";
  const { toast } = useToast();

  const [followUps, setFollowUps] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patient: initialPatientId,
    doctor: "",
    title: "", // Follow up purpose
    followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    instructions: "",
    problemStatus: "Scheduled"
  });

  const loadData = async () => {
    try {
      const [recRes, patRes, docRes] = await Promise.all([
        fetch("/api/clinical/records?recordType=Follow-Up"),
        fetch("/api/patient"),
        fetch("/api/user")
      ]);

      const [recData, patData, docData] = await Promise.all([
        recRes.json(),
        patRes.json(),
        docRes.json()
      ]);

      if (recData.success) setFollowUps(recData.data || []);
      if (patData.success) {
        setPatients(patData.data || []);
        if (initialPatientId) setCreateOpen(true);
      }
      if (docData.success) setDoctors(docData.data || []);
    } catch (err) {
      toast("Failed to load clinical follow-ups", "error");
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
    if (!formData.patient || !formData.title || !formData.followUpDate) {
      toast("Please select a patient, follow-up date, and clinical purpose", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patient: formData.patient,
        doctor: formData.doctor || undefined,
        recordType: "Follow-Up",
        title: formData.title,
        followUpDate: new Date(formData.followUpDate).toISOString(),
        instructions: formData.instructions,
        problemStatus: formData.problemStatus,
        dateRecorded: new Date().toISOString()
      };

      const res = await fetch("/api/clinical/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Follow-up appointment scheduled successfully!", "success");
        setCreateOpen(false);
        setFormData({
          patient: "",
          doctor: "",
          title: "",
          followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          instructions: "",
          problemStatus: "Scheduled"
        });
        loadData();
      } else {
        toast(data.error || "Failed to schedule follow-up", "error");
      }
    } catch (err) {
      toast("An error occurred while scheduling follow-up", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (record: any) => {
    const nextStatus = record.problemStatus === "Completed" ? "Scheduled" : "Completed";
    try {
      const res = await fetch(`/api/clinical/records/${record._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemStatus: nextStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Follow-up marked as ${nextStatus}`, "success");
        loadData();
      } else {
        toast(data.error || "Failed to update status", "error");
      }
    } catch (err) {
      toast("Error updating status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this follow-up?")) return;
    try {
      const res = await fetch(`/api/clinical/records/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Follow-up cancelled", "success");
        loadData();
      } else {
        toast(data.error || "Failed to cancel follow-up", "error");
      }
    } catch (err) {
      toast("Error cancelling follow-up", "error");
    }
  };

  const filteredFollowUps = useMemo(() => {
    return followUps.filter((f) => {
      const q = searchQuery.toLowerCase().trim();
      const patName = (f.patient?.name || "").toLowerCase();
      const uhid = (f.patient?.uhid || "").toLowerCase();
      const title = (f.title || "").toLowerCase();
      const docName = (f.doctor?.name || "").toLowerCase();

      const matchesSearch =
        !q ||
        patName.includes(q) ||
        uhid.includes(q) ||
        title.includes(q) ||
        docName.includes(q);

      let matchesStatus = true;
      if (statusFilter !== "ALL") {
        matchesStatus = (f.problemStatus || "Scheduled") === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [followUps, searchQuery, statusFilter]);

  const statsCount = useMemo(() => {
    let scheduled = 0;
    let completed = 0;
    followUps.forEach((f) => {
      if (f.problemStatus === "Completed") completed++;
      else scheduled++;
    });
    return { total: followUps.length, scheduled, completed };
  }, [followUps]);

  const exportCSV = () => {
    if (filteredFollowUps.length === 0) {
      toast("No follow-up entries to export", "error");
      return;
    }

    const headers = [
      "Follow-Up Date",
      "Patient Name",
      "UHID",
      "Purpose / Reason",
      "Physician",
      "Status",
      "Instructions"
    ];

    const rows = filteredFollowUps.map((f) => [
      `"${f.followUpDate ? new Date(f.followUpDate).toLocaleDateString() : "N/A"}"`,
      `"${f.patient?.name || ""}"`,
      `"${f.patient?.uhid || ""}"`,
      `"${(f.title || "").replace(/"/g, '""')}"`,
      `"Dr. ${f.doctor?.name || ""}"`,
      f.problemStatus || "Scheduled",
      `"${(f.instructions || "").replace(/"/g, '""')}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Clinical_Follow_Ups_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Follow-up tracker exported", "success");
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
            <CalendarCheck className="h-6 w-6 text-lime-600 dark:text-lime-400" />
            Clinical Follow-Up Tracker & Callbacks
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor post-discharge and post-consultation patient callbacks, review appointments, and chronic care re-assessments.
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
            className="bg-lime-600 hover:bg-lime-700 text-white flex items-center gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Schedule Follow-Up
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Total Follow-Ups</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {statsCount.total}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Recorded in tracker</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-lime-50 dark:bg-lime-950/40 text-lime-600 flex items-center justify-center">
            <CalendarCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Scheduled / Pending</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {statsCount.scheduled}
            </div>
            <div className="text-[10px] text-amber-600 mt-0.5">Upcoming reviews</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Completed Callbacks</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {statsCount.completed}
            </div>
            <div className="text-[10px] text-emerald-600 mt-0.5">Successfully reviewed</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search purpose, patient, doctor, UHID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="Scheduled">Scheduled / Pending</option>
                <option value="Completed">Completed</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Follow-ups Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Scheduled Follow-Ups</CardTitle>
          <CardDescription>
            Showing {filteredFollowUps.length} of {followUps.length} patient follow-up appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Target Date</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Clinical Purpose / Procedure Check</TableHead>
                  <TableHead>Attending Doctor</TableHead>
                  <TableHead>Instructions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFollowUps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No follow-up entries found matching filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFollowUps.map((f) => {
                    const isCompleted = f.problemStatus === "Completed";
                    return (
                      <TableRow key={f._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <TableCell className="font-mono font-bold text-lime-700 dark:text-lime-400 whitespace-nowrap">
                          {f.followUpDate ? new Date(f.followUpDate).toLocaleDateString() : "Pending"}
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {f.patient?.name || "Unknown"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {f.patient?.uhid}
                          </div>
                        </TableCell>

                        <TableCell className="font-bold text-slate-900 dark:text-white max-w-xs">
                          {f.title}
                        </TableCell>

                        <TableCell className="font-medium">
                          Dr. {f.doctor?.name || "Attending"}
                        </TableCell>

                        <TableCell className="max-w-xs text-slate-600 dark:text-slate-400 truncate">
                          {f.instructions || "None"}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              isCompleted
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                            }
                          >
                            {f.problemStatus || "Scheduled"}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-7 px-2 text-xs flex items-center gap-1 ${
                                isCompleted
                                  ? "text-slate-500 hover:bg-slate-100"
                                  : "text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                              }`}
                              onClick={() => handleToggleComplete(f)}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {isCompleted ? "Re-open" : "Done"}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700"
                              onClick={() => handleDelete(f._id)}
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

      {/* Schedule Follow-Up Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-lime-600" />
                Schedule Patient Follow-Up
              </DialogTitle>
              <DialogDescription>
                Schedule review appointment, post-discharge callback, or suture check.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="patient" className="text-xs font-semibold">
                  Patient *
                </Label>
                <Select
                  id="patient"
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
                <Label htmlFor="doctor" className="text-xs font-semibold">
                  Attending Physician
                </Label>
                <Select
                  id="doctor"
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
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
                <Label htmlFor="followUpDate" className="text-xs font-semibold">
                  Follow-Up Review Date *
                </Label>
                <Input
                  type="date"
                  id="followUpDate"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold">
                  Follow-Up Purpose / Reason *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Suture removal, BP titration check, Post-op surgical review"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="instructions" className="text-xs font-semibold">
                  Instructions for Patient
                </Label>
                <Textarea
                  id="instructions"
                  rows={2}
                  placeholder="e.g. Bring home blood pressure log, fasting for lab tests, keep wound dry..."
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-lime-600 hover:bg-lime-700 text-white" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirm Schedule
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
