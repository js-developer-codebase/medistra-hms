"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  ClipboardList,
  Plus,
  Search,
  RefreshCw,
  Download,
  Trash2,
  CheckCircle2,
  Loader2,
  Scan,
  AlertTriangle,
  Play
} from "lucide-react";

export default function ImagingOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <ImagingOrdersContent />
    </Suspense>
  );
}

function ImagingOrdersContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [modalityFilter, setModalityFilter] = useState("ALL");

  // Create Modal
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    procedure: "",
    studyType: "X-Ray Chest PA View",
    modality: "X-RAY",
    bodyPart: "Chest",
    price: 600,
    priority: "ROUTINE",
    contrast: false,
    pregnancyStatus: "Negative",
    clinicalNotes: ""
  });

  const loadData = async () => {
    try {
      const [ordRes, patRes, docRes, procRes] = await Promise.all([
        fetch("/api/radiology/orders"),
        fetch("/api/patient"),
        fetch("/api/doctor"),
        fetch("/api/radiology/procedures")
      ]);

      const [ordData, patData, docData, procData] = await Promise.all([
        ordRes.json(),
        patRes.json(),
        docRes.json(),
        procRes.json()
      ]);

      if (ordData.success) setOrders(ordData.data || []);
      if (patData.success) setPatients(patData.data || []);
      if (docData.success) setDoctors(docData.data || []);
      if (procData.success) setProcedures(procData.data || []);
    } catch (error) {
      toast("Error loading imaging requisitions", "error");
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

  const handleProcedureSelect = (procId: string) => {
    const proc = procedures.find((p) => p._id === procId);
    if (proc) {
      setFormData((prev) => ({
        ...prev,
        procedure: procId,
        studyType: proc.name,
        modality: proc.modality,
        bodyPart: proc.bodyPart,
        price: proc.price,
        contrast: proc.requiresContrast || false
      }));
    } else {
      setFormData((prev) => ({ ...prev, procedure: procId }));
    }
  };

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient) {
      toast("Please select a patient", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patient: formData.patient,
        doctor: formData.doctor || undefined,
        procedure: formData.procedure || undefined,
        studyType: formData.studyType,
        modality: formData.modality,
        bodyPart: formData.bodyPart,
        price: formData.price,
        priority: formData.priority,
        contrast: formData.contrast,
        pregnancyStatus: formData.pregnancyStatus,
        clinicalNotes: formData.clinicalNotes,
        status: "PENDING"
      };

      const res = await fetch("/api/radiology/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Diagnostic imaging requisition created successfully!", "success");
        setOpen(false);
        setFormData({
          patient: "",
          doctor: "",
          procedure: "",
          studyType: "X-Ray Chest PA View",
          modality: "X-RAY",
          bodyPart: "Chest",
          price: 600,
          priority: "ROUTINE",
          contrast: false,
          pregnancyStatus: "Negative",
          clinicalNotes: ""
        });
        loadData();
      } else {
        toast(data.message || "Failed to create imaging order", "error");
      }
    } catch (error) {
      toast("Error creating imaging requisition", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel and delete this imaging order?")) return;
    try {
      const res = await fetch(`/api/radiology/orders/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Imaging order deleted", "success");
        loadData();
      } else {
        toast(data.message || "Failed to delete order", "error");
      }
    } catch (error) {
      toast("Error deleting order", "error");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase().trim();
      const patName = (o.patient?.name || "").toLowerCase();
      const uhid = (o.patient?.uhid || "").toLowerCase();
      const accNum = (o.accessionNumber || "").toLowerCase();
      const studyType = (o.studyType || "").toLowerCase();

      const matchesSearch =
        !q || patName.includes(q) || uhid.includes(q) || accNum.includes(q) || studyType.includes(q);

      let matchesStatus = true;
      if (statusFilter !== "ALL") matchesStatus = o.status === statusFilter;

      let matchesPriority = true;
      if (priorityFilter !== "ALL") matchesPriority = o.priority === priorityFilter;

      let matchesModality = true;
      if (modalityFilter !== "ALL") matchesModality = o.modality === modalityFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesModality;
    });
  }, [orders, search, statusFilter, priorityFilter, modalityFilter]);

  const exportCSV = () => {
    if (filteredOrders.length === 0) {
      toast("No imaging orders to export", "error");
      return;
    }

    const headers = [
      "Accession #",
      "Order Date",
      "Patient Name",
      "UHID",
      "Modality",
      "Study Type",
      "Body Part",
      "Priority",
      "Tariff (INR)",
      "Status"
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.accessionNumber || ""}"`,
      `"${new Date(o.createdAt).toLocaleDateString()}"`,
      `"${o.patient?.name || ""}"`,
      `"${o.patient?.uhid || ""}"`,
      `"${o.modality || "X-RAY"}"`,
      `"${(o.studyType || "").replace(/"/g, '""')}"`,
      `"${o.bodyPart || ""}"`,
      o.priority || "ROUTINE",
      o.price || 0,
      o.status
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Radiology_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Orders exported successfully", "success");
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
            <ClipboardList className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Radiology & Diagnostic Imaging Requisitions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Physician study orders, accession numbering, contrast safety checklists, and emergency STAT prioritization.
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
            onClick={() => setOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Imaging Order
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search accession #, patient name, UHID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div>
              <Select
                value={modalityFilter}
                onChange={(e) => setModalityFilter(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Modalities</option>
                <option value="X-RAY">X-Ray (Digital)</option>
                <option value="CT">Computed Tomography (CT)</option>
                <option value="MRI">Magnetic Resonance (MRI)</option>
                <option value="ULTRASOUND">Ultrasound (USG)</option>
                <option value="MAMMOGRAPHY">Mammography</option>
              </Select>
            </div>

            <div>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Priorities</option>
                <option value="ROUTINE">Routine</option>
                <option value="URGENT">Urgent</option>
                <option value="STAT">STAT (Emergency)</option>
              </Select>
            </div>

            <div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Scan</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress / Acquired</option>
                <option value="COMPLETED">Completed</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Imaging Orders Registry</CardTitle>
          <CardDescription>
            Showing {filteredOrders.length} of {orders.length} requisitions
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
                  <TableHead>Study Requested</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Tariff (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-500 py-12 text-xs">
                      No imaging requisitions found. Click "New Imaging Order" to register one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((o) => (
                    <TableRow key={o._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-bold font-mono text-slate-900 dark:text-white">
                          {o.accessionNumber || `RAD-${o._id.slice(-6).toUpperCase()}`}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(o.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {o.patient?.name || "Patient"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {o.patient?.uhid} • {o.patient?.gender}, {o.patient?.age}y
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-semibold text-indigo-700 border-indigo-300">
                          {o.modality || "X-RAY"}
                        </Badge>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {o.bodyPart || "General"}
                        </span>
                      </TableCell>

                      <TableCell className="max-w-xs truncate font-medium text-slate-800 dark:text-slate-200">
                        {o.studyType}
                        {o.contrast && (
                          <span className="text-[10px] text-amber-600 font-bold block">
                            • IV Contrast Protocol
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            o.priority === "STAT"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300"
                              : o.priority === "URGENT"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                              : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          }
                        >
                          {o.priority}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-mono font-bold text-emerald-600">
                        ₹{o.price || 0}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            o.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : o.status === "IN_PROGRESS"
                              ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }
                        >
                          {o.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {o.status === "PENDING" && (
                            <Button
                              size="sm"
                              className="h-7 px-2 text-xs bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1"
                              onClick={() => router.push(`/radiology/worklist`)}
                            >
                              <Play className="h-3 w-3" />
                              Scan
                            </Button>
                          )}

                          {o.status === "IN_PROGRESS" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                              onClick={() => router.push(`/radiology/images`)}
                            >
                              PACS
                            </Button>
                          )}

                          {o.status === "COMPLETED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                              onClick={() => router.push(`/radiology/imaging-reports`)}
                            >
                              Report
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700"
                            onClick={() => handleDelete(o._id)}
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

      {/* New Imaging Order Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleAddOrder}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
                New Diagnostic Imaging Requisition
              </DialogTitle>
              <DialogDescription>
                Assign examination protocol, safety contraindication checks, and accession number.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="patient" className="text-xs font-semibold">
                    Patient Particulars *
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
                        {p.name} ({p.uhid || "UHID"}) • {p.gender}, {p.age}y
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="doctor" className="text-xs font-semibold">
                    Ordering Physician
                  </Label>
                  <Select
                    id="doctor"
                    value={formData.doctor}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="">-- Select Physician (Optional) --</option>
                    {doctors.map((d) => (
                      <option key={d._id} value={d._id}>
                        Dr. {d.name} ({d.specialty || "Physician"})
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Procedure Selector */}
              <div className="space-y-1.5">
                <Label htmlFor="proc" className="text-xs font-semibold">
                  Catalog Procedure Protocol
                </Label>
                <Select
                  id="proc"
                  value={formData.procedure}
                  onChange={(e) => handleProcedureSelect(e.target.value)}
                  className="h-9 text-xs"
                >
                  <option value="">-- Choose from Catalog or Custom --</option>
                  {procedures.map((p) => (
                    <option key={p._id} value={p._id}>
                      [{p.modality}] {p.name} — ₹{p.price}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="mod" className="text-xs font-semibold">
                    Modality *
                  </Label>
                  <Select
                    id="mod"
                    value={formData.modality}
                    onChange={(e) => setFormData({ ...formData, modality: e.target.value as any })}
                    className="h-9 text-xs"
                  >
                    <option value="X-RAY">X-Ray</option>
                    <option value="CT">Computed Tomography (CT)</option>
                    <option value="MRI">Magnetic Resonance (MRI)</option>
                    <option value="ULTRASOUND">Ultrasound (USG)</option>
                    <option value="MAMMOGRAPHY">Mammography</option>
                    <option value="DEXA">DEXA Scan</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="body" className="text-xs font-semibold">
                    Anatomic Region *
                  </Label>
                  <Input
                    id="body"
                    value={formData.bodyPart}
                    onChange={(e) => setFormData({ ...formData, bodyPart: e.target.value })}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prc" className="text-xs font-semibold">
                    Tariff (₹) *
                  </Label>
                  <Input
                    type="number"
                    id="prc"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                    className="h-9 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="prio" className="text-xs font-semibold">
                    Priority Triage *
                  </Label>
                  <Select
                    id="prio"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="h-9 text-xs"
                  >
                    <option value="ROUTINE">Routine (Elective)</option>
                    <option value="URGENT">Urgent (Inpatient)</option>
                    <option value="STAT">STAT (Emergency / Trauma)</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="preg" className="text-xs font-semibold">
                    Pregnancy Safety Check
                  </Label>
                  <Select
                    id="preg"
                    value={formData.pregnancyStatus}
                    onChange={(e) => setFormData({ ...formData, pregnancyStatus: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="Negative">Negative / Not Pregnant</option>
                    <option value="Positive">Pregnant (Radiation Caution)</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-900">
                <input
                  type="checkbox"
                  id="contrastFlag"
                  checked={formData.contrast}
                  onChange={(e) => setFormData({ ...formData, contrast: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="contrastFlag" className="text-xs font-medium cursor-pointer">
                  Requires Intravenous (IV) Contrast Administration (Verify eGFR/Creatinine)
                </Label>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-semibold">
                  Clinical Indication / Suspected Diagnosis
                </Label>
                <Textarea
                  id="notes"
                  rows={2}
                  placeholder="e.g. Chronic cough > 3 weeks, rule out pulmonary consolidation, acute right lower quadrant pain..."
                  value={formData.clinicalNotes}
                  onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Create Requisition
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
