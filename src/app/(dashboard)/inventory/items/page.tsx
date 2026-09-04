"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Layers,
  Plus,
  RefreshCw,
  Search,
  IndianRupee,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Boxes
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

export default function InventoryItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "Surgical Disposables & Consumables",
    subCategory: "Disposables",
    specification: "",
    unit: "Box of 100",
    unitPrice: 500,
    reorderLevel: 20,
    safetyStock: 10,
    currentStock: 50,
    storageLocation: "Central Warehouse - Rack A1",
    supplierName: "Apex Healthcare Ltd",
    description: "Standard medical grade supply"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itmRes, catRes] = await Promise.all([
        fetch("/api/inventory/items"),
        fetch("/api/inventory/categories")
      ]);

      const itmData = await itmRes.json();
      setItems(Array.isArray(itmData) ? itmData : []);

      const catData = await catRes.json();
      if (catData.success) {
        setCategories(catData.data || []);
      }
    } catch (err) {
      toast("Failed to load inventory items", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast("Item name is required", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/inventory/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        toast(`Item ${data.name || formData.name} registered successfully!`, "success");
        setIsOpen(false);
        fetchData();
      } else {
        toast(data.message || "Failed to register item", "error");
      }
    } catch (err) {
      toast("Error creating inventory item", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.code?.toLowerCase().includes(search.toLowerCase()) ||
        item.storageLocation?.toLowerCase().includes(search.toLowerCase());

      const matchesCat = categoryFilter === "ALL" || item.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [items, search, categoryFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Inventory Master Items Catalog
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Comprehensive catalog of medical supplies, surgical instruments, PPE, linen, and biomedical spare parts.
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
            className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Register Inventory Item
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by item name, SKU code, or storage rack..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories ({items.length})</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Boxes className="h-4 w-4 text-emerald-600" />
            Hospital Consumables &amp; Supplies Directory ({filtered.length} Items)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>SKU Code</TableHead>
                <TableHead>Item Name &amp; Specification</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Reorder Threshold</TableHead>
                <TableHead>Unit Price (₹)</TableHead>
                <TableHead>Total Valuation (₹)</TableHead>
                <TableHead className="text-center">Stock Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-400">
                    No items found matching criteria. Click &quot;Register Inventory Item&quot; to add.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => {
                  const isOutOfStock = (item.currentStock || 0) === 0;
                  const isLowStock = !isOutOfStock && (item.currentStock || 0) <= (item.reorderLevel || 20);

                  return (
                    <TableRow key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {item.code}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {item.storageLocation || "Central Warehouse"} • UOM: {item.unit}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {item.category}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                        {item.currentStock} {item.unit}
                      </TableCell>

                      <TableCell className="font-mono text-slate-600 dark:text-slate-400">
                        {item.reorderLevel} {item.unit}
                      </TableCell>

                      <TableCell className="font-mono font-semibold text-slate-900 dark:text-white">
                        ₹{(item.unitPrice || 0).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="font-mono font-bold text-emerald-600">
                        ₹{((item.currentStock || 0) * (item.unitPrice || 0)).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={`text-[9px] ${
                            isOutOfStock
                              ? "bg-rose-600 text-white animate-pulse"
                              : isLowStock
                              ? "bg-amber-600 text-white"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          {isOutOfStock ? "OUT OF STOCK" : isLowStock ? "LOW STOCK" : "IN STOCK"}
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

      {/* Register Item Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Register New Hospital Inventory Item
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Item SKU Code</Label>
                <Input
                  placeholder="Auto-generated if blank (ITM-XXXX)"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Item Name *</Label>
                <Input
                  required
                  placeholder="e.g. Disposable Sterile Gloves 7.5"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Category *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Surgical Disposables & Consumables">Surgical Disposables &amp; Consumables</option>
                  <option value="Critical Care & ICU Supplies">Critical Care &amp; ICU Supplies</option>
                  <option value="General Ward Consumables">General Ward Consumables</option>
                  <option value="Biomedical & Equipment Spares">Biomedical &amp; Equipment Spares</option>
                  <option value="CSSD & Sterilization Packaging">CSSD &amp; Sterilization Packaging</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Unit of Measure (UOM) *</Label>
                <Input
                  required
                  placeholder="e.g. Box of 100, Piece, Pack, Roll"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Unit Purchase Price (₹) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Opening Stock Quantity</Label>
                <Input
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Reorder Level Threshold *</Label>
                <Input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Primary Warehouse Storage Location</Label>
                <Input
                  value={formData.storageLocation}
                  onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Preferred Supplier / Manufacturer</Label>
                <Input
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Technical Description / Specification</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                {submitting ? "Registering..." : "Register Item in Master Catalog"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
