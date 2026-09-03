"use client";

import { useEffect, useState } from "react";
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Calendar,
  Star,
  Edit2,
  Trash2,
  RefreshCw,
  FileCheck
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

export default function PharmacySuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    gstin: "",
    dlNumber: "",
    paymentTerms: "NET_30",
    leadTimeDays: 3,
    categoriesSupplied: "Antibiotics, Cardiovascular",
    rating: 5,
    isActive: true
  });

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pharmacy/suppliers");
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data || []);
      }
    } catch (err) {
      toast("Failed to load suppliers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.code?.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson?.toLowerCase().includes(search.toLowerCase()) ||
      s.gstin?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setFormData({
      name: "",
      code: `SUPP-${Math.floor(100 + Math.random() * 900)}`,
      contactPerson: "",
      phone: "+91 ",
      email: "",
      address: "",
      gstin: "07AAAA0000A1Z5",
      dlNumber: "DL-20B/21B-XXXX",
      paymentTerms: "NET_30",
      leadTimeDays: 3,
      categoriesSupplied: "Antibiotics, Respiratory, Gastrointestinal",
      rating: 4.8,
      isActive: true
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (sup: any) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name || "",
      code: sup.code || "",
      contactPerson: sup.contactPerson || "",
      phone: sup.phone || "",
      email: sup.email || "",
      address: sup.address || "",
      gstin: sup.gstin || "",
      dlNumber: sup.dlNumber || "",
      paymentTerms: sup.paymentTerms || "NET_30",
      leadTimeDays: sup.leadTimeDays || 3,
      categoriesSupplied: Array.isArray(sup.categoriesSupplied)
        ? sup.categoriesSupplied.join(", ")
        : sup.categoriesSupplied || "",
      rating: sup.rating || 5,
      isActive: sup.isActive ?? true
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const url = editingSupplier
        ? `/api/pharmacy/suppliers/${editingSupplier._id}`
        : "/api/pharmacy/suppliers";
      const method = editingSupplier ? "PUT" : "POST";

      const categoriesArray = formData.categoriesSupplied
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        categoriesSupplied: categoriesArray
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast(
          editingSupplier ? "Supplier updated successfully" : "Supplier registered successfully",
          "success"
        );
        setIsOpen(false);
        fetchSuppliers();
      } else {
        toast(data.message || "Failed to save supplier", "error");
      }
    } catch (err) {
      toast("Error submitting supplier", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete supplier "${name}"?`)) return;
    try {
      const res = await fetch(`/api/pharmacy/suppliers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast("Supplier deleted", "success");
        fetchSuppliers();
      }
    } catch (err) {
      toast("Failed to delete supplier", "error");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Pharmacy Suppliers &amp; Distributors
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Authorized pharmaceutical vendors, Drug License (DL) verifications, credit terms, and delivery lead times.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSuppliers}
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
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Search Toolbar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search vendor company, contact person, or GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((sup) => (
          <Card key={sup._id} className="border shadow-sm hover:border-emerald-500/50 transition-all bg-white dark:bg-slate-900">
            <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{sup.name}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Code: {sup.code} • DL: {sup.dlNumber || "DL-20B/21B"}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handleOpenEdit(sup)}
                >
                  <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600"
                  onClick={() => handleDelete(sup._id, sup.name)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="space-y-1">
                <div className="font-medium text-slate-800 dark:text-slate-200">
                  {sup.contactPerson} (Representative)
                </div>
                <div className="text-slate-500 flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-emerald-600" /> {sup.phone}
                </div>
                <div className="text-slate-500 flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-indigo-600" /> {sup.email}
                </div>
                {sup.address && (
                  <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <MapPin className="h-3 w-3" /> {sup.address}
                  </div>
                )}
              </div>

              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded font-mono text-[10px] space-y-0.5">
                <div>GSTIN: {sup.gstin || "N/A"}</div>
                <div>Payment Terms: {sup.paymentTerms}</div>
                <div>Lead Time: {sup.leadTimeDays || 2} Days</div>
              </div>

              {sup.categoriesSupplied && sup.categoriesSupplied.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {sup.categoriesSupplied.map((cat: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-[9px]">
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-emerald-600" />
              {editingSupplier ? "Edit Pharmaceutical Supplier" : "Register New Supplier"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Company / Agency Name *</Label>
                <Input
                  required
                  placeholder="e.g. Sun Pharma Distributors Ltd"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Supplier Code *</Label>
                <Input
                  required
                  placeholder="e.g. SUN-DIST"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Contact Person *</Label>
                <Input
                  required
                  placeholder="Account manager name"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Phone Number *</Label>
                <Input
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Email Address *</Label>
                <Input
                  type="email"
                  required
                  placeholder="orders@vendor.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">GSTIN Number</Label>
                <Input
                  placeholder="07AAAA0000A1Z5"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Drug License (DL) Number</Label>
                <Input
                  placeholder="DL-20B/21B-XXXX"
                  value={formData.dlNumber}
                  onChange={(e) => setFormData({ ...formData, dlNumber: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Payment Terms</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value as any })}
                >
                  <option value="NET_15">Net 15 Days</option>
                  <option value="NET_30">Net 30 Days</option>
                  <option value="NET_60">Net 60 Days</option>
                  <option value="ADVANCE">100% Advance</option>
                  <option value="COD">Cash On Delivery</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Delivery Lead Time (Days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.leadTimeDays}
                  onChange={(e) => setFormData({ ...formData, leadTimeDays: Number(e.target.value) })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Supplied Therapeutic Categories (Comma separated)</Label>
                <Input
                  placeholder="e.g. Antibiotics, Cardiovascular, Gastrointestinal"
                  value={formData.categoriesSupplied}
                  onChange={(e) => setFormData({ ...formData, categoriesSupplied: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Office Address</Label>
                <Input
                  placeholder="Industrial Area, City, State"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                {submitting ? "Saving..." : editingSupplier ? "Update Supplier" : "Register Supplier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
