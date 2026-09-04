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
  Trash2,
  CheckCircle2,
  Calendar,
  User,
  Loader2,
  Eye
} from "lucide-react";

export default function NursingCarePlansPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <NursingCarePlansContent />
    </Suspense>
  );
}

function NursingCarePlansContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patientId") || "";
  const { toast } = useToast();

  const [plans, setPlans] = useState<any[]>([]);
  const [inpatients, setInpatients] = useState<any[]>([]);
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
    diagnosis: "",
    goals: "",
    interventions: "",
    evaluation: "",
    status: "ACTIVE"
  });

  // View Modal
  const [viewPlan, setViewPlan] = useState<any>(null);

  const loadData = async () => {
    try {
      const [plansRes, ptsRes] = await Promise.all([
        fetch("/api/nursing/care-plans"),
        fetch("/api/nursing/my-patients")
      ]);

      const [plansData, ptsData] = await Promise.all([
        plansRes.json(),
        ptsRes.json()
      ]);

      if (plansData.success) setPlans(plansData.data || []);
      if (ptsData.success) {
        setInpatients(ptsData.data || []);
        if (initialPatientId) setCreateOpen(true);
      }
    } catch (err) {
      toast("Failed to load care plans", "error");
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
    if (!formData.patient || !formData.diagnosis || !formData.goals || !formData.interventions) {
      toast("Please complete all required care plan fields", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/nursing/care-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Nursing care plan formulated successfully!", "success");
        setCreateOpen(false);
        setFormData({
          patient: "",
          diagnosis: "",
          goals: "",
          interventions: "",
          evaluation: "",
          status: "ACTIVE"
        });
        loadData();
      } else {
        toast(data.message || "Failed to formulate care plan", "error");
      }
    } catch (err) {
      toast("An error occurred while saving care plan", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (plan: any) => {
    const nextStatus = plan.status === "ACTIVE" ? "RESOLVED" : "ACTIVE";
    try {
      const res = await fetch(`/api/nursing/care-plans/${plan._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Care plan marked as ${nextStatus}`, "success");
        loadData();
      } else {
        toast(data.message || "Failed to update status", "error");
      }
    } catch (err) {
      toast("Error updating care plan status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this nursing care plan?")) return;
    try {
      const res = await fetch(`/api/nursing/care-plans/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Care plan deleted", "success");
        loadData();
      } else {
        toast(data.message || "Failed to delete plan", "error");
      }
    } catch (err) {
      toast("Error deleting care plan", "error");
    }
  };

  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const patName = (p.patient?.name || "").toLowerCase();
      const uhid = (p.patient?.uhid || "").toLowerCase();
      const diag = (p.diagnosis || "").toLowerCase();
      const goals = (p.goals || "").toLowerCase();

      const matchesSearch =
        !q || patName.includes(q) || uhid.includes(q) || diag.includes(q) || goals.includes(q);

      let matchesStatus = true;
      if (statusFilter !== "ALL") {
        matchesStatus = p.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [plans, searchQuery, statusFilter]);

  const statsCount = useMemo(() => {
    let active = 0;
    let resolved = 0;
    plans.forEach((p) => {
      if (p.status === "ACTIVE") active++;
      else resolved++;
    });
    return { total: plans.length, active, resolved };
  }, [plans]);

  const exportCSV = () => {
    if (filteredPlans.length === 0) {
      toast("No care plans to export", "error");
      return;
    }

    const headers = [
      "Created Date",
      "Patient Name",
      "UHID",
      "Nursing Diagnosis",
      "Goals / Desired Outcomes",
      "Interventions",
      "Evaluation",
      "Status"
    ];

    const rows = filteredPlans.map((p) => [
      `"${new Date(p.createdAt).toLocaleDateString()}"`,
      `"${p.patient?.name || ""}"`,
      `"${p.patient?.uhid || ""}"`,
      `"${(p.diagnosis || "").replace(/"/g, '""')}"`,
      `"${(p.goals || "").replace(/"/g, '""')}"`,
      `"${(p.interventions || "").replace(/"/g, '""')}"`,
      `"${(p.evaluation || "").replace(/"/g, '""')}"`,
      p.status || "ACTIVE"
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Nursing_Care_Plans_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Care plans exported successfully", "success");
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
            Standardized Nursing Care Plans (NCP)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            NANDA nursing diagnoses, measurable patient outcome goals, tailored clinical interventions, and evaluation.
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
            Formulate Care Plan
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Total Care Plans</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
            {statsCount.total}
          </span>
          <span className="text-[10px] text-slate-400">All documented clinical pathways</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Active Care Plans</span>
          <span className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1 block">
            {statsCount.active}
          </span>
          <span className="text-[10px] text-teal-600">Currently being implemented</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Resolved / Met Goals</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {statsCount.resolved}
          </span>
          <span className="text-[10px] text-emerald-600">Discharged or goals achieved</span>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search diagnosis, goals, patient, UHID..."
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
                <option value="ACTIVE">Active</option>
                <option value="RESOLVED">Resolved</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Active Nursing Care Pathways</CardTitle>
          <CardDescription>
            Showing {filteredPlans.length} of {plans.length} formulated care pathways
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created</TableHead>
                  <TableHead>Inpatient Particulars</TableHead>
                  <TableHead>Nursing Diagnosis</TableHead>
                  <TableHead>Goals & Expected Outcomes</TableHead>
                  <TableHead>Interventions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No care plans found matching criteria. Click "Formulate Care Plan" to add one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlans.map((p) => {
                    const isResolved = p.status === "RESOLVED";
                    return (
                      <TableRow key={p._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <TableCell className="font-mono text-slate-500 whitespace-nowrap">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {p.patient?.name || "Unknown"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {p.patient?.uhid}
                          </div>
                        </TableCell>

                        <TableCell className="font-bold text-teal-800 dark:text-teal-300 max-w-xs">
                          {p.diagnosis}
                        </TableCell>

                        <TableCell className="max-w-xs truncate text-slate-700 dark:text-slate-300">
                          {p.goals}
                        </TableCell>

                        <TableCell className="max-w-xs truncate text-slate-500">
                          {p.interventions}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              isResolved
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                                : "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300"
                            }
                          >
                            {p.status || "ACTIVE"}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1"
                              onClick={() => setViewPlan(p)}
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-7 px-2 text-xs flex items-center gap-1 ${
                                isResolved ? "text-slate-500" : "text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                              }`}
                              onClick={() => handleToggleStatus(p)}
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

      {/* Formulate Care Plan Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Crosshair className="h-5 w-5 text-teal-600" />
                Formulate Nursing Care Plan
              </DialogTitle>
              <DialogDescription>
                Define nursing diagnosis, patient goals, and evidence-based clinical interventions.
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
                  <option value="">-- Select Inpatient --</option>
                  {inpatients.map((p) => (
                    <option key={p.patientId} value={p.patientId}>
                      Bed {p.bedNumber} - {p.name} ({p.uhid})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="diag" className="text-xs font-semibold">
                  Nursing Diagnosis (NANDA Statement) *
                </Label>
                <Input
                  id="diag"
                  placeholder="e.g. Acute Pain related to surgical wound, Risk for Fall, Impaired Mobility"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="goals" className="text-xs font-semibold">
                  Goals & Expected Patient Outcomes *
                </Label>
                <Textarea
                  id="goals"
                  rows={2}
                  placeholder="e.g. Patient will verbalize pain score <= 3/10 within 1 hour post-analgesic administration..."
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="interventions" className="text-xs font-semibold">
                  Nursing Interventions & Rationale *
                </Label>
                <Textarea
                  id="interventions"
                  rows={3}
                  placeholder="e.g. 1. Assess pain Q4H using visual analog scale. 2. Administer prescribed IV analgesia. 3. Reposition Q2H..."
                  value={formData.interventions}
                  onChange={(e) => setFormData({ ...formData, interventions: e.target.value })}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="evaluation" className="text-xs font-semibold">
                  Evaluation Criteria / Outcome Review Notes
                </Label>
                <Textarea
                  id="evaluation"
                  rows={2}
                  placeholder="e.g. Goal partially met. Patient resting comfortably in bed with minimal grimacing..."
                  value={formData.evaluation}
                  onChange={(e) => setFormData({ ...formData, evaluation: e.target.value })}
                  className="text-xs"
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
                    Save Care Plan
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Care Plan Modal */}
      <Dialog open={!!viewPlan} onOpenChange={() => setViewPlan(null)}>
        <DialogContent className="max-w-lg">
          {viewPlan && (
            <div className="space-y-4 text-xs">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <Crosshair className="h-5 w-5 text-teal-600" />
                  {viewPlan.diagnosis}
                </DialogTitle>
                <DialogDescription>
                  Formulated on {new Date(viewPlan.createdAt).toLocaleDateString()} • Status: {viewPlan.status}
                </DialogDescription>
              </DialogHeader>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {viewPlan.patient?.name}
                </div>
                <div className="text-slate-500 text-[11px]">UHID: {viewPlan.patient?.uhid}</div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="font-bold text-teal-700 dark:text-teal-400 block text-[11px] uppercase">
                    Goals & Expected Outcomes
                  </span>
                  <p className="mt-1 text-slate-800 dark:text-slate-200">{viewPlan.goals}</p>
                </div>

                <div>
                  <span className="font-bold text-teal-700 dark:text-teal-400 block text-[11px] uppercase">
                    Nursing Interventions
                  </span>
                  <p className="mt-1 text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                    {viewPlan.interventions}
                  </p>
                </div>

                {viewPlan.evaluation && (
                  <div>
                    <span className="font-bold text-teal-700 dark:text-teal-400 block text-[11px] uppercase">
                      Evaluation & Outcomes
                    </span>
                    <p className="mt-1 text-slate-800 dark:text-slate-200">{viewPlan.evaluation}</p>
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
