"use client";

import { useEffect, useState, useMemo } from "react";
import {
  HeartPulse,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Syringe,
  Activity,
  Scissors,
  Layers,
  Clock
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

export default function AnesthesiaPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [anesthesiaForm, setAnesthesiaForm] = useState({
    surgeryScheduleId: "",
    anesthesiaType: "General Anesthesia (GA)",
    asaGrade: "ASA II",
    anesthesiologist: "Dr. Sunita Kapoor (Consultant)",
    mallampatiClass: "Class I",
    inductionAgent: "IV Propofol 150mg + IV Fentanyl 100mcg",
    muscleRelaxant: "IV Rocuronium 50mg",
    maintenanceAgent: "Sevoflurane 2% + O2/Air (50:50)",
    reversalAgent: "IV Neostigmine 2.5mg + Glycopyrrolate 0.5mg",
    airwayDetails: "Cuffed Endotracheal Tube #7.5 oral, Cormack-Lehane Grade 1"
  });

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ot/anesthesia");
      const data = await res.json();
      if (data.success) {
        setSchedules(data.data || []);
      }
    } catch (err) {
      toast("Failed to load anesthesia records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleOpenProtocol = (s: any) => {
    setSelectedCase(s);
    setAnesthesiaForm({
      ...anesthesiaForm,
      surgeryScheduleId: s._id,
      anesthesiaType: s.anesthesiaType || "General Anesthesia (GA)",
      asaGrade: s.asaGrade || "ASA II",
      anesthesiologist: s.anesthesiologist || "Dr. Sunita Kapoor"
    });
    setIsOpen(true);
  };

  const handleSaveProtocol = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/ot/anesthesia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(anesthesiaForm)
      });
      const data = await res.json();

      if (data.success) {
        toast("Anesthesia record & agent protocol saved!", "success");
        setIsOpen(false);
        loadSchedules();
      } else {
        toast(data.message || "Failed to save protocol", "error");
      }
    } catch (err) {
      toast("Error saving anesthesia protocol", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    return schedules.filter((s) => {
      const pName = s.patientName || "";
      const surg = s.surgeryName || "";
      const anesth = s.anesthesiologist || "";

      return (
        pName.toLowerCase().includes(search.toLowerCase()) ||
        surg.toLowerCase().includes(search.toLowerCase()) ||
        anesth.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [schedules, search]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            Anesthesia Workstation &amp; Drug Administration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pre-anesthetic evaluation, airway Mallampati grading, induction agents, volatile gases, and reversal protocols.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadSchedules}
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
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by patient, anesthetist, or procedure..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Anesthesia Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-teal-600" />
            Active Surgical Anesthesia Slate ({filtered.length} Patients)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Case Code</TableHead>
                <TableHead>Patient Details</TableHead>
                <TableHead>Surgery &amp; OT Suite</TableHead>
                <TableHead>Consultant Anesthetist</TableHead>
                <TableHead>Anesthesia Technique</TableHead>
                <TableHead>ASA Grade</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    No anesthesia records found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell className="font-mono font-bold text-teal-700 dark:text-teal-400">
                      {s.surgeryCode}
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
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {s.surgeryName}
                      </div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400">
                        {s.otRoom}
                      </div>
                    </TableCell>

                    <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                      {s.anesthesiologist || "On Duty Anesthetist"}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {s.anesthesiaType}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge className="bg-teal-600 text-white text-[10px]">
                        {s.asaGrade || "ASA II"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenProtocol(s)}
                        className="h-7 text-xs px-2 text-teal-700 hover:text-teal-800"
                      >
                        <Syringe className="h-3 w-3 mr-1" /> Protocol
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Anesthesia Protocol Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-teal-600" />
              Anesthesia Protocol &amp; Drug Administration Log
            </DialogTitle>
          </DialogHeader>

          {selectedCase && (
            <form onSubmit={handleSaveProtocol} className="space-y-4 pt-2 text-xs">
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 border">
                <div className="font-bold text-slate-900 dark:text-white">
                  {selectedCase.surgeryName}
                </div>
                <div className="text-[11px] text-slate-500">
                  Patient: <span className="font-semibold">{selectedCase.patientName}</span> ({selectedCase.uhid || "UHID N/A"}) • Room: {selectedCase.otRoom}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Anesthesia Technique *</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={anesthesiaForm.anesthesiaType}
                    onChange={(e) => setAnesthesiaForm({ ...anesthesiaForm, anesthesiaType: e.target.value })}
                  >
                    <option value="General Anesthesia (GA)">General Anesthesia (GA)</option>
                    <option value="Spinal Anesthesia">Spinal Anesthesia</option>
                    <option value="Epidural">Epidural</option>
                    <option value="Regional Nerve Block">Regional Nerve Block</option>
                    <option value="Local Anesthesia / MAC">Local Anesthesia / MAC</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">ASA Grade *</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={anesthesiaForm.asaGrade}
                    onChange={(e) => setAnesthesiaForm({ ...anesthesiaForm, asaGrade: e.target.value })}
                  >
                    <option value="ASA I">ASA I</option>
                    <option value="ASA II">ASA II</option>
                    <option value="ASA III">ASA III</option>
                    <option value="ASA IV">ASA IV</option>
                    <option value="ASA V">ASA V</option>
                    <option value="ASA E (Emergency)">ASA E</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Mallampati Airway Class *</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={anesthesiaForm.mallampatiClass}
                    onChange={(e) => setAnesthesiaForm({ ...anesthesiaForm, mallampatiClass: e.target.value })}
                  >
                    <option value="Class I">Class I (Complete visualization of soft palate, fauces, uvula)</option>
                    <option value="Class II">Class II (Soft palate, fauces, portion of uvula visible)</option>
                    <option value="Class III">Class III (Soft palate, base of uvula visible)</option>
                    <option value="Class IV">Class IV (Hard palate only visible)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Airway Device &amp; Size</Label>
                  <Input
                    value={anesthesiaForm.airwayDetails}
                    onChange={(e) => setAnesthesiaForm({ ...anesthesiaForm, airwayDetails: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Induction Agents &amp; Analgesia</Label>
                <Input
                  value={anesthesiaForm.inductionAgent}
                  onChange={(e) => setAnesthesiaForm({ ...anesthesiaForm, inductionAgent: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Muscle Relaxant</Label>
                  <Input
                    value={anesthesiaForm.muscleRelaxant}
                    onChange={(e) => setAnesthesiaForm({ ...anesthesiaForm, muscleRelaxant: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Inhalational / Gas Maintenance</Label>
                  <Input
                    value={anesthesiaForm.maintenanceAgent}
                    onChange={(e) => setAnesthesiaForm({ ...anesthesiaForm, maintenanceAgent: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Reversal Agents Administered</Label>
                <Input
                  value={anesthesiaForm.reversalAgent}
                  onChange={(e) => setAnesthesiaForm({ ...anesthesiaForm, reversalAgent: e.target.value })}
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
                  className="text-xs bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {submitting ? "Saving..." : "Save Anesthesia Record"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
