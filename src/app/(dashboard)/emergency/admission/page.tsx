"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Search,
  Plus,
  RefreshCw,
  BedDouble,
  CheckCircle2,
  Clock,
  HeartPulse,
  Flame,
  AlertCircle,
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

export default function EmergencyAdmissionPage() {
  const [casualties, setCasualties] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    casualtyId: "",
    patientName: "",
    wardType: "ICU",
    admittingDoctor: "Dr. Arvind (ER Consultant)",
    priority: "IMMEDIATE_STAT",
    handoverVitals: "BP 125/80, HR 86, SpO2 98% on room air",
    infusionsRunning: "Normal Saline 100ml/hr, IV Pantoprazole",
    notes: "Patient stabilized in Resuscitation Bay. Shifted with oxygen & monitor."
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/emergency/casualty");
      const data = await res.json();
      if (data.success) {
        setCasualties(data.data || []);
      }
    } catch (err) {
      toast("Failed to load emergency admissions data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectCasualty = (cId: string) => {
    const found = casualties.find((c) => c._id === cId);
    if (found) {
      setFormData({
        ...formData,
        casualtyId: found._id,
        patientName: found.patientName
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.casualtyId) {
      toast("Please select a patient to admit", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/emergency/admission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        toast(`Patient admitted to ${formData.wardType} successfully!`, "success");
        setIsOpen(false);
        loadData();
      } else {
        toast(data.message || "Failed to process admission", "error");
      }
    } catch (err) {
      toast("Error processing admission", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const admittedCases = casualties.filter((c) => c.status === "ADMITTED");
  const awaitingAdmission = casualties.filter(
    (c) => c.status !== "DISCHARGED" && c.status !== "ADMITTED" && c.status !== "EXPIRED"
  );

  const filteredAdmissions = admittedCases.filter(
    (c) =>
      c.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber?.toLowerCase().includes(search.toLowerCase()) ||
      c.dispositionNotes?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Inpatient Admission &amp; Escalation Gateway
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Rapid handover and bed reservation from ER to Intensive Care Units (ICU, CCU, PICU) and surgical wards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => {
              if (awaitingAdmission.length > 0) handleSelectCasualty(awaitingAdmission[0]._id);
              setIsOpen(true);
            }}
            className="text-xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Process Inpatient Admission
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Total Admissions from ER
              <Building2 className="h-4 w-4 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-indigo-600">
              {admittedCases.length}
            </div>
            <p className="text-[10px] text-slate-500">Transferred to IP wards</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Awaiting Inpatient Bed
              <Clock className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-amber-600">
              {awaitingAdmission.length}
            </div>
            <p className="text-[10px] text-slate-500">Currently in ER bays</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Critical ICU Escalations
              <Flame className="h-4 w-4 text-rose-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-rose-600">
              {admittedCases.filter((c) => c.dispositionNotes?.includes("ICU")).length}
            </div>
            <p className="text-[10px] text-slate-500">Immediate intensive care</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search admissions by patient, case # or ward notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Admitted Cases Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-600" />
            ER Inpatient Escalation Registry ({filteredAdmissions.length} Transferred)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Case #</TableHead>
                <TableHead>Patient Details</TableHead>
                <TableHead>Initial Diagnosis / Complaints</TableHead>
                <TableHead>Admitted Destination</TableHead>
                <TableHead>Admission Handover Notes</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                    No inpatient admissions processed yet.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdmissions.map((c) => (
                  <TableRow key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                      {c.caseNumber}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {c.patientName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {c.uhid || "Casualty"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-xs text-slate-700 dark:text-slate-300 truncate">
                        {c.chiefComplaints}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className="bg-indigo-600 text-white text-[10px] flex items-center gap-1 w-fit">
                        <Building2 className="h-3 w-3" /> Admitted
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-xs text-slate-700 dark:text-slate-300 truncate font-medium">
                        {c.dispositionNotes || "Transferred to Inpatient Bed"}
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-500 font-mono text-[10px]">
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Admission Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              Transfer &amp; Admit Patient to Inpatient Care
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            {/* Patient Selector */}
            <div className="space-y-1">
              <Label className="text-xs">Select Casualty Patient *</Label>
              <select
                required
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={formData.casualtyId}
                onChange={(e) => handleSelectCasualty(e.target.value)}
              >
                <option value="">-- Choose Patient Awaiting Admission --</option>
                {awaitingAdmission.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.patientName} ({c.caseNumber}) - Triage: {c.triagePriority}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Destination Inpatient Unit *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.wardType}
                  onChange={(e) => setFormData({ ...formData, wardType: e.target.value })}
                >
                  <option value="ICU">Medical ICU (MICU)</option>
                  <option value="CCU">Coronary Care Unit (CCU)</option>
                  <option value="TRAUMA_ICU">Surgical Trauma ICU</option>
                  <option value="PICU">Pediatric ICU (PICU)</option>
                  <option value="EMERGENCY_OT">Emergency Operation Theater (OT)</option>
                  <option value="CARDIAC_WARD">Inpatient Cardiology Ward</option>
                  <option value="GENERAL_WARD">General Inpatient Ward</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Admission Priority *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="IMMEDIATE_STAT">Immediate STAT Transfer</option>
                  <option value="HIGH_PRIORITY">High Priority (&lt; 30 mins)</option>
                  <option value="ROUTINE">Routine Bed Handover</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Admitting Physician / Consultant *</Label>
              <Input
                required
                value={formData.admittingDoctor}
                onChange={(e) => setFormData({ ...formData, admittingDoctor: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Vitals at Handover *</Label>
              <Input
                required
                value={formData.handoverVitals}
                onChange={(e) => setFormData({ ...formData, handoverVitals: e.target.value })}
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Ongoing Infusions &amp; Life Support Lines</Label>
              <Input
                value={formData.infusionsRunning}
                onChange={(e) => setFormData({ ...formData, infusionsRunning: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Handover Summary &amp; Special Directives</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {submitting ? "Admitting..." : "Authorize Inpatient Admission"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
