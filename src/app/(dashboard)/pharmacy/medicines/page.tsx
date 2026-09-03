"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Pill,
  Plus,
  Search,
  Filter,
  Download,
  Sparkles,
  Edit2,
  Trash2,
  AlertTriangle,
  Boxes,
  MapPin,
  Calendar,
  IndianRupee,
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
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [dosageFilter, setDosageFilter] = useState("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    category: "Antibiotics",
    genericName: "",
    dosageForm: "TABLET",
    manufacturer: "",
    batchNumber: "",
    rackLocation: "Rack A-01",
    shelfNumber: "Shelf 1",
    hsnCode: "30049099",
    gstRate: 12,
    expiryDate: "",
    unitPrice: 0,
    stockQuantity: 0,
    reorderLevel: 10,
    description: ""
  });

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const [medRes, catRes] = await Promise.all([
        fetch("/api/pharmacy/medicines"),
        fetch("/api/pharmacy/categories")
      ]);
      const medData = await medRes.json();
      if (medData.success) setMedicines(medData.data || []);

      const catData = await catRes.json();
      if (catData.success) setCategories(catData.data || []);
    } catch (err) {
      console.error(err);
      toast("Failed to load medicines", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const matchesSearch =
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.genericName?.toLowerCase().includes(search.toLowerCase()) ||
        m.batchNumber?.toLowerCase().includes(search.toLowerCase()) ||
        m.rackLocation?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "ALL" || m.category === categoryFilter;

      const matchesDosage =
        dosageFilter === "ALL" || m.dosageForm === dosageFilter;

      return matchesSearch && matchesCategory && matchesDosage;
    });
  }, [medicines, search, categoryFilter, dosageFilter]);

  const handleOpenCreate = () => {
    setEditingMedicine(null);
    setFormData({
      name: "",
      category: categories[0]?.name || "Antibiotics",
      genericName: "",
      dosageForm: "TABLET",
      manufacturer: "",
      batchNumber: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
      rackLocation: "Rack A-01",
      shelfNumber: "Shelf 1",
      hsnCode: "30049099",
      gstRate: 12,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      unitPrice: 50,
      stockQuantity: 100,
      reorderLevel: 20,
      description: ""
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (med: any) => {
    setEditingMedicine(med);
    setFormData({
      name: med.name || "",
      category: med.category || "Antibiotics",
      genericName: med.genericName || "",
      dosageForm: med.dosageForm || "TABLET",
      manufacturer: med.manufacturer || "",
      batchNumber: med.batchNumber || "",
      rackLocation: med.rackLocation || "Rack A-01",
      shelfNumber: med.shelfNumber || "Shelf 1",
      hsnCode: med.hsnCode || "30049099",
      gstRate: med.gstRate || 12,
      expiryDate: med.expiryDate ? new Date(med.expiryDate).toISOString().slice(0, 10) : "",
      unitPrice: med.unitPrice || 0,
      stockQuantity: med.stockQuantity || 0,
      reorderLevel: med.reorderLevel || 10,
      description: med.description || ""
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const url = editingMedicine
        ? `/api/pharmacy/medicines/${editingMedicine._id}`
        : "/api/pharmacy/medicines";
      const method = editingMedicine ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast(
          editingMedicine ? "Medicine updated successfully" : "Medicine added successfully",
          "success"
        );
        setIsOpen(false);
        fetchMedicines();
      } else {
        toast(data.message || "Failed to save medicine", "error");
      }
    } catch (err) {
      toast("Error submitting medicine", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/pharmacy/medicines/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast("Medicine deleted", "success");
        fetchMedicines();
      } else {
        toast(data.message || "Delete failed", "error");
      }
    } catch (err) {
      toast("Failed to delete medicine", "error");
    }
  };

  const handleSeed = async () => {
    try {
      const res = await fetch("/api/pharmacy/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast("Essential medicines populated!", "success");
        fetchMedicines();
      }
    } catch (err) {
      toast("Error seeding medicines", "error");
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Generic Name",
      "Category",
      "Dosage Form",
      "Batch Number",
      "Rack Location",
      "Unit Price (INR)",
      "Stock Quantity",
      "Reorder Level",
      "Expiry Date"
    ];
    const rows = filteredMedicines.map((m) => [
      `"${m.name}"`,
      `"${m.genericName || ""}"`,
      `"${m.category}"`,
      m.dosageForm || "TABLET",
      m.batchNumber || "",
      `"${m.rackLocation || ""}"`,
      m.unitPrice || 0,
      m.stockQuantity || 0,
      m.reorderLevel || 10,
      m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : ""
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `medistra_medicines_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Medicines catalog exported as CSV", "success");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Medicines Master Catalog
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Formulations, batch serials, unit pricing in ₹, shelf locations, and stock reorder thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMedicines}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSeed}
            className="text-xs flex items-center gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Seed Essential Drugs
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Medicine
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by drug name, generic, batch or rack..."
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
                <option value="ALL">All Categories ({medicines.length})</option>
                {categories.map((c: any) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={dosageFilter}
                onChange={(e) => setDosageFilter(e.target.value)}
              >
                <option value="ALL">All Formulations</option>
                <option value="TABLET">Tablet</option>
                <option value="CAPSULE">Capsule</option>
                <option value="SYRUP">Syrup</option>
                <option value="INJECTION">Injection</option>
                <option value="IV_FLUID">IV Fluid</option>
                <option value="INHALER">Inhaler</option>
                <option value="OINTMENT">Ointment / Gel</option>
                <option value="DROPS">Drops</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medicines Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Boxes className="h-4 w-4 text-emerald-600" />
            Catalog Directory ({filteredMedicines.length} Formulations)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Medicine Name</TableHead>
                <TableHead>Formulation</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Batch &amp; Rack</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Unit Price (₹)</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedicines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-400">
                    No medicines match the search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMedicines.map((med) => {
                  const isLow = med.stockQuantity <= (med.reorderLevel || 10);
                  const isNil = med.stockQuantity === 0;
                  const isExpired = med.expiryDate && new Date(med.expiryDate) < new Date();

                  return (
                    <TableRow key={med._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {med.name}
                        </div>
                        {med.genericName && (
                          <div className="text-[11px] text-slate-500 italic">
                            {med.genericName}
                          </div>
                        )}
                        {med.manufacturer && (
                          <div className="text-[10px] text-slate-400">
                            Mfg: {med.manufacturer}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {med.dosageForm || "TABLET"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {med.category}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {med.batchNumber || "N/A"}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {med.rackLocation || "Rack A-01"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className={`text-[11px] ${isExpired ? "text-rose-600 font-bold" : "text-slate-600 dark:text-slate-300"}`}>
                          {med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : "N/A"}
                        </div>
                        {isExpired && (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0">
                            EXPIRED
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right font-bold text-slate-900 dark:text-white">
                        ₹{(med.unitPrice || 0).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-right">
                        <Badge
                          className={`text-[10px] ${
                            isNil
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                              : isLow
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          }`}
                        >
                          {med.stockQuantity} in stock
                        </Badge>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          Min: {med.reorderLevel || 10}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleOpenEdit(med)}
                            title="Edit Medicine"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700"
                            onClick={() => handleDelete(med._id, med.name)}
                            title="Delete Medicine"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* Add / Edit Dialog Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-emerald-600" />
              {editingMedicine ? "Edit Medicine Formulation" : "Add New Medicine"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="name" className="text-xs">
                  Brand / Trade Name *
                </Label>
                <Input
                  id="name"
                  required
                  placeholder="e.g. Paracetamol 650mg (Dolo)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="genericName" className="text-xs">
                  Generic Chemical Name
                </Label>
                <Input
                  id="genericName"
                  placeholder="e.g. Paracetamol"
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="dosageForm" className="text-xs">
                  Dosage Form *
                </Label>
                <select
                  id="dosageForm"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.dosageForm}
                  onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                >
                  <option value="TABLET">Tablet</option>
                  <option value="CAPSULE">Capsule</option>
                  <option value="SYRUP">Syrup</option>
                  <option value="INJECTION">Injection</option>
                  <option value="IV_FLUID">IV Fluid</option>
                  <option value="INHALER">Inhaler</option>
                  <option value="OINTMENT">Ointment / Gel</option>
                  <option value="DROPS">Drops</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="category" className="text-xs">
                  Therapeutic Category *
                </Label>
                <select
                  id="category"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((c: any) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="manufacturer" className="text-xs">
                  Manufacturer
                </Label>
                <Input
                  id="manufacturer"
                  placeholder="e.g. Micro Labs, GSK, Cipla"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="batchNumber" className="text-xs">
                  Batch / Lot Number *
                </Label>
                <Input
                  id="batchNumber"
                  required
                  placeholder="e.g. ML-PAR-2401"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="expiryDate" className="text-xs">
                  Expiry Date *
                </Label>
                <Input
                  id="expiryDate"
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="rackLocation" className="text-xs">
                  Storage Rack Location
                </Label>
                <Input
                  id="rackLocation"
                  placeholder="e.g. Rack A-01, Shelf 2"
                  value={formData.rackLocation}
                  onChange={(e) => setFormData({ ...formData, rackLocation: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="unitPrice" className="text-xs">
                  Unit Retail Price (₹) *
                </Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="stockQuantity" className="text-xs">
                  Initial Stock Quantity *
                </Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  min="0"
                  required
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="reorderLevel" className="text-xs">
                  Reorder Level Alert Threshold *
                </Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  min="0"
                  required
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
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
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {submitting ? "Saving..." : editingMedicine ? "Update Medicine" : "Save Medicine"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
