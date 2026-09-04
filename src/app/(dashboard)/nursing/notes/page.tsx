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
  FileText,
  Search,
  Plus,
  RefreshCw,
  Download,
  Eye,
  Trash2,
  Calendar,
  User,
  CheckCircle2,
  Loader2
} from "lucide-react";

export default function NursingNotesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <NursingNotesContent />
    </Suspense>
  );
}

function NursingNotesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patientId") || "";
  const { toast } = useToast();

  const [notes, setNotes] = useState<any[]>([]);
  const [inpatients, setInpatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientFilter, setSelectedPatientFilter] = useState(initialPatientId || "ALL");

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patient: initialPatientId,
    title: "",
    category: "Morning Round",
    chiefComplaint: "", // Data (D)
    objectiveFindings: "", // Action (A)
    assessment: "", // Response (R)
    plan: "" // Follow up
  });

  // View Modal
  const [viewNote, setViewNote] = useState<any>(null);

  const loadData = async () => {
    try {
      const [notesRes, ptsRes] = await Promise.all([
        fetch("/api/clinical/records?recordType=Nursing Note"),
        fetch("/api/nursing/my-patients")
      ]);

      const [notesData, ptsData] = await Promise.all([
        notesRes.json(),
        ptsRes.json()
      ]);

      if (notesData.success) setNotes(notesData.data || []);
      if (ptsData.success) {
        setInpatients(ptsData.data || []);
        if (initialPatientId) setCreateOpen(true);
      }
    } catch (err) {
      toast("Failed to load nursing notes", "error");
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
      toast("Please select a patient and provide a note title", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patient: formData.patient,
        recordType: "Nursing Note",
        title: formData.title,
        category: formData.category,
        chiefComplaint: formData.chiefComplaint,
        objectiveFindings: formData.objectiveFindings,
        assessment: formData.assessment,
        plan: formData.plan,
        dateRecorded: new Date().toISOString()
      };

      const res = await fetch("/api/clinical/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Nursing progress note recorded successfully!", "success");
        setCreateOpen(false);
        setFormData({
          patient: selectedPatientFilter !== "ALL" ? selectedPatientFilter : "",
          title: "",
          category: "Morning Round",
          chiefComplaint: "",
          objectiveFindings: "",
          assessment: "",
          plan: ""
        });
        loadData();
      } else {
        toast(data.error || "Failed to save note", "error");
      }
    } catch (err) {
      toast("An error occurred while saving nursing note", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this nursing note?")) return;
    try {
      const res = await fetch(`/api/clinical/records/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Note deleted", "success");
        loadData();
      } else {
        toast(data.error || "Failed to delete note", "error");
      }
    } catch (err) {
      toast("Error deleting note", "error");
    }
  };

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const q = searchQuery.toLowerCase().trim();
      const patName = (n.patient?.name || "").toLowerCase();
      const uhid = (n.patient?.uhid || "").toLowerCase();
      const title = (n.title || "").toLowerCase();
      const desc = (n.chiefComplaint || "").toLowerCase();

      const matchesSearch = !q || patName.includes(q) || uhid.includes(q) || title.includes(q) || desc.includes(q);

      let matchesPatient = true;
      if (selectedPatientFilter !== "ALL") {
        const pId = n.patient?._id || n.patient;
        matchesPatient = pId === selectedPatientFilter;
      }

      return matchesSearch && matchesPatient;
    });
  }, [notes, searchQuery, selectedPatientFilter]);

  const exportCSV = () => {
    if (filteredNotes.length === 0) {
      toast("No nursing notes to export", "error");
      return;
    }

    const headers = [
      "Timestamp",
      "Patient Name",
      "UHID",
      "Shift / Category",
      "Title / Focus",
      "Data (D)",
      "Action (A)",
      "Response (R)"
    ];

    const rows = filteredNotes.map((n) => [
      `"${new Date(n.dateRecorded || n.createdAt).toLocaleString()}"`,
      `"${n.patient?.name || ""}"`,
      `"${n.patient?.uhid || ""}"`,
      `"${n.category || "General"}"`,
      `"${(n.title || "").replace(/"/g, '""')}"`,
      `"${(n.chiefComplaint || "").replace(/"/g, '""')}"`,
      `"${(n.objectiveFindings || "").replace(/"/g, '""')}"`,
      `"${(n.assessment || "").replace(/"/g, '""')}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Nursing_Notes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Nursing notes exported successfully", "success");
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
            <FileText className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            Nursing Notes & Bedside Observations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Document shift observations, DAR (Data, Action, Response) notes, patient pain levels, and nursing care events.
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
            className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Nursing Note
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
                placeholder="Search note focus, patient, observation details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="w-full sm:w-60">
              <Select
                value={selectedPatientFilter}
                onChange={(e) => setSelectedPatientFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="ALL">All Inpatients</option>
                {inpatients.map((p) => (
                  <option key={p.patientId} value={p.patientId}>
                    Bed {p.bedNumber} - {p.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Nursing Notes Ledger</CardTitle>
          <CardDescription>
            Showing {filteredNotes.length} of {notes.length} bedside progress and observation notes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Observation Time</TableHead>
                  <TableHead>Inpatient Particulars</TableHead>
                  <TableHead>Shift / Shift Category</TableHead>
                  <TableHead>Focus / Note Title</TableHead>
                  <TableHead>Summary Observation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-12 text-xs">
                      No nursing notes recorded. Click "Add Nursing Note" to document bedside care.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotes.map((n) => (
                    <TableRow key={n._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono text-slate-500 whitespace-nowrap">
                        {new Date(n.dateRecorded || n.createdAt).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short"
                        })}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {n.patient?.name || "Unknown"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {n.patient?.uhid}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {n.category || "Morning Round"}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-bold text-slate-900 dark:text-white">
                        {n.title}
                      </TableCell>

                      <TableCell className="max-w-xs truncate text-slate-600 dark:text-slate-400">
                        {n.chiefComplaint || n.objectiveFindings || "Observation documented"}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs flex items-center gap-1 text-cyan-600 hover:text-cyan-700"
                            onClick={() => setViewNote(n)}
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700"
                            onClick={() => handleDelete(n._id)}
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

      {/* Add Nursing Note Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-600" />
                Document Bedside Nursing Note (DAR)
              </DialogTitle>
              <DialogDescription>
                Record shift observations, patient condition changes, and immediate nursing interventions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <Label htmlFor="category" className="text-xs font-semibold">
                    Shift / Note Category
                  </Label>
                  <Select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="Morning Round">Morning Shift Round</option>
                    <option value="Evening Round">Evening Shift Round</option>
                    <option value="Night Observation">Night Shift Observation</option>
                    <option value="Post-Procedure">Post-Procedure Check</option>
                    <option value="Medication Reaction">Medication Response</option>
                    <option value="Incident / Fall">Incident / Fall Report</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold">
                  Focus / Note Heading *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Post-Op Pain Management, Catheter Site Inspection, Fever Management"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>

              {/* [D] Data */}
              <div className="space-y-1.5">
                <Label htmlFor="data" className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                  [D] Data — Patient Symptoms, Complaints & Observations
                </Label>
                <Textarea
                  id="data"
                  rows={2}
                  placeholder="Patient reports surgical wound throbbing, pain 6/10. Dressing intact, no bleeding..."
                  value={formData.chiefComplaint}
                  onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                  className="text-xs"
                />
              </div>

              {/* [A] Action */}
              <div className="space-y-1.5">
                <Label htmlFor="action" className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                  [A] Action — Nursing Interventions Taken
                </Label>
                <Textarea
                  id="action"
                  rows={2}
                  placeholder="Administered prescribed IV Tramadol 50mg as ordered. Repositioned comfortably..."
                  value={formData.objectiveFindings}
                  onChange={(e) => setFormData({ ...formData, objectiveFindings: e.target.value })}
                  className="text-xs"
                />
              </div>

              {/* [R] Response */}
              <div className="space-y-1.5">
                <Label htmlFor="response" className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                  [R] Response — Patient Response & Evaluation
                </Label>
                <Textarea
                  id="response"
                  rows={2}
                  placeholder="30 mins post-dose, patient reports pain reduced to 2/10. Vital signs stable..."
                  value={formData.assessment}
                  onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Save Nursing Note
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Note Modal */}
      <Dialog open={!!viewNote} onOpenChange={() => setViewNote(null)}>
        <DialogContent className="max-w-lg">
          {viewNote && (
            <div className="space-y-4 text-xs">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-cyan-600" />
                  {viewNote.title}
                </DialogTitle>
                <DialogDescription>
                  Recorded on {new Date(viewNote.dateRecorded || viewNote.createdAt).toLocaleString()} • Shift: {viewNote.category}
                </DialogDescription>
              </DialogHeader>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {viewNote.patient?.name}
                </div>
                <div className="text-slate-500 text-[11px]">UHID: {viewNote.patient?.uhid}</div>
              </div>

              <div className="space-y-2.5">
                <div className="p-2.5 rounded border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-cyan-700 dark:text-cyan-400 block text-[11px]">[D] DATA</span>
                  <p className="mt-1 text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                    {viewNote.chiefComplaint || "No data recorded"}
                  </p>
                </div>

                <div className="p-2.5 rounded border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-cyan-700 dark:text-cyan-400 block text-[11px]">[A] ACTION</span>
                  <p className="mt-1 text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                    {viewNote.objectiveFindings || "No immediate action recorded"}
                  </p>
                </div>

                <div className="p-2.5 rounded border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-cyan-700 dark:text-cyan-400 block text-[11px]">[R] RESPONSE</span>
                  <p className="mt-1 text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                    {viewNote.assessment || "Patient stable"}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setViewNote(null)}>
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
