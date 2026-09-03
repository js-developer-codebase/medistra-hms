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
  Calendar,
  User,
  FlaskConical,
  Zap,
  Clock
} from "lucide-react";

export default function LabOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <LabOrdersContent />
    </Suspense>
  );
}

function LabOrdersContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Create Modal
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    selectedTests: [] as string[],
    priority: "Routine",
    sampleType: "Whole Blood (EDTA)",
    notes: ""
  });

  const loadData = async () => {
    try {
      const [ordRes, patRes, tstRes, docRes] = await Promise.all([
        fetch("/api/lab/orders"),
        fetch("/api/patient"),
        fetch("/api/lab/tests"),
        fetch("/api/doctor")
      ]);

      const [ordData, patData, tstData, docData] = await Promise.all([
        ordRes.json(),
        patRes.json(),
        tstRes.json(),
        docRes.json()
      ]);

      if (ordData.success) setOrders(ordData.data || []);
      if (patData.success) setPatients(patData.data || []);
      if (tstData.success) setTests(tstData.data || []);
      if (docData.success) setDoctors(docData.data || []);
    } catch (error) {
      toast("Error loading lab orders", "error");
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

  const handleTestToggle = (testId: string) => {
    setFormData((prev) => {
      const exists = prev.selectedTests.includes(testId);
      if (exists) {
        return { ...prev, selectedTests: prev.selectedTests.filter((id) => id !== testId) };
      } else {
        return { ...prev, selectedTests: [...prev.selectedTests, testId] };
      }
    });
  };

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient) {
      toast("Please select a patient", "error");
      return;
    }
    if (formData.selectedTests.length === 0) {
      toast("Please select at least one laboratory test", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patient: formData.patient,
        doctor: formData.doctor || undefined,
        tests: formData.selectedTests,
        priority: formData.priority,
        sampleType: formData.sampleType,
        notes: formData.notes,
        status: "Pending"
      };

      const res = await fetch("/api/lab/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Lab order requisition created successfully!", "success");
        setOpen(false);
        setFormData({
          patient: "",
          doctor: "",
          selectedTests: [],
          priority: "Routine",
          sampleType: "Whole Blood (EDTA)",
          notes: ""
        });
        loadData();
      } else {
        toast(data.error || "Failed to create order", "error");
      }
    } catch (error) {
      toast("Error creating lab order", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel and delete this lab requisition?")) return;
    try {
      const res = await fetch(`/api/lab/orders/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Lab order deleted", "success");
        loadData();
      } else {
        toast(data.error || "Failed to delete order", "error");
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
      const barcode = (o.barcode || "").toLowerCase();
      const testNames = (o.tests || []).map((t: any) => t.name.toLowerCase()).join(" ");

      const matchesSearch =
        !q || patName.includes(q) || uhid.includes(q) || barcode.includes(q) || testNames.includes(q);

      let matchesStatus = true;
      if (statusFilter !== "ALL") {
        matchesStatus = o.status === statusFilter;
      }

      let matchesPriority = true;
      if (priorityFilter !== "ALL") {
        matchesPriority = o.priority === priorityFilter;
      }

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [orders, search, statusFilter, priorityFilter]);

  const exportCSV = () => {
    if (filteredOrders.length === 0) {
      toast("No lab orders to export", "error");
      return;
    }

    const headers = [
      "Barcode",
      "Order Date",
      "Patient Name",
      "UHID",
      "Tests",
      "Priority",
      "Status",
      "Specimen Type"
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.barcode || ""}"`,
      `"${new Date(o.orderDate || o.createdAt).toLocaleDateString()}"`,
      `"${o.patient?.name || ""}"`,
      `"${o.patient?.uhid || ""}"`,
      `"${(o.tests || []).map((t: any) => t.name).join("; ")}"`,
      o.priority || "Routine",
      o.status || "Pending",
      `"${o.sampleType || "Blood"}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Lab_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Lab orders exported successfully", "success");
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
            Diagnostic Laboratory Requisitions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Order management, test panel requests, priority triage (STAT / Urgent / Routine), and specimen tracking.
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
            New Lab Order
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search barcode, patient name, UHID, test..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending">Pending Collection</option>
                <option value="Sample Collected">Sample Collected</option>
                <option value="Processing">In Processing</option>
                <option value="Completed">Completed / Verified</option>
                <option value="Cancelled">Cancelled</option>
              </Select>
            </div>

            <div>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Priorities</option>
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
                <option value="STAT">STAT (Immediate)</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Laboratory Order Registry</CardTitle>
          <CardDescription>
            Showing {filteredOrders.length} of {orders.length} diagnostic orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Accession Barcode</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Ordered Tests</TableHead>
                  <TableHead>Specimen Tube</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No lab requisitions found matching criteria. Click "New Lab Order" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((o) => (
                    <TableRow key={o._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-bold font-mono text-slate-900 dark:text-white">
                          {o.barcode || `LB-${o._id.slice(-6).toUpperCase()}`}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(o.orderDate || o.createdAt).toLocaleString([], {
                            dateStyle: "short",
                            timeStyle: "short"
                          })}
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

                      <TableCell className="max-w-xs truncate font-medium text-slate-800 dark:text-slate-200">
                        {o.tests && o.tests.length > 0
                          ? o.tests.map((t: any) => t.name).join(", ")
                          : "Custom Test Panel"}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {o.sampleType || "Whole Blood"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            o.priority === "STAT"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300"
                              : o.priority === "Urgent"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                              : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          }
                        >
                          {o.priority || "Routine"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            o.status === "Completed"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : o.status === "Processing"
                              ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300"
                              : o.status === "Sample Collected"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }
                        >
                          {o.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {o.status === "Pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs text-amber-600 border-amber-300 hover:bg-amber-50"
                              onClick={() => router.push(`/lab/collection?orderId=${o._id}`)}
                            >
                              Collect
                            </Button>
                          )}

                          {o.status === "Sample Collected" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs text-cyan-600 border-cyan-300 hover:bg-cyan-50"
                              onClick={() => router.push(`/lab/processing?orderId=${o._id}`)}
                            >
                              Process
                            </Button>
                          )}

                          {o.status === "Processing" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs text-teal-600 border-teal-300 hover:bg-teal-50"
                              onClick={() => router.push(`/lab/results?orderId=${o._id}`)}
                            >
                              Results
                            </Button>
                          )}

                          {o.status === "Completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                              onClick={() => router.push(`/lab/reports?orderId=${o._id}`)}
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

      {/* New Lab Order Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleAddOrder}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
                New Diagnostic Laboratory Order
              </DialogTitle>
              <DialogDescription>
                Create a test requisition with accession barcode and specimen assignment.
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
                    <option value="">-- Select Patient --</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.uhid || "UHID"})
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
                    <option value="">-- Select Doctor (Optional) --</option>
                    {doctors.map((d) => (
                      <option key={d._id} value={d._id}>
                        Dr. {d.name} ({d.specialty || "Physician"})
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="priority" className="text-xs font-semibold">
                    Order Priority *
                  </Label>
                  <Select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="STAT">STAT (Immediate Emergency)</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sampleType" className="text-xs font-semibold">
                    Specimen Required
                  </Label>
                  <Select
                    id="sampleType"
                    value={formData.sampleType}
                    onChange={(e) => setFormData({ ...formData, sampleType: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="Whole Blood (EDTA)">Whole Blood (EDTA - Purple Top)</option>
                    <option value="Serum (SST)">Serum (SST - Gold Top)</option>
                    <option value="Plasma (Citrate)">Plasma (Citrate - Blue Top)</option>
                    <option value="Urine (Clean Catch)">Urine (Clean Catch)</option>
                    <option value="Swab / Culture">Swab / Culture Specimen</option>
                    <option value="Tissue / Biopsy">Tissue / Biopsy</option>
                  </Select>
                </div>
              </div>

              {/* Multi-Test Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold block">
                  Select Diagnostic Tests / Panels * ({formData.selectedTests.length} selected)
                </Label>
                <div className="p-3 border rounded-xl max-h-48 overflow-y-auto space-y-2 bg-slate-50 dark:bg-slate-800/40">
                  {tests.length === 0 ? (
                    <div className="text-center py-4 text-slate-400">
                      No tests found in catalog. Add tests in Test Catalog first.
                    </div>
                  ) : (
                    tests.map((t) => {
                      const checked = formData.selectedTests.includes(t._id);
                      return (
                        <div
                          key={t._id}
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                            checked
                              ? "bg-indigo-50 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-800"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                          }`}
                          onClick={() => handleTestToggle(t._id)}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {}}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {t.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono ml-2">
                                ({t.code})
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline" className="font-mono">
                            ₹{t.price}
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-semibold">
                  Clinical Indication / Physician Notes
                </Label>
                <Textarea
                  id="notes"
                  rows={2}
                  placeholder="e.g. Rule out anemia, fever of unknown origin, pre-operative screening..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
