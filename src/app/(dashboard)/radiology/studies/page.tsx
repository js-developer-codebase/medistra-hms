"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Layers,
  Search,
  RefreshCw,
  Download,
  Images,
  FileEdit,
  CheckCircle2,
  Loader2,
  Scan,
  Activity,
  Radio
} from "lucide-react";

export default function StudyManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <StudyManagementContent />
    </Suspense>
  );
}

function StudyManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("studyId") || "";
  const { toast } = useToast();

  const [studies, setStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Complete Study Modal
  const [selectedStudy, setSelectedStudy] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [studyForm, setStudyForm] = useState({
    seriesCount: 2,
    instanceCount: 120,
    technicianNotes: "Scan completed with good diagnostic quality. Patient tolerated well.",
    technique: "Standard helical acquisition with axial, coronal and sagittal multiplanar reconstructions."
  });

  const loadData = async () => {
    try {
      const res = await fetch("/api/radiology/studies");
      const data = await res.json();
      if (data.success) {
        const list = data.data || [];
        setStudies(list);

        if (preselectedId) {
          const found = list.find((s: any) => s._id === preselectedId);
          if (found) {
            setSelectedStudy(found);
            setStudyForm({
              seriesCount: found.seriesCount || 2,
              instanceCount: found.instanceCount || 120,
              technicianNotes: found.technicianNotes || "Scan completed with good diagnostic quality.",
              technique: found.technique || "Standard axial and multiplanar reconstructions."
            });
          }
        }
      }
    } catch (err) {
      toast("Failed to load imaging studies", "error");
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

  const handleCompleteAcquisition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudy) return;

    setSubmitting(true);
    try {
      const payload = {
        seriesCount: Number(studyForm.seriesCount) || 1,
        instanceCount: Number(studyForm.instanceCount) || 10,
        technicianNotes: studyForm.technicianNotes,
        technique: studyForm.technique,
        status: "IMAGES_UPLOADED"
      };

      const res = await fetch(`/api/radiology/studies/${selectedStudy._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Acquisition finalized for Accession #${selectedStudy.accessionNumber}! Queued for radiologist dictation.`, "success");
        setSelectedStudy(null);
        loadData();
      } else {
        toast(data.message || "Failed to finalize study", "error");
      }
    } catch (err) {
      toast("Error finalizing study", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudies = useMemo(() => {
    return studies.filter((s) => {
      const q = search.toLowerCase().trim();
      const patName = (s.patient?.name || "").toLowerCase();
      const uhid = (s.patient?.uhid || "").toLowerCase();
      const accNum = (s.accessionNumber || "").toLowerCase();

      const matchesSearch = !q || patName.includes(q) || uhid.includes(q) || accNum.includes(q);

      let matchesStatus = true;
      if (statusFilter !== "ALL") matchesStatus = s.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [studies, search, statusFilter]);

  const exportCSV = () => {
    if (filteredStudies.length === 0) {
      toast("No studies to export", "error");
      return;
    }

    const headers = [
      "Accession #",
      "Created At",
      "Patient Name",
      "UHID",
      "Modality",
      "Body Part",
      "Series",
      "Slices / Instances",
      "Status"
    ];

    const rows = filteredStudies.map((s) => [
      `"${s.accessionNumber || ""}"`,
      `"${new Date(s.createdAt).toLocaleString()}"`,
      `"${s.patient?.name || ""}"`,
      `"${s.patient?.uhid || ""}"`,
      `"${s.modality || "X-RAY"}"`,
      `"${s.bodyPart || "Chest"}"`,
      s.seriesCount || 1,
      s.instanceCount || 2,
      s.status
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Imaging_Studies_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Studies exported successfully", "success");
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
            <Layers className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            Diagnostic Study Management & Acquisition Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Scanner series acquisition registration, slice count tracking, technician annotations, and PACS upload handover.
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
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search accession #, patient name, UHID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="w-full sm:w-56">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="ALL">All Study Stages</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress (Scanning)</option>
                <option value="IMAGES_UPLOADED">Images Uploaded (Awaiting Read)</option>
                <option value="FINALIZED">Finalized / Released</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Studies Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Imaging Studies Ledger</CardTitle>
          <CardDescription>
            Showing {filteredStudies.length} of {studies.length} diagnostic acquisitions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Accession #</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Modality & Region</TableHead>
                  <TableHead>Series / Slices</TableHead>
                  <TableHead>Study Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-12 text-xs">
                      No studies found matching current filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudies.map((s) => (
                    <TableRow key={s._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-bold font-mono text-slate-900 dark:text-white">
                          {s.accessionNumber || `RAD-${s._id.slice(-6).toUpperCase()}`}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {s.patient?.name || "Patient"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {s.patient?.uhid}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            s.modality === "MRI"
                              ? "bg-purple-100 text-purple-800"
                              : s.modality === "CT"
                              ? "bg-cyan-100 text-cyan-800"
                              : s.modality === "ULTRASOUND"
                              ? "bg-teal-100 text-teal-800"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {s.modality || "X-RAY"}
                        </Badge>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{s.bodyPart || "General"}</span>
                      </TableCell>

                      <TableCell className="font-mono">
                        <span className="font-bold text-slate-900 dark:text-white">{s.seriesCount || 1}</span> series •{" "}
                        <span className="text-slate-500">{s.instanceCount || 2} slices</span>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            s.status === "FINALIZED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : s.status === "IMAGES_UPLOADED"
                              ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                              : s.status === "IN_PROGRESS"
                              ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }
                        >
                          {s.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {s.status !== "FINALIZED" && (
                            <Button
                              size="sm"
                              className="h-7 px-2 text-xs bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-1"
                              onClick={() => {
                                setSelectedStudy(s);
                                setStudyForm({
                                  seriesCount: s.seriesCount || 2,
                                  instanceCount: s.instanceCount || 120,
                                  technicianNotes: s.technicianNotes || "Scan completed with good diagnostic quality.",
                                  technique: s.technique || "Standard axial and multiplanar reconstructions."
                                });
                              }}
                            >
                              Finalize Slices
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs text-indigo-600 border-indigo-300 hover:bg-indigo-50 flex items-center gap-1"
                            onClick={() => router.push(`/radiology/images?studyId=${s._id}`)}
                          >
                            <Images className="h-3 w-3" />
                            PACS
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

      {/* Complete Acquisition Modal */}
      <Dialog open={!!selectedStudy} onOpenChange={() => setSelectedStudy(null)}>
        <DialogContent className="max-w-md">
          {selectedStudy && (
            <form onSubmit={handleCompleteAcquisition}>
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <Layers className="h-5 w-5 text-cyan-600" />
                  Finalize Scan Acquisition — {selectedStudy.accessionNumber}
                </DialogTitle>
                <DialogDescription>
                  Patient: {selectedStudy.patient?.name} ({selectedStudy.patient?.uhid}) • {selectedStudy.modality} {selectedStudy.bodyPart}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="scount" className="text-xs font-semibold">
                      Series Count
                    </Label>
                    <Input
                      type="number"
                      id="scount"
                      value={studyForm.seriesCount}
                      onChange={(e) => setStudyForm({ ...studyForm, seriesCount: Number(e.target.value) })}
                      required
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="icount" className="text-xs font-semibold">
                      Total Slices / Instances
                    </Label>
                    <Input
                      type="number"
                      id="icount"
                      value={studyForm.instanceCount}
                      onChange={(e) => setStudyForm({ ...studyForm, instanceCount: Number(e.target.value) })}
                      required
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tech" className="text-xs font-semibold">
                    Technique / Sequence Parameters
                  </Label>
                  <Input
                    id="tech"
                    value={studyForm.technique}
                    onChange={(e) => setStudyForm({ ...studyForm, technique: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tnotes" className="text-xs font-semibold">
                    Technician Observations / Contrast Dosage
                  </Label>
                  <Textarea
                    id="tnotes"
                    rows={3}
                    value={studyForm.technicianNotes}
                    onChange={(e) => setStudyForm({ ...studyForm, technicianNotes: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setSelectedStudy(null)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Finalizing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Save & Send to PACS
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
