"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Search,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Flame,
  ShieldCheck,
  Check,
  X
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

export default function SurgeryRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    patientName: "",
    uhid: "",
    requestingDoctor: "Dr. Arvind (Consultant)",
    department: "General Surgery",
    procedureProposed: "",
    diagnosis: "",
    urgency: "ELECTIVE",
    preferredDate: new Date().toISOString().slice(0, 10),
    estimatedDuration: 90,
    pacCleared: false,
    bloodArrangementRequired: false,
    bloodUnits: 0,
    remarks: "Patient hemodynamically stable. Routine elective booking."
  });

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ot/requests");
      const data = await res.json();
      if (data.success) {
        setRequests(data.data || []);
      }
    } catch (err) {
      toast("Failed to load surgery requests", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/ot/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast(`Surgery request marked as ${newStatus}`, "success");
        loadRequests();
      } else {
        toast(data.message || "Failed to update request", "error");
      }
    } catch (err) {
      toast("Error updating surgery request", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName.trim() || !formData.procedureProposed.trim()) {
      toast("Patient name and proposed procedure are required", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/ot/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        toast(`Surgery request ${data.data.requestCode} registered!`, "success");
        setIsOpen(false);
        loadRequests();
      } else {
        toast(data.message || "Failed to submit request", "error");
      }
    } catch (err) {
      toast("Error submitting request", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const pName = r.patientName || "";
      const proc = r.procedureProposed || "";
      const doc = r.requestingDoctor || "";
      const code = r.requestCode || "";

      const matchesSearch =
        pName.toLowerCase().includes(search.toLowerCase()) ||
        proc.toLowerCase().includes(search.toLowerCase()) ||
        doc.toLowerCase().includes(search.toLowerCase()) ||
        code.toLowerCase().includes(search.toLowerCase());

      const matchesUrgency = urgencyFilter === "ALL" || r.urgency === urgencyFilter;
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;

      return matchesSearch && matchesUrgency && matchesStatus;
    });
  }, [requests, search, urgencyFilter, statusFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Surgery Requisitions &amp; Bookings Gateway
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Clinical surgical requisitions submitted by inpatient departments, emergency rooms, and outpatient clinics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadRequests}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsOpen(true)}
            className="text-xs flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4" />
            New Surgery Requisition
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
                placeholder="Search requests by patient, procedure, doctor, or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
              >
                <option value="ALL">All Urgency Tiers</option>
                <option value="ELECTIVE">Elective</option>
                <option value="URGENT">Urgent (&lt; 24h)</option>
                <option value="EMERGENCY_STAT">Emergency STAT</option>
              </select>
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses ({requests.length})</option>
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approved for OT</option>
                <option value="SCHEDULED">Scheduled on Slate</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-purple-600" />
            Surgical Requisition Queue ({filteredRequests.length} Requisitions)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Request Code</TableHead>
                <TableHead>Patient Details</TableHead>
                <TableHead>Proposed Procedure &amp; Diagnosis</TableHead>
                <TableHead>Department &amp; Doctor</TableHead>
                <TableHead>Preferred Date</TableHead>
                <TableHead>PAC &amp; Blood</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-400">
                    No surgery requisitions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((r) => (
                  <TableRow key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell className="font-mono font-bold text-purple-700 dark:text-purple-400">
                      {r.requestCode}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {r.patientName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {r.uhid || "Casualty"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {r.procedureProposed}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs">
                        Dx: {r.diagnosis}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium">{r.requestingDoctor}</div>
                      <div className="text-[10px] text-slate-400">{r.department}</div>
                    </TableCell>

                    <TableCell className="font-mono">
                      {new Date(r.preferredDate).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={r.pacCleared ? "default" : "outline"}
                          className={`text-[9px] w-fit ${
                            r.pacCleared ? "bg-teal-600 text-white" : "text-amber-600 border-amber-300"
                          }`}
                        >
                          {r.pacCleared ? "PAC Cleared" : "PAC Pending"}
                        </Badge>
                        {r.bloodArrangementRequired && (
                          <span className="text-[9px] text-rose-600 font-medium">
                            Blood: {r.bloodUnits || 1} U Req
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          r.urgency === "EMERGENCY_STAT"
                            ? "destructive"
                            : r.urgency === "URGENT"
                            ? "outline"
                            : "secondary"
                        }
                        className="text-[9px]"
                      >
                        {r.urgency}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      {r.status === "PENDING" ? (
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(r._id, "APPROVED")}
                            className="h-6 text-[10px] px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            <Check className="h-3 w-3 mr-0.5" /> Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(r._id, "REJECTED")}
                            className="h-6 text-[10px] px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <X className="h-3 w-3 mr-0.5" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          {r.status}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Requisition Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-purple-600" />
              Submit Surgery Requisition
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
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
                <Label className="text-xs">Requesting Consultant *</Label>
                <Input
                  required
                  value={formData.requestingDoctor}
                  onChange={(e) => setFormData({ ...formData, requestingDoctor: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Department *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="General Surgery">General Surgery</option>
                  <option value="Cardiothoracic Surgery">Cardiothoracic Surgery</option>
                  <option value="Neurosurgery">Neurosurgery</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Urology">Urology</option>
                  <option value="Gynecology">Gynecology</option>
                  <option value="Surgical Oncology">Surgical Oncology</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Proposed Surgical Procedure *</Label>
              <Input
                required
                placeholder="e.g. Left Percutaneous Nephrolithotomy (PCNL)"
                value={formData.procedureProposed}
                onChange={(e) => setFormData({ ...formData, procedureProposed: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Pre-Op Diagnosis &amp; Clinical Indication *</Label>
              <Input
                required
                placeholder="Clinical indication"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Urgency Priority *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                >
                  <option value="ELECTIVE">Elective</option>
                  <option value="URGENT">Urgent (&lt; 24 Hours)</option>
                  <option value="EMERGENCY_STAT">Emergency STAT</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Preferred Date *</Label>
                <Input
                  type="date"
                  required
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Est. Duration (Mins)</Label>
                <Input
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: Number(e.target.value) })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 p-2 rounded bg-slate-50 dark:bg-slate-800 border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pacCleared}
                  onChange={(e) => setFormData({ ...formData, pacCleared: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span>Pre-Anesthesia Checkup (PAC) Cleared</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.bloodArrangementRequired}
                  onChange={(e) => setFormData({ ...formData, bloodArrangementRequired: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span>Crossmatched Blood Required</span>
              </label>
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
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white"
              >
                {submitting ? "Submitting..." : "Submit Surgery Requisition"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
