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
  ClipboardList,
  Search,
  Plus,
  RefreshCw,
  Download,
  Trash2,
  CheckCircle2,
  Calendar,
  User,
  Activity,
  Loader2
} from "lucide-react";

export default function DiagnosesRegistryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <DiagnosesContent />
    </Suspense>
  );
}

function DiagnosesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patientId") || "";
  const { toast } = useToast();

  const [diagnoses, setDiagnoses] = useState<any[]>([]);
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
    code: "",
    description: "",
    status: "Active",
    dateDiagnosed: new Date().toISOString().slice(0, 10),
    notes: ""
  });

  const loadData = async () => {
    try {
      const [diagRes, patRes, docRes] = await Promise.all([
        fetch("/api/clinical/diagnoses"),
        fetch("/api/patient"),
        fetch("/api/user")
      ]);

      const [diagData, patData, docData] = await Promise.all([
        diagRes.json(),
        patRes.json(),
        docRes.json()
      ]);

      if (diagData.success) setDiagnoses(diagData.data || []);
      if (patData.success) {
        setPatients(patData.data || []);
        if (initialPatientId) setCreateOpen(true);
      }
      if (docData.success) setDoctors(docData.data || []);
    } catch (err) {
      toast("Failed to load clinical diagnoses", "error");
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
    if (!formData.patient || !formData.description) {
      toast("Please select a patient and provide the diagnosis description", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        doctor: formData.doctor || undefined
      };

      const res = await fetch("/api/clinical/diagnoses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Diagnosis recorded successfully!", "success");
        setCreateOpen(false);
        setFormData({
          patient: "",
          doctor: "",
          code: "",
          description: "",
          status: "Active",
          dateDiagnosed: new Date().toISOString().slice(0, 10),
          notes: ""
        });
        loadData();
      } else {
        toast(data.error || "Failed to record diagnosis", "error");
      }
    } catch (err) {
      toast("An error occurred while saving diagnosis", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this diagnosis?")) return;
    try {
      const res = await fetch(`/api/clinical/diagnoses/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Diagnosis removed", "success");
        loadData();
      } else {
        toast(data.error || "Failed to delete diagnosis", "error");
      }
    } catch (err) {
      toast("Error deleting diagnosis", "error");
    }
  };

  const filteredDiagnoses = useMemo(() => {
    return diagnoses.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const patName = (d.patient?.name || "").toLowerCase();
      const uhid = (d.patient?.uhid || "").toLowerCase();
      const desc = (d.description || "").toLowerCase();
      const code = (d.code || "").toLowerCase();
      const docName = (d.doctor?.name || "").toLowerCase();

      const matchesSearch =
        !q ||
        patName.includes(q) ||
        uhid.includes(q) ||
        desc.includes(q) ||
        code.includes(q) ||
        docName.includes(q);

      let matchesStatus = true;
      if (statusFilter !== "ALL") {
        matchesStatus = d.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [diagnoses, searchQuery, statusFilter]);

  const statsCount = useMemo(() => {
    let active = 0;
    let chronic = 0;
    let resolved = 0;
    diagnoses.forEach((d) => {
      if (d.status === "Active") active++;
      else if (d.status === "Chronic") chronic++;
      else if (d.status === "Resolved") resolved++;
    });
    return { total: diagnoses.length, active, chronic, resolved };
  }, [diagnoses]);

  const exportCSV = () => {
    if (filteredDiagnoses.length === 0) {
      toast("No diagnoses to export", "error");
      return;
    }

    const headers = [
      "Date Diagnosed",
      "Patient Name",
      "UHID",
      "ICD-10 Code",
      "Description",
      "Doctor",
      "Status",
      "Notes"
    ];

    const rows = filteredDiagnoses.map((d) => [
      `"${new Date(d.dateDiagnosed).toLocaleDateString()}"`,
      `"${d.patient?.name || ""}"`,
      `"${d.patient?.uhid || ""}"`,
      `"${d.code || "N/A"}"`,
      `"${(d.description || "").replace(/"/g, '""')}"`,
      `"Dr. ${d.doctor?.name || ""}"`,
      d.status || "Active",
      `"${(d.notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Clinical_Diagnoses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Diagnoses exported successfully", "success");
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
            <ClipboardList className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            Diagnostic Ledger & ICD-10 Registry
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Record, classify, and track clinical diagnoses with ICD-10 standard coding and chronological resolution.
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
            className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Diagnosis
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Total Diagnoses</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
            {statsCount.total}
          </span>
          <span className="text-[10px] text-slate-400">Total coded conditions</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Active Conditions</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {statsCount.active}
          </span>
          <span className="text-[10px] text-amber-600">Currently under treatment</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Chronic Conditions</span>
          <span className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">
            {statsCount.chronic}
          </span>
          <span className="text-[10px] text-purple-600">Long-term management</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Resolved</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {statsCount.resolved}
          </span>
          <span className="text-[10px] text-emerald-600">Cured / In remission</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search condition, ICD-10 code, patient, doctor..."
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
                <option value="Resolved">Resolved</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnoses Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Diagnoses Ledger</CardTitle>
          <CardDescription>
            Showing {filteredDiagnoses.length} of {diagnoses.length} patient diagnoses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Diagnosed</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>ICD-10 Code</TableHead>
                  <TableHead>Diagnostic Description</TableHead>
                  <TableHead>Attending Doctor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDiagnoses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No clinical diagnoses found matching filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDiagnoses.map((d) => (
                    <TableRow key={d._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono text-slate-500 whitespace-nowrap">
                        {new Date(d.dateDiagnosed).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {d.patient?.name || "Unknown"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {d.patient?.uhid} • {d.patient?.gender}, {d.patient?.age}y
                        </div>
                      </TableCell>

                      <TableCell>
                        {d.code ? (
                          <Badge variant="outline" className="font-mono font-bold text-[10px] text-amber-700 dark:text-amber-400 border-amber-300">
                            {d.code}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Uncoded</span>
                        )}
                      </TableCell>

                      <TableCell className="font-bold text-slate-900 dark:text-white max-w-xs">
                        {d.description}
                        {d.notes && (
                          <span className="text-[10px] text-slate-400 font-normal block mt-0.5 truncate">
                            {d.notes}
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="font-medium">
                        Dr. {d.doctor?.name || "Medical Officer"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            d.status === "Active"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                              : d.status === "Chronic"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                          }
                        >
                          {d.status || "Active"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-rose-600 hover:text-rose-700 ml-auto"
                          onClick={() => handleDelete(d._id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Add Diagnosis Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-amber-600" />
                Record Patient Diagnosis
              </DialogTitle>
              <DialogDescription>
                Document clinical diagnosis with optional ICD-10 code classification.
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

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5 col-span-1">
                  <Label htmlFor="code" className="text-xs font-semibold">
                    ICD-10 Code
                  </Label>
                  <Input
                    id="code"
                    placeholder="e.g. I21.9"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="status" className="text-xs font-semibold">
                    Clinical Status
                  </Label>
                  <Select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="Active">Active (Under Treatment)</option>
                    <option value="Chronic">Chronic (Long-term Disease)</option>
                    <option value="Resolved">Resolved (Cured / Remission)</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold">
                  Diagnostic Description *
                </Label>
                <Input
                  id="description"
                  placeholder="e.g. Acute Myocardial Infarction / Essential Primary Hypertension"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dateDiagnosed" className="text-xs font-semibold">
                  Date Diagnosed
                </Label>
                <Input
                  type="date"
                  id="dateDiagnosed"
                  value={formData.dateDiagnosed}
                  onChange={(e) => setFormData({ ...formData, dateDiagnosed: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-semibold">
                  Clinical Notes / Investigations Rationale
                </Label>
                <Textarea
                  id="notes"
                  rows={2}
                  placeholder="e.g. Confirmed by 12-lead ECG and elevated cardiac enzymes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Record Diagnosis
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
