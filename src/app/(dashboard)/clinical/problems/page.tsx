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
  AlertTriangle,
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

export default function PatientProblemsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <PatientProblemsContent />
    </Suspense>
  );
}

function PatientProblemsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patientId") || "";
  const { toast } = useToast();

  const [problems, setProblems] = useState<any[]>([]);
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
    title: "",
    problemStatus: "Active",
    severity: "Moderate",
    details: "",
    status: "Final"
  });

  const loadData = async () => {
    try {
      const [recRes, patRes, docRes] = await Promise.all([
        fetch("/api/clinical/records?recordType=Patient Problem"),
        fetch("/api/patient"),
        fetch("/api/user")
      ]);

      const [recData, patData, docData] = await Promise.all([
        recRes.json(),
        patRes.json(),
        docRes.json()
      ]);

      if (recData.success) setProblems(recData.data || []);
      if (patData.success) {
        setPatients(patData.data || []);
        if (initialPatientId) setCreateOpen(true);
      }
      if (docData.success) setDoctors(docData.data || []);
    } catch (err) {
      toast("Failed to load problem list", "error");
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
    if (!formData.patient || !formData.title) {
      toast("Please select a patient and provide the problem description", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        recordType: "Patient Problem",
        dateRecorded: new Date().toISOString()
      };

      const res = await fetch("/api/clinical/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Problem added to patient list successfully!", "success");
        setCreateOpen(false);
        setFormData({
          patient: "",
          doctor: "",
          title: "",
          problemStatus: "Active",
          severity: "Moderate",
          details: "",
          status: "Final"
        });
        loadData();
      } else {
        toast(data.error || "Failed to add problem", "error");
      }
    } catch (err) {
      toast("An error occurred while saving problem", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleResolved = async (record: any) => {
    const nextStatus = record.problemStatus === "Resolved" ? "Active" : "Resolved";
    try {
      const res = await fetch(`/api/clinical/records/${record._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemStatus: nextStatus,
          resolutionDate: nextStatus === "Resolved" ? new Date().toISOString() : undefined
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Problem marked as ${nextStatus}`, "success");
        loadData();
      } else {
        toast(data.error || "Failed to update problem status", "error");
      }
    } catch (err) {
      toast("Error updating status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this problem entry?")) return;
    try {
      const res = await fetch(`/api/clinical/records/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Problem entry removed", "success");
        loadData();
      } else {
        toast(data.error || "Failed to delete entry", "error");
      }
    } catch (err) {
      toast("Error deleting entry", "error");
    }
  };

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const patName = (p.patient?.name || "").toLowerCase();
      const uhid = (p.patient?.uhid || "").toLowerCase();
      const title = (p.title || "").toLowerCase();
      const details = (p.details || "").toLowerCase();

      const matchesSearch =
        !q ||
        patName.includes(q) ||
        uhid.includes(q) ||
        title.includes(q) ||
        details.includes(q);

      let matchesStatus = true;
      if (statusFilter !== "ALL") {
        matchesStatus = (p.problemStatus || "Active") === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [problems, searchQuery, statusFilter]);

  const statsCount = useMemo(() => {
    let active = 0;
    let chronic = 0;
    let resolved = 0;
    problems.forEach((p) => {
      if (p.problemStatus === "Active") active++;
      else if (p.problemStatus === "Chronic") chronic++;
      else if (p.problemStatus === "Resolved") resolved++;
    });
    return { total: problems.length, active, chronic, resolved };
  }, [problems]);

  const exportCSV = () => {
    if (filteredProblems.length === 0) {
      toast("No problems to export", "error");
      return;
    }

    const headers = [
      "Date Recorded",
      "Patient Name",
      "UHID",
      "Problem Description",
      "Severity",
      "Status",
      "Clinical Strategy"
    ];

    const rows = filteredProblems.map((p) => [
      `"${new Date(p.dateRecorded || p.createdAt).toLocaleDateString()}"`,
      `"${p.patient?.name || ""}"`,
      `"${p.patient?.uhid || ""}"`,
      `"${(p.title || "").replace(/"/g, '""')}"`,
      p.severity || "Moderate",
      p.problemStatus || "Active",
      `"${(p.details || "").replace(/"/g, '""')}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Patient_Problem_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Problem list exported", "success");
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
            <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            Patient Problem List
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track active medical problems, chronic illnesses, and resolved conditions across patient care encounters.
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
            className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Problem
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Total Tracked</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
            {statsCount.total}
          </span>
          <span className="text-[10px] text-slate-400">Cumulative issues</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Active Problems</span>
          <span className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1 block">
            {statsCount.active}
          </span>
          <span className="text-[10px] text-orange-600">Requiring intervention</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Chronic Conditions</span>
          <span className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">
            {statsCount.chronic}
          </span>
          <span className="text-[10px] text-purple-600">Ongoing monitoring</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Resolved</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {statsCount.resolved}
          </span>
          <span className="text-[10px] text-emerald-600">Past conditions</span>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search problem, patient, details, UHID..."
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
                <option value="Active">Active</option>
                <option value="Chronic">Chronic</option>
                <option value="Inactive">Inactive</option>
                <option value="Resolved">Resolved</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problems Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Problem List Ledger</CardTitle>
          <CardDescription>
            Showing {filteredProblems.length} of {problems.length} documented patient medical conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Logged</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Problem / Medical Condition</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Clinical Notes / Strategy</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProblems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No problems found matching filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProblems.map((p) => {
                    const isResolved = p.problemStatus === "Resolved";
                    return (
                      <TableRow key={p._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <TableCell className="font-mono text-slate-500 whitespace-nowrap">
                          {new Date(p.dateRecorded || p.createdAt).toLocaleDateString()}
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {p.patient?.name || "Unknown"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {p.patient?.uhid}
                          </div>
                        </TableCell>

                        <TableCell className="font-bold text-slate-900 dark:text-white">
                          {p.title}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {p.severity || "Moderate"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              isResolved
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                                : p.problemStatus === "Chronic"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300"
                                : "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300"
                            }
                          >
                            {p.problemStatus || "Active"}
                          </Badge>
                        </TableCell>

                        <TableCell className="max-w-xs truncate text-slate-600 dark:text-slate-400">
                          {p.details || "None"}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-7 px-2 text-xs flex items-center gap-1 ${
                                isResolved
                                  ? "text-slate-500 hover:bg-slate-100"
                                  : "text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                              }`}
                              onClick={() => handleToggleResolved(p)}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {isResolved ? "Re-open" : "Resolve"}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700"
                              onClick={() => handleDelete(p._id)}
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

      {/* Add Problem Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Add Patient Problem
              </DialogTitle>
              <DialogDescription>
                Record medical issue or chronic diagnosis into the patient problem list.
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
                  Diagnosing Physician
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
                <Label htmlFor="title" className="text-xs font-semibold">
                  Problem / Condition Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Chronic Kidney Disease Stage 3, Osteoarthritis of Knee"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="problemStatus" className="text-xs font-semibold">
                    Problem Status
                  </Label>
                  <Select
                    id="problemStatus"
                    value={formData.problemStatus}
                    onChange={(e) => setFormData({ ...formData, problemStatus: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="Active">Active (Ongoing)</option>
                    <option value="Chronic">Chronic (Long-term)</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Resolved">Resolved</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="severity" className="text-xs font-semibold">
                    Severity
                  </Label>
                  <Select
                    id="severity"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="details" className="text-xs font-semibold">
                  Clinical Strategy / Management Notes
                </Label>
                <Textarea
                  id="details"
                  rows={3}
                  placeholder="Document baseline lab values, medications, lifestyle modifications, and referral plans..."
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Add to Problem List
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
