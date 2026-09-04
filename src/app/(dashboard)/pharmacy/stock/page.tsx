"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Boxes,
  Search,
  Plus,
  Minus,
  Download,
  AlertTriangle,
  IndianRupee,
  MapPin,
  RefreshCw,
  TrendingDown,
  TrendingUp
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

export default function PharmacyStockPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState<any | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<"ADD" | "SUBTRACT">("ADD");
  const [adjustQty, setAdjustQty] = useState(10);
  const [adjustNotes, setAdjustNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pharmacy/stock");
      const data = await res.json();
      if (data.success) {
        setMedicines(data.data || []);
      }
    } catch (err) {
      toast("Failed to load pharmacy stock", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const filteredStock = useMemo(() => {
    return medicines.filter((m) => {
      const matchesSearch =
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.batchNumber?.toLowerCase().includes(search.toLowerCase()) ||
        m.rackLocation?.toLowerCase().includes(search.toLowerCase()) ||
        m.category?.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (stockFilter === "LOW") return m.stockQuantity <= (m.reorderLevel || 10) && m.stockQuantity > 0;
      if (stockFilter === "OUT") return m.stockQuantity === 0;
      if (stockFilter === "NORMAL") return m.stockQuantity > (m.reorderLevel || 10);
      return true;
    });
  }, [medicines, search, stockFilter]);

  const totalValuation = useMemo(() => {
    return medicines.reduce((acc, m) => acc + (m.stockQuantity || 0) * (m.unitPrice || 0), 0);
  }, [medicines]);

  const lowStockCount = medicines.filter(
    (m) => m.stockQuantity <= (m.reorderLevel || 10) && m.stockQuantity > 0
  ).length;

  const outOfStockCount = medicines.filter((m) => m.stockQuantity === 0).length;

  const handleOpenAdjustment = (med: any, type: "ADD" | "SUBTRACT") => {
    setSelectedMed(med);
    setAdjustmentType(type);
    setAdjustQty(10);
    setAdjustNotes(type === "ADD" ? "Received warehouse delivery" : "Discarded broken ampoules / damaged packaging");
    setIsOpen(true);
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed) return;

    const delta = adjustmentType === "ADD" ? Number(adjustQty) : -Number(adjustQty);

    try {
      setSubmitting(true);
      const res = await fetch("/api/pharmacy/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineId: selectedMed._id,
          quantityChange: delta,
          notes: adjustNotes
        })
      });
      const data = await res.json();

      if (data.success) {
        toast(`Stock adjusted successfully for ${selectedMed.name}`, "success");
        setIsOpen(false);
        fetchStock();
      } else {
        toast(data.message || "Failed to adjust stock", "error");
      }
    } catch (err) {
      toast("Error adjusting stock", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Medicine Name",
      "Batch Number",
      "Category",
      "Rack Location",
      "Unit Price (INR)",
      "Stock Balance",
      "Reorder Level",
      "Total Valuation (INR)"
    ];
    const rows = filteredStock.map((m) => [
      `"${m.name}"`,
      m.batchNumber || "",
      `"${m.category}"`,
      `"${m.rackLocation || ""}"`,
      m.unitPrice || 0,
      m.stockQuantity || 0,
      m.reorderLevel || 10,
      (m.stockQuantity || 0) * (m.unitPrice || 0)
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pharmacy_stock_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Stock ledger exported to CSV", "success");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Pharmacy Stock &amp; Inventory Ledger
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time shelf balances, batch inventory valuation in ₹, and manual stock adjustment audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStock}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Export Ledger
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Total Stock Valuation
              <IndianRupee className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ₹{totalValuation.toLocaleString("en-IN")}
            </div>
            <p className="text-[10px] text-slate-500">Inventory worth</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Total Drug SKUs
              <Boxes className="h-4 w-4 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {medicines.length}
            </div>
            <p className="text-[10px] text-slate-500">Tracked items</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Low Stock Alert
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-amber-600">
              {lowStockCount}
            </div>
            <p className="text-[10px] text-slate-500">&le; Reorder threshold</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Zero Stock
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-rose-600">
              {outOfStockCount}
            </div>
            <p className="text-[10px] text-slate-500">Urgent PO required</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Filter stock by medicine, batch, category or rack..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="ALL">All Stock Levels ({medicines.length})</option>
                <option value="NORMAL">Adequate Stock</option>
                <option value="LOW">Low Stock Alert (&le; Min)</option>
                <option value="OUT">Out of Stock (Zero Balance)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Ledger Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Boxes className="h-4 w-4 text-emerald-600" />
            Stock Inventory Ledger ({filteredStock.length} Items)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Medicine Details</TableHead>
                <TableHead>Batch &amp; Shelf</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-center">Stock Level</TableHead>
                <TableHead className="text-right">Valuation (₹)</TableHead>
                <TableHead className="text-center">Stock Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStock.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                    No stock inventory items found matching filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStock.map((m) => {
                  const valuation = (m.stockQuantity || 0) * (m.unitPrice || 0);
                  const isLow = m.stockQuantity <= (m.reorderLevel || 10) && m.stockQuantity > 0;
                  const isOut = m.stockQuantity === 0;

                  return (
                    <TableRow key={m._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {m.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {m.category} • {m.dosageForm || "TABLET"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {m.batchNumber || "N/A"}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {m.rackLocation || "Rack A-01"}
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-medium">
                        ₹{(m.unitPrice || 0).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={`text-[10px] ${
                            isOut
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                              : isLow
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          }`}
                        >
                          {m.stockQuantity} in stock
                        </Badge>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          Min: {m.reorderLevel || 10}
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-bold text-slate-900 dark:text-white">
                        ₹{valuation.toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] px-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
                            onClick={() => handleOpenAdjustment(m, "ADD")}
                            title="Stock In / Add Received Quantity"
                          >
                            <Plus className="h-3 w-3 mr-1" /> Stock In
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] px-2 border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300"
                            onClick={() => handleOpenAdjustment(m, "SUBTRACT")}
                            title="Stock Out / Write-off"
                          >
                            <Minus className="h-3 w-3 mr-1" /> Write-off
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stock Adjustment Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-emerald-600" />
              Adjust Stock Balance: {selectedMed?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedMed && (
            <form onSubmit={handleStockSubmit} className="space-y-4 pt-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">CURRENT SHELF BALANCE</span>
                  <span className="font-bold text-base text-slate-900 dark:text-white">
                    {selectedMed.stockQuantity} Units
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">BATCH NUMBER</span>
                  <span className="font-mono font-medium">{selectedMed.batchNumber}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Adjustment Action *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={adjustmentType === "ADD" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAdjustmentType("ADD")}
                    className={`text-xs ${
                      adjustmentType === "ADD" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Stock In (Add)
                  </Button>

                  <Button
                    type="button"
                    variant={adjustmentType === "SUBTRACT" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAdjustmentType("SUBTRACT")}
                    className={`text-xs ${
                      adjustmentType === "SUBTRACT" ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
                    }`}
                  >
                    <Minus className="h-3.5 w-3.5 mr-1" /> Stock Out (Deduct)
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Quantity to Adjust *</Label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Audit Notes / Reason *</Label>
                <Input
                  required
                  placeholder="Reason for adjustment"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
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
                  {submitting ? "Updating..." : "Save Stock Adjustment"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
