"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit2,
  FileCheck2,
  Clock,
  HeartPulse,
  Syringe,
  Scissors
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

export default function PreOpChecklistPage() {
  const [checklists, setChecklists] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedChecklist, setSelectedChecklist] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    patientIdentityConfirmed: true,
    surgicalSiteMarked: true,
    consentConfirmed: true,
    anesthesiaMachineChecked: true,
    pulseOximeterFunctioning: true,
    knownAllergy: false,
    allergyDetails: "No known drug allergies (NKDA)",
    difficultAirwayRisk: false,
    bloodLossRiskOver500ml: false,
    bloodUnitsArranged: 0,
    npoFastingHours: 8,
    premedicationGiven: true,
    asaGrade: "ASA II",
    pacCleared: true,
    verifiedByNurse: "Sr. Staff Nurse Pre-Op",
    verifiedByAnesthetist: "Dr. Anesthesiologist",
    status: "COMPLIANT",
    notes: "All WHO Sign-in safety checkpoints validated."
  });

  const loadChecklists = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ot/preop");
      const data = await res.json();
      if (data.success) {
        setChecklists(data.data || []);
      }
    } catch (err) {
      toast("Failed to load pre-op checklists", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChecklists();
  }, []);

  const handleEdit = (c: any) => {
    setSelectedChecklist(c);
    setForm({
      patientIdentityConfirmed: c.patientIdentityConfirmed ?? true,
      surgicalSiteMarked: c.surgicalSiteMarked ?? true,
      consentConfirmed: c.consentConfirmed ?? true,
      anesthesiaMachineChecked: c.anesthesiaMachineChecked ?? true,
      pulseOximeterFunctioning: c.pulseOximeterFunctioning ?? true,
      knownAllergy: c.knownAllergy ?? false,
      allergyDetails: c.allergyDetails || "None",
      difficultAirwayRisk: c.difficultAirwayRisk ?? false,
      bloodLossRiskOver500ml: c.bloodLossRiskOver500ml ?? false,
      bloodUnitsArranged: c.bloodUnitsArranged || 0,
      npoFastingHours: c.npoFastingHours || 8,
      premedicationGiven: c.premedicationGiven ?? true,
      asaGrade: c.asaGrade || "ASA II",
      pacCleared: c.pacCleared ?? true,
      verifiedByNurse: c.verifiedByNurse || "Staff Nurse",
      verifiedByAnesthetist: c.verifiedByAnesthetist || "Dr. Anesthesiologist",
      status: c.status || "COMPLIANT",
      notes: c.notes || ""
    });
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChecklist) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/ot/preop/${selectedChecklist._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (data.success) {
        toast("WHO Pre-Op Checklist verified and saved!", "success");
        setIsOpen(false);
        loadChecklists();
      } else {
        toast(data.message || "Failed to update checklist", "error");
      }
    } catch (err) {
      toast("Error saving checklist", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    return checklists.filter((c) => {
      const pName = c.patientName || "";
      const sName = c.surgeryName || "";
      const code = c.checklistCode || "";

      const matchesSearch =
        pName.toLowerCase().includes(search.toLowerCase()) ||
        sName.toLowerCase().includes(search.toLowerCase()) ||
        code.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [checklists, search, statusFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            WHO Surgical Safety Sign-In &amp; Pre-Op Checklist
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Mandatory Sign-In verification before induction: identity check, site marking, consent, ASA grade, and blood crossmatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadChecklists}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search checklist by patient, surgery, or code..."
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
                <option value="ALL">All Checklist Statuses</option>
                <option value="COMPLIANT">Compliant (Ready for Induction)</option>
                <option value="INCOMPLETE">Incomplete Sign-In</option>
                <option value="HOLD">On Hold</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-rose-600" />
            WHO Surgical Safety Registry ({filtered.length} Patients)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Checklist Code</TableHead>
                <TableHead>Patient &amp; UHID</TableHead>
                <TableHead>Scheduled Surgery</TableHead>
                <TableHead>WHO Sign-In Verification</TableHead>
                <TableHead>ASA &amp; PAC</TableHead>
                <TableHead>Verified By</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    No pre-op safety checklists recorded.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell className="font-mono font-bold text-rose-700 dark:text-rose-400">
                      {c.checklistCode}
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
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {c.surgeryName}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-[10px]">
                        <span className={c.patientIdentityConfirmed ? "text-emerald-600" : "text-rose-600"}>
                          ✓ Identity Confirmed
                        </span>
                        <span className={c.surgicalSiteMarked ? "text-emerald-600" : "text-rose-600"}>
                          ✓ Site Marked
                        </span>
                        <span className={c.consentConfirmed ? "text-emerald-600" : "text-rose-600"}>
                          ✓ High Risk Consent
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-[9px]">
                          {c.asaGrade}
                        </Badge>
                        <div>
                          <Badge
                            className={`text-[9px] ${
                              c.pacCleared ? "bg-teal-600 text-white" : "bg-amber-600 text-white"
                            }`}
                          >
                            {c.pacCleared ? "PAC Cleared" : "PAC Pending"}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-slate-700 dark:text-slate-300">
                        {c.verifiedByAnesthetist}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Nurse: {c.verifiedByNurse}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(c)}
                        className="h-7 text-xs px-2 text-rose-700 hover:text-rose-800"
                      >
                        <Edit2 className="h-3 w-3 mr-1" /> Sign-In
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* WHO Sign-In Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-rose-600" />
              WHO Surgical Safety Sign-In Verification
            </DialogTitle>
          </DialogHeader>

          {selectedChecklist && (
            <form onSubmit={handleSave} className="space-y-4 pt-2 text-xs">
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 border">
                <div className="font-bold text-slate-900 dark:text-white">
                  {selectedChecklist.surgeryName}
                </div>
                <div className="text-[11px] text-slate-500">
                  Patient: <span className="font-semibold">{selectedChecklist.patientName}</span> ({selectedChecklist.uhid || "UHID N/A"})
                </div>
              </div>

              {/* 9-Point Safety Checklist */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  BEFORE INDUCTION OF ANESTHESIA (SIGN-IN)
                </Label>

                <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded border">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.patientIdentityConfirmed}
                      onChange={(e) => setForm({ ...form, patientIdentityConfirmed: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span>1. Patient has confirmed identity, surgical site, and procedure</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.surgicalSiteMarked}
                      onChange={(e) => setForm({ ...form, surgicalSiteMarked: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span>2. Surgical site marked by operating surgeon</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.consentConfirmed}
                      onChange={(e) => setForm({ ...form, consentConfirmed: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span>3. Informed high-risk consent signed &amp; verified</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.anesthesiaMachineChecked}
                      onChange={(e) => setForm({ ...form, anesthesiaMachineChecked: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span>4. Anesthesia machine and medication safety check completed</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.pulseOximeterFunctioning}
                      onChange={(e) => setForm({ ...form, pulseOximeterFunctioning: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span>5. Pulse oximeter on patient and functioning</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.difficultAirwayRisk}
                      onChange={(e) => setForm({ ...form, difficultAirwayRisk: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span>6. Difficult airway / aspiration risk assessed (Equipment ready)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.bloodLossRiskOver500ml}
                      onChange={(e) => setForm({ ...form, bloodLossRiskOver500ml: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span>7. Risk of &gt;500ml blood loss (Adequate IV access &amp; crossmatched blood)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">ASA Physical Status *</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={form.asaGrade}
                    onChange={(e) => setForm({ ...form, asaGrade: e.target.value as any })}
                  >
                    <option value="ASA I">ASA I - Normal Healthy</option>
                    <option value="ASA II">ASA II - Mild Systemic Disease</option>
                    <option value="ASA III">ASA III - Severe Systemic Disease</option>
                    <option value="ASA IV">ASA IV - Incapacitating Disease</option>
                    <option value="ASA V">ASA V - Moribund</option>
                    <option value="ASA E">ASA E - Emergency Procedure</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">NPO Fasting (Hours) *</Label>
                  <Input
                    type="number"
                    value={form.npoFastingHours}
                    onChange={(e) => setForm({ ...form, npoFastingHours: Number(e.target.value) })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Blood Units Arranged</Label>
                  <Input
                    type="number"
                    value={form.bloodUnitsArranged}
                    onChange={(e) => setForm({ ...form, bloodUnitsArranged: Number(e.target.value) })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Verified By Anesthetist *</Label>
                  <Input
                    required
                    value={form.verifiedByAnesthetist}
                    onChange={(e) => setForm({ ...form, verifiedByAnesthetist: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Verified By Pre-Op Nurse *</Label>
                  <Input
                    required
                    value={form.verifiedByNurse}
                    onChange={(e) => setForm({ ...form, verifiedByNurse: e.target.value })}
                    className="text-xs"
                  />
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
                  className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {submitting ? "Validating..." : "Authorize Sign-In & Clear for Induction"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
