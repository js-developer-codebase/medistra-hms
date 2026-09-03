"use client";

import { useEffect, useState, useMemo } from "react";
import {
  HeartPulse,
  Flame,
  AlertTriangle,
  Clock,
  UserCheck,
  Search,
  Plus,
  Activity,
  BedDouble,
  CheckCircle2,
  RefreshCw,
  Edit2
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

export default function EmergencyTriagePage() {
  const [triages, setTriages] = useState<any[]>([]);
  const [casualties, setCasualties] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    casualtyId: "",
    patientName: "",
    uhid: "",
    esiLevel: "Level 2 - Emergent",
    priority: "Orange",
    chiefComplaint: "",
    assignedBay: "Acute Bay 1",
    triagedBy: "Sr. Triage Sister",
    notes: "",
    vitals: {
      bp: "120/80",
      heartRate: 88,
      respiratoryRate: 18,
      temperature: 98.6,
      spo2: 98,
      gcsScore: 15,
      painScale: 4,
      bloodGlucose: 110
    },
    primarySurvey: {
      airway: "Patent",
      breathing: "Normal",
      circulation: "Stable",
      disability: "Alert",
      exposure: "Normal"
    }
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [tRes, cRes] = await Promise.all([
        fetch("/api/emergency/triage"),
        fetch("/api/emergency/casualty")
      ]);

      const tData = await tRes.json();
      if (tData.success) setTriages(tData.data || []);

      const cData = await cRes.json();
      if (cData.success) setCasualties(cData.data || []);
    } catch (err) {
      toast("Failed to load triage records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTriages = useMemo(() => {
    return triages.filter((t) => {
      const pName = t.patientName || "";
      const complaint = t.chiefComplaint || "";
      const matchesSearch =
        pName.toLowerCase().includes(search.toLowerCase()) ||
        complaint.toLowerCase().includes(search.toLowerCase());

      const matchesPriority =
        priorityFilter === "ALL" || t.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [triages, search, priorityFilter]);

  const handleSelectCasualty = (cId: string) => {
    const found = casualties.find((c) => c._id === cId);
    if (found) {
      setFormData({
        ...formData,
        casualtyId: found._id,
        patientName: found.patientName,
        uhid: found.uhid || "",
        chiefComplaint: found.chiefComplaints,
        priority: found.triagePriority || "Yellow",
        assignedBay: found.assignedBay || "Acute Bay 1"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/emergency/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        toast(`Clinical triage recorded with priority ${formData.priority}!`, "success");
        setIsOpen(false);
        loadData();
      } else {
        toast(data.message || "Failed to record triage", "error");
      }
    } catch (err) {
      toast("Error submitting triage assessment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Red":
        return (
          <Badge className="bg-rose-600 text-white animate-pulse text-[10px] flex items-center gap-1">
            <Flame className="h-3 w-3" /> Level 1 (Red)
          </Badge>
        );
      case "Orange":
        return (
          <Badge className="bg-orange-500 text-white text-[10px] flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Level 2 (Orange)
          </Badge>
        );
      case "Yellow":
        return (
          <Badge className="bg-amber-400 text-slate-900 text-[10px]">
            Level 3 (Yellow)
          </Badge>
        );
      case "Green":
      default:
        return (
          <Badge className="bg-emerald-600 text-white text-[10px]">
            Level 4 (Green)
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            Clinical Triage (ESI &amp; Manchester Protocol)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Emergency Severity Index (ESI) 5-tier classification, ABCDE primary survey, and vital sign alert monitoring.
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
            onClick={() => setIsOpen(true)}
            className="text-xs flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Perform Triage Assessment
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
                placeholder="Search triage by patient name or clinical complaint..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="ALL">All Triage Categories ({triages.length})</option>
                <option value="Red">Red (Level 1: Resuscitation)</option>
                <option value="Orange">Orange (Level 2: Emergent)</option>
                <option value="Yellow">Yellow (Level 3: Urgent)</option>
                <option value="Green">Green (Level 4: Less Urgent)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Triage Register Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-rose-600" />
            Active Clinical Triage Registry ({filteredTriages.length} Assessments)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Patient Details</TableHead>
                <TableHead>Triage Priority &amp; ESI</TableHead>
                <TableHead>Chief Complaint</TableHead>
                <TableHead>Vital Signs</TableHead>
                <TableHead>ABCDE Primary Survey</TableHead>
                <TableHead>Assigned Bay</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTriages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    No clinical triage assessments found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTriages.map((t) => {
                  const v = t.vitals || {};
                  const isHypotensive = v.bp && parseInt(v.bp.split("/")[0]) < 90;
                  const isHypoxemic = v.spo2 && v.spo2 < 94;

                  return (
                    <TableRow key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {t.patientName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {t.uhid || "Casualty Case"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          {renderPriorityBadge(t.priority)}
                          <div className="text-[10px] text-slate-500 font-medium">
                            {t.esiLevel || "Level 3 - Urgent"}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="max-w-xs text-slate-700 dark:text-slate-300">
                          {t.chiefComplaint}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-mono text-[11px] space-y-0.5">
                          <div className={isHypotensive ? "text-rose-600 font-bold" : ""}>
                            BP: {v.bp || "120/80"}
                          </div>
                          <div>HR: {v.heartRate || 78} bpm • RR: {v.respiratoryRate || 18}</div>
                          <div className={isHypoxemic ? "text-rose-600 font-bold" : ""}>
                            SpO2: {v.spo2 || 98}% • GCS: {v.gcsScore || 15}/15
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-[10px] text-slate-600 dark:text-slate-400 space-y-0.5">
                          <div>Airway: <span className="font-semibold text-slate-800 dark:text-slate-200">{t.primarySurvey?.airway || "Patent"}</span></div>
                          <div>Circulation: <span className="font-semibold text-slate-800 dark:text-slate-200">{t.primarySurvey?.circulation || "Stable"}</span></div>
                        </div>
                      </TableCell>

                      <TableCell className="font-medium">
                        {t.assignedBay || "Acute Bay 1"}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {t.status || "Waiting"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Triage Assessment Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-rose-600" />
              Perform Clinical Triage Assessment
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            {/* Casualty Selector */}
            <div className="space-y-1">
              <Label className="text-xs">Select Casualty Patient *</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={formData.casualtyId}
                onChange={(e) => handleSelectCasualty(e.target.value)}
              >
                <option value="">-- Choose Active Casualty --</option>
                {casualties
                  .filter((c) => c.status !== "DISCHARGED" && c.status !== "ADMITTED")
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.patientName} ({c.caseNumber}) - {c.chiefComplaints?.slice(0, 30)}...
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Patient Name *</Label>
                <Input
                  required
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Bay Location *</Label>
                <Input
                  value={formData.assignedBay}
                  onChange={(e) => setFormData({ ...formData, assignedBay: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Severity Tiers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">ESI Classification *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.esiLevel}
                  onChange={(e) => {
                    const esi = e.target.value;
                    let priority = "Yellow";
                    if (esi.includes("Level 1")) priority = "Red";
                    else if (esi.includes("Level 2")) priority = "Orange";
                    else if (esi.includes("Level 3")) priority = "Yellow";
                    else priority = "Green";
                    setFormData({ ...formData, esiLevel: esi as any, priority });
                  }}
                >
                  <option value="Level 1 - Resuscitation">Level 1 - Resuscitation (Immediate life threat)</option>
                  <option value="Level 2 - Emergent">Level 2 - Emergent (High risk / altered mental state)</option>
                  <option value="Level 3 - Urgent">Level 3 - Urgent (Moderate distress)</option>
                  <option value="Level 4 - Less Urgent">Level 4 - Less Urgent (Low acuity)</option>
                  <option value="Level 5 - Non-urgent">Level 5 - Non-urgent (Minor symptoms)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Triage Color Code *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Red">Red (Level 1)</option>
                  <option value="Orange">Orange (Level 2)</option>
                  <option value="Yellow">Yellow (Level 3)</option>
                  <option value="Green">Green (Level 4)</option>
                </select>
              </div>
            </div>

            {/* Vital Signs Grid */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg space-y-2">
              <div className="font-bold text-[11px] text-slate-700 dark:text-slate-300">
                Objective Vital Signs Capture
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px]">BP (mmHg)</Label>
                  <Input
                    value={formData.vitals.bp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vitals: { ...formData.vitals, bp: e.target.value }
                      })
                    }
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">Heart Rate (bpm)</Label>
                  <Input
                    type="number"
                    value={formData.vitals.heartRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vitals: { ...formData.vitals, heartRate: Number(e.target.value) }
                      })
                    }
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">Resp Rate (/min)</Label>
                  <Input
                    type="number"
                    value={formData.vitals.respiratoryRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vitals: { ...formData.vitals, respiratoryRate: Number(e.target.value) }
                      })
                    }
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">SpO2 (%)</Label>
                  <Input
                    type="number"
                    value={formData.vitals.spo2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vitals: { ...formData.vitals, spo2: Number(e.target.value) }
                      })
                    }
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">Temp (°F)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.vitals.temperature}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vitals: { ...formData.vitals, temperature: Number(e.target.value) }
                      })
                    }
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">GCS Score (3–15)</Label>
                  <Input
                    type="number"
                    min="3"
                    max="15"
                    value={formData.vitals.gcsScore}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vitals: { ...formData.vitals, gcsScore: Number(e.target.value) }
                      })
                    }
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">Pain Scale (0–10)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.vitals.painScale}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vitals: { ...formData.vitals, painScale: Number(e.target.value) }
                      })
                    }
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">GRBS (mg/dL)</Label>
                  <Input
                    type="number"
                    value={formData.vitals.bloodGlucose}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vitals: { ...formData.vitals, bloodGlucose: Number(e.target.value) }
                      })
                    }
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            {/* ABCDE Survey */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Airway Assessment</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.primarySurvey.airway}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primarySurvey: { ...formData.primarySurvey, airway: e.target.value as any }
                    })
                  }
                >
                  <option value="Patent">Patent (Clear)</option>
                  <option value="Compromised">Compromised / Obstructed</option>
                  <option value="Intubated">Intubated &amp; Bagged</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Circulation / Perfusion</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.primarySurvey.circulation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primarySurvey: { ...formData.primarySurvey, circulation: e.target.value as any }
                    })
                  }
                >
                  <option value="Stable">Stable Pulses</option>
                  <option value="Tachycardic">Tachycardic</option>
                  <option value="Shock / Hypotensive">Shock / Hypotensive</option>
                  <option value="Arrest">Cardiac Arrest</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Chief Complaint *</Label>
              <Input
                required
                value={formData.chiefComplaint}
                onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
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
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
              >
                {submitting ? "Saving..." : "Record Clinical Triage"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
