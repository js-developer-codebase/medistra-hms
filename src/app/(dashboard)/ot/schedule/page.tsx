"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Search,
  Plus,
  Scissors,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Syringe,
  FileText,
  Flame,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export default function OTSchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roomFilter, setRoomFilter] = useState("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    patientName: "",
    uhid: "",
    surgeryName: "",
    specialty: "General & GI Surgery",
    surgeon: "Dr. Arvind (Sr. Surgeon)",
    assistantSurgeon: "Dr. Alok Verma",
    anesthesiologist: "Dr. Sunita Kapoor",
    scrubNurse: "Sister Mary Varghese",
    circulatingNurse: "Staff Nurse Praveen",
    date: new Date().toISOString().slice(0, 10),
    time: "09:00 AM",
    duration: 90,
    otRoom: "OT 1 - Modular Cardiac OT",
    anesthesiaType: "General Anesthesia (GA)",
    asaGrade: "ASA II",
    urgency: "ELECTIVE",
    estimatedCost: 45000,
    preOpCleared: true,
    status: "Scheduled"
  });

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ot/schedule");
      const data = await res.json();
      if (data.success) {
        setSchedules(data.data || []);
      }
    } catch (err) {
      toast("Failed to load surgery schedule", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const pName = s.patientName || "";
      const sName = s.surgeryName || "";
      const surgeon = s.surgeon || "";
      const code = s.surgeryCode || "";

      const matchesSearch =
        pName.toLowerCase().includes(search.toLowerCase()) ||
        sName.toLowerCase().includes(search.toLowerCase()) ||
        surgeon.toLowerCase().includes(search.toLowerCase()) ||
        code.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
      const matchesRoom = roomFilter === "ALL" || s.otRoom === roomFilter;

      return matchesSearch && matchesStatus && matchesRoom;
    });
  }, [schedules, search, statusFilter, roomFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/ot/schedule/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast(`Surgery status updated to ${newStatus}`, "success");
        fetchSchedules();
      } else {
        toast(data.message || "Failed to update status", "error");
      }
    } catch (err) {
      toast("Error updating surgery status", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName.trim() || !formData.surgeryName.trim()) {
      toast("Patient name and procedure title are required", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/ot/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        toast(`Surgery ${data.data.surgeryCode} scheduled successfully!`, "success");
        setIsOpen(false);
        fetchSchedules();
      } else {
        toast(data.message || "Failed to schedule surgery", "error");
      }
    } catch (err) {
      toast("Error submitting schedule", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Surgical Master Schedule &amp; Slate
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time operating theatre timetable, surgeon roster allocations, and surgical stage tracking across OT suites.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSchedules}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsOpen(true)}
            className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Book &amp; Schedule Surgery
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by patient, surgery name, surgeon, or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses ({schedules.length})</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Recovery">Recovery (PACU)</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
              >
                <option value="ALL">All 5 OT Rooms</option>
                <option value="OT 1 - Modular Cardiac OT">OT 1: Modular Cardiac Suite</option>
                <option value="OT 2 - Neuro-Trauma OT">OT 2: Neuro-Trauma Suite</option>
                <option value="OT 3 - Orthopedic & Joint Replacement OT">OT 3: Orthopedic Suite</option>
                <option value="OT 4 - Laparoscopic & GI OT">OT 4: Laparoscopic Suite</option>
                <option value="OT 5 - Emergency & Minor OT">OT 5: Emergency &amp; Daycare</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Master Schedule Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Scissors className="h-4 w-4 text-emerald-600" />
            Scheduled Surgical Cases ({filteredSchedules.length} Surgeries)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Surgery &amp; Code</TableHead>
                <TableHead>Patient &amp; UHID</TableHead>
                <TableHead>Specialty &amp; OT Room</TableHead>
                <TableHead>Surgical Team</TableHead>
                <TableHead>Time &amp; Tariff</TableHead>
                <TableHead>Stage / Status</TableHead>
                <TableHead className="text-center">Gateways</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    No surgeries found matching filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSchedules.map((s) => (
                  <TableRow
                    key={s._id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                      s.status === "In Progress" ? "bg-emerald-50/40 dark:bg-emerald-950/20" : ""
                    }`}
                  >
                    <TableCell>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {s.surgeryName}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{s.surgeryCode}</span>
                        {s.urgency === "EMERGENCY_STAT" && (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0 animate-pulse">
                            STAT
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {s.patientName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {s.uhid || "Casualty"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {s.specialty}
                      </div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                        {s.otRoom}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {s.surgeon}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Anesth: {s.anesthesiologist || "On Duty"} • Scrub: {s.scrubNurse || "Assigned"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-mono font-medium">{s.time} ({s.duration}m)</div>
                      <div className="text-[11px] text-slate-900 dark:text-white font-bold">
                        ₹{(s.estimatedCost || 0).toLocaleString("en-IN")}
                      </div>
                    </TableCell>

                    <TableCell>
                      <select
                        className="h-7 rounded border border-input bg-background px-2 py-0 text-[11px] shadow-sm font-medium"
                        value={s.status}
                        onChange={(e) => handleUpdateStatus(s._id, e.target.value)}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Recovery">Recovery</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href="/ot/preop" title="WHO Pre-Op Checklist">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                            <ShieldCheck className="h-3.5 w-3.5 text-rose-600" />
                          </Button>
                        </Link>

                        <Link href="/ot/intraop" title="Intra-op Surgical Log">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                            <Scissors className="h-3.5 w-3.5 text-orange-600" />
                          </Button>
                        </Link>

                        <Link href="/ot/postop" title="Post-Op PACU Recovery">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                            <Syringe className="h-3.5 w-3.5 text-cyan-600" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              Book &amp; Schedule Operation Theatre Case
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Patient Full Name *</Label>
                <Input
                  required
                  placeholder="Patient Name"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">UHID</Label>
                <Input
                  placeholder="UHID-XXXXX"
                  value={formData.uhid}
                  onChange={(e) => setFormData({ ...formData, uhid: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Procedure / Surgery Name *</Label>
                <Input
                  required
                  placeholder="e.g. Laparoscopic Cholecystectomy"
                  value={formData.surgeryName}
                  onChange={(e) => setFormData({ ...formData, surgeryName: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Surgical Specialty *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value as any })}
                >
                  <option value="General & GI Surgery">General &amp; GI Surgery</option>
                  <option value="Cardiothoracic">Cardiothoracic (CTVS)</option>
                  <option value="Neurosurgery">Neurosurgery</option>
                  <option value="Orthopedics">Orthopedics &amp; Joint Replacement</option>
                  <option value="Obstetrics & Gynaecology">Obstetrics &amp; Gynaecology</option>
                  <option value="Urology">Urology</option>
                  <option value="Oncology">Surgical Oncology</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Primary Operating Surgeon *</Label>
                <Input
                  required
                  value={formData.surgeon}
                  onChange={(e) => setFormData({ ...formData, surgeon: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Assistant Surgeon</Label>
                <Input
                  value={formData.assistantSurgeon}
                  onChange={(e) => setFormData({ ...formData, assistantSurgeon: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Consultant Anesthesiologist *</Label>
                <Input
                  required
                  value={formData.anesthesiologist}
                  onChange={(e) => setFormData({ ...formData, anesthesiologist: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Surgery Date *</Label>
                <Input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Slot Time *</Label>
                <Input
                  placeholder="e.g. 09:30 AM"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Duration (Minutes)</Label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Estimated Cost (₹) *</Label>
                <Input
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: Number(e.target.value) })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">OT Suite Allocation *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.otRoom}
                  onChange={(e) => setFormData({ ...formData, otRoom: e.target.value })}
                >
                  <option value="OT 1 - Modular Cardiac OT">OT 1: Modular Cardiac Suite</option>
                  <option value="OT 2 - Neuro-Trauma OT">OT 2: Neuro-Trauma Suite</option>
                  <option value="OT 3 - Orthopedic & Joint Replacement OT">OT 3: Orthopedic &amp; Joint Suite</option>
                  <option value="OT 4 - Laparoscopic & GI OT">OT 4: Laparoscopic &amp; GI Suite</option>
                  <option value="OT 5 - Emergency & Minor OT">OT 5: Emergency &amp; Daycare</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Anesthesia Technique *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.anesthesiaType}
                  onChange={(e) => setFormData({ ...formData, anesthesiaType: e.target.value as any })}
                >
                  <option value="General Anesthesia (GA)">General Anesthesia (GA)</option>
                  <option value="Spinal Anesthesia">Spinal Anesthesia</option>
                  <option value="Epidural">Epidural</option>
                  <option value="Regional Nerve Block">Regional Nerve Block</option>
                  <option value="Local Anesthesia / MAC">Local Anesthesia / MAC</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {submitting ? "Booking..." : `Confirm Booking & Schedule (₹${formData.estimatedCost})`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
