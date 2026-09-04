"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  RefreshCw,
  Plus,
  Search,
  IndianRupee,
  FileCheck2,
  Calendar,
  Building2,
  Package,
  Layers
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

export default function StockInGRNPage() {
  const [items, setItems] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    itemId: "",
    quantity: 10,
    unitPrice: 0,
    batchNumber: "",
    expiryDate: "",
    invoiceNumber: "",
    supplierName: "",
    storageLocation: "Central Warehouse - Rack A1",
    inspectedBy: "Storekeeper",
    notes: "Consignment inspected and accepted"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, txnsRes] = await Promise.all([
        fetch("/api/inventory/items"),
        fetch("/api/inventory/stock-in")
      ]);

      const itemsData = await itemsRes.json();
      setItems(Array.isArray(itemsData) ? itemsData : []);

      const txnsData = await txnsRes.json();
      if (txnsData.success) {
        setTransactions(txnsData.data || []);
      }
    } catch (err: any) {
      toast(err.message || "Failed to load stock-in records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectItem = (itemId: string) => {
    const selected = items.find((i) => i._id === itemId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        itemId,
        unitPrice: selected.unitPrice || 0,
        supplierName: selected.supplierName || prev.supplierName,
        storageLocation: selected.storageLocation || prev.storageLocation,
        batchNumber: `BAT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`
      }));
    } else {
      setFormData((prev) => ({ ...prev, itemId }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemId) {
      toast("Please select an inventory item", "error");
      return;
    }
    if (formData.quantity <= 0) {
      toast("Inward quantity must be greater than 0", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/inventory/stock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(`GRN consignment logged successfully! Transaction: ${data.data?.transactionCode}`, "success");
        setIsOpen(false);
        fetchData();
      } else {
        toast(data.message || "Failed to process stock inward", "error");
      }
    } catch (err: any) {
      toast(err.message || "Error submitting stock-in note", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const totalInwardValue = transactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const totalInwardUnits = transactions.reduce((sum, t) => sum + (t.quantity || 0), 0);

  const filteredTxns = transactions.filter((t) => {
    return (
      (t.transactionCode || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.itemName || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.batchNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.sourceDepartment || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.reference || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowDownLeft className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Goods Receipt Note (GRN) &amp; Inward Stock Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Process supplier consignments, verify purchase rates in ₹, track lot numbers, and update warehouse stock balances.
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
              if (items.length > 0 && !formData.itemId) {
                handleSelectItem(items[0]._id);
              }
              setIsOpen(true);
            }}
            className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Create Inward Note (GRN)
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Inward Value</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
                <IndianRupee className="h-4 w-4 mr-0.5" />
                {totalInwardValue.toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Cumulative GRN value</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Units Received</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {totalInwardUnits.toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Total consumables checked in</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Package className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Consignments</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {transactions.length}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Verified GRN receipts</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
              <FileCheck2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by GRN Code, Item Name, Batch #, Supplier, or Invoice #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* GRN Transactions Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-emerald-600" />
            Goods Receipt Notes &amp; Consignment Log ({filteredTxns.length} entries)
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Direct Warehouse Ledger
          </Badge>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>GRN Code</TableHead>
                <TableHead>Receipt Date</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Vendor / Supplier</TableHead>
                <TableHead>Batch &amp; Expiry</TableHead>
                <TableHead className="text-right">Qty Received</TableHead>
                <TableHead className="text-right">Rate (₹)</TableHead>
                <TableHead className="text-right">Total Inward (₹)</TableHead>
                <TableHead>Received By</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-slate-400">
                    Loading inward consignments...
                  </TableCell>
                </TableRow>
              ) : filteredTxns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10 text-slate-400">
                    No Goods Receipt Notes found. Click &quot;Create Inward Note (GRN)&quot; to receive stock.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTxns.map((txn) => {
                  return (
                    <TableRow key={txn._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {txn.transactionCode}
                        <div className="text-[10px] text-slate-400 font-normal">
                          Ref: {txn.reference || "Challan"}
                        </div>
                      </TableCell>

                      <TableCell className="text-slate-600 dark:text-slate-300">
                        {new Date(txn.transactionDate || txn.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {txn.itemName || txn.itemId?.name || "Consumable Item"}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {txn.destinationDepartment || "Central Warehouse"}
                        </div>
                      </TableCell>

                      <TableCell className="text-slate-700 dark:text-slate-300">
                        {txn.sourceDepartment || "Direct Vendor"}
                      </TableCell>

                      <TableCell>
                        <div className="font-mono font-medium text-slate-900 dark:text-white">
                          {txn.batchNumber || "—"}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Exp: {txn.expiryDate ? new Date(txn.expiryDate).toLocaleDateString("en-IN") : "N/A"}
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        +{txn.quantity}
                      </TableCell>

                      <TableCell className="text-right font-mono text-slate-700 dark:text-slate-300">
                        ₹{(txn.unitPrice || 0).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-emerald-600">
                        ₹{(txn.totalAmount || 0).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {txn.performedByName || "Storekeeper"}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge className="bg-emerald-600 text-white text-[9px]">
                          RECEIVED
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

      {/* New GRN Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
              Log Goods Receipt Note (GRN) Inward Consignment
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Select Inventory Item *</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={formData.itemId}
                onChange={(e) => handleSelectItem(e.target.value)}
                required
              >
                <option value="">Select Catalog Item...</option>
                {items.map((i) => (
                  <option key={i._id} value={i._id}>
                    {i.code} - {i.name} (Current: {i.currentStock} {i.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Received Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Unit Purchase Rate (₹) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border flex justify-between items-center text-xs">
              <span className="text-slate-500">Calculated Consignment Value:</span>
              <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                ₹{(formData.quantity * formData.unitPrice).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Batch / Lot Number</Label>
                <Input
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  placeholder="e.g. BAT-20260904"
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Lot Expiry Date</Label>
                <Input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Supplier / Vendor Name</Label>
                <Input
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  placeholder="e.g. Apex Healthcare Ltd"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Vendor Invoice / Delivery Challan #</Label>
                <Input
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="e.g. INV-98214"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Storage Rack / Bin Allocation</Label>
                <Input
                  value={formData.storageLocation}
                  onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                  placeholder="e.g. Central Warehouse - Rack A1"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Inspected &amp; Accepted By</Label>
                <Input
                  value={formData.inspectedBy}
                  onChange={(e) => setFormData({ ...formData, inspectedBy: e.target.value })}
                  placeholder="Storekeeper Name"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Receiving &amp; Quality Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Remarks on packaging, temperature check, etc."
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
                {submitting ? "Processing Inward..." : "Confirm & Commit to Stock"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
