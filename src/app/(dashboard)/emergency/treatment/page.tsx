"use client";

import { useEffect, useState } from "react";
import {
  Syringe,
  Search,
  Plus,
  RefreshCw,
  Activity,
  CheckCircle2,
  Clock,
  HeartPulse,
  Flame,
  ShieldAlert,
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

export default function EmergencyTreatmentPage() {
  const [treatments, setTreatments] = useState<any[]>([]);
  const [casualties, setCasualties] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    casualtyId: "",
    patientName: "",
    uhid: "",
    procedureCategory: "WOUND_TRAUMA",
    procedureName: "",
    performedBy: "Dr. Arvind (ER Medical Officer)",
    assistedBy: "Staff Nurse Sunita",
    equipmentUsed: "Minor surgical suture tray, 2% Lignocaine",
    medicationsGiven: "2% Lignocaine local anesthesia, TT 0.5ml IM",
    complications: "None documented",
    outcomeNotes: "Procedure successfully completed without immediate complications."
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [tRes, cRes] = await Promise.all([
        fetch("/api/emergency/treatment"),
        fetch("/api/emergency/casualty")
      ]);

      const tData = await tRes.json();
      if (tData.success) setTreatments(tData.data || []);

      const cData = await cRes.json();
      if (cData.success) setCasualties(cData.data || []);
    } catch (err) {
      toast("Failed to load emergency procedures", "error");
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
        patientName: found.patientName,
        uhid: found.uhid || ""
      });
    }
  };

  const fastPickProcedures = [
    { cat: "RESUSCITATION", name: "CPR & Defibrillation Protocol (200J Biphasic)", eq: "Zoll Defibrillator, Ambubag" },
    { cat: "AIRWAY", name: "Endotracheal Intubation (7.5mm Cuffed Tube)", eq: "Macintosh Laryngoscope, ET Tube, Stylet" },
    { cat: "WOUND_TRAUMA", name: "Laceration Wound Debridement & Primary Suturing", eq: "Suture tray, 3-0/4-0 Ethilon, Lignocaine" },
    { cat: "VASCULAR_ACCESS", name: "Emergency Right Internal Jugular Triple-Lumen CVC Line", eq: "CVC kit, Ultrasound probe, Seldinger needle" },
    { cat: "ORTHOPEDIC", name: "Closed Colles Fracture Reduction & Below-Elbow POP Slab", eq: "POP Bandage, Cotton roll, Stockinette" },
    { cat: "OTHER", name: "Intercostal Chest Tube Thoracostomy (28 Fr)", eq: "Chest drain kit, Underwater seal bottle" }
  ];

  const handleSelectPreset = (p: { cat: string; name: string; eq: string }) => {
    setFormData({
      ...formData,
      procedureCategory: p.cat as any,
      procedureName: p.name,
      equipmentUsed: p.eq
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.procedureName.trim() || !formData.patientName.trim()) {
      toast("Patient name and procedure name are required", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/emergency/treatment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        toast(`Emergency procedure ${data.data.treatmentCode} logged!`, "success");
        setIsOpen(false);
        loadData();
      } else {
        toast(data.message || "Failed to log procedure", "error");
      }
    } catch (err) {
      toast("Error logging procedure", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTreatments = treatments.filter((t) => {
    const matchesSearch =
      t.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      t.procedureName?.toLowerCase().includes(search.toLowerCase()) ||
      t.performedBy?.toLowerCase().includes(search.toLowerCase());

    const matchesCat = categoryFilter === "ALL" || t.procedureCategory === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Syringe className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            Trauma &amp; Emergency Procedures
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Resuscitation protocols, endotracheal intubation, trauma debridement, and invasive line logs.
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
              if (casualties.length > 0) handleSelectCasualty(casualties[0]._id);
              setIsOpen(true);
            }}
            className="text-xs flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Log Emergency Procedure
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
                placeholder="Search procedures by patient, doctor, or procedure title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories ({treatments.length})</option>
                <option value="RESUSCITATION">CPR &amp; Resuscitation</option>
                <option value="AIRWAY">Airway &amp; Intubation</option>
                <option value="WOUND_TRAUMA">Wound Suturing &amp; Trauma</option>
                <option value="VASCULAR_ACCESS">Central Lines &amp; IV Access</option>
                <option value="ORTHOPEDIC">Fracture POP &amp; Splints</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Procedures Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-600" />
            Administered Procedures Log ({filteredTreatments.length} Records)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Treatment Code</TableHead>
                <TableHead>Patient Details</TableHead>
                <TableHead>Procedure Name &amp; Category</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Equipment &amp; Meds</TableHead>
                <TableHead>Clinical Outcome</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTreatments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    No emergency treatment records logged.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTreatments.map((t) => (
                  <TableRow key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                      {t.treatmentCode}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {t.patientName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {t.uhid || "Casualty"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {t.procedureName}
                      </div>
                      <Badge variant="outline" className="text-[9px] mt-0.5">
                        {t.procedureCategory?.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-slate-700 dark:text-slate-300">
                        {t.performedBy}
                      </div>
                      {t.assistedBy && (
                        <div className="text-[10px] text-slate-400">
                          Asst: {t.assistedBy}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="max-w-[180px] text-[11px] text-slate-600 dark:text-slate-400 truncate">
                        {t.equipmentUsed || "Standard pack"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-xs text-slate-700 dark:text-slate-300 truncate font-medium">
                        {t.outcomeNotes}
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-500 font-mono text-[10px]">
                      {new Date(t.performedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Procedure Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Syringe className="h-5 w-5 text-teal-600" />
              Log Trauma &amp; Emergency Procedure
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            {/* Quick Presets */}
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-slate-500">
                FAST-PICK EMERGENCY PROCEDURES
              </Label>
              <div className="flex flex-wrap gap-1.5 p-1 bg-slate-50 dark:bg-slate-800 rounded border">
                {fastPickProcedures.map((p, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => handleSelectPreset(p)}
                  >
                    + {p.name.slice(0, 28)}...
                  </Button>
                ))}
              </div>
            </div>

            {/* Patient Selector */}
            <div className="space-y-1">
              <Label className="text-xs">Casualty Patient *</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={formData.casualtyId}
                onChange={(e) => handleSelectCasualty(e.target.value)}
              >
                <option value="">-- Choose Patient --</option>
                {casualties
                  .filter((c) => c.status !== "DISCHARGED" && c.status !== "ADMITTED")
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.patientName} ({c.caseNumber}) - Bay: {c.assignedBay}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Procedure Category *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.procedureCategory}
                  onChange={(e) => setFormData({ ...formData, procedureCategory: e.target.value as any })}
                >
                  <option value="WOUND_TRAUMA">Wound Suturing &amp; Trauma</option>
                  <option value="RESUSCITATION">CPR &amp; Resuscitation</option>
                  <option value="AIRWAY">Airway &amp; Intubation</option>
                  <option value="VASCULAR_ACCESS">Central Line / CVC / Arterial Line</option>
                  <option value="ORTHOPEDIC">Fracture POP Slab &amp; Splints</option>
                  <option value="OTHER">Chest Tube / Gastric Lavage / Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Procedure Title *</Label>
                <Input
                  required
                  placeholder="e.g. Endotracheal Intubation"
                  value={formData.procedureName}
                  onChange={(e) => setFormData({ ...formData, procedureName: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Performed By (Doctor / Surgeon) *</Label>
                <Input
                  required
                  value={formData.performedBy}
                  onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Assisting Staff Nurse</Label>
                <Input
                  value={formData.assistedBy}
                  onChange={(e) => setFormData({ ...formData, assistedBy: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Equipment / Implants Used</Label>
                <Input
                  value={formData.equipmentUsed}
                  onChange={(e) => setFormData({ ...formData, equipmentUsed: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Sedation &amp; Medications Administered</Label>
                <Input
                  value={formData.medicationsGiven}
                  onChange={(e) => setFormData({ ...formData, medicationsGiven: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Procedure Outcome &amp; Post-Care Notes *</Label>
              <Input
                required
                placeholder="Post-procedure vitals, patency, or dressing verification"
                value={formData.outcomeNotes}
                onChange={(e) => setFormData({ ...formData, outcomeNotes: e.target.value })}
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
                {submitting ? "Saving..." : "Save Emergency Procedure"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
