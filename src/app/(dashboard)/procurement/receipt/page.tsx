"use client";

import { useEffect, useState, useMemo } from "react";
import {
  PackageCheck,
  RefreshCw,
  Plus,
  Search,
  IndianRupee,
  ShieldCheck,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Truck
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

export default function GoodsReceiptPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [qcFilter, setQcFilter] = useState("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    poNumber: "",
    poId: "",
    supplierName: "",
    deliveryChallanNumber: "",
    warehouseLocation: "Central Warehouse - Receiving Bay 1",
    inspectedBy: "Procurement QC Officer",
    qcStatus: "PASSED",
    notes: "Consignment packaging intact, cold seal checked, seals verified.",
    items: [
      {
        itemId: "",
        itemName: "Disposable Sterile Surgical Gloves (Size 7.5)",
        orderedQuantity: 50,
        receivedQuantity: 50,
        acceptedQuantity: 50,
        rejectedQuantity: 0,
        unitPrice: 850,
        batchNumber: "BAT-202609-01",
        expiryDate: "2028-09-01",
        rejectionReason: ""
      }
    ]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [receiptsRes, ordersRes] = await Promise.all([
        fetch("/api/procurement/receipt"),
        fetch("/api/procurement/purchase-orders")
      ]);

      const receiptsData = await receiptsRes.json();
      if (receiptsData.success) {
        setReceipts(receiptsData.data || []);
      }

      const ordersData = await ordersRes.json();
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err: any) {
      toast(err.message || "Failed to load goods receipts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectPO = (poNum: string) => {
    const po = orders.find((o) => o.poNumber === poNum);
    if (po) {
      const mappedItems = (po.items || []).map((i: any) => ({
        itemId: i.itemId?._id || i.itemId || "",
        itemName: i.itemName || i.itemId?.name || "Medical Item",
        orderedQuantity: i.quantity || 1,
        receivedQuantity: i.quantity || 1,
        acceptedQuantity: i.quantity || 1,
        rejectedQuantity: 0,
        unitPrice: i.unitPrice || 0,
        batchNumber: `BAT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`,
        expiryDate: "",
        rejectionReason: ""
      }));

      setFormData((prev) => ({
        ...prev,
        poNumber: poNum,
        poId: po._id,
        supplierName: po.supplierName,
        deliveryChallanNumber: `DC-${Math.floor(10000 + Math.random() * 90000)}`,
        items: mappedItems.length > 0 ? mappedItems : prev.items
      }));
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...formData.items];
    (updated[index] as any)[field] = value;
    if (field === "receivedQuantity" || field === "rejectedQuantity") {
      const rec = Number(updated[index].receivedQuantity) || 0;
      const rej = Number(updated[index].rejectedQuantity) || 0;
      updated[index].acceptedQuantity = Math.max(0, rec - rej);
    }
    setFormData({ ...formData, items: updated });
  };

  const totalAcceptedValueCalc = formData.items.reduce(
    (sum, i) => sum + (i.acceptedQuantity || 0) * (i.unitPrice || 0),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.poNumber || !formData.supplierName) {
      toast("Please select a valid Purchase Order", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/procurement/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Goods Receipt ${data.data?.grnNumber} committed & stock updated!`, "success");
        setIsOpen(false);
        fetchData();
      } else {
        toast(data.message || "Failed to log goods receipt", "error");
      }
    } catch (err: any) {
      toast(err.message || "Error submitting GRN", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const matchesSearch =
        (r.grnNumber || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.poNumber || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.supplierName || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.deliveryChallanNumber || "").toLowerCase().includes(search.toLowerCase());

      const matchesQc = qcFilter === "ALL" || r.qcStatus === qcFilter;
      return matchesSearch && matchesQc;
    });
  }, [receipts, search, qcFilter]);

  const totalAcceptedSpend = receipts.reduce((sum, r) => sum + (r.totalAcceptedValue || 0), 0);
  const passedCount = receipts.filter((r) => r.qcStatus === "PASSED").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <PackageCheck className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            Goods Receipt Note (GRN) &amp; Inward QC Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Dockside consignment inspection, ordered vs received variance checks, lot expiry tracking, and stock inventory credit.
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
            onClick={() => {
              if (orders.length > 0 && !formData.poNumber) {
                handleSelectPO(orders[0].poNumber);
              }
              setIsOpen(true);
            }}
            className="text-xs flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Inspect Inward Consignment (GRN)
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Received Value</p>
              <h3 className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1 flex items-center">
                <IndianRupee className="h-4 w-4 mr-0.5" />
                {totalAcceptedSpend.toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Value credited to hospital stores</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Passed QC</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {passedCount} consignments
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">100% acceptance &amp; zero defects</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Inspection Receipts</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {receipts.length}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Delivered vendor consignments</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Truck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Pending Delivery POs</p>
              <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {orders.filter((o) => o.deliveryStatus !== "DELIVERED").length}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Awaiting vendor transit</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <PackageCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by GRN Number, PO Number, Vendor, Challan #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={qcFilter}
                onChange={(e) => setQcFilter(e.target.value)}
              >
                <option value="ALL">All Inspection Statuses ({receipts.length})</option>
                <option value="PASSED">Passed (Accepted)</option>
                <option value="CONDITIONAL">Conditional / Partial</option>
                <option value="FAILED">Failed (Rejected)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipts Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <PackageCheck className="h-4 w-4 text-teal-600" />
            Goods Receipt Notes Ledger ({filteredReceipts.length} entries)
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Inward Store Manifest
          </Badge>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>GRN Code</TableHead>
                <TableHead>Receipt Date</TableHead>
                <TableHead>PO Reference</TableHead>
                <TableHead>Supplier Name</TableHead>
                <TableHead>Challan Ref</TableHead>
                <TableHead>Items Received</TableHead>
                <TableHead className="text-right">Accepted Value (₹)</TableHead>
                <TableHead>QC Inspector</TableHead>
                <TableHead className="text-center">QC Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                    Loading inward consignments...
                  </TableCell>
                </TableRow>
              ) : filteredReceipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-slate-400">
                    No Goods Receipt Notes found. Click &quot;Inspect Inward Consignment (GRN)&quot; to receive goods.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReceipts.map((r) => {
                  return (
                    <TableRow key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-teal-700 dark:text-teal-400">
                        {r.grnNumber}
                      </TableCell>

                      <TableCell className="text-slate-600 dark:text-slate-300">
                        {new Date(r.deliveryDate || r.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </TableCell>

                      <TableCell className="font-mono font-medium text-blue-600">
                        {r.poNumber}
                      </TableCell>

                      <TableCell className="font-semibold text-slate-900 dark:text-white">
                        {r.supplierName}
                      </TableCell>

                      <TableCell className="font-mono text-slate-600 dark:text-slate-400">
                        {r.deliveryChallanNumber || "—"}
                      </TableCell>

                      <TableCell className="max-w-[200px]">
                        <div className="font-medium text-slate-900 dark:text-white truncate">
                          {(r.items || []).map((i: any) => `${i.itemName} (Acc: ${i.acceptedQuantity})`).join(", ")}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Location: {r.warehouseLocation || "Central Receiving Bay"}
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-teal-600 dark:text-teal-400">
                        ₹{(r.totalAcceptedValue || 0).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-slate-600 dark:text-slate-300">
                        {r.inspectedBy}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={`text-[9px] ${
                            r.qcStatus === "PASSED"
                              ? "bg-emerald-600 text-white"
                              : r.qcStatus === "CONDITIONAL"
                              ? "bg-amber-600 text-white"
                              : "bg-rose-600 text-white"
                          }`}
                        >
                          {r.qcStatus}
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

      {/* Inspect Inward Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-teal-600" />
              Goods Receipt &amp; Physical Quality Inspection
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Select Linked Purchase Order *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.poNumber}
                  onChange={(e) => handleSelectPO(e.target.value)}
                  required
                >
                  <option value="">Select PO...</option>
                  {orders.map((o) => (
                    <option key={o._id} value={o.poNumber}>
                      {o.poNumber} - {o.supplierName} (Total: ₹{o.totalAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Vendor Delivery Challan / Invoice # *</Label>
                <Input
                  required
                  placeholder="e.g. DC-98102"
                  value={formData.deliveryChallanNumber}
                  onChange={(e) => setFormData({ ...formData, deliveryChallanNumber: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Supplier</Label>
                <Input value={formData.supplierName} disabled className="text-xs bg-slate-50 dark:bg-slate-800" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Receiving Warehouse Bay</Label>
                <Input
                  value={formData.warehouseLocation}
                  onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">QC Overall Status</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.qcStatus}
                  onChange={(e) => setFormData({ ...formData, qcStatus: e.target.value })}
                >
                  <option value="PASSED">Passed (Accept into Inventory)</option>
                  <option value="CONDITIONAL">Conditional (Minor Rejections)</option>
                  <option value="FAILED">Failed (Quarantine Consignment)</option>
                </select>
              </div>
            </div>

            {/* Line Items Inspection */}
            <div className="space-y-2 border rounded-md p-3 bg-slate-50 dark:bg-slate-800/40">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 dark:text-slate-200">Consignment Verification Items</span>
                <span className="text-[11px] text-slate-500">Accepted Qty credits to Master Stock</span>
              </div>

              {formData.items.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-white dark:bg-slate-900 rounded border space-y-2 text-xs">
                  <div className="font-semibold text-slate-900 dark:text-white flex justify-between">
                    <span>{item.itemName}</span>
                    <span className="text-slate-400 font-mono">Ordered: {item.orderedQuantity}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label className="text-[10px]">Delivered Qty</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.receivedQuantity}
                        onChange={(e) => handleItemChange(idx, "receivedQuantity", Number(e.target.value))}
                        className="text-xs font-mono h-8"
                      />
                    </div>

                    <div>
                      <Label className="text-[10px]">Rejected Qty</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.rejectedQuantity}
                        onChange={(e) => handleItemChange(idx, "rejectedQuantity", Number(e.target.value))}
                        className="text-xs font-mono h-8 text-rose-600"
                      />
                    </div>

                    <div>
                      <Label className="text-[10px]">Accepted Qty</Label>
                      <Input
                        type="number"
                        disabled
                        value={item.acceptedQuantity}
                        className="text-xs font-mono h-8 bg-slate-50 dark:bg-slate-800 font-bold text-teal-600"
                      />
                    </div>

                    <div>
                      <Label className="text-[10px]">Batch Number</Label>
                      <Input
                        value={item.batchNumber}
                        onChange={(e) => handleItemChange(idx, "batchNumber", e.target.value)}
                        placeholder="BAT-XXXX"
                        className="text-xs font-mono h-8"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 flex justify-between items-center text-xs">
              <span className="text-teal-800 dark:text-teal-200">Total Accepted Inventory Inward Value:</span>
              <span className="font-mono font-bold text-base text-teal-700 dark:text-teal-300">
                ₹{totalAcceptedValueCalc.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">QC Notes &amp; Packaging Remarks</Label>
              <Input
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
                className="text-xs bg-teal-600 hover:bg-teal-700 text-white"
              >
                {submitting ? "Committing..." : "Commit Inward & Credit Stock"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
