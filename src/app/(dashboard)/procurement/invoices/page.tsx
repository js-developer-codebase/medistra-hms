"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Receipt,
  RefreshCw,
  Plus,
  Search,
  IndianRupee,
  ShieldCheck,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck2,
  CreditCard,
  Layers
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

export default function PurchaseInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [matchingFilter, setMatchingFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    poNumber: "",
    grnNumber: "",
    vendorInvoiceRef: "",
    supplierName: "",
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    subTotal: 0,
    taxAmount: 0,
    totalAmount: 0,
    notes: "Vendor original tax invoice verified against store GRN."
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentReference: "NEFT-20260904-001"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, ordersRes] = await Promise.all([
        fetch("/api/procurement/invoices"),
        fetch("/api/procurement/purchase-orders")
      ]);

      const invData = await invRes.json();
      if (invData.success) {
        setInvoices(invData.data || []);
      }

      const ordersData = await ordersRes.json();
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err: any) {
      toast(err.message || "Failed to load purchase invoices", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectPO = (poNum: string) => {
    const po = orders.find((o) => o.poNumber === poNum);
    if (po) {
      setFormData((prev) => ({
        ...prev,
        poNumber: poNum,
        supplierName: po.supplierName,
        subTotal: po.subTotal || po.totalAmount,
        taxAmount: po.taxAmount || 0,
        totalAmount: po.totalAmount || 0,
        vendorInvoiceRef: `INV-VEND-${Math.floor(1000 + Math.random() * 9000)}`
      }));
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendorInvoiceRef || !formData.poNumber || formData.totalAmount <= 0) {
      toast("Please complete vendor bill reference and total amount", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/procurement/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Purchase Invoice ${data.data?.invoiceNumber} registered! Match status: ${data.data?.matchingStatus}`, "success");
        setIsOpen(false);
        fetchData();
      } else {
        toast(data.message || "Failed to log invoice", "error");
      }
    } catch (err: any) {
      toast(err.message || "Error creating invoice", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || paymentForm.amount <= 0) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/procurement/invoices/${selectedInvoice._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PAYMENT",
          amount: paymentForm.amount,
          paymentReference: paymentForm.paymentReference
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Payment of ₹${paymentForm.amount.toLocaleString("en-IN")} recorded successfully!`, "success");
        setIsPayOpen(false);
        fetchData();
      }
    } catch (err) {
      toast("Failed to record payment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        (inv.invoiceNumber || "").toLowerCase().includes(search.toLowerCase()) ||
        (inv.vendorInvoiceRef || "").toLowerCase().includes(search.toLowerCase()) ||
        (inv.poNumber || "").toLowerCase().includes(search.toLowerCase()) ||
        (inv.supplierName || "").toLowerCase().includes(search.toLowerCase());

      const matchesMatching = matchingFilter === "ALL" || inv.matchingStatus === matchingFilter;
      const matchesPayment = paymentFilter === "ALL" || inv.paymentStatus === paymentFilter;

      return matchesSearch && matchesMatching && matchesPayment;
    });
  }, [invoices, search, matchingFilter, paymentFilter]);

  const totalPayable = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const totalOutstanding = totalPayable - totalPaid;
  const matchedCount = invoices.filter((inv) => inv.matchingStatus === "3_WAY_MATCHED").length;
  const discrepancyCount = invoices.filter((inv) => inv.matchingStatus === "DISCREPANCY_DETECTED").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Purchase Invoices &amp; 3-Way Matching Engine
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cross-reconcile Purchase Orders, Inward Goods Receipts (GRN), and Vendor Tax Invoices; authorize accounts payable in ₹.
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
              if (orders.length > 0 && !formData.poNumber) {
                handleSelectPO(orders[0].poNumber);
              }
              setIsOpen(true);
            }}
            className="text-xs flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Register Vendor Tax Invoice
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Outstanding Payable</p>
              <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1 flex items-center">
                <IndianRupee className="h-4 w-4 mr-0.5" />
                {totalOutstanding.toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Pending vendor disbursements</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">3-Way Matched</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {matchedCount} bills
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">PO = GRN = Invoice verified</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Discrepancy Alerts</p>
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {discrepancyCount} bills
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Price / quantity variance flagged</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Settled Payments</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 flex items-center">
                <IndianRupee className="h-4 w-4 mr-0.5" />
                {totalPaid.toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Disbursed to date</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by Bill #, Vendor Invoice Ref, PO #, or Vendor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={matchingFilter}
                onChange={(e) => setMatchingFilter(e.target.value)}
              >
                <option value="ALL">All Match Statuses</option>
                <option value="3_WAY_MATCHED">3-Way Matched (Clean)</option>
                <option value="DISCREPANCY_DETECTED">Discrepancy Detected</option>
                <option value="PENDING_VERIFICATION">Pending Verification</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="UNPAID">Unpaid Invoices</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="PAID">Fully Settled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Receipt className="h-4 w-4 text-purple-600" />
            Vendor Invoices &amp; Accounts Payable Ledger ({filteredInvoices.length} entries)
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Commercial Audit
          </Badge>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Bill Code</TableHead>
                <TableHead>Vendor Bill Ref</TableHead>
                <TableHead>PO Reference</TableHead>
                <TableHead>Vendor Company</TableHead>
                <TableHead>Date / Due</TableHead>
                <TableHead className="text-right">Billed Total (₹)</TableHead>
                <TableHead className="text-right">Paid (₹)</TableHead>
                <TableHead className="text-center">3-Way Match</TableHead>
                <TableHead className="text-center">Payment Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-slate-400">
                    Loading purchase invoices...
                  </TableCell>
                </TableRow>
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10 text-slate-400">
                    No purchase invoices found. Click &quot;Register Vendor Tax Invoice&quot; to log a bill.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((inv) => {
                  const balance = (inv.totalAmount || 0) - (inv.paidAmount || 0);

                  return (
                    <TableRow key={inv._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-purple-700 dark:text-purple-400">
                        {inv.invoiceNumber}
                      </TableCell>

                      <TableCell className="font-mono font-semibold text-slate-900 dark:text-white">
                        {inv.vendorInvoiceRef}
                      </TableCell>

                      <TableCell className="font-mono text-blue-600">
                        {inv.poNumber}
                      </TableCell>

                      <TableCell className="font-semibold text-slate-900 dark:text-white">
                        {inv.supplierName}
                      </TableCell>

                      <TableCell className="text-slate-600 dark:text-slate-300">
                        <div>{new Date(inv.invoiceDate || inv.createdAt).toLocaleDateString("en-IN")}</div>
                        {inv.dueDate && (
                          <div className="text-[10px] text-slate-400">
                            Due: {new Date(inv.dueDate).toLocaleDateString("en-IN")}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-slate-900 dark:text-white">
                        ₹{(inv.totalAmount || 0).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-right font-mono text-emerald-600 font-semibold">
                        ₹{(inv.paidAmount || 0).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-bold ${
                            inv.matchingStatus === "3_WAY_MATCHED"
                              ? "border-emerald-500 text-emerald-600"
                              : inv.matchingStatus === "DISCREPANCY_DETECTED"
                              ? "border-rose-500 text-rose-600 animate-pulse"
                              : "border-slate-400 text-slate-500"
                          }`}
                        >
                          {inv.matchingStatus === "3_WAY_MATCHED" ? "MATCHED" : inv.matchingStatus === "DISCREPANCY_DETECTED" ? "DISCREPANCY" : "PENDING"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={`text-[9px] ${
                            inv.paymentStatus === "PAID"
                              ? "bg-emerald-600 text-white"
                              : inv.paymentStatus === "PARTIALLY_PAID"
                              ? "bg-amber-600 text-white"
                              : "bg-purple-600 text-white"
                          }`}
                        >
                          {inv.paymentStatus}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        {inv.paymentStatus !== "PAID" ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setPaymentForm({
                                amount: balance,
                                paymentReference: `NEFT-${Math.floor(100000 + Math.random() * 900000)}`
                              });
                              setIsPayOpen(true);
                            }}
                            className="h-6 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Pay Bill
                          </Button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Settled
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Register Invoice Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-purple-600" />
              Register Vendor Tax Invoice &amp; Execute 3-Way Match
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateInvoice} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Select Linked Purchase Order *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.poNumber}
                  onChange={(e) => handleSelectPO(e.target.value)}
                  required
                >
                  <option value="">Select PO...</option>
                  {orders.map((o) => (
                    <option key={o._id} value={o.poNumber}>
                      {o.poNumber} - {o.supplierName} (Total: ₹{o.totalAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Vendor Tax Invoice Ref # *</Label>
                <Input
                  required
                  placeholder="e.g. INV-2026-904"
                  value={formData.vendorInvoiceRef}
                  onChange={(e) => setFormData({ ...formData, vendorInvoiceRef: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Vendor Company Name</Label>
                <Input value={formData.supplierName} disabled className="text-xs bg-slate-50 dark:bg-slate-800" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Inward GRN Reference (Optional)</Label>
                <Input
                  placeholder="e.g. PGRN-20260904-01"
                  value={formData.grnNumber}
                  onChange={(e) => setFormData({ ...formData, grnNumber: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Invoice Date</Label>
                <Input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Payment Due Date</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Subtotal (₹) *</Label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={formData.subTotal}
                  onChange={(e) => {
                    const sub = Number(e.target.value);
                    const tax = formData.taxAmount;
                    setFormData({ ...formData, subTotal: sub, totalAmount: sub + tax });
                  }}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">GST Tax Amount (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.taxAmount}
                  onChange={(e) => {
                    const tax = Number(e.target.value);
                    const sub = formData.subTotal;
                    setFormData({ ...formData, taxAmount: tax, totalAmount: sub + tax });
                  }}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Gross Billed Total (₹) *</Label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                  className="text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-xs flex justify-between items-center">
              <span className="text-purple-800 dark:text-purple-200">3-Way Match Verification:</span>
              <span className="font-mono font-bold text-sm text-purple-700 dark:text-purple-300">
                Automated check against PO {formData.poNumber || "—"}
              </span>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Accounting Remarks</Label>
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
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white"
              >
                {submitting ? "Processing..." : "Commit Invoice & Reconcile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Settle Payment Dialog */}
      {selectedInvoice && (
        <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                Record Accounts Payable Settlement
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handlePayment} className="space-y-4 pt-2 text-xs">
              <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Ref:</span>
                  <span className="font-bold">{selectedInvoice.vendorInvoiceRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Supplier:</span>
                  <span className="font-semibold">{selectedInvoice.supplierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Billed:</span>
                  <span className="font-mono">₹{(selectedInvoice.totalAmount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-bold text-rose-600 pt-1 border-t">
                  <span>Balance Due:</span>
                  <span className="font-mono">
                    ₹{((selectedInvoice.totalAmount || 0) - (selectedInvoice.paidAmount || 0)).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Disbursement Amount (₹) *</Label>
                <Input
                  type="number"
                  min="1"
                  max={(selectedInvoice.totalAmount || 0) - (selectedInvoice.paidAmount || 0)}
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Bank Transfer UTR / Cheque Reference *</Label>
                <Input
                  required
                  value={paymentForm.paymentReference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })}
                  placeholder="e.g. NEFT/RTGS-10928371"
                  className="text-xs font-mono"
                />
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPayOpen(false)}
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
                  {submitting ? "Settling..." : "Confirm Payment Disbursement"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
