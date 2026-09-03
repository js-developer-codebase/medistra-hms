"use client";

import { useEffect, useState } from "react";
import {
  LogOut,
  Search,
  Plus,
  RefreshCw,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
  ShieldAlert
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

export default function EmergencyDischargePage() {
  const [casualties, setCasualties] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDischarge, setSelectedDischarge] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    casualtyId: "",
    patientName: "",
    disposition: "DISCHARGE_HOME",
    dischargeCondition: "Hemodynamically Stable",
    dischargeInstructions: "Take prescribed oral medications after food. Rest for 3 days. Return to ER if severe pain or high fever recurs.",
    followUpDate: "Within 5 days in General Medicine / Surgery OPD",
    attendantName: "Self / Family"
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
      toast("Failed to load emergency discharge data", "error");
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
      toast("Please select a patient to discharge", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/emergency/discharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          casualtyId: formData.casualtyId,
          disposition: formData.disposition,
          notes: `${formData.dischargeCondition}. Advice: ${formData.dischargeInstructions}. Follow-up: ${formData.followUpDate}`
        })
      });
      const data = await res.json();

      if (data.success) {
        toast("Patient discharge processed successfully!", "success");
        setIsOpen(false);
        loadData();
      } else {
        toast(data.message || "Failed to process discharge", "error");
      }
    } catch (err) {
      toast("Error processing discharge", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const dischargedCases = casualties.filter(
    (c) => c.status === "DISCHARGED" || c.status === "TRANSFERRED" || c.status === "EXPIRED"
  );

  const activeCasualties = casualties.filter(
    (c) => c.status !== "DISCHARGED" && c.status !== "ADMITTED" && c.status !== "TRANSFERRED" && c.status !== "EXPIRED"
  );

  const filteredDischarges = dischargedCases.filter(
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
            <LogOut className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            Emergency Discharge &amp; Disposition
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Discharge summaries, LAMA/DAMA waivers, tertiary transfer referrals, and mortality records.
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
              if (activeCasualties.length > 0) handleSelectCasualty(activeCasualties[0]._id);
              setIsOpen(true);
            }}
            className="text-xs flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            <Plus className="h-4 w-4" />
            Process Discharge
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search discharge records by patient, case # or advice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Discharged Patients Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-emerald-600" />
            Completed ER Dispositions ({filteredDischarges.length} Records)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Case #</TableHead>
                <TableHead>Patient Details</TableHead>
                <TableHead>Initial Complaint</TableHead>
                <TableHead>Disposition Outcome</TableHead>
                <TableHead>Instructions &amp; Advice</TableHead>
                <TableHead>Discharge Date</TableHead>
                <TableHead className="text-center">Slip</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDischarges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    No emergency discharge records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDischarges.map((c) => (
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
                      <Badge
                        variant={c.status === "EXPIRED" ? "destructive" : "outline"}
                        className="text-[10px]"
                      >
                        {c.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-xs text-slate-700 dark:text-slate-300 truncate font-medium">
                        {c.dispositionNotes || "Discharged in stable condition"}
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-500 font-mono text-[10px]">
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2 text-slate-700 dark:text-slate-300"
                        onClick={() => setSelectedDischarge(c)}
                      >
                        <Printer className="h-3.5 w-3.5 mr-1" /> View Slip
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Discharge Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-slate-700" />
              Process ER Patient Discharge &amp; Disposition
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
                <option value="">-- Choose Active Patient --</option>
                {activeCasualties.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.patientName} ({c.caseNumber}) - Bay: {c.assignedBay}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Disposition Outcome *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.disposition}
                  onChange={(e) => setFormData({ ...formData, disposition: e.target.value })}
                >
                  <option value="DISCHARGE_HOME">Discharge Home (Relieved / Stable)</option>
                  <option value="LAMA">Left Against Medical Advice (LAMA)</option>
                  <option value="TRANSFER_TERTIARY">Transfer to Higher Tertiary Center</option>
                  <option value="DECEASED">Expired / Brought In Dead (BID)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Condition at Discharge *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.dischargeCondition}
                  onChange={(e) => setFormData({ ...formData, dischargeCondition: e.target.value })}
                >
                  <option value="Hemodynamically Stable">Hemodynamically Stable</option>
                  <option value="Symptomatically Relieved">Symptomatically Relieved</option>
                  <option value="High Risk / Unstable (Against Medical Advice)">High Risk / Unstable (LAMA)</option>
                  <option value="Deceased / Mortuary Handover">Deceased / Mortuary Handover</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Discharge Advice &amp; Return Precautions *</Label>
              <Input
                required
                value={formData.dischargeInstructions}
                onChange={(e) => setFormData({ ...formData, dischargeInstructions: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">OPD Follow-up Schedule</Label>
                <Input
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Attendant / Receiver Name</Label>
                <Input
                  value={formData.attendantName}
                  onChange={(e) => setFormData({ ...formData, attendantName: e.target.value })}
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
                className="text-xs bg-slate-800 hover:bg-slate-900 text-white"
              >
                {submitting ? "Finalizing..." : "Authorize Discharge"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Printable Discharge Slip Modal */}
      <Dialog open={!!selectedDischarge} onOpenChange={(open) => !open && setSelectedDischarge(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <FileText className="h-5 w-5 text-emerald-600" />
              Emergency Department Discharge Summary
            </DialogTitle>
          </DialogHeader>

          {selectedDischarge && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="text-center pb-2 border-b space-y-0.5">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  MEDISTRA SUPER SPECIALITY HOSPITAL
                </h3>
                <p className="text-[11px] text-slate-500">
                  Department of Emergency Medicine &amp; Level-1 Trauma Care
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  24x7 Emergency Helpline: 1066 / 011-23456789
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px]">CASE NUMBER</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedDischarge.caseNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[9px]">DISCHARGE DATE</span>
                  <span>{new Date(selectedDischarge.updatedAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">PATIENT NAME</span>
                  <span className="font-bold">{selectedDischarge.patientName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[9px]">DISPOSITION</span>
                  <Badge variant="outline" className="text-[10px]">
                    {selectedDischarge.status}
                  </Badge>
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border space-y-1">
                <span className="font-bold text-[10px] block text-slate-500 uppercase">
                  PRESENTING COMPLAINTS &amp; DIAGNOSIS
                </span>
                <p className="text-slate-800 dark:text-slate-200">
                  {selectedDischarge.chiefComplaints}
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border space-y-1">
                <span className="font-bold text-[10px] block text-slate-500 uppercase">
                  DISCHARGE ADVICE &amp; RETURN PRECAUTIONS
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {selectedDischarge.dispositionNotes || "Routine home rest. Return to ER immediately if warning signs appear."}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDischarge(null)}
                  className="text-xs"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="text-xs bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Summary
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
