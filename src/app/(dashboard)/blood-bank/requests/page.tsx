"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Plus,
  RefreshCw,
  Search,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Stethoscope
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

export default function BloodRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    patientName: "",
    uhid: "",
    wardOrDepartment: "Emergency Triage",
    doctorName: "Dr. Emergency Consultant",
    diagnosis: "Severe Acute Hemorrhagic Shock / Trauma",
    bloodGroup: "O+",
    componentRequested: "PRBC",
    unitsRequested: 2,
    urgency: "URGENT",
    remarks: "Immediate transfusion needed post-stabilization."
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/blood-bank/requests");
      const data = await res.json();
      if (data.success) {
        setRequests(data.data || []);
      }
    } catch (err) {
      toast("Failed to load blood requests", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName.trim() || !formData.doctorName.trim()) {
      toast("Patient name and doctor name are required", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/blood-bank/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        toast(`Blood Requisition ${data.data.requestCode} submitted successfully!`, "success");
        setIsOpen(false);
        fetchRequests();
      } else {
        toast(data.message || "Failed to submit blood requisition", "error");
      }
    } catch (err) {
      toast("Error submitting blood requisition", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/blood-bank/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        toast(`Request updated to ${status}`, "success");
        fetchRequests();
      }
    } catch (err) {
      toast("Failed to update status", "error");
    }
  };

  const filtered = requests.filter((r) => {
    const matchesSearch =
      r.requestCode?.toLowerCase().includes(search.toLowerCase()) ||
      r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      r.wardOrDepartment?.toLowerCase().includes(search.toLowerCase()) ||
      r.doctorName?.toLowerCase().includes(search.toLowerCase());

    const matchesUrgency = urgencyFilter === "ALL" || r.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            Clinical Blood Requisitions Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Requisitions from Emergency, OT, ICU, and Inpatient wards with urgency prioritization and status workflow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRequests}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsOpen(true)}
            className="text-xs flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Raise Blood Requisition
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by requisition code, patient, ward, or prescribing doctor..."
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
                <option value="ROUTINE">Routine (Planned Transfusion)</option>
                <option value="URGENT">Urgent (Ward / ICU Bleed)</option>
                <option value="EMERGENCY_STAT_UNMATCHED">EMERGENCY STAT (Trauma / Code Red)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-amber-600" />
            Clinical Blood Requisition Queue ({filtered.length} Requisitions)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Requisition Code</TableHead>
                <TableHead>Patient Details &amp; Location</TableHead>
                <TableHead>Blood Group &amp; Units</TableHead>
                <TableHead>Clinical Indication</TableHead>
                <TableHead>Ordering Doctor</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-400">
                    No blood requisitions found. Click &quot;Raise Blood Requisition&quot; to order blood components.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell className="font-mono font-bold text-amber-700 dark:text-amber-400">
                      {r.requestCode}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {r.patientName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {r.wardOrDepartment} • UHID: {r.uhid || "N/A"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge className="bg-rose-600 text-white font-bold text-[10px]">
                          {r.bloodGroup}
                        </Badge>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {r.unitsRequested} {r.componentRequested}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="max-w-[200px]">
                      <div className="text-slate-800 dark:text-slate-200 truncate font-medium">
                        {r.diagnosis}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {r.remarks || "No extra remarks"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-slate-800 dark:text-slate-200">{r.doctorName}</div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={`text-[9px] ${
                          r.urgency === "EMERGENCY_STAT_UNMATCHED"
                            ? "bg-red-600 text-white animate-pulse"
                            : r.urgency === "URGENT"
                            ? "bg-amber-600 text-white"
                            : "bg-slate-500 text-white"
                        }`}
                      >
                        {r.urgency}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[9px] ${
                          r.status === "READY_FOR_ISSUE"
                            ? "border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950"
                            : r.status === "ISSUED"
                            ? "border-slate-500 text-slate-700"
                            : "border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950"
                        }`}
                      >
                        {r.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right space-x-1">
                      {r.status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(r._id, "CROSSMATCHING")}
                          className="h-6 text-[10px] text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                        >
                          Crossmatch
                        </Button>
                      )}
                      {r.status === "CROSSMATCHING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(r._id, "READY_FOR_ISSUE")}
                          className="h-6 text-[10px] text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        >
                          Ready
                        </Button>
                      )}
                      {r.status === "READY_FOR_ISSUE" && (
                        <Link href="/blood-bank/issue">
                          <Button
                            size="sm"
                            className="h-6 text-[10px] bg-rose-600 hover:bg-rose-700 text-white"
                          >
                            Dispense
                          </Button>
                        </Link>
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
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-amber-600" />
              Raise Clinical Blood Component Requisition
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Patient Recipient Name *</Label>
                <Input
                  required
                  placeholder="Patient full name"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Patient UHID</Label>
                <Input
                  placeholder="MED-2026-XXXX"
                  value={formData.uhid}
                  onChange={(e) => setFormData({ ...formData, uhid: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Ward / OT / Department *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.wardOrDepartment}
                  onChange={(e) => setFormData({ ...formData, wardOrDepartment: e.target.value })}
                >
                  <option value="Emergency Triage">Emergency Triage</option>
                  <option value="Trauma Resuscitation">Trauma Resuscitation</option>
                  <option value="Medical ICU">Medical ICU</option>
                  <option value="Surgical ICU">Surgical ICU</option>
                  <option value="OT 1 - Modular Cardiac">OT 1 - Modular Cardiac</option>
                  <option value="OT 2 - Neuro-Trauma">OT 2 - Neuro-Trauma</option>
                  <option value="Labour & Delivery">Labour &amp; Delivery Suite</option>
                  <option value="General Ward">General Ward</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Ordering Doctor *</Label>
                <Input
                  required
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Blood Group *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as any })}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Component *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.componentRequested}
                  onChange={(e) => setFormData({ ...formData, componentRequested: e.target.value as any })}
                >
                  <option value="PRBC">Packed Red Cells (PRBC)</option>
                  <option value="WHOLE_BLOOD">Whole Blood (WB)</option>
                  <option value="FFP">Fresh Frozen Plasma (FFP)</option>
                  <option value="PLATELETS">Platelets (RDP/SDP)</option>
                  <option value="CRYOPRECIPITATE">Cryoprecipitate</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Units Required *</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.unitsRequested}
                  onChange={(e) => setFormData({ ...formData, unitsRequested: Number(e.target.value) })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Urgency Tier *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring font-semibold"
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                >
                  <option value="ROUTINE">ROUTINE (Within 24h)</option>
                  <option value="URGENT">URGENT (Within 2h)</option>
                  <option value="EMERGENCY_STAT_UNMATCHED">EMERGENCY STAT (&lt;15m, Code Red)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Diagnosis / Clinical Indication *</Label>
                <Input
                  required
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Transfusion Instructions / Remarks</Label>
              <Input
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="text-xs"
              />
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
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
              >
                {submitting ? "Submitting..." : "Submit Blood Requisition"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
