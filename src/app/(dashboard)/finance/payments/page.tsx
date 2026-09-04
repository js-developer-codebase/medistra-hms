"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Receipt,
  IndianRupee,
  CheckCircle2,
  Calendar,
  Building2,
  ArrowRight,
  Printer
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function PaymentsLedgerPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");

  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const { toast } = useToast();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payment");
      const data = await res.json();
      if (data.success) {
        setPayments(data.data || []);
      } else {
        toast(data.message || "Failed to fetch payments", "error");
      }
    } catch (err: any) {
      toast("Error fetching payments: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((p) => {
    if (methodFilter !== "ALL" && p.method !== methodFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const pName = (p.patientId?.name || "").toLowerCase();
    const pUhid = (p.patientId?.uhid || "").toLowerCase();
    const recNum = (p.receiptNumber || "").toLowerCase();
    const txnId = (p.transactionId || "").toLowerCase();
    return pName.includes(q) || pUhid.includes(q) || recNum.includes(q) || txnId.includes(q);
  });

  // Calculate totals
  const totalAmount = filteredPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "UPI":
        return <Badge className="bg-teal-600 text-white">UPI / QR</Badge>;
      case "CASH":
        return <Badge className="bg-emerald-600 text-white">CASH</Badge>;
      case "CARD":
        return <Badge className="bg-blue-600 text-white">CARD (POS)</Badge>;
      case "BANK_TRANSFER":
        return <Badge className="bg-indigo-600 text-white">BANK NEFT</Badge>;
      case "INSURANCE_TPA":
        return <Badge className="bg-purple-600 text-white">TPA CLAIM</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-600/10 text-teal-600 rounded-xl">
              <CreditCard className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Payments Ledger</h1>
              <p className="text-sm text-muted-foreground">
                Live transactional audit trail of all patient payments, POS slips & cashier reconciliations
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchPayments} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/finance/invoices">
            <Button size="sm" className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white">
              <Receipt className="h-4 w-4" />
              Collect from Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter & Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-3 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by Patient Name, UHID, Receipt #, or Transaction Ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
              <div>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="ALL">All Payment Methods</option>
                  <option value="CASH">Cash Counter</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                  <option value="INSURANCE_TPA">Insurance / TPA</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-teal-600">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Filtered Collections</p>
            <h3 className="text-xl font-bold text-teal-700 dark:text-teal-300 mt-0.5">
              ₹{totalAmount.toLocaleString("en-IN")}
            </h3>
            <p className="text-[11px] text-muted-foreground">{filteredPayments.length} transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-y text-muted-foreground text-left">
                <tr>
                  <th className="py-3 px-4 font-semibold">Receipt No</th>
                  <th className="py-3 px-4 font-semibold">Patient</th>
                  <th className="py-3 px-4 font-semibold">Invoice Ref</th>
                  <th className="py-3 px-4 font-semibold">Payment Method</th>
                  <th className="py-3 px-4 font-semibold">Transaction / UTR ID</th>
                  <th className="py-3 px-4 font-semibold">Cashier</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Date & Time</th>
                  <th className="py-3 px-4 font-semibold text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((p: any) => (
                    <tr key={p._id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-teal-700 dark:text-teal-300">
                        {p.receiptNumber || `REC-${p._id?.slice(-6).toUpperCase()}`}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {p.patientId?.name || "OPD Patient"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          UHID: {p.patientId?.uhid || "N/A"}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-blue-600 font-medium">
                        {p.invoiceId?.invoiceNumber || p.invoiceId?._id?.slice(-8).toUpperCase() || "General Advance"}
                      </td>
                      <td className="py-3 px-4">
                        {getMethodBadge(p.method)}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                        {p.transactionId || "OFFLINE-CASH"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {p.cashierName || "Main Billing Counter"}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{Number(p.amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {p.date ? new Date(p.date).toLocaleString("en-IN", { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReceipt(p)}
                          className="h-7 w-7 p-0 text-teal-600 hover:bg-teal-50"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-muted-foreground">
                      {loading ? "Loading payments..." : "No payment records found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-background rounded-xl border max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">MEDISTRA HEALTHCARE SYSTEM</h3>
                <p className="text-[11px] text-muted-foreground">12 Medical Enclave, Central Avenue &bull; Ph: +91 11 2345 6789</p>
                <p className="text-xs font-semibold text-teal-600 mt-1">OFFICIAL MONEY RECEIPT</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedReceipt(null)} className="h-7 w-7 p-0">
                ✕
              </Button>
            </div>

            <div className="bg-muted/40 p-3.5 rounded-lg border text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receipt Number:</span>
                <span className="font-bold text-teal-700">{selectedReceipt.receiptNumber || selectedReceipt._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time:</span>
                <span>{new Date(selectedReceipt.date || Date.now()).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient Name:</span>
                <span className="font-semibold">{selectedReceipt.patientId?.name || "Patient"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">UHID:</span>
                <span>{selectedReceipt.patientId?.uhid || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Mode:</span>
                <span className="font-semibold">{selectedReceipt.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction Ref:</span>
                <span className="font-mono">{selectedReceipt.transactionId || "N/A"}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 rounded-lg flex items-center justify-between text-emerald-900 dark:text-emerald-200">
              <span className="font-semibold text-sm">Total Received Amount:</span>
              <span className="font-bold text-xl">₹{Number(selectedReceipt.amount).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-muted-foreground border-t pt-3">
              <span>Cashier: {selectedReceipt.cashierName || "Main Billing Counter"}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1 text-xs">
                  <Printer className="h-3 w-3" /> Print
                </Button>
                <Button size="sm" onClick={() => setSelectedReceipt(null)} className="text-xs">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
