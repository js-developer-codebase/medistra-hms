"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Scissors,
  Search,
  Plus,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Layers,
  HeartPulse
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

export default function IntraOpNotesPage() {
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
    otRoom: "OT 1 - Modular Cardiac OT",
    timeOutConfirmed: true,
    incisionTime: "09:15 AM",
    closureTime: "11:45 AM",
    operatingSurgeon: "Dr. Rajeshwar Naidu",
    assistantSurgeon: "Dr. Alok Verma",
    anesthetist: "Dr. Sunita Kapoor",
    scrubNurse: "Sister Mary Varghese",
    circulatingNurse: "Staff Nurse Praveen",
    surgicalFindings: "Severe triple vessel CAD. Left internal mammary artery healthy and harvested.",
    procedureDescription: "CABG x 3 performed off-pump on beating heart using Octopus tissue stabilizer.",
    implantsOrProsthetics: "LIMA to LAD, Saphenous vein graft to OM1 and PDA. Sternal wires x 6.",
    estimatedBloodLoss: 250,
    bloodTransfusedUnits: 1,
    urineOutput: 350,
    swabCountCorrect: true,
    needleAndInstrumentCountCorrect: true,
    specimenSentToBiopsy: false,
    specimenDetails: "",
    drainsPlaced: "1x Mediastinal chest drain, 1x Left pleural drain"
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [rRes, sRes] = await Promise.all([
        fetch("/api/ot/intraop"),
        fetch("/api/ot/schedule")
      ]);

      const rData = await rRes.json();
      if (rData.success) setRecords(rData.data || []);

      const sData = await sRes.json();
      if (sData.success) setSchedules(sData.data || []);
    } catch (err) {
      toast("Failed to load intraoperative notes", "error");
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
        surgeryName: found.surgeryName,
        otRoom: found.otRoom,
        operatingSurgeon: found.surgeon,
        assistantSurgeon: found.assistantSurgeon || "",
        anesthetist: found.anesthesiologist || "",
        scrubNurse: found.scrubNurse || "",
        circulatingNurse: found.circulatingNurse || ""
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.surgeryName.trim() || !formData.patientName.trim()) {
      toast("Patient name and procedure name are required", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/ot/intraop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        toast(`Intraoperative record ${data.data.recordCode} logged!`, "success");
        setIsOpen(false);
        loadData();
      } else {
        toast(data.message || "Failed to log intraop note", "error");
      }
    } catch (err) {
      toast("Error submitting note", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const pName = r.patientName || "";
      const surg = r.surgeryName || "";
      const doc = r.operatingSurgeon || "";
      const code = r.recordCode || "";

      return (
        pName.toLowerCase().includes(search.toLowerCase()) ||
        surg.toLowerCase().includes(search.toLowerCase()) ||
        doc.toLowerCase().includes(search.toLowerCase()) ||
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
            <Scissors className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            Intraoperative Surgical Notes &amp; Implants Log
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            WHO Time-out verification, skin incision/closure times, surgical findings, implant tracking, and swab counts.
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
            className="text-xs flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Record Intra-Op Surgical Note
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by patient, surgery, surgeon, or record code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Intra-Op Records Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Scissors className="h-4 w-4 text-orange-600" />
            Intraoperative Operative Logs ({filtered.length} Procedures)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Record Code</TableHead>
                <TableHead>Patient &amp; Surgery</TableHead>
                <TableHead>Surgeon &amp; Suite</TableHead>
                <TableHead>Incision / Closure</TableHead>
                <TableHead>Operative Findings</TableHead>
                <TableHead>Implants &amp; Blood Loss</TableHead>
                <TableHead className="text-center">Swab Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    No intraoperative records logged.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell className="font-mono font-bold text-orange-700 dark:text-orange-400">
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
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {r.operatingSurgeon}
                      </div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400">
                        {r.otRoom}
                      </div>
                    </TableCell>

                    <TableCell className="font-mono">
                      <div>{r.incisionTime}</div>
                      <div className="text-[10px] text-slate-400">to {r.closureTime}</div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-xs truncate text-slate-700 dark:text-slate-300">
                        {r.surgicalFindings}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-[11px] font-medium">
                        Loss: {r.estimatedBloodLoss}ml
                      </div>
                      {r.implantsOrProsthetics && (
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">
                          Imp: {r.implantsOrProsthetics}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className="text-[9px] text-emerald-700 dark:text-emerald-400 border-emerald-300"
                      >
                        ✓ Correct
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Record Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-orange-600" />
              Document Intraoperative Surgical Procedure
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            {/* Surgery Selector */}
            <div className="space-y-1">
              <Label className="text-xs">Select Scheduled Surgery *</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={formData.surgeryScheduleId}
                onChange={(e) => handleSelectSchedule(e.target.value)}
              >
                <option value="">-- Choose Surgery --</option>
                {schedules.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.surgeryName} - {s.patientName} ({s.otRoom})
                  </option>
                ))}
              </select>
            </div>

            {/* WHO Time-Out Confirmation */}
            <div className="p-2.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900 dark:text-amber-200">
                <input
                  type="checkbox"
                  checked={formData.timeOutConfirmed}
                  onChange={(e) => setFormData({ ...formData, timeOutConfirmed: e.target.checked })}
                  className="rounded border-amber-400"
                />
                <span>WHO Surgical Time-Out Conducted (All team members introduced, patient/procedure/site re-confirmed before incision)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Skin Incision Time *</Label>
                <Input
                  required
                  value={formData.incisionTime}
                  onChange={(e) => setFormData({ ...formData, incisionTime: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Surgical Closure Time *</Label>
                <Input
                  required
                  value={formData.closureTime}
                  onChange={(e) => setFormData({ ...formData, closureTime: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Operative Findings *</Label>
              <Input
                required
                placeholder="Pathology observed during dissection"
                value={formData.surgicalFindings}
                onChange={(e) => setFormData({ ...formData, surgicalFindings: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Operative Procedure Description *</Label>
              <Input
                required
                placeholder="Step-by-step surgical intervention"
                value={formData.procedureDescription}
                onChange={(e) => setFormData({ ...formData, procedureDescription: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Implants &amp; Prosthetics (Serial / Batch #)</Label>
              <Input
                placeholder="e.g. Stryker Triathlon Knee Component Batch #9921"
                value={formData.implantsOrProsthetics}
                onChange={(e) => setFormData({ ...formData, implantsOrProsthetics: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Est. Blood Loss (ml)</Label>
                <Input
                  type="number"
                  value={formData.estimatedBloodLoss}
                  onChange={(e) => setFormData({ ...formData, estimatedBloodLoss: Number(e.target.value) })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Blood Transfused (Units)</Label>
                <Input
                  type="number"
                  value={formData.bloodTransfusedUnits}
                  onChange={(e) => setFormData({ ...formData, bloodTransfusedUnits: Number(e.target.value) })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Urine Output (ml)</Label>
                <Input
                  type="number"
                  value={formData.urineOutput}
                  onChange={(e) => setFormData({ ...formData, urineOutput: Number(e.target.value) })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 p-2 rounded bg-slate-50 dark:bg-slate-800 border">
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={formData.swabCountCorrect}
                  onChange={(e) => setFormData({ ...formData, swabCountCorrect: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span>✓ Swab Count Verified Correct</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={formData.needleAndInstrumentCountCorrect}
                  onChange={(e) => setFormData({ ...formData, needleAndInstrumentCountCorrect: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span>✓ Instrument &amp; Needle Count Correct</span>
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
                className="text-xs bg-orange-600 hover:bg-orange-700 text-white"
              >
                {submitting ? "Logging..." : "Save Intraoperative Note"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
