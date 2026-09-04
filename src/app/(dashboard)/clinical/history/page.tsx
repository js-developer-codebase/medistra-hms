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
  History,
  Search,
  Plus,
  RefreshCw,
  Download,
  Trash2,
  Calendar,
  User,
  CheckCircle2,
  Loader2,
  Clock
} from "lucide-react";

export default function MedicalHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <MedicalHistoryContent />
    </Suspense>
  );
}

function MedicalHistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patientId") || "";
  const { toast } = useToast();

  const [records, setRecords] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientFilter, setSelectedPatientFilter] = useState(initialPatientId || "ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patient: initialPatientId,
    title: "",
    category: "Past Medical Illness",
    details: "",
    problemStatus: "Ongoing"
  });

  const loadData = async () => {
    try {
      const [recRes, patRes] = await Promise.all([
        fetch("/api/clinical/records?recordType=Medical History"),
        fetch("/api/patient")
      ]);

      const [recData, patData] = await Promise.all([
        recRes.json(),
        patRes.json()
      ]);

      if (recData.success) setRecords(recData.data || []);
      if (patData.success) setPatients(patData.data || []);
    } catch (err) {
      toast("Failed to load medical history records", "error");
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
      toast("Please select a patient and provide the condition/procedure title", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patient: formData.patient,
        recordType: "Medical History",
        title: formData.title,
        category: formData.category,
        details: formData.details,
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
        toast("Medical history entry recorded successfully!", "success");
        setCreateOpen(false);
        setFormData({
          patient: selectedPatientFilter !== "ALL" ? selectedPatientFilter : "",
          title: "",
          category: "Past Medical Illness",
          details: "",
          problemStatus: "Ongoing"
        });
        loadData();
      } else {
        toast(data.error || "Failed to save entry", "error");
      }
    } catch (err) {
      toast("An error occurred while saving medical history", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this history record?")) return;
    try {
      const res = await fetch(`/api/clinical/records/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Record removed", "success");
        loadData();
      } else {
        toast(data.error || "Failed to delete record", "error");
      }
    } catch (err) {
      toast("Error deleting record", "error");
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const patName = (r.patient?.name || "").toLowerCase();
      const uhid = (r.patient?.uhid || "").toLowerCase();
      const title = (r.title || "").toLowerCase();
      const details = (r.details || "").toLowerCase();

      const matchesSearch =
        !q ||
        patName.includes(q) ||
        uhid.includes(q) ||
        title.includes(q) ||
        details.includes(q);

      let matchesPatient = true;
      if (selectedPatientFilter !== "ALL") {
        const pId = r.patient?._id || r.patient;
        matchesPatient = pId === selectedPatientFilter;
      }

      let matchesCategory = true;
      if (categoryFilter !== "ALL") {
        matchesCategory = r.category === categoryFilter;
      }

      return matchesSearch && matchesPatient && matchesCategory;
    });
  }, [records, searchQuery, selectedPatientFilter, categoryFilter]);

  const exportCSV = () => {
    if (filteredRecords.length === 0) {
      toast("No medical history to export", "error");
      return;
    }

    const headers = [
      "Recorded Date",
      "Patient Name",
      "UHID",
      "Category",
      "Condition / Surgery",
      "Details",
      "Status"
    ];

    const rows = filteredRecords.map((r) => [
      `"${new Date(r.dateRecorded || r.createdAt).toLocaleDateString()}"`,
      `"${r.patient?.name || ""}"`,
      `"${r.patient?.uhid || ""}"`,
      `"${r.category || ""}"`,
      `"${(r.title || "").replace(/"/g, '""')}"`,
      `"${(r.details || "").replace(/"/g, '""')}"`,
      r.problemStatus || "Ongoing"
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Medical_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Medical history exported successfully", "success");
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
            <History className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Patient Medical & Surgical History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Document past illnesses, previous surgeries, family history, and chronic risk factors for patient care.
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
            Add History Entry
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search condition, procedure, details, patient..."
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
                <option value="ALL">All Patients</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.uhid || p.contact})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Categories</option>
                <option value="Past Medical Illness">Past Medical Illness</option>
                <option value="Surgical History">Surgical History</option>
                <option value="Family History">Family History</option>
                <option value="Social & Lifestyle">Social & Lifestyle</option>
                <option value="Immunization">Immunization</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Medical History Ledger</CardTitle>
          <CardDescription>
            Showing {filteredRecords.length} of {records.length} documented history events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Recorded</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Condition / Surgical Procedure</TableHead>
                  <TableHead>Clinical Notes / Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No medical history records found. Click "Add History Entry" to record past medical events.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((r) => (
                    <TableRow key={r._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono text-slate-500 whitespace-nowrap">
                        {new Date(r.dateRecorded || r.createdAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {r.patient?.name || "Unknown"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {r.patient?.uhid} • {r.patient?.gender}, {r.patient?.age}y
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {r.category || "General"}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-bold text-slate-900 dark:text-white">
                        {r.title}
                      </TableCell>

                      <TableCell className="max-w-xs text-slate-600 dark:text-slate-400 truncate">
                        {r.details || "No additional remarks"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            r.problemStatus === "Ongoing"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          }
                        >
                          {r.problemStatus || "Ongoing"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-rose-600 hover:text-rose-700 ml-auto"
                          onClick={() => handleDelete(r._id)}
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

      {/* Add History Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <History className="h-5 w-5 text-purple-600" />
                Add Patient Medical History
              </DialogTitle>
              <DialogDescription>
                Record prior surgeries, chronic illnesses, or family health conditions.
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
                  <option value="">-- Select Patient --</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.uhid || p.contact})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-semibold">
                  History Category
                </Label>
                <Select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="h-9 text-xs"
                >
                  <option value="Past Medical Illness">Past Medical Illness</option>
                  <option value="Surgical History">Surgical History</option>
                  <option value="Family History">Family History</option>
                  <option value="Social & Lifestyle">Social & Lifestyle</option>
                  <option value="Immunization">Immunization</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold">
                  Condition / Surgical Procedure Name *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Appendectomy (2018), Type 2 Diabetes Mellitus, Hypertension"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="details" className="text-xs font-semibold">
                  Clinical Details / Hospitalization Notes
                </Label>
                <Textarea
                  id="details"
                  rows={3}
                  placeholder="e.g. Performed at City Hospital without complications. Currently managed on Metformin 500mg..."
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs font-semibold">
                  Condition Status
                </Label>
                <Select
                  id="status"
                  value={formData.problemStatus}
                  onChange={(e) => setFormData({ ...formData, problemStatus: e.target.value })}
                  className="h-9 text-xs"
                >
                  <option value="Ongoing">Ongoing / Chronic</option>
                  <option value="Resolved">Resolved / In Remission</option>
                  <option value="Under Medication">Under Active Medication</option>
                </Select>
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
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Save History
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
