"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Receipt,
  Search,
  Printer,
  Download,
  Eye,
  RefreshCw,
  IndianRupee,
  Building2,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  User
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function PaymentReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const { toast } = useToast();

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/finance/receipts");
      const data = await res.json();
      if (data.success) {
        setReceipts(data.data || []);
      } else {
        toast(data.message || "Failed to fetch payment receipts", "error");
      }
    } catch (err: any) {
      toast("Error: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const filteredReceipts = receipts.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const rNum = (r.receiptNumber || "").toLowerCase();
    const pName = (r.patientId?.name || "").toLowerCase();
    const pUhid = (r.patientId?.uhid || "").toLowerCase();
    const invNum = (r.invoiceId?.invoiceNumber || "").toLowerCase();
    return rNum.includes(q) || pName.includes(q) || pUhid.includes(q) || invNum.includes(q);
  });

  const totalReceiptsAmount = filteredReceipts.reduce((sum, r) => sum + Number(r.amount || 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/10 text-indigo-600 rounded-xl">
              <Receipt className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Payment Receipts Register</h1>
              <p className="text-sm text-muted-foreground">
                Official hospital money receipts (REC-XXXX) with verification stamps, breakdown of charges & print dispatch
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchReceipts} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/finance/invoices">
            <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Receipt className="h-4 w-4" />
              Issue New Receipt
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Receipts Issued</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{filteredReceipts.length}</h3>
            <p className="text-[11px] text-muted-foreground">Across all hospital desks</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-indigo-600">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Value Collected</p>
            <h3 className="text-2xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">
              ₹{totalReceiptsAmount.toLocaleString("en-IN")}
            </h3>
            <p className="text-[11px] text-muted-foreground">Settled in Indian Rupees</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Hospital Compliance</p>
            <h3 className="text-2xl font-bold mt-1 text-emerald-600">100% Audited</h3>
            <p className="text-[11px] text-muted-foreground">Tax compliant & auto-stamped</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search receipts by Receipt No (REC-XXXX), Patient Name, UHID, or Invoice No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Receipts Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-y text-muted-foreground text-left">
                <tr>
                  <th className="py-3 px-4 font-semibold">Receipt No</th>
                  <th className="py-3 px-4 font-semibold">Date & Time</th>
                  <th className="py-3 px-4 font-semibold">Patient Name</th>
                  <th className="py-3 px-4 font-semibold">UHID</th>
                  <th className="py-3 px-4 font-semibold">Invoice No</th>
                  <th className="py-3 px-4 font-semibold">Payment Mode</th>
                  <th className="py-3 px-4 font-semibold">Cashier</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount Received (₹)</th>
                  <th className="py-3 px-4 font-semibold text-center">Print / View</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredReceipts.length > 0 ? (
                  filteredReceipts.map((r: any) => (
                    <tr key={r._id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-indigo-700 dark:text-indigo-300">
                        {r.receiptNumber || `REC-${r._id?.slice(-6).toUpperCase()}`}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {r.date ? new Date(r.date).toLocaleString("en-IN", { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {r.patientId?.name || "OPD Patient"}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                        {r.patientId?.uhid || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-blue-600 font-medium">
                        {r.invoiceId?.invoiceNumber || r.invoiceId?._id?.slice(-8).toUpperCase() || "Advance"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px]">
                          {r.method}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {r.cashierName || "Central Counter"}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{Number(r.amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReceipt(r)}
                          className="h-7 w-7 p-0 text-indigo-600 hover:bg-indigo-50"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-muted-foreground">
                      {loading ? "Loading receipts..." : "No receipts found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Official Money Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-background rounded-xl border max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">MEDISTRA HEALTHCARE SYSTEM</h2>
                <p className="text-xs text-muted-foreground">12 Medical Enclave, Central Avenue, Kolkata &bull; Phone: +91 11 2345 6789</p>
                <div className="inline-block mt-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-md border border-indigo-200">
                  OFFICIAL MONEY RECEIPT
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedReceipt(null)} className="h-8 w-8 p-0">
                ✕
              </Button>
            </div>

            {/* Receipt Meta */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-muted/30 p-4 rounded-lg border">
              <div>
                <p className="text-muted-foreground">Receipt Number:</p>
                <p className="font-bold text-indigo-700 text-sm">{selectedReceipt.receiptNumber || selectedReceipt._id}</p>
                <p className="text-muted-foreground mt-2">Date & Time:</p>
                <p className="font-medium">{new Date(selectedReceipt.date || Date.now()).toLocaleString("en-IN")}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Original Invoice Ref:</p>
                <p className="font-bold text-blue-600">{selectedReceipt.invoiceId?.invoiceNumber || "OPD ADVANCE"}</p>
                <p className="text-muted-foreground mt-2">Payment Method:</p>
                <p className="font-medium">{selectedReceipt.method} {selectedReceipt.transactionId ? `(${selectedReceipt.transactionId})` : ""}</p>
              </div>
            </div>

            {/* Patient Details */}
            <div className="border rounded-lg p-4 space-y-2 text-xs">
              <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Received With Thanks From:</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground">Patient Name:</p>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedReceipt.patientId?.name || "Walk-in Patient"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">UHID Number:</p>
                  <p className="font-mono font-bold text-emerald-600">{selectedReceipt.patientId?.uhid || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Age / Gender:</p>
                  <p>{selectedReceipt.patientId?.age || "N/A"} Years / {selectedReceipt.patientId?.gender || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Contact Mobile:</p>
                  <p>{selectedReceipt.patientId?.contact || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Total Paid Highlight */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 rounded-lg flex items-center justify-between text-emerald-900 dark:text-emerald-200">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider">Amount Received (in Indian Rupees):</p>
                <p className="text-2xl font-bold">₹{Number(selectedReceipt.amount).toLocaleString("en-IN")}</p>
              </div>
              <div className="text-right">
                <Badge className="bg-emerald-600 text-white">SETTLED IN FULL</Badge>
              </div>
            </div>

            {/* Signatures & Seal */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t text-xs">
              <div>
                <p className="text-muted-foreground">Cashier / Collector:</p>
                <p className="font-medium mt-1">{selectedReceipt.cashierName || "Central Billing Desk"}</p>
                <p className="text-[10px] text-muted-foreground">Terminal ID: MED-TERM-01</p>
              </div>
              <div className="text-right">
                <div className="inline-block border-b-2 border-slate-400 w-32 mb-1"></div>
                <p className="font-semibold text-[11px]">Authorized Signatory</p>
                <p className="text-[10px] text-muted-foreground">Medistra Accounts Division</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center border-t pt-4">
              <p className="text-[10px] text-muted-foreground">Original Patient Copy</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs">
                  <Printer className="h-3.5 w-3.5" /> Print Receipt
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
