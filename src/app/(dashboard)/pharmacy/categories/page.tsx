"use client";

import { useEffect, useState } from "react";
import {
  Layers,
  Plus,
  Search,
  Lock,
  ThermometerSnowflake,
  Sun,
  ShieldCheck,
  FileText,
  Trash2,
  Edit2,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export default function MedicineCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    storageCondition: "ROOM_TEMPERATURE",
    requiresPrescription: true,
    isActive: true
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pharmacy/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (err) {
      toast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      storageCondition: "ROOM_TEMPERATURE",
      requiresPrescription: true,
      isActive: true
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || "",
      code: cat.code || "",
      description: cat.description || "",
      storageCondition: cat.storageCondition || "ROOM_TEMPERATURE",
      requiresPrescription: cat.requiresPrescription ?? true,
      isActive: cat.isActive ?? true
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const url = editingCategory
        ? `/api/pharmacy/categories/${editingCategory._id}`
        : "/api/pharmacy/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast(
          editingCategory ? "Category updated successfully" : "Category created successfully",
          "success"
        );
        setIsOpen(false);
        fetchCategories();
      } else {
        toast(data.message || "Failed to save category", "error");
      }
    } catch (err) {
      toast("Error submitting category", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      const res = await fetch(`/api/pharmacy/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast("Category deleted", "success");
        fetchCategories();
      }
    } catch (err) {
      toast("Failed to delete category", "error");
    }
  };

  const renderStorageBadge = (condition: string) => {
    switch (condition) {
      case "REFRIGERATED_2_8C":
        return (
          <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 flex items-center gap-1 text-[10px]">
            <ThermometerSnowflake className="h-3 w-3" /> Cold Chain 2–8°C
          </Badge>
        );
      case "NARCOTICS_VAULT":
        return (
          <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 flex items-center gap-1 text-[10px]">
            <Lock className="h-3 w-3" /> Narcotics Vault
          </Badge>
        );
      case "COOL_DRY":
        return (
          <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 flex items-center gap-1 text-[10px]">
            Cool &amp; Dry (&lt;25°C)
          </Badge>
        );
      case "ROOM_TEMPERATURE":
      default:
        return (
          <Badge variant="outline" className="text-[10px] flex items-center gap-1">
            <Sun className="h-3 w-3 text-amber-500" /> Room Temp (15–30°C)
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Medicine Categories
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Therapeutic drug classifications, storage protocol rules, and prescription controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCategories}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4" />
            New Category
          </Button>
        </div>
      </div>

      {/* Search Toolbar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search therapeutic categories or codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => (
          <Card key={cat._id} className="border shadow-sm hover:border-emerald-500/50 transition-all bg-white dark:bg-slate-900">
            <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{cat.name}</span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {cat.code}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handleOpenEdit(cat)}
                >
                  <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600"
                  onClick={() => handleDelete(cat._id, cat.name)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400 min-h-[36px]">
                {cat.description || "Therapeutic category description and pharmaceutical indications."}
              </p>

              <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-2">
                <div>{renderStorageBadge(cat.storageCondition)}</div>
                <div>
                  {cat.requiresPrescription ? (
                    <Badge variant="secondary" className="text-[10px] flex items-center gap-1">
                      <FileText className="h-3 w-3 text-purple-600" /> Rx Only
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
                      OTC Permitted
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-600" />
              {editingCategory ? "Edit Therapeutic Category" : "Add Medicine Category"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="cname" className="text-xs">
                Category Name *
              </Label>
              <Input
                id="cname"
                required
                placeholder="e.g. Antibiotics, Cardiovascular"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="ccode" className="text-xs">
                Category Code (Abbreviation) *
              </Label>
              <Input
                id="ccode"
                required
                placeholder="e.g. ANTI, CARD, RESP"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="storageCondition" className="text-xs">
                Storage &amp; Vault Conditions *
              </Label>
              <select
                id="storageCondition"
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={formData.storageCondition}
                onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value })}
              >
                <option value="ROOM_TEMPERATURE">Room Temperature (15–30°C)</option>
                <option value="REFRIGERATED_2_8C">Cold Chain / Refrigerated (2–8°C)</option>
                <option value="COOL_DRY">Cool &amp; Dry Place (&lt;25°C)</option>
                <option value="NARCOTICS_VAULT">Controlled Substances / Vault</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="cdesc" className="text-xs">
                Clinical Scope &amp; Indications
              </Label>
              <Input
                id="cdesc"
                placeholder="Brief clinical description of medications in this category"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="requiresPrescription"
                checked={formData.requiresPrescription}
                onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <Label htmlFor="requiresPrescription" className="text-xs cursor-pointer">
                Strict Prescription Required (Doctor Rx mandatory to dispense)
              </Label>
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
                {submitting ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
