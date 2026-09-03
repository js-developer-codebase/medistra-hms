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
  Crosshair,
  Search,
  Plus,
  RefreshCw,
  Download,
  Eye,
  Trash2,
  Calendar,
  CheckCircle2,
  Loader2
} from "lucide-react";

export default function TreatmentPlansPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <TreatmentPlansContent />
    </Suspense>
  );
}

function TreatmentPlansContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patientId") || "";
  const { toast } = useToast();

  const [plans, setPlans] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patient: initialPatientId,
    doctor: "",
    title: "",
    assessment: "", // Clinical Goals
    plan: "", // Interventions / Regimen
    priority: "Routine",
    followUpDate: "",
    status: "Final"
  });

  // View Modal
  const [viewPlan, setViewPlan] = useState<any>(null);

  const loadData = async () => {
    try {
      const [recRes, patRes, docRes] = await Promise.all([
        fetch("/api/clinical/records?recordType=Treatment Plan"),
        fetch("/api/patient"),
        fetch("/api/user")
      ]);

      const [recData, patData, docData] = await Promise.all([
        recRes.json(),
        patRes.json(),
        docRes.json()
      ]);

      if (recData.success) setPlans(recData.data || []);
      if (patData.success) {
        setPatients(patData.data || []);
        if (initialPatientId) setCreateOpen(true);
      }
      if (docData.success) setDoctors(docData.data || []);
    } catch (err) {
      toast("Failed to load treatment plans", "error");
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
    if (!formData.patient || !formData.title || !formData.plan) {
      toast("Please select a patient, plan title, and therapeutic regimen", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        recordType: "Treatment Plan",
        dateRecorded: new Date().toISOString()
      };

      const res = await fetch("/api/clinical/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Treatment plan formulated successfully!", "success");
        setCreateOpen(false);
        setFormData({
          patient: "",
          doctor: "",
          title: "",
          assessment: "",
          plan: "",
          priority: "Routine",
          followUpDate: "",
          status: "Final"
        });
        loadData();
      } else {
        toast(data.error || "Failed to formulate plan", "error");
      }
    } catch (err) {
      toast("An error occurred while saving treatment plan", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this treatment plan?")) return;
    try {
      const res = await fetch(`/api/clinical/records/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Treatment plan deleted", "success");
        loadData();
      } else {
        toast(data.error || "Failed to delete plan", "error");
      }
    } catch (err) {
      toast("Error deleting plan", "error");
    }
  };

  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const patName = (p.patient?.name || "").toLowerCase();
      const uhid = (p.patient?.uhid || "").toLowerCase();
      const title = (p.title || "").toLowerCase();
      const regimen = (p.plan || "").toLowerCase();

      const matchesSearch =
        !q ||
        patName.includes(q) ||
        uhid.includes(q) ||
        title.includes(q) ||
        regimen.includes(q);

      let matchesPri = true;
      if (priorityFilter !== "ALL") {
        matchesPri = p.priority === priorityFilter;
      }

      return matchesSearch && matchesPri;
    });
  }, [plans, searchQuery, priorityFilter]);

  const exportCSV = () => {
    if (filteredPlans.length === 0) {
      toast("No treatment plans to export", "error");
      return;
    }

    const headers = [
      "Date Formulated",
      "Patient Name",
      "UHID",
      "Plan Title",
      "Priority",
      "Clinical Goals",
      "Therapeutic Regimen",
      "Review Date",
      "Physician"
    ];

    const rows = filteredPlans.map((p) => [
      `"${new Date(p.dateRecorded || p.createdAt).toLocaleDateString()}"`,
      `"${p.patient?.name || ""}"`,
      `"${p.patient?.uhid || ""}"`,
      `"${(p.title || "").replace(/"/g, '""')}"`,
      p.priority || "Routine",
      `"${(p.assessment || "").replace(/"/g, '""')}"`,
      `"${(p.plan || "").replace(/"/g, '""')}"`,
      p.followUpDate ? `"${new Date(p.followUpDate).toLocaleDateString()}"` : "N/A",
      `"Dr. ${p.doctor?.name || ""}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Treatment_Plans_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Treatment plans exported successfully", "success");
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
            <Crosshair className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            Comprehensive Treatment Plans
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Formulate therapeutic regimens, clinical goals of care, multidisciplinary care plans, and review milestones.
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
            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Treatment Plan
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
                placeholder="Search plan title, regimen, patient, doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="w-full sm:w-48">
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="ALL">All Priorities</option>
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
                <option value="STAT">STAT / Critical</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Active Treatment Plans</CardTitle>
          <CardDescription>
            Showing {filteredPlans.length} of {plans.length} formulated patient care pathways
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Formulated</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Plan Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Regimen / Interventions</TableHead>
                  <TableHead>Review Date</TableHead>
                  <TableHead>Physician</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-500 py-12 text-xs">
                      No treatment plans found. Click "Create Treatment Plan" to define therapeutic regimens.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlans.map((p) => (
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
                        <Badge
                          variant="secondary"
                          className={
                            p.priority === "STAT"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : p.priority === "Urgent"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : ""
                          }
                        >
                          {p.priority || "Routine"}
                        </Badge>
                      </TableCell>

                      <TableCell className="max-w-xs truncate text-slate-600 dark:text-slate-400">
                        {p.plan}
                      </TableCell>

                      <TableCell className="font-mono text-slate-500">
                        {p.followUpDate ? new Date(p.followUpDate).toLocaleDateString() : "Ongoing"}
                      </TableCell>

                      <TableCell className="font-medium">
                        Dr. {p.doctor?.name || "Attending"}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs flex items-center gap-1 text-teal-600 hover:text-teal-700"
                            onClick={() => setViewPlan(p)}
                          >
                            <Eye className="h-3 w-3" />
                            View
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Plan Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Crosshair className="h-5 w-5 text-teal-600" />
                Formulate Clinical Treatment Plan
              </DialogTitle>
              <DialogDescription>
                Define therapeutic interventions, goals of care, and milestone review dates.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="title" className="text-xs font-semibold">
                    Plan Title / Protocol Name *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g. Type 2 Diabetes Glycemic Control Regimen, Post-Op Rehabilitation"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5 col-span-1">
                  <Label htmlFor="priority" className="text-xs font-semibold">
                    Priority
                  </Label>
                  <Select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="STAT">STAT / Critical</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="assessment" className="text-xs font-semibold">
                  Clinical Goals & Expected Outcomes
                </Label>
                <Input
                  id="assessment"
                  placeholder="e.g. Target HbA1c < 7.0%, blood pressure < 130/80 mmHg within 90 days..."
                  value={formData.assessment}
                  onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="plan" className="text-xs font-semibold">
                  Therapeutic Interventions & Orders *
                </Label>
                <Textarea
                  id="plan"
                  rows={3}
                  placeholder="Document medication schedule, dietary restrictions, physical therapy exercises, and monitoring..."
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="followUpDate" className="text-xs font-semibold">
                  Scheduled Milestone / Review Date
                </Label>
                <Input
                  type="date"
                  id="followUpDate"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  className="h-9 text-xs w-48"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Formulating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Save Treatment Plan
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Plan Modal */}
      <Dialog open={!!viewPlan} onOpenChange={() => setViewPlan(null)}>
        <DialogContent className="max-w-xl">
          {viewPlan && (
            <div className="space-y-4 text-xs">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <Crosshair className="h-5 w-5 text-teal-600" />
                  {viewPlan.title}
                </DialogTitle>
                <DialogDescription>
                  Formulated on {new Date(viewPlan.dateRecorded || viewPlan.createdAt).toLocaleString()} by Dr.{" "}
                  {viewPlan.doctor?.name || "Attending"}
                </DialogDescription>
              </DialogHeader>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-1">
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {viewPlan.patient?.name}
                </div>
                <div className="text-slate-500 text-[11px]">
                  UHID: {viewPlan.patient?.uhid} • Priority: {viewPlan.priority}
                </div>
              </div>

              <div className="space-y-3">
                {viewPlan.assessment && (
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase">
                      Goals & Objectives
                    </span>
                    <p className="text-teal-700 dark:text-teal-400 font-medium mt-0.5">
                      {viewPlan.assessment}
                    </p>
                  </div>
                )}

                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase">
                    Therapeutic Regimen & Orders
                  </span>
                  <p className="text-slate-900 dark:text-white mt-0.5 whitespace-pre-wrap">
                    {viewPlan.plan}
                  </p>
                </div>

                {viewPlan.followUpDate && (
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase">
                      Review / Target Date
                    </span>
                    <p className="text-slate-900 dark:text-white font-mono mt-0.5">
                      {new Date(viewPlan.followUpDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setViewPlan(null)}>
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
