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
  XCircle,
  Search,
  Calendar,
  Clock,
  User,
  Stethoscope,
  AlertTriangle,
  FileText,
  Loader2,
  Trash2,
  CheckCircle2,
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
  };
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber?: string;
  status: string;
  reason: string;
  cancellationReason?: string;
  cancellationCategory?: string;
  cancelledAt?: string;
}

export default function AppointmentCancellationPage() {
  const [activeAppointments, setActiveAppointments] = useState<AppointmentItem[]>([]);
  const [cancelledHistory, setCancelledHistory] = useState<AppointmentItem[]>([]);
  const [reasonsBreakdown, setReasonsBreakdown] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Cancel Modal
  const [selectedAppt, setSelectedAppt] = useState<AppointmentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelCategory, setCancelCategory] = useState("Patient Request");
  const [cancelReason, setCancelReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  async function loadData() {
    try {
      setLoading(true);
      const [allRes, cancelRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/appointments/cancel"),
      ]);
      const allJson = await allRes.json();
      const cancelJson = await cancelRes.json();

      if (allJson.success) {
        const active = (allJson.data || []).filter(
          (a: any) => a.status !== "CANCELLED" && a.status !== "COMPLETED"
        );
        setActiveAppointments(active);
      }
      if (cancelJson.success) {
        setCancelledHistory(cancelJson.data || []);
        if (cancelJson.reasonsBreakdown) {
          setReasonsBreakdown(cancelJson.reasonsBreakdown);
        }
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load cancellation records.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredActive = useMemo(() => {
    return activeAppointments.filter((apt) => {
      const q = search.toLowerCase();
      const pName = apt.patientId?.name?.toLowerCase() || "";
      const pContact = apt.patientId?.contact?.toLowerCase() || "";
      const dName = (apt.doctorId?.userId?.name || apt.doctorId?.name || "").toLowerCase();
      const token = apt.tokenNumber?.toLowerCase() || "";
      return pName.includes(q) || pContact.includes(q) || dName.includes(q) || token.includes(q);
    });
  }, [activeAppointments, search]);

  const openCancelModal = (apt: AppointmentItem) => {
    setSelectedAppt(apt);
    setCancelCategory("Patient Request");
    setCancelReason("");
    setIsModalOpen(true);
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: selectedAppt._id,
          reason: cancelReason || cancelCategory,
          category: cancelCategory,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Appointment Cancelled", description: "Cancellation logged successfully." });
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

  // Metrics
  const totalCancelled = cancelledHistory.length;
  const patientRequested = cancelledHistory.filter((c) => c.cancellationCategory === "Patient Request").length;
  const doctorUnavailable = cancelledHistory.filter((c) => c.cancellationCategory === "Doctor Unavailable").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Appointment Cancellation Management
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Process appointment cancellations, track cancellation categories, and view audit history.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Cancellations</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalCancelled}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Patient Requested</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{patientRequested}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Doctor Unavailable</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{doctorUnavailable}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Active Retained</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{activeAppointments.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 1: Active Appointments Eligible for Cancel */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base">Active Appointments</CardTitle>
              <CardDescription>Select an active appointment to process cancellation.</CardDescription>
            </div>
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search patient or doctor..."
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
          ) : filteredActive.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No active appointments matching search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActive.map((apt) => (
                    <TableRow key={apt._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
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
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          Dr. {apt.doctorId?.userId?.name || apt.doctorId?.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-slate-700 dark:text-slate-300">
                          {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                          {apt.reason}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openCancelModal(apt)}
                          className="text-xs text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 dark:border-red-900/40 h-8 gap-1"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Cancel Visit
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

      {/* Section 2: Cancellation History Audit */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-red-600" /> Cancelled Appointments Log
          </CardTitle>
          <CardDescription>Comprehensive record of all cancelled appointments and reasons.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {cancelledHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No cancelled appointments on record.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Cancellation Reason</TableHead>
                    <TableHead>Cancelled Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cancelledHistory.map((c) => (
                    <TableRow key={c._id}>
                      <TableCell className="font-semibold text-xs text-slate-900 dark:text-white">
                        {c.patientId?.name || "Patient"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                        Dr. {c.doctorId?.userId?.name || c.doctorId?.name}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(c.appointmentDate).toLocaleDateString()} at {c.appointmentTime}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {c.cancellationCategory || "Patient Request"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                        {c.cancellationReason || "Unspecified"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {c.cancelledAt ? new Date(c.cancelledAt).toLocaleString() : "Recently"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CANCEL DIALOG */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Cancel appointment for <strong>{selectedAppt?.patientId?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCancelSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Cancellation Category *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={cancelCategory}
                onChange={(e) => setCancelCategory(e.target.value)}
              >
                <option value="Patient Request">Patient Request / Personal Conflict</option>
                <option value="Doctor Unavailable">Doctor Unavailable / Medical Emergency</option>
                <option value="Patient Emergency">Patient Acute Emergency / Admitted</option>
                <option value="Duplicate Booking">Duplicate / Accidental Booking</option>
                <option value="Weather / Transport">Weather / Transport Breakdown</option>
                <option value="Financial / Fee Dispute">Financial / Fee Issues</option>
                <option value="Other">Other Reason</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Explanation / Remarks (Optional)</Label>
              <textarea
                rows={3}
                placeholder="Detailed remarks or caller details..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Back
              </Button>
              <Button type="submit" disabled={submitting} variant="destructive">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirm Cancellation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
