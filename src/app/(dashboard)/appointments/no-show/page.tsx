"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
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
  UserX,
  Phone,
  PhoneCall,
  Calendar,
  Clock,
  RefreshCw,
  Search,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Loader2,
  Plus,
} from "lucide-react";

interface AppointmentItem {
  _id: string;
  patientId?: {
    _id: string;
    name: string;
    contact: string;
    uhid?: string;
    address?: string;
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
  notes?: string;
  noShowRecordedAt?: string;
}

export default function NoShowManagementPage() {
  const [noShows, setNoShows] = useState<AppointmentItem[]>([]);
  const [overduePending, setOverduePending] = useState<AppointmentItem[]>([]);
  const [metrics, setMetrics] = useState({
    totalNoShows: 0,
    pendingOverdueCount: 0,
    noShowRatePercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Follow-up modal
  const [selectedAppt, setSelectedAppt] = useState<AppointmentItem | null>(null);
  const [isFollowupOpen, setIsFollowupOpen] = useState(false);
  const [followupNote, setFollowupNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch("/api/appointments/no-show");
      const json = await res.json();

      if (json.success) {
        setNoShows(json.data?.noShows || []);
        setOverduePending(json.data?.overduePending || []);
        if (json.metrics) setMetrics(json.metrics);
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load no-show data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkNoShow = async (appointmentId: string) => {
    try {
      const res = await fetch("/api/appointments/no-show", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, action: "MARK_NO_SHOW" }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Flagged", description: "Appointment marked as No-Show." });
        loadData();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/appointments/no-show", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: selectedAppt._id,
          action: "RECORD_FOLLOWUP",
          notes: followupNote || "Patient called to check status",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Follow-up Logged", description: "Outreach note saved to appointment." });
        setIsFollowupOpen(false);
        loadData();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNoShows = useMemo(() => {
    return noShows.filter((apt) => {
      const q = search.toLowerCase();
      const pName = apt.patientId?.name?.toLowerCase() || "";
      const pContact = apt.patientId?.contact?.toLowerCase() || "";
      const dName = (apt.doctorId?.userId?.name || apt.doctorId?.name || "").toLowerCase();
      return pName.includes(q) || pContact.includes(q) || dName.includes(q);
    });
  }, [noShows, search]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          No-Show Patient Management
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Identify unfulfilled consultations, log patient outreach, and recover missed clinic visits.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
              <UserX className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Recorded No-Shows</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.totalNoShows}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Overdue Unchecked</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.pendingOverdueCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Hospital No-Show Rate</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.noShowRatePercentage}%</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Recovery Status</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Active</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 1: Overdue Pending Action */}
      {overduePending.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800/60 bg-amber-50/20 dark:bg-amber-950/10 shadow-sm">
          <CardHeader className="border-b border-amber-100 dark:border-amber-800/40 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" /> Overdue Consultations Requiring Confirmation ({overduePending.length})
                </CardTitle>
                <CardDescription>
                  These appointments passed their scheduled time without patient check-in.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Missed Date & Time</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overduePending.map((apt) => (
                  <TableRow key={apt._id}>
                    <TableCell className="font-semibold text-xs text-slate-900 dark:text-white">
                      {apt.patientId?.name || "Patient"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                      Dr. {apt.doctorId?.userId?.name || apt.doctorId?.name}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-red-600">
                      {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                      {apt.patientId?.contact}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAppt(apt);
                          setFollowupNote("");
                          setIsFollowupOpen(true);
                        }}
                        className="text-xs h-7 gap-1"
                      >
                        <PhoneCall className="h-3 w-3 text-blue-600" /> Call Patient
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleMarkNoShow(apt._id)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-7"
                      >
                        Flag as No-Show
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Section 2: No-Show History Log */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <UserX className="h-4 w-4 text-red-600" /> Flagged No-Show Roster
              </CardTitle>
              <CardDescription>Patients marked absent for scheduled clinic visits.</CardDescription>
            </div>
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search patient, phone, or doctor..."
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
          ) : filteredNoShows.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No recorded no-show appointments.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Consulting Doctor</TableHead>
                    <TableHead>Scheduled Date & Time</TableHead>
                    <TableHead>Follow-up Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNoShows.map((apt) => (
                    <TableRow key={apt._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
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
                        <div className="text-[11px] text-slate-400">{apt.doctorId?.specialization}</div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-slate-700 dark:text-slate-300">
                          {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                        </div>
                        <Badge variant="outline" className="text-[9px] text-red-500 border-red-300 mt-0.5">
                          Absent
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-slate-600 dark:text-slate-400 max-w-[220px] truncate">
                          {apt.notes || "No follow-up logged yet"}
                        </div>
                      </TableCell>

                      <TableCell className="text-right space-x-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAppt(apt);
                            setFollowupNote("");
                            setIsFollowupOpen(true);
                          }}
                          className="text-xs h-8 gap-1"
                        >
                          <Phone className="h-3 w-3 text-blue-600" /> Log Call
                        </Button>
                        <Link href="/appointments/book">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1">
                            <Plus className="h-3 w-3" /> Re-Book
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FOLLOW-UP DIALOG */}
      <Dialog open={isFollowupOpen} onOpenChange={setIsFollowupOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Patient Outreach</DialogTitle>
            <DialogDescription>
              Record follow-up outreach for <strong>{selectedAppt?.patientId?.name}</strong> (
              {selectedAppt?.patientId?.contact}).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFollowupSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Outreach Remarks / Call Summary *</Label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Called patient, patient forgot timing, offered tomorrow morning slot..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={followupNote}
                onChange={(e) => setFollowupNote(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsFollowupOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Outreach Note
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
