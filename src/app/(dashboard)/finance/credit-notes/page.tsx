"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Search,
  Plus,
  RefreshCw,
  Printer,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Building2,
  Calendar
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function CreditNotesPage() {
  const [creditNotes, setCreditNotes] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<any>(null);

  // Issue Credit Note Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [creditReason, setCreditReason] = useState("BILLING_ERROR");
  const [description, setDescription] = useState("Correction for duplicate test item charged");
  const [issuedBy, setIssuedBy] = useState("Accounts Superintendent");
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  const fetchCreditNotes = async () => {
    try {
      setLoading(true);
      const [cnRes, invRes] = await Promise.all([
        fetch("/api/finance/credit-notes"),
        fetch("/api/invoice")
      ]);
      const cnData = await cnRes.json();
      const invData = await invRes.json();

      if (cnData.success) setCreditNotes(cnData.data || []);
      if (invData.success) {
        setInvoices(invData.data || []);
        if (invData.data?.length > 0) {
          setSelectedInvoiceId(invData.data[0]._id);
          setCreditAmount(invData.data[0].finalAmount || 500);
        }
      }
    } catch (err: any) {
      toast("Error fetching credit notes: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditNotes();
  }, []);

  const handleCreateCreditNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find((i) => i._id === selectedInvoiceId);
    if (!inv || creditAmount <= 0) {
      toast("Please select a valid invoice and positive credit amount", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/finance/credit-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: inv._id,
          patientId: inv.patientId?._id || inv.patientId,
          amount: creditAmount,
          reason: creditReason,
          description,
          issuedBy
        })
      });
      const data = await res.json();
      if (data.success) {
        toast("Credit Note issued successfully!", "success");
        setShowCreateModal(false);
        fetchCreditNotes();
      } else {
        toast(data.message || "Failed to issue credit note", "error");
      }
    } catch (err: any) {
      toast("Error: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNotes = creditNotes.filter((cn) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const cnNum = (cn.creditNoteNumber || "").toLowerCase();
    const pName = (cn.patientId?.name || "").toLowerCase();
    const invNum = (cn.invoiceId?.invoiceNumber || "").toLowerCase();
    return cnNum.includes(q) || pName.includes(q) || invNum.includes(q);
  });

  const totalCreditAmount = filteredNotes.reduce((sum, cn) => sum + Number(cn.amount || 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-600/10 text-violet-600 rounded-xl">
              <FileCheck2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Credit Notes & Adjustments</h1>
              <p className="text-sm text-muted-foreground">
                Official credit note issuance (CN-XXXX) for post-billing amendments, returned meds & billing corrections
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchCreditNotes} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-1.5 bg-violet-600 hover:bg-violet-700 text-white">
            <Plus className="h-4 w-4" />
            Issue Credit Note
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm border-l-4 border-l-violet-600">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Credited Value</p>
            <h3 className="text-2xl font-bold text-violet-700 dark:text-violet-400 mt-1">
              ₹{totalCreditAmount.toLocaleString("en-IN")}
            </h3>
            <p className="text-[11px] text-muted-foreground">Adjusted against patient bills</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Credit Notes Issued</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {creditNotes.length}
            </h3>
            <p className="text-[11px] text-muted-foreground">Official documents registered</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Audited Adjustments</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">100% Tax Compliant</h3>
            <p className="text-[11px] text-muted-foreground">Linked with original GST invoice</p>
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
              placeholder="Search by Credit Note No (CN-XXXX), Patient Name, or Invoice Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Credit Notes Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-y text-muted-foreground text-left">
                <tr>
                  <th className="py-3 px-4 font-semibold">Credit Note No</th>
                  <th className="py-3 px-4 font-semibold">Original Invoice</th>
                  <th className="py-3 px-4 font-semibold">Patient</th>
                  <th className="py-3 px-4 font-semibold">Reason</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold text-right">Credit Amount (₹)</th>
                  <th className="py-3 px-4 font-semibold">Issued By</th>
                  <th className="py-3 px-4 font-semibold text-right">Date</th>
                  <th className="py-3 px-4 font-semibold text-center">Print / View</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredNotes.length > 0 ? (
                  filteredNotes.map((cn: any) => (
                    <tr key={cn._id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-violet-700 dark:text-violet-400">
                        {cn.creditNoteNumber}
                      </td>
                      <td className="py-3 px-4 text-blue-600 font-medium">
                        {cn.invoiceId?.invoiceNumber || cn.invoiceId?._id?.slice(-8).toUpperCase() || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {cn.patientId?.name || "Patient"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          UHID: {cn.patientId?.uhid || "N/A"}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px]">
                          {cn.reason.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-muted-foreground">
                        {cn.description}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-violet-700 dark:text-violet-300">
                        ₹{Number(cn.amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {cn.issuedBy}
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {cn.createdAt ? new Date(cn.createdAt).toLocaleDateString("en-IN", { month: 'short', day: 'numeric' }) : "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedNote(cn)}
                          className="h-7 w-7 p-0 text-violet-600 hover:bg-violet-50"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-muted-foreground">
                      {loading ? "Loading credit notes..." : "No credit notes issued."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Issue Credit Note Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-background rounded-xl border max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-violet-600" />
                Issue Credit Note
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)} className="h-7 w-7 p-0">
                ✕
              </Button>
            </div>

            <form onSubmit={handleCreateCreditNote} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold">Select Target Invoice</label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    setSelectedInvoiceId(e.target.value);
                    const matched = invoices.find((i) => i._id === e.target.value);
                    if (matched) setCreditAmount(matched.finalAmount || 500);
                  }}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  required
                >
                  {invoices.map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceNumber || inv._id} &bull; {inv.patientId?.name} &bull; ₹{inv.finalAmount} ({inv.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Credit Amount (₹)</label>
                  <Input
                    type="number"
                    min="1"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(Number(e.target.value))}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold">Adjustment Reason</label>
                  <select
                    value={creditReason}
                    onChange={(e) => setCreditReason(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="BILLING_ERROR">Billing / Tariff Calculation Error</option>
                    <option value="SERVICE_CANCELLED">Service Cancelled / Not Rendered</option>
                    <option value="MEDICINE_RETURN">Medicines Returned to Pharmacy</option>
                    <option value="DISCOUNT_ADJUSTMENT">Post-Facto Concession Adjustment</option>
                    <option value="PRICING_DISPUTE">Pricing Dispute Settlement</option>
                    <option value="OTHER">Other Administrative Reason</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Detailed Description</label>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Authorizing Accounts Officer</label>
                <Input
                  type="text"
                  value={issuedBy}
                  onChange={(e) => setIssuedBy(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-violet-600 hover:bg-violet-700 text-white">
                  {submitting ? "Issuing..." : `Issue Credit Note (₹${creditAmount.toLocaleString("en-IN")})`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credit Note View / Print Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-background rounded-xl border max-w-xl w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">MEDISTRA HEALTHCARE SYSTEM</h2>
                <p className="text-xs text-muted-foreground">12 Medical Enclave, Central Avenue &bull; GSTIN: 19AAECM0123M1Z5</p>
                <div className="inline-block mt-2 px-3 py-1 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-bold text-xs rounded-md border border-violet-200">
                  OFFICIAL CREDIT NOTE
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedNote(null)} className="h-8 w-8 p-0">
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-muted/30 p-4 rounded-lg border">
              <div>
                <p className="text-muted-foreground">Credit Note Number:</p>
                <p className="font-bold text-violet-700 text-sm">{selectedNote.creditNoteNumber}</p>
                <p className="text-muted-foreground mt-2">Date Issued:</p>
                <p>{new Date(selectedNote.createdAt || Date.now()).toLocaleString("en-IN")}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Original Invoice Ref:</p>
                <p className="font-bold text-blue-600">{selectedNote.invoiceId?.invoiceNumber || "N/A"}</p>
                <p className="text-muted-foreground mt-2">Adjustment Category:</p>
                <p className="font-medium">{selectedNote.reason.replace(/_/g, " ")}</p>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-2 text-xs">
              <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Beneficiary Patient Details:</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedNote.patientId?.name || "Patient"}</p>
              <p className="text-muted-foreground">UHID: {selectedNote.patientId?.uhid || "N/A"} &bull; Contact: {selectedNote.patientId?.contact || "N/A"}</p>
              <p className="pt-2 text-slate-700 dark:text-slate-300">
                <strong>Adjustment Description:</strong> {selectedNote.description}
              </p>
            </div>

            <div className="p-4 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 rounded-lg flex items-center justify-between text-violet-900 dark:text-violet-200">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider">Total Credited Amount:</p>
                <p className="text-2xl font-bold">₹{Number(selectedNote.amount).toLocaleString("en-IN")}</p>
              </div>
              <Badge className="bg-violet-600 text-white">CREDIT APPLIED</Badge>
            </div>

            <div className="flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
              <span>Authorized By: {selectedNote.issuedBy || "Finance Accounts Head"}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1 text-xs">
                  <Printer className="h-3.5 w-3.5" /> Print Credit Note
                </Button>
                <Button size="sm" onClick={() => setSelectedNote(null)} className="text-xs">
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
