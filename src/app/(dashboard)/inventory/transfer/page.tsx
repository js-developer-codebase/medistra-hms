"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  RefreshCw,
  Plus,
  Search,
  Warehouse,
  Package,
  Building2,
  CheckCircle2,
  Clock,
  SendHorizontal
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

export default function StockTransferPage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    itemId: "",
    sourceLocation: "Central Warehouse - Rack A1",
    destinationLocation: "OT Satellite Store",
    quantity: 5,
    batchNumber: "",
    requestedBy: "OT Incharge",
    approvedBy: "Store Manager",
    notes: "Restocking OT emergency consumables cart"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trfRes, itmRes] = await Promise.all([
        fetch("/api/inventory/transfer"),
        fetch("/api/inventory/items")
      ]);

      const trfData = await trfRes.json();
      if (trfData.success) {
        setTransfers(trfData.data || []);
      }

      const itmData = await itmRes.json();
      setItems(Array.isArray(itmData) ? itmData : []);
    } catch (err: any) {
      toast(err.message || "Failed to load stock transfers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedItem = items.find((i) => i._id === formData.itemId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemId) {
      toast("Please select an item to transfer", "error");
      return;
    }
    if (formData.quantity <= 0) {
      toast("Transfer quantity must be greater than 0", "error");
      return;
    }
    if (formData.sourceLocation === formData.destinationLocation) {
      toast("Source and destination locations cannot be identical", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/inventory/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Stock transfer ${data.data?.transferCode} completed successfully!`, "success");
        setIsOpen(false);
        fetchData();
      } else {
        toast(data.message || "Failed to execute transfer", "error");
      }
    } catch (err: any) {
      toast(err.message || "Error during transfer submission", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const totalTransferredUnits = transfers.reduce((sum, t) => sum + (t.quantity || 0), 0);
  const completedCount = transfers.filter((t) => t.status === "COMPLETED").length;

  const filteredTransfers = transfers.filter((t) => {
    return (
      (t.transferCode || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.itemName || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.sourceLocation || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.destinationLocation || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.requestedBy || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Inter-Store &amp; Sub-Store Stock Transfers
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Internal transfer of medical consumables from Central Warehouse to OT, ICU, and Emergency satellite dispensaries.
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
                setFormData((prev) => ({
                  ...prev,
                  itemId: items[0]._id,
                  sourceLocation: items[0].storageLocation || "Central Warehouse - Rack A1"
                }));
              }
              setIsOpen(true);
            }}
            className="text-xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Initiate Store Transfer
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Dispatched Units</p>
              <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {totalTransferredUnits.toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Units moved between stores</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600">
              <Package className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Completed Transfers</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {completedCount}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Successfully acknowledged</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Sub-Store Locations</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                6 Units
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Active satellite dispensaries</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Warehouse className="h-5 w-5" />
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
              placeholder="Search by Transfer Code, Item Name, Source or Destination Location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transfers Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <SendHorizontal className="h-4 w-4 text-indigo-600" />
            Inter-Store Transfer Ledger ({filteredTransfers.length} records)
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Sub-Store Relocation
          </Badge>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Transfer Code</TableHead>
                <TableHead>Transfer Date</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Source Location</TableHead>
                <TableHead>Destination Location</TableHead>
                <TableHead className="text-right">Transferred Qty</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead className="text-center">Transfer Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                    Loading transfer manifests...
                  </TableCell>
                </TableRow>
              ) : filteredTransfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-400">
                    No inter-store transfers found. Click &quot;Initiate Store Transfer&quot; to transfer items.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransfers.map((t) => {
                  return (
                    <TableRow key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-indigo-700 dark:text-indigo-400">
                        {t.transferCode}
                      </TableCell>

                      <TableCell className="text-slate-600 dark:text-slate-300">
                        {new Date(t.transferDate || t.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {t.itemName || t.itemId?.name || "Inventory Item"}
                        </div>
                        {t.batchNumber && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Batch: {t.batchNumber}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-slate-600 dark:text-slate-300">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {t.sourceLocation}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                          {t.destinationLocation}
                        </span>
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-slate-900 dark:text-white">
                        {t.quantity}
                      </TableCell>

                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {t.requestedBy || "Storekeeper"}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={`text-[9px] ${
                            t.status === "COMPLETED"
                              ? "bg-emerald-600 text-white"
                              : "bg-amber-600 text-white"
                          }`}
                        >
                          {t.status || "COMPLETED"}
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

      {/* New Transfer Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-indigo-600" />
              Initiate Inter-Store Stock Movement
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Select Item to Transfer *</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={formData.itemId}
                onChange={(e) => {
                  const itm = items.find((i) => i._id === e.target.value);
                  setFormData({
                    ...formData,
                    itemId: e.target.value,
                    sourceLocation: itm?.storageLocation || formData.sourceLocation
                  });
                }}
                required
              >
                <option value="">Select Item...</option>
                {items.map((i) => (
                  <option key={i._id} value={i._id}>
                    {i.code} - {i.name} (Stock: {i.currentStock} {i.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Source Store / Bin *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.sourceLocation}
                  onChange={(e) => setFormData({ ...formData, sourceLocation: e.target.value })}
                  required
                >
                  <option value="Central Warehouse - Rack A1">Central Warehouse - Rack A1</option>
                  <option value="Central Warehouse - Rack B2">Central Warehouse - Rack B2</option>
                  <option value="Main Stores Dispensing Bay">Main Stores Dispensing Bay</option>
                  <option value="OT Satellite Store">OT Satellite Store</option>
                  <option value="ICU Sub-Dispenser">ICU Sub-Dispenser</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Destination Store / Cart *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.destinationLocation}
                  onChange={(e) => setFormData({ ...formData, destinationLocation: e.target.value })}
                  required
                >
                  <option value="OT Satellite Store">OT Satellite Store</option>
                  <option value="ICU Crash Cart Sub-Store">ICU Crash Cart Sub-Store</option>
                  <option value="Emergency Triage Bin">Emergency Triage Bin</option>
                  <option value="Cardiology Cath Lab Bay">Cardiology Cath Lab Bay</option>
                  <option value="Wards Dispensing Cabinet">Wards Dispensing Cabinet</option>
                  <option value="CSSD Sterilization Holding Area">CSSD Sterilization Holding Area</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Transfer Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  max={selectedItem?.currentStock || 9999}
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Batch / Lot Reference</Label>
                <Input
                  placeholder="e.g. BAT-202609-01"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Requested By</Label>
                <Input
                  value={formData.requestedBy}
                  onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Approved By</Label>
                <Input
                  value={formData.approvedBy}
                  onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Transfer Reason &amp; Remarks</Label>
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
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {submitting ? "Processing..." : "Authorize & Execute Transfer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
