"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Search,
  Filter,
  Plus,
  RefreshCw,
  IndianRupee,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  User,
  FileText
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function PatientRefundsPage() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create Refund Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundDepartment, setRefundDepartment] = useState("OPD");
  const [refundMethod, setRefundMethod] = useState("ORIGINAL_PAYMENT_MODE");
  const [refundReason, setRefundReason] = useState("Doctor unavailable / consultation cancelled");
  const [requestedBy, setRequestedBy] = useState("Billing Officer");
  const [refundNotes, setRefundNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const [refRes, patRes, invRes] = await Promise.all([
        fetch("/api/finance/refunds"),
        fetch("/api/patient"),
        fetch("/api/invoice")
      ]);
      const refData = await refRes.json();
      const patData = await patRes.json();
      const invData = await invRes.json();

      if (refData.success) setRefunds(refData.data || []);
      if (patData.success) {
        setPatients(patData.data || []);
        if (patData.data?.length > 0) setSelectedPatientId(patData.data[0]._id);
      }
      if (invData.success) setInvoices(invData.data || []);
    } catch (err: any) {
      toast("Error fetching refunds: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleCreateRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || refundAmount <= 0 || !refundReason) {
      toast("Please select patient, valid amount, and reason", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/finance/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatientId,
          invoiceId: selectedInvoiceId || undefined,
          amount: refundAmount,
          department: refundDepartment,
          refundMethod,
          reason: refundReason,
          requestedBy,
          notes: refundNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        toast("Refund request submitted successfully!", "success");
        setShowCreateModal(false);
        setRefundAmount(0);
        setRefundNotes("");
        fetchRefunds();
      } else {
        toast(data.message || "Failed to submit refund", "error");
      }
    } catch (err: any) {
      toast("Error: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/finance/refunds/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          approvedBy: "Chief Medical Officer / Finance Head",
          notes: `Status changed to ${status} via Finance Terminal`
        })
      });
      const data = await res.json();
      if (data.success) {
        toast(`Refund marked as ${status}`, "success");
        fetchRefunds();
      } else {
        toast(data.message || "Failed to update status", "error");
      }
    } catch (err: any) {
      toast("Error: " + err.message, "error");
    }
  };

  const filteredRefunds = refunds.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const rNum = (r.refundNumber || "").toLowerCase();
    const pName = (r.patientId?.name || "").toLowerCase();
    const pUhid = (r.patientId?.uhid || "").toLowerCase();
    const reason = (r.reason || "").toLowerCase();
    return rNum.includes(q) || pName.includes(q) || pUhid.includes(q) || reason.includes(q);
  });

  const totalProcessed = refunds
    .filter((r) => r.status === "PROCESSED")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const totalPending = refunds
    .filter((r) => r.status === "PENDING" || r.status === "APPROVED")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROCESSED":
        return <Badge className="bg-emerald-600 text-white">PROCESSED</Badge>;
      case "APPROVED":
        return <Badge className="bg-blue-600 text-white">APPROVED</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">REJECTED</Badge>;
      default:
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800">PENDING</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-600/10 text-amber-600 rounded-xl">
              <RotateCcw className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Patient Refunds & Cancellation Credits</h1>
              <p className="text-sm text-muted-foreground">
                Manage appointment cancellations, lab test reversals, discharge deposits & refund disbursement approvals
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchRefunds} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="h-4 w-4" />
            New Refund Request
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm border-l-4 border-l-emerald-600">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Disbursed Refunds</p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              ₹{totalProcessed.toLocaleString("en-IN")}
            </h3>
            <p className="text-[11px] text-muted-foreground">Disbursed to patients</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-amber-600">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pending Approvals</p>
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              ₹{totalPending.toLocaleString("en-IN")}
            </h3>
            <p className="text-[11px] text-muted-foreground">Awaiting audit sign-off</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-600">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Claims</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {refunds.length}
            </h3>
            <p className="text-[11px] text-muted-foreground">Historical claims filed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search refunds by Refund No (REF-XXXX), Patient, UHID, or Reason..."
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
                <option value="ALL">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="PROCESSED">PROCESSED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refunds Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-y text-muted-foreground text-left">
                <tr>
                  <th className="py-3 px-4 font-semibold">Refund No</th>
                  <th className="py-3 px-4 font-semibold">Patient</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Reason</th>
                  <th className="py-3 px-4 font-semibold">Method</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount (₹)</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Date</th>
                  <th className="py-3 px-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRefunds.length > 0 ? (
                  filteredRefunds.map((r: any) => (
                    <tr key={r._id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-amber-700 dark:text-amber-400">
                        {r.refundNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {r.patientId?.name || "Patient"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          UHID: {r.patientId?.uhid || "N/A"}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px]">
                          {r.department}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-muted-foreground">
                        {r.reason}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {r.refundMethod}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-600">
                        ₹{Number(r.amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(r.status)}
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { month: 'short', day: 'numeric' }) : "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {r.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(r._id, "APPROVED")}
                                className="h-7 px-2 text-[10px] text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(r._id, "REJECTED")}
                                className="h-7 px-2 text-[10px] text-rose-600 border-rose-200 hover:bg-rose-50"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {r.status === "APPROVED" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(r._id, "PROCESSED")}
                              className="h-7 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Disburse ₹
                            </Button>
                          )}
                          {r.status === "PROCESSED" && (
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Settled
                            </span>
                          )}
                          {r.status === "REJECTED" && (
                            <span className="text-[10px] text-rose-500 font-medium">Declined</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-muted-foreground">
                      {loading ? "Loading refunds..." : "No refund records found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Refund Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-background rounded-xl border max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-amber-600" />
                Issue Patient Refund Request
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)} className="h-7 w-7 p-0">
                ✕
              </Button>
            </div>

            <form onSubmit={handleCreateRefund} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold">Select Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  required
                >
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.uhid || "No UHID"} - {p.contact})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Associated Invoice (Optional)</label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="">None / General Advance Deposit</option>
                  {invoices.map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceNumber || inv._id} - ₹{inv.finalAmount} ({inv.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Refund Amount (₹)</label>
                  <Input
                    type="number"
                    min="1"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Department</label>
                  <select
                    value={refundDepartment}
                    onChange={(e) => setRefundDepartment(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="OPD">OPD Consultation</option>
                    <option value="Emergency">Emergency</option>
                    <option value="IPD">Inpatient IPD</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Pharmacy">Pharmacy</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Disbursement Mode</label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="ORIGINAL_PAYMENT_MODE">Original Payment Mode</option>
                  <option value="CASH">Cash Counter</option>
                  <option value="UPI">UPI Transfer</option>
                  <option value="BANK_TRANSFER">Direct Bank NEFT</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Reason for Refund</label>
                <Input
                  type="text"
                  placeholder="e.g. Doctor cancelled, lab test not conducted"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Requested By</label>
                <Input
                  type="text"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Audit Notes</label>
                <Input
                  type="text"
                  placeholder="Additional justification for medical superintendent"
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-amber-600 hover:bg-amber-700 text-white">
                  {submitting ? "Submitting..." : `Submit Claim (₹${refundAmount.toLocaleString("en-IN")})`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
