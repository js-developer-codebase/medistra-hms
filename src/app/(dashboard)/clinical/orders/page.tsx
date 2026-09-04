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
  ShoppingBag,
  Search,
  Plus,
  RefreshCw,
  Download,
  Trash2,
  Calendar,
  User,
  CheckCircle2,
  Loader2,
  AlertTriangle
} from "lucide-react";

export default function ClinicalOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <ClinicalOrdersContent />
    </Suspense>
  );
}

function ClinicalOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patientId") || "";
  const { toast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patient: initialPatientId,
    doctor: "",
    title: "",
    orderType: "Laboratory",
    priority: "Routine",
    instructions: "",
    status: "Final"
  });

  const loadData = async () => {
    try {
      const [recRes, patRes, docRes] = await Promise.all([
        fetch("/api/clinical/records?recordType=Clinical Order"),
        fetch("/api/patient"),
        fetch("/api/user")
      ]);

      const [recData, patData, docData] = await Promise.all([
        recRes.json(),
        patRes.json(),
        docRes.json()
      ]);

      if (recData.success) setOrders(recData.data || []);
      if (patData.success) {
        setPatients(patData.data || []);
        if (initialPatientId) setCreateOpen(true);
      }
      if (docData.success) setDoctors(docData.data || []);
    } catch (err) {
      toast("Failed to load clinical orders", "error");
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
      toast("Please select a patient and specify the order item", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        recordType: "Clinical Order",
        dateRecorded: new Date().toISOString()
      };

      const res = await fetch("/api/clinical/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Clinical order placed successfully!", "success");
        setCreateOpen(false);
        setFormData({
          patient: "",
          doctor: "",
          title: "",
          orderType: "Laboratory",
          priority: "Routine",
          instructions: "",
          status: "Final"
        });
        loadData();
      } else {
        toast(data.error || "Failed to place clinical order", "error");
      }
    } catch (err) {
      toast("An error occurred while placing order", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel/delete this clinical order?")) return;
    try {
      const res = await fetch(`/api/clinical/records/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Order cancelled", "success");
        loadData();
      } else {
        toast(data.error || "Failed to cancel order", "error");
      }
    } catch (err) {
      toast("Error cancelling order", "error");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase().trim();
      const patName = (o.patient?.name || "").toLowerCase();
      const uhid = (o.patient?.uhid || "").toLowerCase();
      const title = (o.title || "").toLowerCase();
      const instr = (o.instructions || "").toLowerCase();
      const docName = (o.doctor?.name || "").toLowerCase();

      const matchesSearch =
        !q ||
        patName.includes(q) ||
        uhid.includes(q) ||
        title.includes(q) ||
        instr.includes(q) ||
        docName.includes(q);

      let matchesCat = true;
      if (categoryFilter !== "ALL") {
        matchesCat = o.orderType === categoryFilter;
      }

      let matchesPri = true;
      if (priorityFilter !== "ALL") {
        matchesPri = o.priority === priorityFilter;
      }

      return matchesSearch && matchesCat && matchesPri;
    });
  }, [orders, searchQuery, categoryFilter, priorityFilter]);

  const statsCount = useMemo(() => {
    let lab = 0;
    let rad = 0;
    let stat = 0;
    orders.forEach((o) => {
      if (o.orderType === "Laboratory") lab++;
      if (o.orderType === "Radiology") rad++;
      if (o.priority === "STAT") stat++;
    });
    return { total: orders.length, lab, rad, stat };
  }, [orders]);

  const exportCSV = () => {
    if (filteredOrders.length === 0) {
      toast("No orders to export", "error");
      return;
    }

    const headers = [
      "Date Ordered",
      "Patient Name",
      "UHID",
      "Order Category",
      "Investigation / Procedure",
      "Priority",
      "Instructions",
      "Physician"
    ];

    const rows = filteredOrders.map((o) => [
      `"${new Date(o.dateRecorded || o.createdAt).toLocaleDateString()}"`,
      `"${o.patient?.name || ""}"`,
      `"${o.patient?.uhid || ""}"`,
      o.orderType || "Laboratory",
      `"${(o.title || "").replace(/"/g, '""')}"`,
      o.priority || "Routine",
      `"${(o.instructions || "").replace(/"/g, '""')}"`,
      `"Dr. ${o.doctor?.name || ""}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Clinical_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <ShoppingBag className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            Clinical Orders Workstation
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Order laboratory diagnostic panels, radiology imaging studies, bedside nursing tasks, and clinical diets.
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
            className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Place Clinical Order
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Total Orders</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
            {statsCount.total}
          </span>
          <span className="text-[10px] text-slate-400">Diagnostic & care orders</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Lab Investigations</span>
          <span className="text-xl font-bold text-violet-600 dark:text-violet-400 mt-1 block">
            {statsCount.lab}
          </span>
          <span className="text-[10px] text-violet-600">Pathology & biochemistry</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Radiology & Imaging</span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">
            {statsCount.rad}
          </span>
          <span className="text-[10px] text-blue-600">X-Ray, CT, MRI, USG</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">STAT / Emergency</span>
          <span className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
            {statsCount.stat}
          </span>
          <span className="text-[10px] text-rose-600">Immediate processing</span>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search order title, instructions, patient, doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Order Categories</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Radiology">Radiology / Imaging</option>
                <option value="Procedure">Procedure / Intervention</option>
                <option value="Nursing">Nursing Care Task</option>
                <option value="Diet">Dietary / Nutrition</option>
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
                <option value="STAT">STAT / Critical</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Active Clinical Orders</CardTitle>
          <CardDescription>
            Showing {filteredOrders.length} of {orders.length} clinical diagnostic and treatment orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Ordered</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Investigation / Procedure</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Instructions</TableHead>
                  <TableHead>Physician</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-500 py-12 text-xs">
                      No clinical orders found matching filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((o) => (
                    <TableRow key={o._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono text-slate-500 whitespace-nowrap">
                        {new Date(o.dateRecorded || o.createdAt).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short"
                        })}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {o.patient?.name || "Unknown"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {o.patient?.uhid}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {o.orderType || "Lab"}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-bold text-slate-900 dark:text-white">
                        {o.title}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            o.priority === "STAT"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300"
                              : o.priority === "Urgent"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                              : ""
                          }
                        >
                          {o.priority || "Routine"}
                        </Badge>
                      </TableCell>

                      <TableCell className="max-w-xs truncate text-slate-600 dark:text-slate-400">
                        {o.instructions || "Standard protocol"}
                      </TableCell>

                      <TableCell className="font-medium">
                        Dr. {o.doctor?.name || "Attending"}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-rose-600 hover:text-rose-700 ml-auto"
                          onClick={() => handleDelete(o._id)}
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

      {/* Place Order Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-violet-600" />
                Place Clinical Order
              </DialogTitle>
              <DialogDescription>
                Submit order for laboratory, radiology, procedure, nursing, or dietary service.
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
                  Ordering Physician
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-semibold">
                    Order Category
                  </Label>
                  <Select
                    id="category"
                    value={formData.orderType}
                    onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="Laboratory">Laboratory / Pathology</option>
                    <option value="Radiology">Radiology / Imaging</option>
                    <option value="Procedure">Procedure / Intervention</option>
                    <option value="Nursing">Nursing Care</option>
                    <option value="Diet">Dietary / Nutrition</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="priority" className="text-xs font-semibold">
                    Clinical Priority
                  </Label>
                  <Select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="STAT">STAT / Emergency</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold">
                  Investigation / Order Item *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. CBC, Serum Creatinine, Chest X-Ray, ECG, Low Sodium Diet"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="instructions" className="text-xs font-semibold">
                  Clinical Instructions / Precautions
                </Label>
                <Textarea
                  id="instructions"
                  rows={2}
                  placeholder="e.g. Fasting sample required, portable bedside radiograph, monitor vitals post-draw..."
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
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Submit Order
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
