"use client";

import { useEffect, useState } from "react";
import {
  RotateCcw,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  PackageCheck,
  Trash2,
  Boxes,
  RefreshCw
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

export default function PharmacyReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    billNumber: "",
    patientName: "",
    reason: "MEDICATION_CHANGED",
    notes: "",
    medicineId: "",
    quantity: 1,
    condition: "INTACT_RESTOCKABLE"
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [retRes, medRes] = await Promise.all([
        fetch("/api/pharmacy/returns"),
        fetch("/api/pharmacy/medicines")
      ]);

      const retData = await retRes.json();
      if (retData.success) setReturns(retData.data || []);

      const medData = await medRes.json();
      if (medData.success) setMedicines(medData.data || []);
    } catch (err) {
      toast("Failed to load returns", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredReturns = returns.filter(
    (r) =>
      r.returnNumber?.toLowerCase().includes(search.toLowerCase()) ||
      r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      r.billNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRefundsProcessed = returns.reduce(
    (acc, r) => acc + (r.totalRefund || 0),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.medicineId) {
      toast("Please select a medicine being returned", "error");
      return;
    }

    const med = medicines.find((m) => m._id === formData.medicineId);
    if (!med) return;

    const unitPrice = med.unitPrice || 0;
    const totalRefund = Math.round(Number(formData.quantity) * unitPrice);

    try {
      setSubmitting(true);
      const payload = {
        billNumber: formData.billNumber || undefined,
        patientName: formData.patientName,
        reason: formData.reason,
        notes: formData.notes,
        totalRefund,
        items: [
          {
            medicineId: med._id,
            medicineName: med.name,
            batchNumber: med.batchNumber || "BAT-DEF",
            quantity: Number(formData.quantity),
            unitPrice: unitPrice,
            refundAmount: totalRefund,
            condition: formData.condition,
            restocked: formData.condition === "INTACT_RESTOCKABLE"
          }
        ]
      };

      const res = await fetch("/api/pharmacy/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        toast(
          formData.condition === "INTACT_RESTOCKABLE"
            ? `Return processed & ${formData.quantity} units restocked to inventory!`
            : `Return processed & quarantined for disposal`,
          "success"
        );
        setIsOpen(false);
        setFormData({
          billNumber: "",
          patientName: "",
          reason: "MEDICATION_CHANGED",
          notes: "",
          medicineId: "",
          quantity: 1,
          condition: "INTACT_RESTOCKABLE"
        });
        loadData();
      } else {
        toast(data.message || "Failed to process return", "error");
      }
    } catch (err) {
      toast("Error processing return", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Medicine Returns &amp; Restocking
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Process patient medication returns, condition verification, refund calculations in ₹, and stock restoration.
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
            className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Process Return
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Total Returns Processed
              <RotateCcw className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {returns.length}
            </div>
            <p className="text-[10px] text-slate-500">Return requests</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Total Refunds Issued
              <IndianRupee className="h-4 w-4 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-indigo-600">
              ₹{totalRefundsProcessed.toLocaleString("en-IN")}
            </div>
            <p className="text-[10px] text-slate-500">Credited / Cash refund</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Restock Compliance
              <PackageCheck className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-emerald-600">
              100%
            </div>
            <p className="text-[10px] text-slate-500">Intact seal verification</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search return voucher #, patient name or bill reference..."
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
            <RotateCcw className="h-4 w-4 text-emerald-600" />
            Returns History Log ({filteredReturns.length} Vouchers)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Voucher #</TableHead>
                <TableHead>Date &amp; Patient</TableHead>
                <TableHead>Items Returned</TableHead>
                <TableHead>Condition &amp; Restock</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Refund Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReturns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                    No medicine return vouchers recorded.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReturns.map((r) => (
                  <TableRow key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                      {r.returnNumber}
                      {r.billNumber && (
                        <div className="text-[10px] text-slate-400 font-normal">
                          Ref: {r.billNumber}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {r.patientName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>

                    <TableCell>
                      {r.items?.map((item: any, idx: number) => (
                        <div key={idx} className="font-medium text-slate-900 dark:text-white">
                          {item.quantity}x {item.medicineName}
                        </div>
                      ))}
                    </TableCell>

                    <TableCell>
                      {r.items?.[0]?.condition === "INTACT_RESTOCKABLE" ? (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3" /> Restocked
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px] flex items-center gap-1 w-fit">
                          <Trash2 className="h-3 w-3" /> Discarded
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="text-slate-600 dark:text-slate-400">
                        {r.reason?.replace(/_/g, " ")}
                      </span>
                    </TableCell>

                    <TableCell className="text-right font-bold text-emerald-600">
                      ₹{(r.totalRefund || 0).toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Process Return Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-emerald-600" />
              Process Medicine Return &amp; Refund
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Original Bill # (Optional)</Label>
                <Input
                  placeholder="e.g. PHARM-20260903-1029"
                  value={formData.billNumber}
                  onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Patient Name *</Label>
                <Input
                  required
                  placeholder="Patient full name"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Select Medicine to Return *</Label>
              <select
                required
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={formData.medicineId}
                onChange={(e) => setFormData({ ...formData, medicineId: e.target.value })}
              >
                <option value="">-- Choose Medicine --</option>
                {medicines.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} (₹{m.unitPrice} / unit)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Returned Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Packaging Condition *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                >
                  <option value="INTACT_RESTOCKABLE">Intact Seal (Return to Inventory)</option>
                  <option value="DAMAGED_EXPIRED_DISCARD">Broken / Damaged (Quarantine/Discard)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Return Reason *</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              >
                <option value="MEDICATION_CHANGED">Doctor Changed Medication</option>
                <option value="PATIENT_DISCHARGED">Patient Discharged Early</option>
                <option value="OVERPRESCRIBED">Excess Quantity Prescribed</option>
                <option value="ADVERSE_REACTION">Patient Adverse Reaction</option>
                <option value="OTHER">Other Reason</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Pharmacist Verification Notes</Label>
              <Input
                placeholder="Physical inspection remarks"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {submitting ? "Processing..." : "Process Return & Restock"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
