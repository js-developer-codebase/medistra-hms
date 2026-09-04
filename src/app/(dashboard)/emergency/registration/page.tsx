"use client";

import { useEffect, useState } from "react";
import {
  UserPlus,
  Search,
  Truck,
  ShieldAlert,
  Phone,
  Clock,
  MapPin,
  RefreshCw,
  Plus,
  BedDouble,
  CheckCircle2,
  FileText
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

export default function EmergencyRegistrationPage() {
  const [casualties, setCasualties] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    patientName: "",
    uhid: "",
    age: "",
    gender: "Male",
    contactNumber: "",
    modeOfArrival: "Walk-in",
    broughtBy: "",
    broughtByPhone: "",
    attendantRelation: "",
    isMLC: false,
    mlcNumber: "",
    policeStation: "",
    constableDetails: "",
    chiefComplaints: "",
    initialAssessment: "",
    assignedBay: "Acute Bay 1",
    triagePriority: "Yellow"
  });

  const fetchCasualties = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/emergency/casualty");
      const data = await res.json();
      if (data.success) {
        setCasualties(data.data || []);
      }
    } catch (err) {
      toast("Failed to load casualties", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCasualties();
  }, []);

  const filteredCasualties = casualties.filter(
    (c) =>
      c.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber?.toLowerCase().includes(search.toLowerCase()) ||
      c.chiefComplaints?.toLowerCase().includes(search.toLowerCase()) ||
      c.mlcNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setFormData({
      patientName: "",
      uhid: `UHID-${Math.floor(10000 + Math.random() * 90000)}`,
      age: "",
      gender: "Male",
      contactNumber: "+91 ",
      modeOfArrival: "Walk-in",
      broughtBy: "",
      broughtByPhone: "",
      attendantRelation: "",
      isMLC: false,
      mlcNumber: `MLC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      policeStation: "",
      constableDetails: "",
      chiefComplaints: "",
      initialAssessment: "",
      assignedBay: "Acute Bay 1",
      triagePriority: "Yellow"
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName.trim() || !formData.chiefComplaints.trim()) {
      toast("Patient name and chief complaints are required", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        age: formData.age ? Number(formData.age) : undefined
      };

      const res = await fetch("/api/emergency/casualty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        toast(`Casualty case ${data.data.caseNumber} registered successfully!`, "success");
        setIsOpen(false);
        fetchCasualties();
      } else {
        toast(data.message || "Failed to register casualty", "error");
      }
    } catch (err) {
      toast("Error registering casualty", "error");
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
            <UserPlus className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Emergency &amp; Casualty Registration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Rapid casualty registration, ambulance transfer logging, and Medicolegal Case (MLC) police tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCasualties}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Register New Casualty
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by case #, patient name, MLC # or complaint..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Casualty Register Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-600" />
            Casualty Inflow Register ({filteredCasualties.length} Cases)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Case #</TableHead>
                <TableHead>Patient Details</TableHead>
                <TableHead>Arrival Info</TableHead>
                <TableHead>Chief Complaints</TableHead>
                <TableHead>MLC Status</TableHead>
                <TableHead>Assigned Bay</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCasualties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    No casualty records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCasualties.map((c) => (
                  <TableRow key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                      {c.caseNumber}
                      {c.uhid && (
                        <div className="text-[10px] text-slate-400 font-normal">
                          {c.uhid}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {c.patientName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {c.age ? `${c.age} Yrs` : "Age N/A"} • {c.gender || "Gender N/A"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <Truck className="h-3 w-3 text-slate-400" />
                        {c.modeOfArrival}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(c.arrivalTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-xs truncate text-slate-700 dark:text-slate-300">
                        {c.chiefComplaints}
                      </div>
                    </TableCell>

                    <TableCell>
                      {c.isMLC ? (
                        <div>
                          <Badge variant="destructive" className="text-[9px] flex items-center gap-1 w-fit">
                            <ShieldAlert className="h-2.5 w-2.5" /> MLC Case
                          </Badge>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            {c.mlcNumber || "Registered"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Non-MLC</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {c.assignedBay || "Acute Bay 1"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {c.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Rapid Registration Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              Rapid Emergency &amp; Casualty Registration
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            {/* Patient Demographics */}
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
                <Label className="text-xs">UHID (Auto / Existing)</Label>
                <Input
                  placeholder="UHID-XXXXX"
                  value={formData.uhid}
                  onChange={(e) => setFormData({ ...formData, uhid: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Age (Years)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 45"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Gender *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Patient / Attendant Phone</Label>
                <Input
                  placeholder="+91 98765 43210"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Mode of Arrival & Attendant */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg space-y-3">
              <div className="font-bold text-[11px] text-slate-700 dark:text-slate-300">
                Arrival &amp; Transport Details
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Mode of Arrival *</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={formData.modeOfArrival}
                    onChange={(e) => setFormData({ ...formData, modeOfArrival: e.target.value as any })}
                  >
                    <option value="Walk-in">Walk-in</option>
                    <option value="Ambulance">Ambulance (102 / 108)</option>
                    <option value="Police">Police PCR Van</option>
                    <option value="Transfer">Inter-hospital Transfer</option>
                    <option value="Other">Private Vehicle / Auto</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Brought By (Name / Organization)</Label>
                  <Input
                    placeholder="e.g. CAT Ambulance / ASI Singh / Relative"
                    value={formData.broughtBy}
                    onChange={(e) => setFormData({ ...formData, broughtBy: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Brought By Phone</Label>
                  <Input
                    placeholder="Contact number"
                    value={formData.broughtByPhone}
                    onChange={(e) => setFormData({ ...formData, broughtByPhone: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Medicolegal Case (MLC) Section */}
            <div className="p-3 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isMLC"
                    checked={formData.isMLC}
                    onChange={(e) => setFormData({ ...formData, isMLC: e.target.checked })}
                    className="rounded border-rose-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
                  />
                  <Label htmlFor="isMLC" className="text-xs font-bold text-rose-800 dark:text-rose-300 cursor-pointer">
                    Medicolegal Case (MLC Mandatory Tagging - RTA, Assault, Poisoning)
                  </Label>
                </div>
              </div>

              {formData.isMLC && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="space-y-1">
                    <Label className="text-xs">MLC Register Number *</Label>
                    <Input
                      placeholder="MLC-2026-XXXX"
                      value={formData.mlcNumber}
                      onChange={(e) => setFormData({ ...formData, mlcNumber: e.target.value })}
                      className="text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Jurisdiction Police Station *</Label>
                    <Input
                      placeholder="Police Station Name"
                      value={formData.policeStation}
                      onChange={(e) => setFormData({ ...formData, policeStation: e.target.value })}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Investigating Officer / Constable</Label>
                    <Input
                      placeholder="Constable Name & Badge #"
                      value={formData.constableDetails}
                      onChange={(e) => setFormData({ ...formData, constableDetails: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Clinical Intake */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Chief Complaints &amp; Injury Mechanism *</Label>
                <Input
                  required
                  placeholder="e.g. Severe chest pain, Dyspnea, Poly-trauma RTA, High grade fever"
                  value={formData.chiefComplaints}
                  onChange={(e) => setFormData({ ...formData, chiefComplaints: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Initial Physical Assessment / Nurse Notes *</Label>
                <Input
                  required
                  placeholder="Primary physical survey observations"
                  value={formData.initialAssessment}
                  onChange={(e) => setFormData({ ...formData, initialAssessment: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Immediate Bay Allocation *</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={formData.assignedBay}
                    onChange={(e) => setFormData({ ...formData, assignedBay: e.target.value })}
                  >
                    <option value="Resuscitation Bay 1">Resuscitation Bay 1 (Ventilator)</option>
                    <option value="Resuscitation Bay 2">Resuscitation Bay 2 (Defibrillator)</option>
                    <option value="Trauma Bay">Trauma Bay (Surgical)</option>
                    <option value="Acute Bay 1">Acute Bay 1</option>
                    <option value="Acute Bay 2">Acute Bay 2</option>
                    <option value="Acute Bay 3">Acute Bay 3</option>
                    <option value="Pediatric ER Bay">Pediatric ER Bay</option>
                    <option value="Procedure Room 1">Procedure / Minor OT</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Initial Triage Priority *</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={formData.triagePriority}
                    onChange={(e) => setFormData({ ...formData, triagePriority: e.target.value as any })}
                  >
                    <option value="Red">Red (Level 1 - Resuscitation)</option>
                    <option value="Orange">Orange (Level 2 - Emergent)</option>
                    <option value="Yellow">Yellow (Level 3 - Urgent)</option>
                    <option value="Green">Green (Level 4 - Less Urgent)</option>
                  </select>
                </div>
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
                {submitting ? "Registering..." : "Complete Casualty Intake"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
