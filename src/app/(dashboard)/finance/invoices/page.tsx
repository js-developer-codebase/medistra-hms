"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Filter,
  Plus,
  Printer,
  CreditCard,
  XCircle,
  Eye,
  RefreshCw,
  IndianRupee,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");

  // View / Print Invoice Modal
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Record Payment Modal
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState("UPI");
  const [payTxnId, setPayTxnId] = useState("");
  const [cashierName, setCashierName] = useState("Main Billing Counter");
  const [recordingPayment, setRecordingPayment] = useState(false);

  const { toast } = useToast();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/invoice");
      const data = await res.json();
      if (data.success) {
        setInvoices(data.data || []);
      } else {
        toast(data.message || "Failed to fetch invoices", "error");
      }
    } catch (err: any) {
      toast("Error fetching invoices: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;

    if (payAmount <= 0) {
      toast("Payment amount must be greater than 0", "error");
      return;
    }

    try {
      setRecordingPayment(true);
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: paymentModalInvoice._id,
          patientId: paymentModalInvoice.patientId?._id || paymentModalInvoice.patientId,
          amount: payAmount,
          method: payMethod,
          transactionId: payTxnId || `TXN-${Date.now().toString().slice(-6)}`,
          cashierName,
          notes: `Settlement for invoice ${paymentModalInvoice.invoiceNumber || paymentModalInvoice._id}`
        })
      });

      const data = await res.json();
      if (data.success) {
        toast("Payment recorded successfully! Receipt generated.", "success");
        setPaymentModalInvoice(null);
        fetchInvoices();
      } else {
        toast(data.message || "Failed to record payment", "error");
      }
    } catch (err: any) {
      toast("Error: " + err.message, "error");
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleCancelInvoice = async (invoiceId: string) => {
    if (!confirm("Are you sure you want to void/cancel this invoice?")) return;
    try {
      const res = await fetch(`/api/invoice/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" })
      });
      const data = await res.json();
      if (data.success) {
        toast("Invoice marked as CANCELLED", "success");
        fetchInvoices();
      } else {
        toast(data.message || "Failed to cancel invoice", "error");
      }
    } catch (err: any) {
      toast("Error cancelling invoice: " + err.message, "error");
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    // Status Filter
    if (statusFilter !== "ALL" && inv.status !== statusFilter) return false;
    // Department Filter
    if (departmentFilter !== "ALL" && inv.department !== departmentFilter) return false;
    // Search Query
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const invNum = (inv.invoiceNumber || inv._id || "").toLowerCase();
    const pName = (inv.patientId?.name || "").toLowerCase();
    const pUhid = (inv.patientId?.uhid || "").toLowerCase();
    return invNum.includes(q) || pName.includes(q) || pUhid.includes(q);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">PAID</Badge>;
      case "PARTIALLY_PAID":
        return <Badge className="bg-amber-500 text-white hover:bg-amber-600">PARTIAL</Badge>;
      case "CANCELLED":
        return <Badge variant="secondary" className="text-slate-500">CANCELLED</Badge>;
      default:
        return <Badge variant="destructive">UNPAID</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 text-blue-600 rounded-xl">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Patient Invoices Directory</h1>
              <p className="text-sm text-muted-foreground">
                Search, inspect tax invoices, collect dues & reprint official hospital billing statements
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchInvoices} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/finance/invoice/create">
            <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by Invoice Number, Patient Name, or UHID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="PAID">PAID</option>
                <option value="UNPAID">UNPAID</option>
                <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="ALL">All Departments</option>
                <option value="OPD Consultation">OPD Consultation</option>
                <option value="Emergency & Trauma">Emergency & Trauma</option>
                <option value="Inpatient (IPD)">Inpatient (IPD)</option>
                <option value="Diagnostic Laboratory">Diagnostic Laboratory</option>
                <option value="Radiology & Imaging">Radiology & Imaging</option>
                <option value="Pharmacy Counter">Pharmacy Counter</option>
                <option value="Operation Theatre (OT)">Operation Theatre (OT)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-y text-muted-foreground text-left">
                <tr>
                  <th className="py-3 px-4 font-semibold">Invoice No</th>
                  <th className="py-3 px-4 font-semibold">Patient</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold text-right">Gross (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Discount (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Net Payable (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Balance Due (₹)</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Date</th>
                  <th className="py-3 px-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv: any) => {
                    const finalAmt = Number(inv.finalAmount || 0);
                    const paidAmt = Number(inv.paidAmount || (inv.status === "PAID" ? finalAmt : 0));
                    const balance = Number(inv.balanceAmount ?? (finalAmt - paidAmt));

                    return (
                      <tr key={inv._id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-bold text-blue-600">
                          {inv.invoiceNumber || inv._id?.slice(-8).toUpperCase()}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {inv.patientId?.name || "OPD Patient"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            UHID: {inv.patientId?.uhid || "N/A"} &bull; Ph: {inv.patientId?.contact || "N/A"}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-[10px] font-normal">
                            {inv.department || "General"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          ₹{Number(inv.totalAmount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-right text-rose-600">
                          -₹{Number(inv.discount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                          ₹{finalAmt.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-right font-bold">
                          {balance > 0 ? (
                            <span className="text-amber-600">₹{balance.toLocaleString("en-IN")}</span>
                          ) : (
                            <span className="text-emerald-600">₹0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(inv.status)}
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground">
                          {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("en-IN", { month: 'short', day: 'numeric', year: 'numeric' }) : "-"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="View Tax Invoice"
                              onClick={() => setSelectedInvoice(inv)}
                              className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>

                            {balance > 0 && inv.status !== "CANCELLED" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Collect Payment"
                                onClick={() => {
                                  setPaymentModalInvoice(inv);
                                  setPayAmount(balance);
                                }}
                                className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-50"
                              >
                                <CreditCard className="h-3.5 w-3.5" />
                              </Button>
                            )}

                            {inv.status !== "CANCELLED" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Cancel Invoice"
                                onClick={() => handleCancelInvoice(inv._id)}
                                className="h-7 w-7 p-0 text-rose-500 hover:bg-rose-50"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-muted-foreground">
                      {loading ? "Loading invoices..." : "No invoices matched your filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tax Invoice View / Print Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-background rounded-xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">MEDISTRA HEALTHCARE SYSTEM</h2>
                <p className="text-xs text-muted-foreground">12 Medical Enclave, Central Avenue, Kolkata &bull; GSTIN: 19AAECM0123M1Z5</p>
                <p className="text-xs font-semibold text-emerald-600 mt-1">OFFICIAL PATIENT TAX INVOICE</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(null)} className="h-8 w-8 p-0">
                ✕
              </Button>
            </div>

            {/* Patient & Invoice Meta */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-muted/40 p-4 rounded-lg border">
              <div>
                <p className="text-muted-foreground">Patient Name:</p>
                <p className="font-bold text-sm text-slate-900 dark:text-white">
                  {selectedInvoice.patientId?.name || "Walk-in Patient"}
                </p>
                <p className="text-muted-foreground mt-1">UHID: {selectedInvoice.patientId?.uhid || "N/A"}</p>
                <p className="text-muted-foreground">Mobile: {selectedInvoice.patientId?.contact || "N/A"}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Invoice Number:</p>
                <p className="font-bold text-sm text-blue-600">
                  {selectedInvoice.invoiceNumber || selectedInvoice._id}
                </p>
                <p className="text-muted-foreground mt-1">
                  Date: {new Date(selectedInvoice.createdAt || Date.now()).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-muted-foreground">Department: {selectedInvoice.department || "General"}</p>
                <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted text-muted-foreground border-b text-left">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Service / Description</th>
                    <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Discount (₹)</th>
                    <th className="py-2.5 px-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedInvoice.items?.map((it: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 text-muted-foreground">{idx + 1}</td>
                      <td className="py-2 px-3 font-medium">{it.name}</td>
                      <td className="py-2 px-3 text-right">₹{Number(it.price || 0).toLocaleString("en-IN")}</td>
                      <td className="py-2 px-3 text-center">{it.quantity}</td>
                      <td className="py-2 px-3 text-right text-rose-600">-₹{Number(it.discount || 0).toLocaleString("en-IN")}</td>
                      <td className="py-2 px-3 text-right font-semibold">₹{Number(it.total || 0).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-1.5 border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gross Amount:</span>
                  <span className="font-medium">₹{Number(selectedInvoice.totalAmount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Concessions / Discount:</span>
                  <span>-₹{Number(selectedInvoice.discount || 0).toLocaleString("en-IN")}</span>
                </div>
                {selectedInvoice.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST Taxes:</span>
                    <span>+₹{Number(selectedInvoice.taxAmount || 0).toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1 border-t">
                  <span>Net Payable:</span>
                  <span className="text-slate-900 dark:text-white">₹{Number(selectedInvoice.finalAmount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Paid Amount:</span>
                  <span>₹{Number(selectedInvoice.paidAmount || (selectedInvoice.status === "PAID" ? selectedInvoice.finalAmount : 0)).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-bold text-amber-600 border-t pt-1">
                  <span>Balance Due:</span>
                  <span>₹{Number(selectedInvoice.balanceAmount || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center border-t pt-4">
              <p className="text-[10px] text-muted-foreground">Computer-generated hospital invoice. No physical signature required.</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs">
                  <Printer className="h-3.5 w-3.5" /> Print Invoice
                </Button>
                <Button size="sm" onClick={() => setSelectedInvoice(null)} className="text-xs">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-background rounded-xl border max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                Record Payment
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setPaymentModalInvoice(null)} className="h-7 w-7 p-0">
                ✕
              </Button>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
              <p>
                <strong>Invoice:</strong> {paymentModalInvoice.invoiceNumber || paymentModalInvoice._id}
              </p>
              <p>
                <strong>Patient:</strong> {paymentModalInvoice.patientId?.name || "Patient"} (UHID: {paymentModalInvoice.patientId?.uhid || "N/A"})
              </p>
              <p>
                <strong>Total Amount:</strong> ₹{Number(paymentModalInvoice.finalAmount).toLocaleString("en-IN")}
              </p>
              <p className="text-amber-600 font-bold">
                <strong>Pending Balance:</strong> ₹{Number(paymentModalInvoice.balanceAmount || paymentModalInvoice.finalAmount).toLocaleString("en-IN")}
              </p>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold">Settlement Amount (₹)</label>
                <Input
                  type="number"
                  min="1"
                  max={Number(paymentModalInvoice.balanceAmount || paymentModalInvoice.finalAmount)}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CASH">Cash Counter</option>
                  <option value="CARD">Debit / Credit Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                  <option value="INSURANCE_TPA">Insurance / TPA Settlement</option>
                  <option value="CHEQUE">Cheque / Demand Draft</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Transaction / Reference ID (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g. UPI Ref # or Card Slip #"
                  value={payTxnId}
                  onChange={(e) => setPayTxnId(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Cashier Name</label>
                <Input
                  type="text"
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setPaymentModalInvoice(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={recordingPayment} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {recordingPayment ? "Saving..." : `Collect ₹${payAmount.toLocaleString("en-IN")}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
