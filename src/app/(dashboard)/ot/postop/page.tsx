"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Syringe,
  Search,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  HeartPulse,
  Activity,
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

export default function PostOpPACUPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    surgeryScheduleId: "",
    patientName: "",
    uhid: "",
    surgeryName: "",
    aldreteScore: 9,
    aldreteBreakdown: {
      activity: 2,
      respiration: 2,
      circulation: 2,
      consciousness: 2,
      o2Saturation: 1
    },
    vitals: {
      bp: "124/80",
      heartRate: 78,
      spo2: 98,
      respiratoryRate: 16,
      temperature: 98.6,
      painScore: 2
    },
    drainOutputMl: 40,
    postOpAnalgesia: "IV Paracetamol 1g Q8H, IV Tramadol 50mg SOS",
    antibioticCover: "IV Cefuroxime 1.5g BD",
    transferDestination: "Inpatient Ward" as "ICU" | "HDU" | "Inpatient Ward" | "Daycare Discharge",
    dischargeClearanceStatus: "Cleared for Ward" as "In Recovery / Monitoring" | "Cleared for Ward" | "Cleared for ICU" | "Discharged",
    clearedByAnesthetist: "Dr. Sunita Kapoor (PACU In-Charge)",
    recoveryNotes: "Patient awake, responding well, vitals stable, minimal drain."
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, sRes] = await Promise.all([
        fetch("/api/ot/postop"),
        fetch("/api/ot/schedule")
      ]);

      const pData = await pRes.json();
      if (pData.success) setRecords(pData.data || []);

      const sData = await sRes.json();
      if (sData.success) setSchedules(sData.data || []);
    } catch (err) {
      toast("Failed to load PACU recovery records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectSchedule = (sId: string) => {
    const found = schedules.find((s) => s._id === sId);
    if (found) {
      setFormData({
        ...formData,
        surgeryScheduleId: found._id,
        patientName: found.patientName,
        uhid: found.uhid || "",
        surgeryName: found.surgeryName
      });
    }
  };

  // Recalculate Aldrete total
  const updateAldrete = (field: keyof typeof formData.aldreteBreakdown, val: number) => {
    const updated = { ...formData.aldreteBreakdown, [field]: val };
    const total = Object.values(updated).reduce((a, b) => a + b, 0);
    setFormData({
      ...formData,
      aldreteBreakdown: updated,
      aldreteScore: total,
      dischargeClearanceStatus: total >= 9 ? "Cleared for Ward" : "In Recovery / Monitoring"
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName.trim() || !formData.surgeryName.trim()) {
      toast("Patient name and surgery name are required", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/ot/postop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        toast(`PACU Assessment ${data.data.recordCode} recorded!`, "success");
        setIsOpen(false);
        loadData();
      } else {
        toast(data.message || "Failed to log PACU record", "error");
      }
    } catch (err) {
      toast("Error submitting PACU record", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const pName = r.patientName || "";
      const surg = r.surgeryName || "";
      const code = r.recordCode || "";

      return (
        pName.toLowerCase().includes(search.toLowerCase()) ||
        surg.toLowerCase().includes(search.toLowerCase()) ||
        code.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [records, search]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Syringe className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            Post-Operative Recovery (PACU) &amp; Aldrete Scoring
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Post-Anesthesia Care Unit monitoring, objective Aldrete recovery scores (0–10), and step-down discharge clearance.
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
              if (schedules.length > 0) handleSelectSchedule(schedules[0]._id);
              setIsOpen(true);
            }}
            className="text-xs flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Assess PACU Patient
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search recovery records by patient, surgery, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* PACU Records Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Syringe className="h-4 w-4 text-cyan-600" />
            PACU Recovery Log &amp; Discharge Clearance ({filtered.length} Patients)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Record Code</TableHead>
                <TableHead>Patient &amp; Surgery</TableHead>
                <TableHead>Aldrete Score</TableHead>
                <TableHead>Post-Op Vitals</TableHead>
                <TableHead>Analgesia &amp; Drains</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    No PACU recovery records documented.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell className="font-mono font-bold text-cyan-700 dark:text-cyan-400">
                      {r.recordCode}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {r.patientName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {r.surgeryName}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-bold font-mono ${
                          r.aldreteScore >= 9 ? "text-emerald-600" : "text-amber-600"
                        }`}>
                          {r.aldreteScore} / 10
                        </span>
                        {r.aldreteScore >= 9 && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        )}
                      </div>
                      <span className="text-[9px] text-slate-400">
                        {r.aldreteScore >= 9 ? "Fit for transfer" : "Monitor in PACU"}
                      </span>
                    </TableCell>

                    <TableCell className="font-mono text-[11px]">
                      <div>BP: {r.vitals?.bp} • HR: {r.vitals?.heartRate}</div>
                      <div className="text-slate-500 text-[10px]">
                        SpO2: {r.vitals?.spo2}% • Pain: {r.vitals?.painScore}/10
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-[10px] text-slate-700 dark:text-slate-300 truncate max-w-xs">
                        {r.postOpAnalgesia}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Drain: {r.drainOutputMl}ml
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {r.transferDestination}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        className={`text-[9px] ${
                          r.dischargeClearanceStatus === "Cleared for Ward"
                            ? "bg-emerald-600 text-white"
                            : "bg-amber-600 text-white"
                        }`}
                      >
                        {r.dischargeClearanceStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PACU Assessment Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Syringe className="h-5 w-5 text-cyan-600" />
              PACU Post-Anesthesia Recovery Assessment (Aldrete Scoring)
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            {/* Surgery Selector */}
            <div className="space-y-1">
              <Label className="text-xs">Select Surgery Patient *</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={formData.surgeryScheduleId}
                onChange={(e) => handleSelectSchedule(e.target.value)}
              >
                <option value="">-- Choose Patient in Recovery --</option>
                {schedules.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.patientName} - {s.surgeryName} ({s.otRoom})
                  </option>
                ))}
              </select>
            </div>

            {/* Aldrete Score Calculator */}
            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800 rounded border">
              <div className="flex items-center justify-between pb-1 border-b">
                <span className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
                  Aldrete Post-Anesthesia Recovery Scoring
                </span>
                <span className={`text-base font-bold font-mono ${
                  formData.aldreteScore >= 9 ? "text-emerald-600" : "text-amber-600"
                }`}>
                  Total Score: {formData.aldreteScore} / 10
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <Label className="text-[10px]">1. Activity (Motor Ability)</Label>
                  <select
                    className="w-full h-8 rounded border text-[11px] px-2 bg-background"
                    value={formData.aldreteBreakdown.activity}
                    onChange={(e) => updateAldrete("activity", Number(e.target.value))}
                  >
                    <option value={2}>2 - Moves 4 extremities voluntarily</option>
                    <option value={1}>1 - Moves 2 extremities voluntarily</option>
                    <option value={0}>0 - Unable to move extremities</option>
                  </select>
                </div>

                <div>
                  <Label className="text-[10px]">2. Respiration</Label>
                  <select
                    className="w-full h-8 rounded border text-[11px] px-2 bg-background"
                    value={formData.aldreteBreakdown.respiration}
                    onChange={(e) => updateAldrete("respiration", Number(e.target.value))}
                  >
                    <option value={2}>2 - Able to breathe deeply and cough</option>
                    <option value={1}>1 - Dyspneic or shallow breathing</option>
                    <option value={0}>0 - Apneic or on mechanical ventilation</option>
                  </select>
                </div>

                <div>
                  <Label className="text-[10px]">3. Circulation (BP Stability)</Label>
                  <select
                    className="w-full h-8 rounded border text-[11px] px-2 bg-background"
                    value={formData.aldreteBreakdown.circulation}
                    onChange={(e) => updateAldrete("circulation", Number(e.target.value))}
                  >
                    <option value={2}>2 - BP within ±20% of pre-op level</option>
                    <option value={1}>1 - BP within ±20-49% of pre-op level</option>
                    <option value={0}>0 - BP within ±50% of pre-op level</option>
                  </select>
                </div>

                <div>
                  <Label className="text-[10px]">4. Consciousness</Label>
                  <select
                    className="w-full h-8 rounded border text-[11px] px-2 bg-background"
                    value={formData.aldreteBreakdown.consciousness}
                    onChange={(e) => updateAldrete("consciousness", Number(e.target.value))}
                  >
                    <option value={2}>2 - Fully awake and oriented</option>
                    <option value={1}>1 - Arousable on calling name</option>
                    <option value={0}>0 - Unresponsive</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-[10px]">5. Oxygen Saturation (SpO2)</Label>
                  <select
                    className="w-full h-8 rounded border text-[11px] px-2 bg-background"
                    value={formData.aldreteBreakdown.o2Saturation}
                    onChange={(e) => updateAldrete("o2Saturation", Number(e.target.value))}
                  >
                    <option value={2}>2 - Maintains SpO2 &gt; 92% on room air</option>
                    <option value={1}>1 - Needs supplemental O2 to maintain SpO2 &gt; 90%</option>
                    <option value={0}>0 - SpO2 &lt; 90% even with supplemental O2</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vitals */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <div>
                <Label className="text-[10px]">BP</Label>
                <Input
                  value={formData.vitals.bp}
                  onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, bp: e.target.value } })}
                  className="text-xs font-mono h-8"
                />
              </div>

              <div>
                <Label className="text-[10px]">HR (bpm)</Label>
                <Input
                  type="number"
                  value={formData.vitals.heartRate}
                  onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, heartRate: Number(e.target.value) } })}
                  className="text-xs font-mono h-8"
                />
              </div>

              <div>
                <Label className="text-[10px]">SpO2 (%)</Label>
                <Input
                  type="number"
                  value={formData.vitals.spo2}
                  onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, spo2: Number(e.target.value) } })}
                  className="text-xs font-mono h-8"
                />
              </div>

              <div>
                <Label className="text-[10px]">RR (/min)</Label>
                <Input
                  type="number"
                  value={formData.vitals.respiratoryRate}
                  onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, respiratoryRate: Number(e.target.value) } })}
                  className="text-xs font-mono h-8"
                />
              </div>

              <div>
                <Label className="text-[10px]">Pain (0-10)</Label>
                <Input
                  type="number"
                  value={formData.vitals.painScore}
                  onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, painScore: Number(e.target.value) } })}
                  className="text-xs font-mono h-8"
                />
              </div>

              <div>
                <Label className="text-[10px]">Drain (ml)</Label>
                <Input
                  type="number"
                  value={formData.drainOutputMl}
                  onChange={(e) => setFormData({ ...formData, drainOutputMl: Number(e.target.value) })}
                  className="text-xs font-mono h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Post-Op Analgesia Protocol</Label>
                <Input
                  value={formData.postOpAnalgesia}
                  onChange={(e) => setFormData({ ...formData, postOpAnalgesia: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Transfer Destination *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.transferDestination}
                  onChange={(e) => setFormData({ ...formData, transferDestination: e.target.value as any })}
                >
                  <option value="Inpatient Ward">Inpatient Ward</option>
                  <option value="ICU">Intensive Care Unit (ICU)</option>
                  <option value="HDU">High Dependency Unit (HDU)</option>
                  <option value="Daycare Discharge">Daycare Discharge</option>
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
                className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {submitting ? "Saving..." : "Authorize PACU Discharge Clearance"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
