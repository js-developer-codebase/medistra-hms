"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  RefreshCw,
  Plus,
  Search,
  IndianRupee,
  Building2,
  Package,
  ClipboardList,
  AlertCircle
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

export default function StockOutPage() {
  const [items, setItems] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    itemId: "",
    quantity: 1,
    department: "Emergency & Casualty",
    requisitionNumber: "",
    issuedTo: "Sister in Charge",
    batchNumber: "",
    notes: "Departmental emergency requisition fulfillment"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, txnsRes] = await Promise.all([
        fetch("/api/inventory/items"),
        fetch("/api/inventory/stock-out")
      ]);

      const itemsData = await itemsRes.json();
      setItems(Array.isArray(itemsData) ? itemsData : []);

      const txnsData = await txnsRes.json();
      if (txnsData.success) {
        setTransactions(txnsData.data || []);
      }
    } catch (err: any) {
      toast(err.message || "Failed to load stock-out records", "error");
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
      toast("Please select an inventory item", "error");
      return;
    }
    if (formData.quantity <= 0) {
      toast("Issue quantity must be greater than 0", "error");
      return;
    }
    if (selectedItem && formData.quantity > (selectedItem.currentStock || 0)) {
      toast(`Cannot issue ${formData.quantity}. Only ${selectedItem.currentStock} available in stock.`, "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/inventory/stock-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Voucher ${data.data?.transactionCode} issued to ${formData.department} successfully!`, "success");
        setIsOpen(false);
        fetchData();
      } else {
        toast(data.message || "Failed to issue stock", "error");
      }
    } catch (err: any) {
      toast(err.message || "Error processing department issue", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const totalIssuedValue = transactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const totalIssuedUnits = transactions.reduce((sum, t) => sum + (t.quantity || 0), 0);

  const filteredTxns = transactions.filter((t) => {
    return (
      (t.transactionCode || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.itemName || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.destinationDepartment || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.reference || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.performedByName || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowUpRight className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Department Issues &amp; Consumption Requisitions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Fulfill stock requisitions for Emergency, OT, ICU, and wards, with real-time stock deductions and department cost-tracking.
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
                  requisitionNumber: `REQ-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`
                }));
              }
              setIsOpen(true);
            }}
            className="text-xs flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Issue Stock Voucher
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Consumed Value</p>
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1 flex items-center">
                <IndianRupee className="h-4 w-4 mr-0.5" />
                {totalIssuedValue.toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Department consumption cost</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Dispatched Quantity</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {totalIssuedUnits.toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Consumable units dispatched</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <Package className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Issue Vouchers</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {transactions.length}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Dispatches processed</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600">
              <ClipboardList className="h-5 w-5" />
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
              placeholder="Search by Voucher Code, Item Name, Department, Requisition #, or Recipient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Issues Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-blue-600" />
            Department Requisition Fulfillment Log ({filteredTxns.length} entries)
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Hospital Consumptions Ledger
          </Badge>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Voucher Code</TableHead>
                <TableHead>Dispatch Date</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Destination Department</TableHead>
                <TableHead className="text-right">Qty Dispatched</TableHead>
                <TableHead className="text-right">Unit Rate (₹)</TableHead>
                <TableHead className="text-right">Total Debit (₹)</TableHead>
                <TableHead>Issued To / Received By</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                    Loading department issues...
                  </TableCell>
                </TableRow>
              ) : filteredTxns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-slate-400">
                    No department issues found. Click &quot;Issue Stock Voucher&quot; to dispense items.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTxns.map((txn) => {
                  return (
                    <TableRow key={txn._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-blue-700 dark:text-blue-400">
                        {txn.transactionCode}
                        <div className="text-[10px] text-slate-400 font-normal">
                          Req: {txn.reference || "Direct"}
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
                          Source: {txn.sourceDepartment || "Central Warehouse"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px] bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                          {txn.destinationDepartment || "Emergency Ward"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        -{txn.quantity}
                      </TableCell>

                      <TableCell className="text-right font-mono text-slate-700 dark:text-slate-300">
                        ₹{(txn.unitPrice || 0).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-slate-900 dark:text-white">
                        ₹{(txn.totalAmount || 0).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {txn.performedByName || "Department Nurse"}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge className="bg-blue-600 text-white text-[9px]">
                          DISPATCHED
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

      {/* Issue Stock Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-blue-600" />
              Issue Inventory Items to Hospital Department
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Select Inventory Item *</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={formData.itemId}
                onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                required
              >
                <option value="">Select Catalog Item...</option>
                {items.map((i) => (
                  <option key={i._id} value={i._id} disabled={i.currentStock === 0}>
                    {i.code} - {i.name} (Stock: {i.currentStock} {i.unit}) {i.currentStock === 0 ? "— [OUT OF STOCK]" : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedItem && (
              <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Available Stock:</span>
                  <span className={`font-mono font-bold ${selectedItem.currentStock <= selectedItem.reorderLevel ? "text-amber-600" : "text-emerald-600"}`}>
                    {selectedItem.currentStock} {selectedItem.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Unit Rate:</span>
                  <span className="font-mono font-semibold">₹{(selectedItem.unitPrice || 0).toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Total Debited:</span>
                  <span className="font-mono font-bold text-blue-600">
                    ₹{(formData.quantity * (selectedItem.unitPrice || 0)).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Quantity to Issue *</Label>
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
                <Label className="text-xs">Destination Department *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                >
                  <option value="Emergency & Casualty">Emergency &amp; Casualty</option>
                  <option value="Operation Theatre (OT)">Operation Theatre (OT)</option>
                  <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                  <option value="Inpatient General Ward (Male)">Inpatient General Ward (Male)</option>
                  <option value="Inpatient General Ward (Female)">Inpatient General Ward (Female)</option>
                  <option value="Labor & Delivery Room (LDR)">Labor &amp; Delivery Room (LDR)</option>
                  <option value="Radiology & Imaging">Radiology &amp; Imaging</option>
                  <option value="Pathology & Blood Bank">Pathology &amp; Blood Bank</option>
                  <option value="Dialysis Unit">Dialysis Unit</option>
                  <option value="Cardiology Cath Lab">Cardiology Cath Lab</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Department Requisition / Indent #</Label>
                <Input
                  value={formData.requisitionNumber}
                  onChange={(e) => setFormData({ ...formData, requisitionNumber: e.target.value })}
                  placeholder="e.g. REQ-2026-081"
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Received By (Staff / Nurse Name)</Label>
                <Input
                  value={formData.issuedTo}
                  onChange={(e) => setFormData({ ...formData, issuedTo: e.target.value })}
                  placeholder="Sister in Charge / OT Staff"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Issue Notes / Procedure Details</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Emergency craniotomy preparation, routine ward restocking"
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
                disabled={submitting || (selectedItem && selectedItem.currentStock === 0)}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitting ? "Processing Issue..." : "Confirm & Issue Stock"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
