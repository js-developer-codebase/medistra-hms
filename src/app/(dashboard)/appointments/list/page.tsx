"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  Plus,
  Search,
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  Building2,
  Printer,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
  RefreshCw,
  XCircle,
} from "lucide-react";

interface AppointmentItem {
  _id: string;
  patientId?: {
    _id: string;
    name: string;
    contact: string;
    uhid?: string;
    age?: number;
    gender?: string;
    bloodGroup?: string;
  };
  doctorId?: {
    _id: string;
    userId?: {
      name: string;
      email?: string;
    };
    name?: string;
    specialization?: string;
    departmentId?: {
      name: string;
      location?: string;
    };
    roomNumber?: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber?: string;
  status: string;
  queueStatus?: string;
  type: string;
  priority?: string;
  reason: string;
  notes?: string;
  consultationFee?: number;
  paymentStatus?: string;
  paymentMode?: string;
}

export default function AppointmentsListPage() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [timeFilter, setTimeFilter] = useState<"ALL" | "TODAY" | "TOMORROW" | "WEEK">("TODAY");

  // Modals
  const [selectedAppt, setSelectedAppt] = useState<AppointmentItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("Patient Request");
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "10:00", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const [apptRes, docRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/doctor"),
      ]);
      const apptData = await apptRes.json();
      const docData = await docRes.json();

      if (apptData.success) setAppointments(apptData.data || []);
      if (docData.success) setDoctors(docData.data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    return appointments.filter((apt) => {
      const q = search.toLowerCase();
      const pName = apt.patientId?.name?.toLowerCase() || "";
      const pContact = apt.patientId?.contact?.toLowerCase() || "";
      const pUhid = apt.patientId?.uhid?.toLowerCase() || "";
      const dName = (apt.doctorId?.userId?.name || apt.doctorId?.name || "").toLowerCase();
      const token = apt.tokenNumber?.toLowerCase() || "";
      const reason = apt.reason?.toLowerCase() || "";

      const matchesSearch =
        pName.includes(q) ||
        pContact.includes(q) ||
        pUhid.includes(q) ||
        dName.includes(q) ||
        token.includes(q) ||
        reason.includes(q);

      const matchesDoc = selectedDoctor === "ALL" || apt.doctorId?._id === selectedDoctor;
      const matchesStatus = selectedStatus === "ALL" || apt.status === selectedStatus;
      const matchesType = selectedType === "ALL" || apt.type === selectedType;

      const aptDateStr = new Date(apt.appointmentDate).toISOString().split("T")[0];
      let matchesTime = true;
      if (timeFilter === "TODAY") matchesTime = aptDateStr === todayStr;
      else if (timeFilter === "TOMORROW") matchesTime = aptDateStr === tomorrowStr;

      return matchesSearch && matchesDoc && matchesStatus && matchesType && matchesTime;
    });
  }, [appointments, search, selectedDoctor, selectedStatus, selectedType, timeFilter]);

  // Summary Metrics
  const totalCount = appointments.length;
  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter(
    (a) => new Date(a.appointmentDate).toISOString().split("T")[0] === todayStr
  );
  const inQueueCount = todayAppointments.filter(
    (a) => a.status === "CHECKED_IN" || a.status === "IN_PROGRESS"
  ).length;
  const completedTodayCount = todayAppointments.filter((a) => a.status === "COMPLETED").length;

  // Status transitions
  const handleQuickStatusChange = async (appointmentId: string, action: string) => {
    try {
      const res = await fetch("/api/appointments/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, action }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Status Updated", description: `Appointment updated to ${data.data?.status}` });
        fetchAppointments();
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Cancel handler
  const handleCancelSubmit = async () => {
    if (!selectedAppt) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: selectedAppt._id,
          reason: cancelReason,
          category: "Patient Request",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Cancelled", description: "Appointment has been cancelled." });
        setIsCancelOpen(false);
        fetchAppointments();
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Reschedule handler
  const handleRescheduleSubmit = async () => {
    if (!selectedAppt || !rescheduleData.date || !rescheduleData.time) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/appointments/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: selectedAppt._id,
          newDate: rescheduleData.date,
          newTime: rescheduleData.time,
          reason: rescheduleData.reason || "Patient requested reschedule",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Rescheduled", description: "Appointment rescheduled successfully." });
        setIsRescheduleOpen(false);
        fetchAppointments();
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this appointment record?")) return;
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Deleted", description: "Appointment record removed." });
        fetchAppointments();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <Badge variant="secondary">Scheduled</Badge>;
      case "CONFIRMED":
        return <Badge variant="info">Confirmed</Badge>;
      case "CHECKED_IN":
        return <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white">Checked In</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-amber-600 hover:bg-amber-700 text-white">In Progress</Badge>;
      case "COMPLETED":
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "NO_SHOW":
        return <Badge variant="outline" className="text-red-500 border-red-400">No Show</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Appointments Master Roster
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time outpatient consultation list, token queue status, and visit records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5" /> Print OPD List
          </Button>
          <Link href="/appointments/book">
            <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
              <Plus className="h-4 w-4" /> Book Appointment
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total All-Time</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Today's Appointments</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{todayAppointments.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">In Waiting Queue</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{inQueueCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Completed Today</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{completedTodayCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Time Filter Tabs */}
            <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800">
              <button
                onClick={() => setTimeFilter("TODAY")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  timeFilter === "TODAY"
                    ? "bg-white dark:bg-slate-900 shadow-xs text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Today ({todayAppointments.length})
              </button>
              <button
                onClick={() => setTimeFilter("TOMORROW")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  timeFilter === "TOMORROW"
                    ? "bg-white dark:bg-slate-900 shadow-xs text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Tomorrow
              </button>
              <button
                onClick={() => setTimeFilter("ALL")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  timeFilter === "ALL"
                    ? "bg-white dark:bg-slate-900 shadow-xs text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                All Records
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search patient, token, phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-xs"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
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
                <option value="SCHEDULED">Scheduled</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="NO_SHOW">No Show</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-16">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <CalendarIcon className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm">No appointments found matching selected filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Consulting Doctor</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Chief Complaint</TableHead>
                    <TableHead>Status & Triage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((apt) => (
                    <TableRow key={apt._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      {/* Token & Priority */}
                      <TableCell>
                        <div className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block text-slate-800 dark:text-slate-200">
                          {apt.tokenNumber || "T-??"}
                        </div>
                        {apt.priority && apt.priority !== "NORMAL" && (
                          <div className="mt-1">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                apt.priority === "URGENT"
                                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                  : "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                              }`}
                            >
                              {apt.priority}
                            </span>
                          </div>
                        )}
                      </TableCell>

                      {/* Patient */}
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {apt.patientId?.name || "Patient"}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          <span className="font-mono text-[11px]">{apt.patientId?.uhid || "UHID-N/A"}</span> • {apt.patientId?.contact}
                        </div>
                      </TableCell>

                      {/* Doctor */}
                      <TableCell>
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          Dr. {apt.doctorId?.userId?.name || apt.doctorId?.name || "Doctor"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {apt.doctorId?.specialization || "Physician"} • Room {apt.doctorId?.roomNumber || "101"}
                        </div>
                      </TableCell>

                      {/* Date & Time */}
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

                      {/* Complaint */}
                      <TableCell>
                        <div className="text-xs text-slate-700 dark:text-slate-300 max-w-[180px] truncate font-medium">
                          {apt.reason}
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                          {apt.type}
                        </span>
                      </TableCell>

                      {/* Status & Quick Action */}
                      <TableCell>
                        <div className="space-y-1">
                          <div>{getStatusBadge(apt.status)}</div>
                          {/* Quick Workflow Action */}
                          {apt.status === "SCHEDULED" && (
                            <button
                              onClick={() => handleQuickStatusChange(apt._id, "CHECK_IN")}
                              className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-0.5"
                            >
                              + Check In Patient
                            </button>
                          )}
                          {apt.status === "CHECKED_IN" && (
                            <button
                              onClick={() => handleQuickStatusChange(apt._id, "START_CONSULTATION")}
                              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-0.5"
                            >
                              ▶ Start Consultation
                            </button>
                          )}
                          {apt.status === "IN_PROGRESS" && (
                            <button
                              onClick={() => handleQuickStatusChange(apt._id, "COMPLETE")}
                              className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-0.5"
                            >
                              ✓ Mark Complete
                            </button>
                          )}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-emerald-600"
                            title="View Details"
                            onClick={() => {
                              setSelectedAppt(apt);
                              setIsDetailOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-blue-600"
                            title="Reschedule"
                            onClick={() => {
                              setSelectedAppt(apt);
                              setRescheduleData({
                                date: new Date(apt.appointmentDate).toISOString().split("T")[0],
                                time: apt.appointmentTime,
                                reason: "",
                              });
                              setIsRescheduleOpen(true);
                            }}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-amber-600"
                            title="Cancel"
                            onClick={() => {
                              setSelectedAppt(apt);
                              setIsCancelOpen(true);
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-red-600"
                            title="Delete"
                            onClick={() => handleDelete(apt._id)}
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

      {/* VIEW DETAILS MODAL */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          {selectedAppt && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    Token: {selectedAppt.tokenNumber || "T-??"}
                  </span>
                  {getStatusBadge(selectedAppt.status)}
                </div>
                <DialogTitle className="text-lg mt-2">{selectedAppt.patientId?.name}</DialogTitle>
                <DialogDescription>
                  UHID: {selectedAppt.patientId?.uhid} • Contact: {selectedAppt.patientId?.contact}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 py-2 text-xs border-y border-slate-100 dark:border-slate-800">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Doctor</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Dr. {selectedAppt.doctorId?.userId?.name || selectedAppt.doctorId?.name}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Specialization & Room</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedAppt.doctorId?.specialization} • Room {selectedAppt.doctorId?.roomNumber || "OPD"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Appointment Timing</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(selectedAppt.appointmentDate).toLocaleDateString()} at {selectedAppt.appointmentTime}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Complaint</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedAppt.reason}</span>
                </div>
                {selectedAppt.notes && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Clinical Notes</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{selectedAppt.notes}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Consultation Fee</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    ₹{selectedAppt.consultationFee || 500} ({selectedAppt.paymentStatus || "PAID"})
                  </span>
                </div>
              </div>

              <DialogFooter className="flex justify-between gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1 text-xs">
                  <Printer className="h-3.5 w-3.5" /> Print Token
                </Button>
                <Button size="sm" onClick={() => setIsDetailOpen(false)} className="text-xs">
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QUICK RESCHEDULE MODAL */}
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Select a new date and time for <strong>{selectedAppt?.patientId?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>New Date *</Label>
                <Input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>New Time Slot *</Label>
                <Input
                  type="time"
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Reason for Rescheduling</Label>
              <Input
                placeholder="e.g. Patient requested morning slot"
                value={rescheduleData.reason}
                onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRescheduleSubmit} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QUICK CANCEL MODAL */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Cancel appointment for <strong>{selectedAppt?.patientId?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Cancellation Reason</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              >
                <option value="Patient Request">Patient Request</option>
                <option value="Doctor Unavailable">Doctor Unavailable / Emergency</option>
                <option value="Patient Emergency">Patient Medical Emergency</option>
                <option value="Duplicate Booking">Duplicate / Accidental Booking</option>
                <option value="Weather / Transport">Transport / Weather Issue</option>
                <option value="Other">Other Reason</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelOpen(false)}>
              Back
            </Button>
            <Button variant="destructive" onClick={handleCancelSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
