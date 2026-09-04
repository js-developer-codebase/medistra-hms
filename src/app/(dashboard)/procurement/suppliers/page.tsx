"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Building2,
  RefreshCw,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Star,
  ShieldCheck,
  CreditCard,
  Clock,
  Trash2,
  Edit
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

export default function SuppliersDirectoryPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isOpen, setIsOpen] = useState(false);
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
    panNumber: "",
    paymentTerms: "NET_30",
    leadTimeDays: 5,
    categoriesSupplied: "Surgical Disposables, Consumables",
    rating: 4.8,
    bankName: "HDFC Bank",
    accountNumber: "",
    ifscCode: ""
  });

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/procurement/suppliers");
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data || []);
      } else {
        toast(data.message || "Failed to load suppliers", "error");
      }
    } catch (err: any) {
      toast(err.message || "Error fetching supplier registry", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contactPerson || !formData.phone || !formData.email) {
      toast("Please fill in all required contact fields", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        categoriesSupplied: formData.categoriesSupplied.split(",").map((s) => s.trim()),
        bankDetails: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode
        }
      };

      const res = await fetch("/api/procurement/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Supplier ${data.data?.name} registered successfully!`, "success");
        setIsOpen(false);
        fetchSuppliers();
        setFormData({
          name: "",
          code: "",
          contactPerson: "",
          phone: "",
          email: "",
          address: "",
          gstin: "",
          panNumber: "",
          paymentTerms: "NET_30",
          leadTimeDays: 5,
          categoriesSupplied: "Surgical Disposables, Consumables",
          rating: 4.8,
          bankName: "HDFC Bank",
          accountNumber: "",
          ifscCode: ""
        });
      } else {
        toast(data.message || "Failed to register supplier", "error");
      }
    } catch (err: any) {
      toast(err.message || "Error during supplier registration", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate or remove this supplier?")) return;
    try {
      const res = await fetch(`/api/procurement/suppliers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast("Supplier removed successfully", "success");
        fetchSuppliers();
      }
    } catch (err: any) {
      toast("Error deleting supplier", "error");
    }
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchesSearch =
        (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.code || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.contactPerson || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.gstin || "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [suppliers, search, statusFilter]);

  const avgLeadTime = suppliers.length
    ? Math.round(suppliers.reduce((sum, s) => sum + (s.leadTimeDays || 0), 0) / suppliers.length)
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Approved Suppliers &amp; Vendor Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Certified pharmaceutical, surgical, biomedical, and hospital consumable distributors and manufacturers.
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
            onClick={() => setIsOpen(true)}
            className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Onboard New Supplier
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Suppliers</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {suppliers.length}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Enrolled vendor accounts</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Active Status</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {suppliers.filter((s) => s.status === "ACTIVE").length}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Compliant for procurement</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Average Lead Time</p>
              <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {avgLeadTime} Days
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Order to dock delivery</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Credit Accounts</p>
              <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {suppliers.filter((s) => s.paymentTerms && s.paymentTerms.startsWith("NET")).length}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Net 30/45/60 credit lines</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
              <CreditCard className="h-5 w-5" />
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
                placeholder="Search vendor name, SKU code, contact person, or GSTIN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Vendor Statuses ({suppliers.length})</option>
                <option value="ACTIVE">Active Vendors Only</option>
                <option value="INACTIVE">Inactive Vendors</option>
                <option value="BLACKLISTED">Blacklisted Vendors</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-600" />
            Hospital Approved Supplier Directory ({filteredSuppliers.length} records)
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Direct Procurement
          </Badge>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Vendor Code</TableHead>
                <TableHead>Supplier Company Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Phone / Email</TableHead>
                <TableHead>GSTIN / Tax ID</TableHead>
                <TableHead>Credit Terms</TableHead>
                <TableHead>Lead Time</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-slate-400">
                    Loading supplier directory...
                  </TableCell>
                </TableRow>
              ) : filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10 text-slate-400">
                    No suppliers found matching criteria. Click &quot;Onboard New Supplier&quot; to add.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((s) => (
                  <TableRow key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {s.code}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white">{s.name}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                        {s.address || "Corporate Office"}
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-800 dark:text-slate-200 font-medium">
                      {s.contactPerson}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {s.phone}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {s.email}
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-slate-700 dark:text-slate-300">
                      {s.gstin || s.panNumber || "—"}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {s.paymentTerms || "NET_30"}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-mono text-slate-700 dark:text-slate-300">
                      {s.leadTimeDays || 5} days
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        {s.rating || 4.5}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        className={`text-[9px] ${
                          s.status === "ACTIVE"
                            ? "bg-emerald-600 text-white"
                            : s.status === "BLACKLISTED"
                            ? "bg-rose-600 text-white"
                            : "bg-slate-500 text-white"
                        }`}
                      >
                        {s.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(s._id)}
                        className="h-7 w-7 text-rose-500 hover:text-rose-700"
                        title="Delete Supplier"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Onboard Supplier Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              Onboard Hospital Approved Supplier
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Supplier Company Name *</Label>
                <Input
                  required
                  placeholder="e.g. Medtronic India Pvt Ltd"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Vendor Code (Auto-generated if empty)</Label>
                <Input
                  placeholder="e.g. SUP-201"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Contact Person *</Label>
                <Input
                  required
                  placeholder="Name"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Phone Number *</Label>
                <Input
                  required
                  placeholder="+91 98XXX XXXXX"
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">GSTIN Tax ID</Label>
                <Input
                  placeholder="e.g. 27AABCA1234F1Z1"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">PAN Number</Label>
                <Input
                  placeholder="e.g. AABCA1234F"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Payment Credit Terms</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                >
                  <option value="NET_30">NET 30 Days Credit</option>
                  <option value="NET_45">NET 45 Days Credit</option>
                  <option value="NET_60">NET 60 Days Credit</option>
                  <option value="NET_15">NET 15 Days Credit</option>
                  <option value="ADVANCE">100% Advance Payment</option>
                  <option value="COD">Cash / Pay on Delivery (COD)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Expected Delivery Lead Time (Days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.leadTimeDays}
                  onChange={(e) => setFormData({ ...formData, leadTimeDays: Number(e.target.value) })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Registered Company Address</Label>
              <Input
                placeholder="Warehouse / Corporate address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Bank Name</Label>
                <Input
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Account Number</Label>
                <Input
                  placeholder="e.g. 50200012345678"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">IFSC Code</Label>
                <Input
                  placeholder="e.g. HDFC0000123"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                  className="text-xs font-mono"
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
                {submitting ? "Registering..." : "Onboard Supplier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
