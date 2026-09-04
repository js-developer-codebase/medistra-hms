"use client";

import { useEffect, useState } from "react";
import {
  Sliders,
  RefreshCw,
  Plus,
  Search,
  IndianRupee,
  Scale,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet
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

export default function StockAdjustmentPage() {
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    itemId: "",
    physicalCount: 0,
    batchNumber: "",
    adjustmentType: "AUDIT_DEFICIT",
    reason: "Monthly store cycle physical count reconciliation",
    adjustedBy: "Store Auditor",
    approvedBy: "Operations Director"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [adjRes, itmRes] = await Promise.all([
        fetch("/api/inventory/adjustment"),
        fetch("/api/inventory/items")
      ]);

      const adjData = await adjRes.json();
      if (adjData.success) {
        setAdjustments(adjData.data || []);
      }

      const itmData = await itmRes.json();
      setItems(Array.isArray(itmData) ? itmData : []);
    } catch (err: any) {
      toast(err.message || "Failed to load stock adjustments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedItem = items.find((i) => i._id === formData.itemId);
  const systemStock = selectedItem?.currentStock ?? 0;
  const discrepancy = (Number(formData.physicalCount) || 0) - systemStock;
  const costImpact = Math.abs(discrepancy * (selectedItem?.unitPrice || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemId) {
      toast("Please select an item to adjust", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/inventory/adjustment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Stock adjustment ${data.data?.adjustmentCode} recorded successfully!`, "success");
        setIsOpen(false);
        fetchData();
      } else {
        toast(data.message || "Failed to submit adjustment", "error");
      }
    } catch (err: any) {
      toast(err.message || "Error submitting adjustment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const totalCostImpact = adjustments.reduce((sum, a) => sum + (a.costImpact || 0), 0);
  const deficitCount = adjustments.filter((a) => (a.difference || 0) < 0).length;
  const surplusCount = adjustments.filter((a) => (a.difference || 0) > 0).length;

  const filteredAdjustments = adjustments.filter((a) => {
    return (
      (a.adjustmentCode || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.itemName || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.reason || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.adjustmentType || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.adjustedBy || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            Stock Adjustments &amp; Physical Audit Reconciliations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Reconcile physical stock counts against book records, log damaged goods, write-offs, and track financial variance in ₹.
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
                  physicalCount: items[0].currentStock || 0
                }));
              }
              setIsOpen(true);
            }}
            className="text-xs flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Record Stock Adjustment
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Financial Variance</p>
              <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center">
                <IndianRupee className="h-4 w-4 mr-0.5" />
                {totalCostImpact.toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Total value adjusted</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Shortages &amp; Write-Offs</p>
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {deficitCount} events
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Physical deficit count</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
              <TrendingDown className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Surplus Reconciled</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {surplusCount} events
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Physical surplus count</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Audits</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {adjustments.length}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Reconciliation ledger</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
              <Scale className="h-5 w-5" />
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
              placeholder="Search by Adjustment Code, Item Name, Reason, Type, or Auditor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Adjustments Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-amber-600" />
            Physical Inventory Audit Log ({filteredAdjustments.length} entries)
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Financial Reconciliation
          </Badge>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Audit Code</TableHead>
                <TableHead>Audit Date</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Book Stock</TableHead>
                <TableHead className="text-right">Physical Count</TableHead>
                <TableHead className="text-right">Discrepancy</TableHead>
                <TableHead className="text-right">Cost Impact (₹)</TableHead>
                <TableHead>Auditor / Approver</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-slate-400">
                    Loading audit reconciliations...
                  </TableCell>
                </TableRow>
              ) : filteredAdjustments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10 text-slate-400">
                    No adjustments found. Click &quot;Record Stock Adjustment&quot; to audit inventory.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdjustments.map((a) => {
                  const diff = a.difference || 0;
                  const isNegative = diff < 0;

                  return (
                    <TableRow key={a._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-amber-700 dark:text-amber-400">
                        {a.adjustmentCode}
                      </TableCell>

                      <TableCell className="text-slate-600 dark:text-slate-300">
                        {new Date(a.adjustmentDate || a.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {a.itemName || a.itemId?.name || "Inventory Item"}
                        </div>
                        {a.batchNumber && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Batch: {a.batchNumber}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            a.adjustmentType === "AUDIT_DEFICIT"
                              ? "border-rose-500 text-rose-600"
                              : a.adjustmentType === "DAMAGE_WRITE_OFF"
                              ? "border-orange-500 text-orange-600"
                              : a.adjustmentType === "SURPLUS_FOUND"
                              ? "border-emerald-500 text-emerald-600"
                              : "border-slate-500 text-slate-600"
                          }`}
                        >
                          {a.adjustmentType}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right font-mono text-slate-600">
                        {a.previousStock}
                      </TableCell>

                      <TableCell className="text-right font-mono font-semibold text-slate-900 dark:text-white">
                        {a.physicalCount}
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold">
                        <span className={isNegative ? "text-rose-600" : diff > 0 ? "text-emerald-600" : "text-slate-500"}>
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-amber-600">
                        ₹{(a.costImpact || 0).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-slate-600 dark:text-slate-300">
                        <div>{a.adjustedBy || "Store Auditor"}</div>
                        <div className="text-[10px] text-slate-400">Appr: {a.approvedBy || "Manager"}</div>
                      </TableCell>

                      <TableCell className="text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                        {a.reason || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Record Adjustment Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-amber-600" />
              Reconcile Physical Inventory Count
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Select Inventory Item *</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={formData.itemId}
                onChange={(e) => {
                  const itm = items.find((i) => i._id === e.target.value);
                  setFormData({
                    ...formData,
                    itemId: e.target.value,
                    physicalCount: itm?.currentStock ?? 0
                  });
                }}
                required
              >
                <option value="">Select Item...</option>
                {items.map((i) => (
                  <option key={i._id} value={i._id}>
                    {i.code} - {i.name} (Current Book Stock: {i.currentStock} {i.unit})
                  </option>
                ))}
              </select>
            </div>

            {selectedItem && (
              <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border grid grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Book Stock:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {systemStock} {selectedItem.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Physical Count:</span>
                  <span className="font-mono font-bold text-amber-600">
                    {formData.physicalCount} {selectedItem.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Variance:</span>
                  <span className={`font-mono font-bold ${discrepancy < 0 ? "text-rose-600" : discrepancy > 0 ? "text-emerald-600" : "text-slate-500"}`}>
                    {discrepancy > 0 ? `+${discrepancy}` : discrepancy} {selectedItem.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Financial Impact:</span>
                  <span className="font-mono font-bold text-amber-600">
                    ₹{costImpact.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Verified Physical Count *</Label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={formData.physicalCount}
                  onChange={(e) => setFormData({ ...formData, physicalCount: Number(e.target.value) })}
                  className="text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Adjustment Category *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.adjustmentType}
                  onChange={(e) => setFormData({ ...formData, adjustmentType: e.target.value })}
                  required
                >
                  <option value="AUDIT_DEFICIT">Audit Deficit (Missing / Unaccounted)</option>
                  <option value="DAMAGE_WRITE_OFF">Damage / Breakage Write-off</option>
                  <option value="EXPIRY_DISPOSAL">Expired Item Quarantine Disposal</option>
                  <option value="SURPLUS_FOUND">Surplus Found (Unrecorded Return)</option>
                  <option value="CORRECTION">Manual Count Correction</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Batch Number (Optional)</Label>
                <Input
                  placeholder="e.g. BAT-202609"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Store Auditor Name</Label>
                <Input
                  value={formData.adjustedBy}
                  onChange={(e) => setFormData({ ...formData, adjustedBy: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Audit Justification &amp; Notes *</Label>
              <Input
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Reason for variance (e.g. Vials shattered in transit, counted during quarterly audit)"
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
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
              >
                {submitting ? "Applying Rebalance..." : "Reconcile & Update Book Stock"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
