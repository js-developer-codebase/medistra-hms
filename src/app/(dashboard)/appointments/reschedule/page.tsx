"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  RefreshCw,
  Search,
  Calendar as CalendarIcon,
  Clock,
  ArrowRight,
  User,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Loader2,
  History,
} from "lucide-react";

interface AppointmentItem {
  _id: string;
  patientId?: {
    _id: string;
    name: string;
    contact: string;
    uhid?: string;
  };
  doctorId?: {
    _id: string;
    userId?: {
      name: string;
    };
    name?: string;
    specialization?: string;
    roomNumber?: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber?: string;
  status: string;
  reason: string;
  rescheduledFrom?: any;
  rescheduleReason?: string;
  updatedAt?: string;
}

export default function AppointmentReschedulePage() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [rescheduleHistory, setRescheduleHistory] = useState<AppointmentItem[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Reschedule Modal
  const [selectedAppt, setSelectedAppt] = useState<AppointmentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    newDate: new Date().toISOString().split("T")[0],
    newTime: "10:00",
    newDoctorId: "",
    reason: "Patient Request",
  });
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  async function loadData() {
    try {
      setLoading(true);
      const [apptRes, historyRes, docRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/appointments/reschedule"),
        fetch("/api/doctor"),
      ]);
      const apptJson = await apptRes.json();
      const histJson = await historyRes.json();
      const docJson = await docRes.json();

      if (apptJson.success) {
        // Filter eligible appointments (SCHEDULED or CONFIRMED)
        const active = (apptJson.data || []).filter(
          (a: any) => a.status === "SCHEDULED" || a.status === "CONFIRMED"
        );
        setAppointments(active);
      }
      if (histJson.success) setRescheduleHistory(histJson.data || []);
      if (docJson.success) setDoctors(docJson.data || []);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load rescheduling data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const q = search.toLowerCase();
      const pName = apt.patientId?.name?.toLowerCase() || "";
      const pContact = apt.patientId?.contact?.toLowerCase() || "";
      const pUhid = apt.patientId?.uhid?.toLowerCase() || "";
      const dName = (apt.doctorId?.userId?.name || apt.doctorId?.name || "").toLowerCase();
      const token = apt.tokenNumber?.toLowerCase() || "";
      return (
        pName.includes(q) ||
        pContact.includes(q) ||
        pUhid.includes(q) ||
        dName.includes(q) ||
        token.includes(q)
      );
    });
  }, [appointments, search]);

  const openReschedule = (apt: AppointmentItem) => {
    setSelectedAppt(apt);
    const curDate = new Date(apt.appointmentDate);
    curDate.setDate(curDate.getDate() + 1); // default to tomorrow
    setFormData({
      newDate: curDate.toISOString().split("T")[0],
      newTime: apt.appointmentTime,
      newDoctorId: apt.doctorId?._id || "",
      reason: "Patient Request",
    });
    setIsModalOpen(true);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt || !formData.newDate || !formData.newTime) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/appointments/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: selectedAppt._id,
          newDate: formData.newDate,
          newTime: formData.newTime,
          newDoctorId: formData.newDoctorId || undefined,
          reason: formData.reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: "Appointment Rescheduled",
          description: `Appointment moved to ${formData.newDate} at ${formData.newTime}.`,
        });
        setIsModalOpen(false);
        loadData();
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Appointment Rescheduling Hub
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Modify appointment timings, transfer between physicians, and view audit history.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Eligible Appointments</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{appointments.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
              <History className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Rescheduled Total</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{rescheduleHistory.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Available Doctors</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{doctors.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 1: Eligible Appointments */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base">Active Appointments Awaiting Visit</CardTitle>
              <CardDescription>
                Select an appointment below to reschedule date, timeslot, or attending doctor.
              </CardDescription>
            </div>
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search patient, contact, or doctor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CalendarIcon className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm">No scheduled appointments available for rescheduling.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Attending Doctor</TableHead>
                    <TableHead>Current Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((apt) => (
                    <TableRow key={apt._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-800 dark:text-slate-200">
                          {apt.tokenNumber || "T-??"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {apt.patientId?.name || "Patient"}
                        </div>
                        <div className="text-xs text-slate-500">{apt.patientId?.contact}</div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          Dr. {apt.doctorId?.userId?.name || apt.doctorId?.name || "Doctor"}
                        </div>
                        <div className="text-xs text-slate-500">{apt.doctorId?.specialization}</div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3 text-slate-400" />
                          {new Date(apt.appointmentDate).toLocaleDateString()}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {apt.appointmentTime}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {apt.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => openReschedule(apt)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 h-8"
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Reschedule
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Rescheduled History Audit */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-purple-600" /> Rescheduling History & Audit Log
          </CardTitle>
          <CardDescription>
            Record of appointments previously rescheduled with audit reasons.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {rescheduleHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No rescheduled appointments recorded in the audit log.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Previous Date</TableHead>
                    <TableHead></TableHead>
                    <TableHead>New Date & Time</TableHead>
                    <TableHead>Reason Recorded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rescheduleHistory.map((h) => (
                    <TableRow key={h._id}>
                      <TableCell className="font-semibold text-xs">
                        {h.patientId?.name || "Patient"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                        Dr. {h.doctorId?.userId?.name || h.doctorId?.name}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 line-through">
                        {h.rescheduledFrom ? new Date(h.rescheduledFrom).toLocaleDateString() : "Earlier"}
                      </TableCell>
                      <TableCell>
                        <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        {new Date(h.appointmentDate).toLocaleDateString()} at {h.appointmentTime}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                        {h.rescheduleReason || "Patient Request"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RESCHEDULE DIALOG */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Assign a new consultation slot for <strong>{selectedAppt?.patientId?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRescheduleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>New Date *</Label>
                <Input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.newDate}
                  onChange={(e) => setFormData({ ...formData, newDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>New Time Slot *</Label>
                <Input
                  type="time"
                  required
                  value={formData.newTime}
                  onChange={(e) => setFormData({ ...formData, newTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Transfer Doctor (Optional)</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={formData.newDoctorId}
                onChange={(e) => setFormData({ ...formData, newDoctorId: e.target.value })}
              >
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    Dr. {d.userId?.name || "Doctor"} ({d.specialization || "Physician"})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Reason for Rescheduling *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              >
                <option value="Patient Request">Patient Request / Conflict</option>
                <option value="Doctor Emergency / Leave">Doctor Emergency / Leave</option>
                <option value="Weather / Transport Issue">Weather / Transport Issue</option>
                <option value="Diagnostic Lab Delay">Awaiting Diagnostic / Lab Results</option>
                <option value="Administrative Reallocation">Administrative Reallocation</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirm Reschedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
