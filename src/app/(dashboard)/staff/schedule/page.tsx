"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Stethoscope,
  MapPin,
  Users,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface ScheduleItem {
  _id: string;
  doctorId?: {
    _id: string;
    licenseNo: string;
    specialization?: string;
    userId?: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
    };
    departmentId?: {
      _id: string;
      name: string;
      code: string;
      location?: string;
    };
  };
  dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
  startTime: string;
  endTime: string;
  roomNumber?: string;
  maxPatients?: number;
  slotDurationMinutes?: number;
  status: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
}

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export default function StaffSchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState<string>("ALL");
  const [selectedDoc, setSelectedDoc] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialFormState = {
    doctorId: "",
    dayOfWeek: "MONDAY" as (typeof DAYS_OF_WEEK)[number],
    startTime: "09:00",
    endTime: "13:00",
    roomNumber: "OPD-101",
    maxPatients: 20,
    slotDurationMinutes: 15,
    status: "ACTIVE" as "ACTIVE" | "ON_LEAVE" | "INACTIVE",
  };
  const [formData, setFormData] = useState(initialFormState);

  const { toast } = useToast();

  async function fetchScheduleData() {
    try {
      setLoading(true);
      const [schedRes, docRes] = await Promise.all([
        fetch("/api/staff/schedule"),
        fetch("/api/doctor"),
      ]);
      const schedJson = await schedRes.json();
      const docJson = await docRes.json();

      if (schedJson.success) setSchedules(schedJson.data || []);
      if (docJson.success) {
        setDoctors(docJson.data || []);
        if (docJson.data.length > 0 && !formData.doctorId) {
          setFormData((p) => ({ ...p, doctorId: docJson.data[0]._id }));
        }
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load schedules.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const filtered = useMemo(() => {
    return schedules.filter((s) => {
      const q = search.toLowerCase();
      const docName = s.doctorId?.userId?.name?.toLowerCase() || "";
      const spec = s.doctorId?.specialization?.toLowerCase() || "";
      const dept = s.doctorId?.departmentId?.name?.toLowerCase() || "";
      const room = s.roomNumber?.toLowerCase() || "";

      const matchesSearch = docName.includes(q) || spec.includes(q) || dept.includes(q) || room.includes(q);
      const matchesDay = selectedDay === "ALL" || s.dayOfWeek === selectedDay;
      const matchesDoc = selectedDoc === "ALL" || s.doctorId?._id === selectedDoc;
      const matchesStatus = selectedStatus === "ALL" || s.status === selectedStatus;

      return matchesSearch && matchesDay && matchesDoc && matchesStatus;
    });
  }, [schedules, search, selectedDay, selectedDoc, selectedStatus]);

  // Quick stats
  const totalSlots = schedules.length;
  const activeSlots = schedules.filter((s) => s.status === "ACTIVE").length;
  const uniqueDocs = new Set(schedules.map((s) => s.doctorId?._id).filter(Boolean)).size;
  const avgDuration =
    schedules.length > 0
      ? Math.round(
          schedules.reduce((acc, s) => acc + (s.slotDurationMinutes || 15), 0) / schedules.length
        )
      : 15;

  // Create
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.doctorId || !formData.dayOfWeek || !formData.startTime || !formData.endTime) {
      toast({ title: "Validation Error", description: "All schedule fields are required.", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/staff/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Success", description: "Schedule slot created." });
        setIsAddOpen(false);
        setFormData(initialFormState);
        fetchScheduleData();
      } else {
        toast({ title: "Error", description: data.message || "Failed to create schedule.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  // Edit
  function openEdit(item: ScheduleItem) {
    setSelectedSchedule(item);
    setFormData({
      doctorId: item.doctorId?._id || "",
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      roomNumber: item.roomNumber || "",
      maxPatients: item.maxPatients || 20,
      slotDurationMinutes: item.slotDurationMinutes || 15,
      status: item.status,
    });
    setIsEditOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSchedule) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/staff/schedule/${selectedSchedule._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Success", description: "Schedule updated successfully." });
        setIsEditOpen(false);
        setSelectedSchedule(null);
        fetchScheduleData();
      } else {
        toast({ title: "Error", description: data.message || "Failed to update schedule.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update schedule.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  // Delete
  async function handleDelete() {
    if (!selectedSchedule) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/staff/schedule/${selectedSchedule._id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Deleted", description: "Schedule slot has been deleted." });
        setIsDeleteOpen(false);
        setSelectedSchedule(null);
        fetchScheduleData();
      } else {
        toast({ title: "Error", description: data.message || "Failed to delete.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete schedule.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Doctor Schedule & OPD Roster
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Weekly physician consultation hours, clinic rooms, timeslots, and patient capacity.
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData(initialFormState);
            setIsAddOpen(true);
          }}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="h-4 w-4" /> Add Schedule Slot
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Weekly Slots</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalSlots}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Active Consultation Slots</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{activeSlots}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Doctors Scheduled</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{uniqueDocs}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Avg Slot Duration</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{avgDuration} mins</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-slim">
        <Button
          size="sm"
          variant={selectedDay === "ALL" ? "default" : "outline"}
          className="text-xs font-medium shrink-0"
          onClick={() => setSelectedDay("ALL")}
        >
          All Days
        </Button>
        {DAYS_OF_WEEK.map((d) => (
          <Button
            key={d}
            size="sm"
            variant={selectedDay === d ? "default" : "outline"}
            className="text-xs font-medium shrink-0"
            onClick={() => setSelectedDay(d)}
          >
            {d.charAt(0) + d.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Duty & Clinic Slots</CardTitle>
              <CardDescription>
                Showing {filtered.length} of {schedules.length} schedule timings
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search doctor or room..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-xs"
                value={selectedDoc}
                onChange={(e) => setSelectedDoc(e.target.value)}
              >
                <option value="ALL">All Doctors</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    Dr. {d.userId?.name || "Doctor"}
                  </option>
                ))}
              </select>

              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-xs"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Calendar className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm">No duty schedules found for selected filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Day of Week</TableHead>
                    <TableHead>Timing & Duration</TableHead>
                    <TableHead>OPD Clinic / Room</TableHead>
                    <TableHead>Max Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((sched) => (
                    <TableRow key={sched._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          Dr. {sched.doctorId?.userId?.name || "Doctor"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {sched.doctorId?.specialization || "Physician"} • {sched.doctorId?.departmentId?.name || "General"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="font-semibold text-xs capitalize">
                          {sched.dayOfWeek.toLowerCase()}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {sched.startTime} - {sched.endTime}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {sched.slotDurationMinutes || 15} mins / patient slot
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {sched.roomNumber || "OPD"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1 font-medium">
                          <Users className="h-3 w-3 text-slate-400" />
                          Up to {sched.maxPatients || 20} patients
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            sched.status === "ACTIVE"
                              ? "default"
                              : sched.status === "ON_LEAVE"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {sched.status === "ACTIVE"
                            ? "Active"
                            : sched.status === "ON_LEAVE"
                            ? "On Leave"
                            : "Inactive"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-blue-600"
                            onClick={() => openEdit(sched)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-red-600"
                            onClick={() => {
                              setSelectedSchedule(sched);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ADD MODAL */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Doctor Duty Schedule</DialogTitle>
            <DialogDescription>Schedule outpatient clinic hours and patient capacity.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Doctor *</Label>
              <select
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              >
                <option value="">Select Doctor</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    Dr. {d.userId?.name || "Doctor"} ({d.specialization || d.departmentId?.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Day of the Week *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value as any })}
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0) + d.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>End Time *</Label>
                <Input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>OPD Room</Label>
                <Input
                  placeholder="e.g. Room 204"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Max Patients</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.maxPatients}
                  onChange={(e) => setFormData({ ...formData, maxPatients: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Slot Duration (Mins)</Label>
                <Input
                  type="number"
                  min="5"
                  step="5"
                  value={formData.slotDurationMinutes}
                  onChange={(e) => setFormData({ ...formData, slotDurationMinutes: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Schedule Status</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Schedule Slot</DialogTitle>
            <DialogDescription>Modify timing, consultation room, or patient capacity.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Day of the Week</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value as any })}
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0) + d.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>OPD Room</Label>
                <Input
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Max Patients</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.maxPatients}
                  onChange={(e) => setFormData({ ...formData, maxPatients: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Slot Duration (Mins)</Label>
                <Input
                  type="number"
                  min="5"
                  step="5"
                  value={formData.slotDurationMinutes}
                  onChange={(e) => setFormData({ ...formData, slotDurationMinutes: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Schedule Status</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Schedule Slot</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this schedule slot on <strong>{selectedSchedule?.dayOfWeek}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
