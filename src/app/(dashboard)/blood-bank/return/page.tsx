"use client";

import { useEffect, useState } from "react";
import {
  RotateCcw,
  Plus,
  RefreshCw,
  Search,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ThermometerSnowflake,
  Flame,
  ShieldCheck
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

export default function BloodReturnPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    bagNumber: "",
    bloodGroup: "O+",
    component: "PRBC",
    patientName: "",
    returnedBy: "Sr. Ward Staff Nurse",
    returnReason: "Surgery Cancelled / Postponed",
    minutesOutsideColdChain: 15,
    temperatureAtReturn: 5.2,
    sealIntact: true,
    acceptanceDecision: "RESTOCKED_TO_INVENTORY",
    disposalMethod: "Autoclaving & Incineration",
    acceptedBy: "Blood Bank Officer",
    notes: "Cold chain verified intact under 30 mins. Port seal undisturbed."
  });

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/blood-bank/return");
      const data = await res.json();
      if (data.success) {
        setReturns(data.data || []);
      }
    } catch (err) {
      toast("Failed to load blood returns", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bagNumber.trim() || !formData.patientName.trim()) {
      toast("Bag number and patient name are required", "error");
      return;
    }

    // Automated acceptance decision logic
    const coldChainBreached =
      formData.minutesOutsideColdChain > 30 ||
      formData.temperatureAtReturn > 10.0 ||
      !formData.sealIntact ||
      formData.returnReason === "Suspected Transfusion Adverse Reaction" ||
      formData.returnReason === "Cold Chain Breach (>30m at room temp)";

    const payload = {
      ...formData,
      acceptanceDecision: coldChainBreached ? "DISCARDED_AS_BIOHAZARD" : formData.acceptanceDecision
    };

    try {
      setSubmitting(true);
      const res = await fetch("/api/blood-bank/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        toast(`Return record ${data.data.returnCode} processed: ${data.data.acceptanceDecision}!`, "success");
        setIsOpen(false);
        fetchReturns();
      } else {
        toast(data.message || "Failed to process return", "error");
      }
    } catch (err) {
      toast("Error submitting blood return", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = returns.filter(
    (r) =>
      r.returnCode?.toLowerCase().includes(search.toLowerCase()) ||
      r.bagNumber?.toLowerCase().includes(search.toLowerCase()) ||
      r.patientName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            Blood Bag Return &amp; Biohazard Wastage Registry
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Statutory cold-chain inspection for returned units, re-stocking clearance, and biohazard incineration logging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReturns}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsOpen(true)}
            className="text-xs flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Record Blood Bag Return
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by return code, bag number, or patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Returns Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-orange-600" />
            Returned Blood Units &amp; Wastage Audit ({filtered.length} Returns)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Return Code</TableHead>
                <TableHead>Bag Number &amp; Group</TableHead>
                <TableHead>Patient / Ward</TableHead>
                <TableHead>Reason for Return</TableHead>
                <TableHead>Cold Chain Parameters</TableHead>
                <TableHead>Returned Date</TableHead>
                <TableHead className="text-center">Disposition Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    No return records found. Click &quot;Record Blood Bag Return&quot; to inspect a returned blood unit.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell className="font-mono font-bold text-orange-700 dark:text-orange-400">
                      {r.returnCode}
                    </TableCell>

                    <TableCell>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {r.bagNumber}
                      </div>
                      <Badge className="bg-rose-600 text-white text-[10px] mt-0.5">
                        {r.bloodGroup} • {r.component}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white">{r.patientName}</div>
                      <div className="text-[10px] text-slate-400">By {r.returnedBy}</div>
                    </TableCell>

                    <TableCell>
                      <div className="text-slate-800 dark:text-slate-200 font-medium">{r.returnReason}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{r.notes}</div>
                    </TableCell>

                    <TableCell className="font-mono text-[11px]">
                      <div>Temp: <span className="font-bold">{r.temperatureAtReturn}°C</span></div>
                      <div className="text-[10px] text-slate-400">
                        {r.minutesOutsideColdChain} mins out • {r.sealIntact ? "Seal Intact" : "Seal Broken"}
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-[11px]">
                      {new Date(r.returnDate).toLocaleString()}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        className={`text-[9px] ${
                          r.acceptanceDecision === "RESTOCKED_TO_INVENTORY"
                            ? "bg-emerald-600 text-white"
                            : "bg-rose-600 text-white"
                        }`}
                      >
                        {r.acceptanceDecision === "RESTOCKED_TO_INVENTORY" ? "RESTOCKED SAFE" : "DISCARDED BIOHAZARD"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Return Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-orange-600" />
              Record Blood Bag Return &amp; Cold Chain Inspection
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Returned Bag Number *</Label>
                <Input
                  required
                  placeholder="BAG-YYYYMMDD-XXXX"
                  value={formData.bagNumber}
                  onChange={(e) => setFormData({ ...formData, bagNumber: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Patient Recipient Name *</Label>
                <Input
                  required
                  placeholder="Patient full name"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Blood Group *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as any })}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Component *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.component}
                  onChange={(e) => setFormData({ ...formData, component: e.target.value as any })}
                >
                  <option value="PRBC">Packed Red Cells (PRBC)</option>
                  <option value="WHOLE_BLOOD">Whole Blood (WB)</option>
                  <option value="FFP">Fresh Frozen Plasma (FFP)</option>
                  <option value="PLATELETS">Platelets (RDP/SDP)</option>
                  <option value="CRYOPRECIPITATE">Cryoprecipitate</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Reason for Blood Bag Return *</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={formData.returnReason}
                onChange={(e) => setFormData({ ...formData, returnReason: e.target.value as any })}
              >
                <option value="Surgery Cancelled / Postponed">Surgery Cancelled / Postponed</option>
                <option value="Patient Expired Before Transfusion">Patient Expired Before Transfusion</option>
                <option value="Clinical Condition Improved">Clinical Condition Improved (No Longer Required)</option>
                <option value="Suspected Transfusion Adverse Reaction">Suspected Transfusion Adverse Reaction (Mandatory Biohazard Discard)</option>
                <option value="Cold Chain Breach (>30m at room temp)">Cold Chain Breach (&gt;30m at room temp - Mandatory Biohazard Discard)</option>
              </select>
            </div>

            {/* Cold Chain Parameters */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border space-y-2">
              <span className="font-bold text-[11px] block uppercase text-slate-700 dark:text-slate-300">
                Statutory Cold Chain &amp; Physical Integrity Audit
              </span>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px]">Time Out of Bank (Mins) *</Label>
                  <Input
                    type="number"
                    value={formData.minutesOutsideColdChain}
                    onChange={(e) => setFormData({ ...formData, minutesOutsideColdChain: Number(e.target.value) })}
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px]">Temp on Return (°C) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.temperatureAtReturn}
                    onChange={(e) => setFormData({ ...formData, temperatureAtReturn: Number(e.target.value) })}
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px]">Port Seal Intact? *</Label>
                  <select
                    className="w-full h-9 rounded border text-xs px-2 bg-background"
                    value={formData.sealIntact ? "YES" : "NO"}
                    onChange={(e) => setFormData({ ...formData, sealIntact: e.target.value === "YES" })}
                  >
                    <option value="YES">YES (Untampered)</option>
                    <option value="NO">NO (Tampered / Spiked)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Returned By (Staff Nurse) *</Label>
                <Input
                  value={formData.returnedBy}
                  onChange={(e) => setFormData({ ...formData, returnedBy: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Inspected &amp; Accepted By *</Label>
                <Input
                  value={formData.acceptedBy}
                  onChange={(e) => setFormData({ ...formData, acceptedBy: e.target.value })}
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
                className="text-xs bg-orange-600 hover:bg-orange-700 text-white"
              >
                {submitting ? "Processing..." : "Process Return & Audit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
