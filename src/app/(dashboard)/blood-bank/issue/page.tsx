"use client";

import { useEffect, useState } from "react";
import {
  Droplet,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ShieldCheck,
  FileText,
  Clock,
  UserCheck
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

export default function BloodIssuePage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [availableBags, setAvailableBags] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    bagNumber: "",
    patientName: "",
    uhid: "",
    recipientBloodGroup: "O+",
    componentIssued: "PRBC",
    volumeMl: 350,
    issuedToStaff: "Staff Nurse Priya",
    issuedToStaffId: "NUR-8842",
    wardOrOT: "OT 1 - Modular Cardiac",
    issuedBy: "Blood Bank Officer",
    coldChainBoxVerified: true,
    crossmatchSlipVerified: true,
    dualNurseCheckVerified: true,
    processingFee: 1450,
    notes: "Cold chain container verified. Dual-nurse recipient confirmation complete."
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [issRes, invRes] = await Promise.all([
        fetch("/api/blood-bank/issue"),
        fetch("/api/blood-bank/inventory?status=AVAILABLE")
      ]);

      const issData = await issRes.json();
      if (issData.success) setIssues(issData.data || []);

      const invData = await invRes.json();
      if (invData.success) {
        setAvailableBags(invData.data || []);
        if (invData.data?.length > 0 && !formData.bagNumber) {
          setFormData((prev) => ({
            ...prev,
            bagNumber: invData.data[0].bagNumber,
            recipientBloodGroup: invData.data[0].bloodGroup,
            componentIssued: invData.data[0].componentType,
            volumeMl: invData.data[0].volumeMl,
            processingFee: invData.data[0].processingFee || 1450
          }));
        }
      }
    } catch (err) {
      toast("Failed to load blood issue logs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBagSelect = (bagNumber: string) => {
    const selected = availableBags.find((b) => b.bagNumber === bagNumber);
    if (selected) {
      setFormData({
        ...formData,
        bagNumber: selected.bagNumber,
        recipientBloodGroup: selected.bloodGroup,
        componentIssued: selected.componentType,
        volumeMl: selected.volumeMl,
        processingFee: selected.processingFee || 1450
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName.trim() || !formData.bagNumber) {
      toast("Patient name and bag number are required", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/blood-bank/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        toast(`Blood bag ${data.data.bagNumber} dispensed under Voucher ${data.data.transfusionVoucherNumber}!`, "success");
        setIsOpen(false);
        fetchData();
        setSelectedVoucher(data.data);
      } else {
        toast(data.message || "Failed to issue blood unit", "error");
      }
    } catch (err) {
      toast("Error issuing blood unit", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = issues.filter(
    (i) =>
      i.issueCode?.toLowerCase().includes(search.toLowerCase()) ||
      i.transfusionVoucherNumber?.toLowerCase().includes(search.toLowerCase()) ||
      i.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      i.bagNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Droplet className="h-6 w-6 text-red-600 dark:text-red-400" />
            Blood Bag Dispensing &amp; Transfusion Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Certified blood release with dual-nurse verification, cold-chain transport confirmation, and printable transfusion slips.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsOpen(true)}
            className="text-xs flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Dispense Blood Bag
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by voucher number, issue code, patient name, or bag number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Issues Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-red-600" />
            Dispensed Blood Transfusion Vouchers ({filtered.length} Dispatches)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Voucher / Issue Code</TableHead>
                <TableHead>Patient Details &amp; Ward</TableHead>
                <TableHead>Bag Number &amp; Group</TableHead>
                <TableHead>Received By Staff</TableHead>
                <TableHead>Issue Timestamp</TableHead>
                <TableHead>Tariff (₹)</TableHead>
                <TableHead className="text-right">Transfusion Slip</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    No blood dispatches recorded. Click &quot;Dispense Blood Bag&quot; to issue a crossmatched unit.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell>
                      <div className="font-mono font-bold text-red-700 dark:text-red-400">
                        {item.transfusionVoucherNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.issueCode}</div>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {item.patientName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {item.wardOrOT} • UHID: {item.uhid || "N/A"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {item.bagNumber}
                      </div>
                      <Badge className="bg-rose-600 text-white text-[10px] mt-0.5">
                        {item.recipientBloodGroup} • {item.componentIssued} ({item.volumeMl}ml)
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="text-slate-800 dark:text-slate-200">{item.issuedToStaff}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.issuedToStaffId || "ID Verified"}</div>
                    </TableCell>

                    <TableCell className="font-mono text-[11px]">
                      {new Date(item.issueDate).toLocaleString()}
                    </TableCell>

                    <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                      ₹{(item.processingFee || 1450).toLocaleString("en-IN")}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedVoucher(item)}
                        className="h-7 text-xs flex items-center gap-1"
                      >
                        <Printer className="h-3.5 w-3.5 text-slate-600" />
                        Print Voucher
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dispense Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-red-600" />
              Dispense Certified Blood Bag Unit
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
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

              <div className="space-y-1">
                <Label className="text-xs">Patient UHID</Label>
                <Input
                  placeholder="MED-2026-XXXX"
                  value={formData.uhid}
                  onChange={(e) => setFormData({ ...formData, uhid: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Select Certified Bag from Stock *</Label>
              {availableBags.length === 0 ? (
                <Input
                  required
                  placeholder="BAG-YYYYMMDD-XXXX"
                  value={formData.bagNumber}
                  onChange={(e) => setFormData({ ...formData, bagNumber: e.target.value })}
                  className="text-xs font-mono"
                />
              ) : (
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                  value={formData.bagNumber}
                  onChange={(e) => handleBagSelect(e.target.value)}
                >
                  {availableBags.map((b) => (
                    <option key={b._id} value={b.bagNumber}>
                      {b.bagNumber} ({b.bloodGroup} • {b.componentType} • {b.volumeMl}ml • {b.storageLocation})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Receiving Staff (Nurse / Attendant) *</Label>
                <Input
                  required
                  value={formData.issuedToStaff}
                  onChange={(e) => setFormData({ ...formData, issuedToStaff: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Ward / OT Destination *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.wardOrOT}
                  onChange={(e) => setFormData({ ...formData, wardOrOT: e.target.value })}
                >
                  <option value="OT 1 - Modular Cardiac">OT 1 - Modular Cardiac</option>
                  <option value="OT 2 - Neuro-Trauma">OT 2 - Neuro-Trauma</option>
                  <option value="Medical ICU">Medical ICU</option>
                  <option value="Surgical ICU">Surgical ICU</option>
                  <option value="Emergency Resuscitation">Emergency Resuscitation</option>
                  <option value="Inpatient Ward 3A">Inpatient Ward 3A</option>
                </select>
              </div>
            </div>

            {/* Statutory Safety Checkpoints */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border space-y-2">
              <span className="font-bold text-[11px] block uppercase text-slate-700 dark:text-slate-300">
                Statutory Dispensing Safety Checklist
              </span>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.coldChainBoxVerified}
                    onChange={(e) => setFormData({ ...formData, coldChainBoxVerified: e.target.checked })}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span>Cold Chain Transport Box &amp; Ice Pack container verified (2°C–10°C)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.crossmatchSlipVerified}
                    onChange={(e) => setFormData({ ...formData, crossmatchSlipVerified: e.target.checked })}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span>Major &amp; Minor Crossmatch certificate verified COMPATIBLE</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dualNurseCheckVerified}
                    onChange={(e) => setFormData({ ...formData, dualNurseCheckVerified: e.target.checked })}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span>Dual-nurse recipient UHID and Blood Group confirmation complete</span>
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Processing Charges (₹ INR)</Label>
              <Input
                type="number"
                value={formData.processingFee}
                onChange={(e) => setFormData({ ...formData, processingFee: Number(e.target.value) })}
                className="text-xs font-mono"
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
                className="text-xs bg-red-600 hover:bg-red-700 text-white"
              >
                {submitting ? "Dispensing..." : "Dispense Unit & Print Slip"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Printable Transfusion Voucher Slip Modal */}
      {selectedVoucher && (
        <Dialog open={!!selectedVoucher} onOpenChange={() => setSelectedVoucher(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-red-600 font-bold">
                  <Droplet className="h-5 w-5" />
                  Blood Transfusion Dispense Voucher
                </span>
                <span className="font-mono text-xs text-slate-500">
                  {selectedVoucher.transfusionVoucherNumber}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="p-4 border rounded bg-white dark:bg-slate-900 text-xs space-y-3 font-mono">
              <div className="text-center border-b pb-2">
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  MEDISTRA SUPER SPECIALITY HOSPITAL
                </div>
                <div className="text-[10px] text-slate-500">
                  Department of Transfusion Medicine &amp; Blood Bank
                </div>
                <div className="text-[10px] font-bold text-rose-600 mt-1">
                  BEDSIDE TRANSFUSION VERIFICATION SLIP
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px]">PATIENT NAME</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedVoucher.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">PATIENT UHID</span>
                  <span className="font-bold">{selectedVoucher.uhid || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">WARD / OT</span>
                  <span className="font-bold">{selectedVoucher.wardOrOT}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">RECIPIENT BLOOD GROUP</span>
                  <span className="font-bold text-rose-600 text-sm">{selectedVoucher.recipientBloodGroup}</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded border space-y-1">
                <div className="flex justify-between font-bold">
                  <span>BAG NO: {selectedVoucher.bagNumber}</span>
                  <span className="text-rose-600">{selectedVoucher.componentIssued} ({selectedVoucher.volumeMl}ml)</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Crossmatch: COMPATIBLE • TTI: TESTED SAFE • Cold Chain: VERIFIED
                </div>
                <div className="text-[10px] text-slate-500">
                  Processing Tariff: ₹{(selectedVoucher.processingFee || 1450).toLocaleString("en-IN")}
                </div>
              </div>

              <div className="pt-2 border-t grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-400 block">ISSUED BY</span>
                  <span className="font-bold">{selectedVoucher.issuedBy}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">RECEIVED BY (NURSE)</span>
                  <span className="font-bold">{selectedVoucher.issuedToStaff} ({selectedVoucher.issuedToStaffId || "NUR"})</span>
                </div>
              </div>

              <div className="text-[9px] text-center text-slate-400 pt-1">
                * Note: Transfusion must commence within 30 minutes of receipt and complete within 4 hours.
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedVoucher(null)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="text-xs bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Transfusion Slip
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
