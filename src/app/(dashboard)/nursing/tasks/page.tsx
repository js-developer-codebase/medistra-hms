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
  ClipboardCheck,
  Search,
  Plus,
  RefreshCw,
  Download,
  Trash2,
  Calendar,
  User,
  Loader2,
  CheckCircle2,
  Play,
  Clock,
  AlertTriangle
} from "lucide-react";

export default function NursingTasksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <NursingTasksContent />
    </Suspense>
  );
}

function NursingTasksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patientId") || "";
  const { toast } = useToast();

  const [tasks, setTasks] = useState<any[]>([]);
  const [inpatients, setInpatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedPatientFilter, setSelectedPatientFilter] = useState(initialPatientId || "ALL");

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patient: initialPatientId,
    taskName: "",
    category: "Wound Care",
    priority: "ROUTINE",
    dueDate: new Date().toISOString().slice(0, 16),
    notes: ""
  });

  const loadData = async () => {
    try {
      const [tasksRes, ptsRes] = await Promise.all([
        fetch("/api/nursing/tasks"),
        fetch("/api/nursing/my-patients")
      ]);

      const [tasksData, ptsData] = await Promise.all([
        tasksRes.json(),
        ptsRes.json()
      ]);

      if (tasksData.success) setTasks(tasksData.data || []);
      if (ptsData.success) {
        setInpatients(ptsData.data || []);
        if (initialPatientId) setCreateOpen(true);
      }
    } catch (err) {
      toast("Failed to load nursing tasks", "error");
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
    if (!formData.patient || !formData.taskName) {
      toast("Please select an inpatient and enter a task description", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patient: formData.patient,
        taskName: formData.taskName,
        category: formData.category,
        priority: formData.priority,
        dueDate: new Date(formData.dueDate).toISOString(),
        notes: formData.notes,
        status: "PENDING"
      };

      const res = await fetch("/api/nursing/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Bedside nursing task created successfully!", "success");
        setCreateOpen(false);
        setFormData({
          patient: selectedPatientFilter !== "ALL" ? selectedPatientFilter : "",
          taskName: "",
          category: "Wound Care",
          priority: "ROUTINE",
          dueDate: new Date().toISOString().slice(0, 16),
          notes: ""
        });
        loadData();
      } else {
        toast(data.message || "Failed to schedule task", "error");
      }
    } catch (err) {
      toast("An error occurred while creating task", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (task: any, newStatus: string) => {
    try {
      const payload: any = { status: newStatus };
      if (newStatus === "COMPLETED") {
        payload.completedAt = new Date().toISOString();
      }
      const res = await fetch(`/api/nursing/tasks/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Task marked as ${newStatus}`, "success");
        loadData();
      } else {
        toast(data.message || "Failed to update task", "error");
      }
    } catch (err) {
      toast("Error updating task status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this nursing task?")) return;
    try {
      const res = await fetch(`/api/nursing/tasks/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Nursing task deleted", "success");
        loadData();
      } else {
        toast(data.message || "Failed to delete task", "error");
      }
    } catch (err) {
      toast("Error deleting task", "error");
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const patName = (t.patient?.name || "").toLowerCase();
      const uhid = (t.patient?.uhid || "").toLowerCase();
      const name = (t.taskName || "").toLowerCase();
      const cat = (t.category || "").toLowerCase();

      const matchesSearch = !q || patName.includes(q) || uhid.includes(q) || name.includes(q) || cat.includes(q);

      let matchesStatus = true;
      if (statusFilter !== "ALL") {
        matchesStatus = t.status === statusFilter;
      }

      let matchesPatient = true;
      if (selectedPatientFilter !== "ALL") {
        const pId = t.patient?._id || t.patient;
        matchesPatient = pId === selectedPatientFilter;
      }

      return matchesSearch && matchesStatus && matchesPatient;
    });
  }, [tasks, searchQuery, statusFilter, selectedPatientFilter]);

  const statsCount = useMemo(() => {
    let pending = 0;
    let inProgress = 0;
    let completed = 0;
    tasks.forEach((t) => {
      if (t.status === "PENDING") pending++;
      else if (t.status === "IN_PROGRESS") inProgress++;
      else if (t.status === "COMPLETED") completed++;
    });
    return { total: tasks.length, pending, inProgress, completed };
  }, [tasks]);

  const exportCSV = () => {
    if (filteredTasks.length === 0) {
      toast("No tasks to export", "error");
      return;
    }

    const headers = [
      "Due Time",
      "Patient Name",
      "UHID",
      "Task Name",
      "Category",
      "Priority",
      "Status",
      "Notes"
    ];

    const rows = filteredTasks.map((t) => [
      `"${new Date(t.dueDate).toLocaleString()}"`,
      `"${t.patient?.name || ""}"`,
      `"${t.patient?.uhid || ""}"`,
      `"${(t.taskName || "").replace(/"/g, '""')}"`,
      t.category || "General",
      t.priority || "ROUTINE",
      t.status || "PENDING",
      `"${(t.notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Nursing_Tasks_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Nursing tasks exported successfully", "success");
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
            <ClipboardCheck className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            Bedside Nursing Tasks & Ward Orders
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track bedside nursing orders, wound dressings, IV cannula replacements, respiratory nebulizations, and hygiene care.
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
            Add Bedside Task
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Total Shift Tasks</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
            {statsCount.total}
          </span>
          <span className="text-[10px] text-slate-400">All scheduled procedures</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Pending</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {statsCount.pending}
          </span>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting performance</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">In Progress</span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">
            {statsCount.inProgress}
          </span>
          <span className="text-[10px] text-blue-600 font-medium">Currently underway</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Completed</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {statsCount.completed}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">Documented & signed</span>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search task name, category, patient..."
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
                <option value="ALL">All Inpatients</option>
                {inpatients.map((p) => (
                  <option key={p.patientId} value={p.patientId}>
                    Bed {p.bedNumber} - {p.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Bedside Task Schedule</CardTitle>
          <CardDescription>
            Showing {filteredTasks.length} of {tasks.length} nursing procedures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Due Time</TableHead>
                  <TableHead>Inpatient Particulars</TableHead>
                  <TableHead>Procedure / Task</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No nursing tasks found. Click "Add Bedside Task" to schedule one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((t) => {
                    const isCompleted = t.status === "COMPLETED";
                    const isInProg = t.status === "IN_PROGRESS";
                    return (
                      <TableRow key={t._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <TableCell className="font-mono text-slate-500 whitespace-nowrap">
                          {new Date(t.dueDate).toLocaleString([], {
                            dateStyle: "short",
                            timeStyle: "short"
                          })}
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {t.patient?.name || "Unknown"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {t.patient?.uhid}
                          </div>
                        </TableCell>

                        <TableCell className="font-bold text-slate-900 dark:text-white max-w-xs">
                          {t.taskName}
                          {t.notes && (
                            <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                              {t.notes}
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {t.category || "General"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              t.priority === "STAT"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300"
                                : t.priority === "URGENT"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                                : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                            }
                          >
                            {t.priority}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              isCompleted
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                                : isInProg
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                            }
                          >
                            {t.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!isCompleted && (
                              <>
                                {!isInProg && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center gap-1"
                                    onClick={() => handleUpdateStatus(t, "IN_PROGRESS")}
                                  >
                                    <Play className="h-3 w-3" />
                                    Start
                                  </Button>
                                )}

                                <Button
                                  size="sm"
                                  className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                                  onClick={() => handleUpdateStatus(t, "COMPLETED")}
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Complete
                                </Button>
                              </>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700"
                              onClick={() => handleDelete(t._id)}
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

      {/* Add Bedside Task Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-amber-600" />
                Schedule Bedside Nursing Task
              </DialogTitle>
              <DialogDescription>
                Assign clinical procedure or monitoring order for the inpatient.
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
                  <option value="">-- Choose Inpatient --</option>
                  {inpatients.map((p) => (
                    <option key={p.patientId} value={p.patientId}>
                      Bed {p.bedNumber} - {p.name} ({p.uhid})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="task" className="text-xs font-semibold">
                  Task / Procedure Description *
                </Label>
                <Input
                  id="task"
                  placeholder="e.g. Surgical Wound Dressing, Foley Catheter Flush, Salbutamol Nebulization"
                  value={formData.taskName}
                  onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-semibold">
                    Category
                  </Label>
                  <Select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="Wound Care">Wound Care</option>
                    <option value="Medication / IV">Medication / IV Line</option>
                    <option value="Catheter / Drain">Catheter / Drain</option>
                    <option value="Monitoring">Monitoring</option>
                    <option value="Hygiene / Nursing Care">Hygiene / Nursing Care</option>
                    <option value="Respiratory / Nebulization">Respiratory / Nebulization</option>
                    <option value="Diagnostic / Specimen">Diagnostic / Specimen</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="priority" className="text-xs font-semibold">
                    Priority
                  </Label>
                  <Select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="ROUTINE">Routine</option>
                    <option value="URGENT">Urgent</option>
                    <option value="STAT">STAT (Immediate)</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="due" className="text-xs font-semibold">
                  Scheduled Due Time *
                </Label>
                <Input
                  type="datetime-local"
                  id="due"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-semibold">
                  Special Technique / Supplies Required
                </Label>
                <Input
                  id="notes"
                  placeholder="e.g. Use sterile technique, Betadine gauze, check vitals pre/post..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="h-9 text-xs"
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
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Schedule Task
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
