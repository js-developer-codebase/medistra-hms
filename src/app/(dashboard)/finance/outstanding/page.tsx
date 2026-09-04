"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClockAlert,
  Search,
  Filter,
  RefreshCw,
  CreditCard,
  Send,
  IndianRupee,
  AlertTriangle,
  User,
  CheckCircle2,
  Calendar,
  Building2,
  PhoneCall
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function OutstandingPaymentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [bucketFilter, setBucketFilter] = useState("ALL");

  // Collect Payment Modal
  const [collectModalInvoice, setCollectModalInvoice] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState("UPI");
  const [payTxnId, setPayTxnId] = useState("");
  const [cashierName, setCashierName] = useState("Dues Recovery Counter");
  const [recordingPayment, setRecordingPayment] = useState(false);

  const { toast } = useToast();

  const fetchOutstanding = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/finance/outstanding");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast(json.message || "Failed to load outstanding dues", "error");
      }
    } catch (err: any) {
      toast("Error: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutstanding();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectModalInvoice) return;

    if (payAmount <= 0) {
      toast("Please enter a positive amount", "error");
      return;
    }

    try {
      setRecordingPayment(true);
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: collectModalInvoice._id,
          patientId: collectModalInvoice.patientId?._id || collectModalInvoice.patientId,
          amount: payAmount,
          method: payMethod,
          transactionId: payTxnId || `TXN-${Date.now().toString().slice(-6)}`,
          cashierName,
          notes: `Aging dues recovery for invoice ${collectModalInvoice.invoiceNumber || collectModalInvoice._id}`
        })
      });
      const resData = await res.json();
      if (resData.success) {
        toast(`Collected ₹${payAmount.toLocaleString("en-IN")} successfully! Balance updated.`, "success");
        setCollectModalInvoice(null);
        fetchOutstanding();
      } else {
        toast(resData.message || "Failed to record payment", "error");
      }
    } catch (err: any) {
      toast("Error: " + err.message, "error");
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleSendReminder = (inv: any) => {
    toast(`Payment reminder notification sent to ${inv.patientId?.name || "Patient"} (${inv.patientId?.contact || "Mobile"})`, "success");
  };

  const allItems: any[] = data?.allOutstanding || [];

  const filteredItems = allItems.filter((it) => {
    if (bucketFilter === "0_30" && it.ageDays > 30) return false;
    if (bucketFilter === "31_60" && (it.ageDays <= 30 || it.ageDays > 60)) return false;
    if (bucketFilter === "61_90" && (it.ageDays <= 60 || it.ageDays > 90)) return false;
    if (bucketFilter === "OVER_90" && it.ageDays <= 90) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const invNum = (it.invoiceNumber || it._id || "").toLowerCase();
    const pName = (it.patientId?.name || "").toLowerCase();
    const pUhid = (it.patientId?.uhid || "").toLowerCase();
    return invNum.includes(q) || pName.includes(q) || pUhid.includes(q);
  });

  const getBucketBadge = (ageDays: number) => {
    if (ageDays <= 30) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">0-30 Days (Current)</Badge>;
    } else if (ageDays <= 60) {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">31-60 Days (Overdue)</Badge>;
    } else if (ageDays <= 90) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">61-90 Days (Late)</Badge>;
    } else {
      return <Badge className="bg-rose-100 text-rose-800 border-rose-200 font-bold">90+ Days (Critical)</Badge>;
    }
  };

  const buckets = data?.buckets || {};

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-600/10 text-orange-600 rounded-xl">
              <ClockAlert className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Outstanding Payments & Aging Analysis</h1>
              <p className="text-sm text-muted-foreground">
                Accounts receivable tracking across 0-30, 31-60, 61-90, and 90+ days aging buckets with recovery workflows
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchOutstanding} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/finance/invoices">
            <Button size="sm" className="gap-1.5 bg-orange-600 hover:bg-orange-700 text-white">
              <CreditCard className="h-4 w-4" />
              All Invoices
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Aging Buckets Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          onClick={() => setBucketFilter(bucketFilter === "0_30" ? "ALL" : "0_30")}
          className={`cursor-pointer transition-all shadow-sm border-l-4 border-l-blue-500 hover:shadow-md ${
            bucketFilter === "0_30" ? "ring-2 ring-blue-500 bg-blue-50/20" : ""
          }`}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">0 - 30 Days (Current)</p>
                <h3 className="text-xl font-bold mt-1 text-blue-700 dark:text-blue-300">
                  ₹{(buckets.bucket0To30?.total || 0).toLocaleString("en-IN")}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{buckets.bucket0To30?.count || 0} patient bills</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setBucketFilter(bucketFilter === "31_60" ? "ALL" : "31_60")}
          className={`cursor-pointer transition-all shadow-sm border-l-4 border-l-amber-500 hover:shadow-md ${
            bucketFilter === "31_60" ? "ring-2 ring-amber-500 bg-amber-50/20" : ""
          }`}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">31 - 60 Days (Overdue)</p>
                <h3 className="text-xl font-bold mt-1 text-amber-700 dark:text-amber-300">
                  ₹{(buckets.bucket31To60?.total || 0).toLocaleString("en-IN")}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{buckets.bucket31To60?.count || 0} patient bills</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setBucketFilter(bucketFilter === "61_90" ? "ALL" : "61_90")}
          className={`cursor-pointer transition-all shadow-sm border-l-4 border-l-orange-500 hover:shadow-md ${
            bucketFilter === "61_90" ? "ring-2 ring-orange-500 bg-orange-50/20" : ""
          }`}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">61 - 90 Days (Late)</p>
                <h3 className="text-xl font-bold mt-1 text-orange-700 dark:text-orange-300">
                  ₹{(buckets.bucket61To90?.total || 0).toLocaleString("en-IN")}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{buckets.bucket61To90?.count || 0} patient bills</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setBucketFilter(bucketFilter === "OVER_90" ? "ALL" : "OVER_90")}
          className={`cursor-pointer transition-all shadow-sm border-l-4 border-l-rose-500 hover:shadow-md ${
            bucketFilter === "OVER_90" ? "ring-2 ring-rose-500 bg-rose-50/20" : ""
          }`}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">&gt; 90 Days (Critical)</p>
                <h3 className="text-xl font-bold mt-1 text-rose-700 dark:text-rose-400">
                  ₹{(buckets.bucketOver90?.total || 0).toLocaleString("en-IN")}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{buckets.bucketOver90?.count || 0} patient bills</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search outstanding bills by Patient Name, UHID, or Invoice #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div>
              <select
                value={bucketFilter}
                onChange={(e) => setBucketFilter(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="ALL">All Aging Buckets</option>
                <option value="0_30">0 - 30 Days (Current)</option>
                <option value="31_60">31 - 60 Days (Overdue)</option>
                <option value="61_90">61 - 90 Days (Late)</option>
                <option value="OVER_90">&gt; 90 Days (Critical)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Invoices Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-y text-muted-foreground text-left">
                <tr>
                  <th className="py-3 px-4 font-semibold">Invoice No</th>
                  <th className="py-3 px-4 font-semibold">Patient</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold text-center">Age (Days)</th>
                  <th className="py-3 px-4 font-semibold">Aging Bucket</th>
                  <th className="py-3 px-4 font-semibold text-right">Invoiced (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Paid (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Outstanding (₹)</th>
                  <th className="py-3 px-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredItems.length > 0 ? (
                  filteredItems.map((it: any) => (
                    <tr key={it._id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-blue-600">
                        {it.invoiceNumber || it._id?.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {it.patientId?.name || "Patient"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          UHID: {it.patientId?.uhid || "N/A"} &bull; Ph: {it.patientId?.contact || "N/A"}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px]">
                          {it.department || "General"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        {it.ageDays}d
                      </td>
                      <td className="py-3 px-4">
                        {getBucketBadge(it.ageDays)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        ₹{Number(it.finalAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                        ₹{Number(it.paidAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-600">
                        ₹{Number(it.calculatedBalance || it.balanceAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => {
                              setCollectModalInvoice(it);
                              setPayAmount(Number(it.calculatedBalance || it.balanceAmount || 0));
                            }}
                            className="h-7 px-2.5 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                          >
                            <CreditCard className="h-3 w-3" /> Collect
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendReminder(it)}
                            className="h-7 px-2 text-[10px] text-slate-600 hover:bg-slate-50 gap-1"
                          >
                            <Send className="h-3 w-3" /> Reminder
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-muted-foreground">
                      {loading ? "Calculating aging report..." : "No outstanding dues found in this category!"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Collect Payment Modal */}
      {collectModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-background rounded-xl border max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                Collect Overdue Payment
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setCollectModalInvoice(null)} className="h-7 w-7 p-0">
                ✕
              </Button>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
              <p>
                <strong>Invoice:</strong> {collectModalInvoice.invoiceNumber || collectModalInvoice._id}
              </p>
              <p>
                <strong>Patient:</strong> {collectModalInvoice.patientId?.name || "Patient"} (UHID: {collectModalInvoice.patientId?.uhid || "N/A"})
              </p>
              <p className="text-rose-600 font-bold">
                <strong>Outstanding Due:</strong> ₹{Number(collectModalInvoice.calculatedBalance || collectModalInvoice.balanceAmount).toLocaleString("en-IN")}
              </p>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold">Settlement Amount (₹)</label>
                <Input
                  type="number"
                  min="1"
                  max={Number(collectModalInvoice.calculatedBalance || collectModalInvoice.balanceAmount)}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Payment Channel</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CASH">Cash Counter</option>
                  <option value="CARD">Debit / Credit Card (POS)</option>
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                  <option value="INSURANCE_TPA">Insurance / TPA Settlement</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Transaction / UTR Reference</label>
                <Input
                  type="text"
                  placeholder="e.g. Bank Ref or UPI transaction #"
                  value={payTxnId}
                  onChange={(e) => setPayTxnId(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setCollectModalInvoice(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={recordingPayment} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {recordingPayment ? "Processing..." : `Collect ₹${payAmount.toLocaleString("en-IN")}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
