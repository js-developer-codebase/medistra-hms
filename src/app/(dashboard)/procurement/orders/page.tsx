"use client";

import { useEffect, useState, useMemo } from "react";
import {
  FileCheck2,
  RefreshCw,
  Plus,
  Search,
  IndianRupee,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  XCircle,
  Package,
  Trash2,
  Send
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

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    supplierId: "",
    supplierName: "",
    supplierEmail: "",
    supplierPhone: "",
    paymentTerms: "NET_30",
    expectedDeliveryDate: "",
    prReference: "",
    notes: "Deliver to Central Receiving Bay between 9 AM and 5 PM.",
    items: [
      {
        itemId: "",
        itemName: "Disposable Sterile Surgical Gloves (Size 7.5)",
        quantity: 50,
        uom: "Box of 100",
        unitPrice: 850
      }
    ]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, supRes, itemsRes] = await Promise.all([
        fetch("/api/procurement/purchase-orders"),
        fetch("/api/procurement/suppliers"),
        fetch("/api/inventory/items")
      ]);

      const ordersData = await ordersRes.json();
      setOrders(Array.isArray(ordersData) ? ordersData : []);

      const supData = await supRes.json();
      if (supData.success) setSuppliers(supData.data || []);

      const itemsData = await itemsRes.json();
      setInventoryItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (err: any) {
      toast(err.message || "Failed to load purchase orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectSupplier = (supId: string) => {
    const sup = suppliers.find((s) => s._id === supId);
    if (sup) {
      setFormData((prev) => ({
        ...prev,
        supplierId: supId,
        supplierName: sup.name,
        supplierEmail: sup.email,
        supplierPhone: sup.phone,
        paymentTerms: sup.paymentTerms || prev.paymentTerms
      }));
    }
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemId: "",
          itemName: "",
          quantity: 10,
          uom: "Units",
          unitPrice: 500
        }
      ]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...formData.items];
    (updated[index] as any)[field] = value;
    if (field === "itemId") {
      const itm = inventoryItems.find((i) => i._id === value);
      if (itm) {
        updated[index].itemName = itm.name;
        updated[index].uom = itm.unit || "Units";
        updated[index].unitPrice = itm.unitPrice || 0;
      }
    }
    setFormData({ ...formData, items: updated });
  };

  const subTotalCalc = formData.items.reduce((sum, i) => sum + (i.quantity || 0) * (i.unitPrice || 0), 0);
  const gstCalc = Math.round(subTotalCalc * 0.18);
  const totalCalc = subTotalCalc + gstCalc;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierName || formData.items.length === 0) {
      toast("Please select a vendor and add at least one line item", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/procurement/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        toast(`Purchase Order ${data.poNumber} generated successfully!`, "success");
        setIsOpen(false);
        fetchData();
      } else {
        toast(data.message || "Failed to create PO", "error");
      }
    } catch (err: any) {
      toast(err.message || "Error generating PO", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprovePO = async (id: string) => {
    try {
      const res = await fetch(`/api/procurement/purchase-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE", approvedBy: "Procurement Manager" })
      });

      const data = await res.json();
      if (data.success) {
        toast("Purchase Order approved and dispatched to vendor!", "success");
        fetchData();
      }
    } catch (err) {
      toast("Error approving PO", "error");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((po) => {
      const matchesSearch =
        (po.poNumber || "").toLowerCase().includes(search.toLowerCase()) ||
        (po.supplierName || "").toLowerCase().includes(search.toLowerCase()) ||
        (po.prReference || "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || po.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalCommittedSpend = orders.reduce((sum, po) => sum + (po.totalAmount || 0), 0);
  const approvedPOCount = orders.filter((po) => po.status === "APPROVED").length;
  const completedPOCount = orders.filter((po) => po.status === "COMPLETED").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Purchase Orders (PO) Management Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Authoritative purchase order contracts, GST tax computation in ₹, approval authorizations, and delivery fulfillment.
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
              if (suppliers.length > 0 && !formData.supplierId) {
                handleSelectSupplier(suppliers[0]._id);
              }
              setIsOpen(true);
            }}
            className="text-xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Draft New Purchase Order
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Committed Spend</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
                <IndianRupee className="h-4 w-4 mr-0.5" />
                {totalCommittedSpend.toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Across all PO contracts</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Active Approved POs</p>
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {approvedPOCount} orders
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Awaiting vendor delivery</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Send className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Delivered / Completed</p>
              <h3 className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                {completedPOCount} orders
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Fulfilled &amp; received in store</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total PO Contracts</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {orders.length}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Lifetime issued POs</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600">
              <FileCheck2 className="h-5 w-5" />
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
                placeholder="Search by PO number, vendor name, or PR reference..."
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
                <option value="ALL">All Order Statuses ({orders.length})</option>
                <option value="DRAFT">Draft Orders</option>
                <option value="PENDING">Pending Approval</option>
                <option value="APPROVED">Approved / Dispatched</option>
                <option value="COMPLETED">Completed / Received</option>
                <option value="CANCELLED">Cancelled Orders</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-indigo-600" />
            Purchase Order Directory ({filteredOrders.length} records)
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Official Commercial Contracts
          </Badge>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>PO Number</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Vendor Company</TableHead>
                <TableHead>Items Overview</TableHead>
                <TableHead className="text-right">Subtotal (₹)</TableHead>
                <TableHead className="text-right">GST (₹)</TableHead>
                <TableHead className="text-right">Total Net (₹)</TableHead>
                <TableHead className="text-center">Delivery</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-slate-400">
                    Loading purchase orders...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10 text-slate-400">
                    No purchase orders found. Click &quot;Draft New Purchase Order&quot; to generate.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((po) => {
                  return (
                    <TableRow key={po._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-indigo-700 dark:text-indigo-400">
                        {po.poNumber}
                        {po.prReference && (
                          <div className="text-[10px] text-slate-400 font-normal">
                            Indent: {po.prReference}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-slate-600 dark:text-slate-300">
                        {new Date(po.orderDate || po.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {po.supplierName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {po.paymentTerms || "NET_30"}
                        </div>
                      </TableCell>

                      <TableCell className="max-w-[200px]">
                        <div className="font-medium text-slate-900 dark:text-white truncate">
                          {(po.items || []).map((i: any) => `${i.itemName || "Item"} (x${i.quantity})`).join(", ")}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {po.items?.length || 0} line item(s)
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-mono text-slate-600">
                        ₹{(po.subTotal || po.totalAmount || 0).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-right font-mono text-slate-500">
                        ₹{(po.taxAmount || 0).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-slate-900 dark:text-white">
                        ₹{(po.totalAmount || 0).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            po.deliveryStatus === "DELIVERED"
                              ? "border-emerald-500 text-emerald-600"
                              : "border-slate-400 text-slate-500"
                          }`}
                        >
                          {po.deliveryStatus || "PENDING"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={`text-[9px] ${
                            po.status === "APPROVED"
                              ? "bg-blue-600 text-white"
                              : po.status === "COMPLETED"
                              ? "bg-emerald-600 text-white"
                              : po.status === "PENDING"
                              ? "bg-amber-600 text-white"
                              : "bg-slate-500 text-white"
                          }`}
                        >
                          {po.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {po.status === "DRAFT" || po.status === "PENDING" ? (
                            <Button
                              size="sm"
                              onClick={() => handleApprovePO(po._id)}
                              className="h-6 text-[10px] bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Approve
                            </Button>
                          ) : null}

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setSelectedPO(po);
                              setIsPrintOpen(true);
                            }}
                            className="h-7 w-7 text-indigo-600"
                            title="View / Print Purchase Order"
                          >
                            <Printer className="h-3.5 w-3.5" />
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

      {/* Draft PO Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-indigo-600" />
              Generate Official Purchase Order (PO)
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Select Vendor / Supplier *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.supplierId}
                  onChange={(e) => handleSelectSupplier(e.target.value)}
                  required
                >
                  <option value="">Choose Supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.code} - {s.name} ({s.paymentTerms || "NET_30"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Linked Indent / PR Ref # (Optional)</Label>
                <Input
                  value={formData.prReference}
                  onChange={(e) => setFormData({ ...formData, prReference: e.target.value })}
                  placeholder="e.g. PR-20260904-101"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Payment Terms</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                >
                  <option value="NET_30">NET 30 Days</option>
                  <option value="NET_45">NET 45 Days</option>
                  <option value="NET_60">NET 60 Days</option>
                  <option value="NET_15">NET 15 Days</option>
                  <option value="ADVANCE">100% Advance</option>
                  <option value="COD">Pay on Delivery</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Expected Delivery Date</Label>
                <Input
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 border rounded-md p-3 bg-slate-50 dark:bg-slate-800/40">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 dark:text-slate-200">Contract Line Items</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="h-6 text-[10px] flex items-center gap-1 text-indigo-600"
                >
                  <Plus className="h-3 w-3" /> Add Item Line
                </Button>
              </div>

              {formData.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-slate-900 p-2 rounded border">
                  <div className="col-span-5">
                    <Label className="text-[10px]">Catalog Item or Custom Item</Label>
                    <Input
                      placeholder="Item name"
                      value={item.itemName}
                      onChange={(e) => handleItemChange(idx, "itemName", e.target.value)}
                      className="text-xs h-8"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-[10px]">Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                      className="text-xs font-mono h-8"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-[10px]">UOM</Label>
                    <Input
                      value={item.uom}
                      onChange={(e) => handleItemChange(idx, "uom", e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-[10px]">Rate (₹)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, "unitPrice", Number(e.target.value))}
                      className="text-xs font-mono h-8"
                      required
                    />
                  </div>

                  <div className="col-span-1 pt-4 text-center">
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(idx)}
                        className="h-6 w-6 text-rose-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border text-xs space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal Items Value:</span>
                <span className="font-mono font-semibold">₹{subTotalCalc.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST (18% Goods &amp; Services Tax):</span>
                <span className="font-mono font-semibold">₹{gstCalc.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1 border-t">
                <span>Total Purchase Order Value:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  ₹{totalCalc.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Delivery Instructions &amp; Contract Terms</Label>
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
                {submitting ? "Drafting..." : "Generate & Commit PO"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Printable PO Voucher Modal */}
      {selectedPO && (
        <Dialog open={isPrintOpen} onOpenChange={setIsPrintOpen}>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="flex justify-between items-center text-base">
                <span className="font-bold flex items-center gap-2">
                  <FileCheck2 className="h-5 w-5 text-indigo-600" />
                  Official Purchase Order Contract
                </span>
                <Badge className="font-mono text-xs bg-indigo-600 text-white">
                  {selectedPO.poNumber}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="p-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 border-b pb-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">MEDISTRA SUPERSPECIALTY HOSPITAL</h4>
                  <p className="text-slate-500">Central Stores &amp; Procurement Wing</p>
                  <p className="text-slate-500">GSTIN: 27MEDIS1234F1Z0</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Vendor: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPO.supplierName}</span></p>
                  <p className="text-slate-500">PO Date: <span className="font-mono">{new Date(selectedPO.orderDate).toLocaleDateString("en-IN")}</span></p>
                  <p className="text-slate-500">Payment: <span className="font-mono">{selectedPO.paymentTerms || "NET_30"}</span></p>
                </div>
              </div>

              <div>
                <Table className="text-xs border">
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead>Line Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Rate (₹)</TableHead>
                      <TableHead className="text-right">Total (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedPO.items || []).map((i: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{i.itemName || "Medical Consumable"}</TableCell>
                        <TableCell className="text-right font-mono">{i.quantity} {i.uom || ""}</TableCell>
                        <TableCell className="text-right font-mono">₹{(i.unitPrice || 0).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          ₹{((i.quantity || 1) * (i.unitPrice || 0)).toLocaleString("en-IN")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end pt-2">
                <div className="w-60 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold">₹{(selectedPO.subTotal || selectedPO.totalAmount).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>GST (18%):</span>
                    <span className="font-mono font-semibold">₹{(selectedPO.taxAmount || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm border-t pt-1 text-slate-900 dark:text-white">
                    <span>Net Amount:</span>
                    <span className="font-mono text-indigo-600">₹{(selectedPO.totalAmount || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 flex justify-between items-center text-slate-400 text-[11px]">
                <span>Authorized Signatory: Procurement Manager</span>
                <span>System Verified PO</span>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                Print PO Document
              </Button>
              <Button
                size="sm"
                onClick={() => setIsPrintOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
