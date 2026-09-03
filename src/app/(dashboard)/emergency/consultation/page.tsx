"use client";

import { useEffect, useState } from "react";
import {
  Stethoscope,
  Search,
  User,
  Activity,
  FileText,
  Plus,
  RefreshCw,
  Building2,
  LogOut,
  AlertCircle,
  CheckCircle2,
  HeartPulse
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export default function EmergencyConsultationPage() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [casualties, setCasualties] = useState<any[]>([]);
  const [selectedCasualty, setSelectedCasualty] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    casualtyId: "",
    patientName: "",
    uhid: "",
    consultingDoctor: "Dr. Arvind (ER Consultant)",
    doctorSpecialty: "Emergency Medicine",
    chiefComplaint: "",
    historyOfPresentIllness: "",
    systemicExamination: {
      cvs: "S1 S2 heard, no murmur",
      rs: "Bilateral air entry equal, vesicular sounds",
      cns: "Conscious, oriented to time/place/person, GCS 15/15",
      pa: "Soft, non-tender, no guarding, bowel sounds present"
    },
    provisionalDiagnosis: "",
    emergencyCarePlan: "",
    disposition: "OBSERVATION",
    dispositionNotes: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [consRes, casRes] = await Promise.all([
        fetch("/api/emergency/consultation"),
        fetch("/api/emergency/casualty")
      ]);

      const conData = await consRes.json();
      if (conData.success) setConsultations(conData.data || []);

      const cData = await casRes.json();
      if (cData.success) setCasualties(cData.data || []);
    } catch (err) {
      toast("Failed to load consultations", "error");
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
      setSelectedCasualty(found);
      setFormData({
        ...formData,
        casualtyId: found._id,
        patientName: found.patientName,
        uhid: found.uhid || "",
        chiefComplaint: found.chiefComplaints || "",
        historyOfPresentIllness: `Patient presented with ${found.chiefComplaints}. Arrived via ${found.modeOfArrival}. Initial triage priority ${found.triagePriority}.`,
        provisionalDiagnosis: found.initialAssessment || "",
        emergencyCarePlan: "Continuous multi-para monitoring, IV access, STAT blood draw, pain control."
      });
    }
  };

  const handleOpenConsultation = () => {
    if (casualties.length > 0) {
      const active = casualties.find(
        (c) => c.status !== "DISCHARGED" && c.status !== "ADMITTED"
      );
      if (active) handleSelectCasualty(active._id);
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.provisionalDiagnosis.trim() || !formData.emergencyCarePlan.trim()) {
      toast("Provisional diagnosis and care plan are mandatory", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/emergency/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        toast("ER Doctor consultation notes recorded successfully!", "success");
        setIsOpen(false);
        loadData();
      } else {
        toast(data.message || "Failed to record consultation", "error");
      }
    } catch (err) {
      toast("Error recording consultation", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredConsultations = consultations.filter(
    (c) =>
      c.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      c.provisionalDiagnosis?.toLowerCase().includes(search.toLowerCase()) ||
      c.consultingDoctor?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Emergency Physician Consultation
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Emergency physician clinical examination, systemic evaluations, provisional diagnoses, and clinical disposition.
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
            onClick={handleOpenConsultation}
            className="text-xs flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4" />
            New Physician Consultation
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by patient name, diagnosis, or doctor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Consultation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConsultations.map((con) => (
          <Card key={con._id} className="border shadow-sm bg-white dark:bg-slate-900 hover:border-purple-500/50 transition-all">
            <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {con.patientName}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {con.consultationCode} • Dr. {con.consultingDoctor}
                </div>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {con.disposition?.replace(/_/g, " ")}
              </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="p-2 rounded bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
                <span className="font-bold text-[10px] block text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                  PROVISIONAL DIAGNOSIS
                </span>
                <span className="font-semibold text-purple-900 dark:text-purple-200">
                  {con.provisionalDiagnosis}
                </span>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[10px] text-slate-400 uppercase">
                  CARE PLAN &amp; ORDERS
                </span>
                <p className="text-slate-700 dark:text-slate-300 line-clamp-3">
                  {con.emergencyCarePlan}
                </p>
              </div>

              <div className="pt-2 border-t flex items-center justify-between text-[10px] text-slate-400">
                <span>{new Date(con.createdAt).toLocaleDateString()}</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {con.doctorSpecialty || "ER Specialist"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Consultation Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-purple-600" />
              Physician Emergency Consultation &amp; Plan
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            {/* Patient Selector */}
            <div className="space-y-1">
              <Label className="text-xs">Select Casualty Patient *</Label>
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
                <Label className="text-xs">Consulting ER Physician *</Label>
                <Input
                  required
                  value={formData.consultingDoctor}
                  onChange={(e) => setFormData({ ...formData, consultingDoctor: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Specialty / Department</Label>
                <Input
                  value={formData.doctorSpecialty}
                  onChange={(e) => setFormData({ ...formData, doctorSpecialty: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">History of Present Illness (HPI) *</Label>
              <Input
                required
                value={formData.historyOfPresentIllness}
                onChange={(e) => setFormData({ ...formData, historyOfPresentIllness: e.target.value })}
                className="text-xs"
              />
            </div>

            {/* Systemic Examination Grid */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg space-y-2">
              <div className="font-bold text-[11px] text-slate-700 dark:text-slate-300">
                Systemic Physical Examination
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px]">CVS (Cardiovascular)</Label>
                  <Input
                    value={formData.systemicExamination.cvs}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        systemicExamination: { ...formData.systemicExamination, cvs: e.target.value }
                      })
                    }
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">RS (Respiratory)</Label>
                  <Input
                    value={formData.systemicExamination.rs}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        systemicExamination: { ...formData.systemicExamination, rs: e.target.value }
                      })
                    }
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">CNS (Neurological / GCS)</Label>
                  <Input
                    value={formData.systemicExamination.cns}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        systemicExamination: { ...formData.systemicExamination, cns: e.target.value }
                      })
                    }
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">P/A (Abdomen / Pelvis)</Label>
                  <Input
                    value={formData.systemicExamination.pa}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        systemicExamination: { ...formData.systemicExamination, pa: e.target.value }
                      })
                    }
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-900 dark:text-white">
                Provisional Diagnosis *
              </Label>
              <Input
                required
                placeholder="e.g. Acute STEMI, Right Tibia Fracture, Subdural Hematoma"
                value={formData.provisionalDiagnosis}
                onChange={(e) => setFormData({ ...formData, provisionalDiagnosis: e.target.value })}
                className="text-xs font-semibold"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Emergency Care Plan &amp; Immediate Directives *</Label>
              <Input
                required
                placeholder="Immediate treatment protocol and stat directives"
                value={formData.emergencyCarePlan}
                onChange={(e) => setFormData({ ...formData, emergencyCarePlan: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Disposition Decision *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.disposition}
                  onChange={(e) => setFormData({ ...formData, disposition: e.target.value as any })}
                >
                  <option value="OBSERVATION">Observation in ER Bay</option>
                  <option value="ADMIT_ICU">Immediate ICU Admission</option>
                  <option value="ADMIT_WARD">Inpatient Ward Admission</option>
                  <option value="EMERGENCY_OT">Emergency OT / Surgery</option>
                  <option value="DISCHARGE_HOME">Discharge Home (Stable)</option>
                  <option value="LAMA">LAMA / DAMA</option>
                  <option value="TRANSFER_TERTIARY">Transfer Tertiary Center</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Disposition Notes / Instructions</Label>
                <Input
                  placeholder="Bed reservation or transfer instructions"
                  value={formData.dispositionNotes}
                  onChange={(e) => setFormData({ ...formData, dispositionNotes: e.target.value })}
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
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white"
              >
                {submitting ? "Saving..." : "Save Physician Consultation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
