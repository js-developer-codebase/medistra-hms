"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Percent,
  Search,
  Plus,
  RefreshCw,
  IndianRupee,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  User,
  Building2,
  Calendar
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function DiscountsConcessionsPage() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create Concession Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [category, setCategory] = useState("BPL_CARD_HOLDER");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [discountAmount, setDiscountAmount] = useState<number>(500);
  const [applicableDepartment, setApplicableDepartment] = useState("All Services");
  const [approvedBy, setApprovedBy] = useState("Medical Superintendent");
  const [reason, setReason] = useState("BPL card verified, subsidised healthcare policy");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const [discRes, patRes] = await Promise.all([
        fetch("/api/finance/discounts"),
        fetch("/api/patient")
      ]);
      const discData = await discRes.json();
      const patData = await patRes.json();

      if (discData.success) setDiscounts(discData.data || []);
      if (patData.success) {
        setPatients(patData.data || []);
        if (patData.data?.length > 0) setSelectedPatientId(patData.data[0]._id);
      }
    } catch (err: any) {
      toast("Error fetching concessions: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || discountAmount <= 0 || !approvedBy || !reason) {
      toast("Please complete all required fields", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/finance/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatientId,
          category,
          discountType,
          discountValue,
          discountAmount,
          applicableDepartment,
          approvedBy,
          reason,
          notes
        })
      });
      const data = await res.json();
      if (data.success) {
        toast("Concession voucher approved & created!", "success");
        setShowCreateModal(false);
        fetchDiscounts();
      } else {
        toast(data.message || "Failed to create concession", "error");
      }
    } catch (err: any) {
      toast("Error: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/finance/discounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        toast(`Concession status updated to ${status}`, "success");
        fetchDiscounts();
      } else {
        toast(data.message || "Failed to update concession", "error");
      }
    } catch (err: any) {
      toast("Error: " + err.message, "error");
    }
  };

  const filteredDiscounts = discounts.filter((d) => {
    if (statusFilter !== "ALL" && d.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const cNum = (d.concessionNumber || "").toLowerCase();
    const pName = (d.patientId?.name || "").toLowerCase();
    const pUhid = (d.patientId?.uhid || "").toLowerCase();
    const cat = (d.category || "").toLowerCase();
    return cNum.includes(q) || pName.includes(q) || pUhid.includes(q) || cat.includes(q);
  });

  const totalConcessionsValue = discounts
    .filter((d) => d.status === "APPROVED" || d.status === "APPLIED")
    .reduce((sum, d) => sum + Number(d.discountAmount || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPLIED":
        return <Badge className="bg-emerald-600 text-white">APPLIED</Badge>;
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
            <div className="p-2.5 bg-rose-600/10 text-rose-600 rounded-xl">
              <Percent className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Billing Discounts & Concessions</h1>
              <p className="text-sm text-muted-foreground">
                Staff dependents, BPL cardholders, senior citizens & management waiver voucher administration
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchDiscounts} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white">
            <Plus className="h-4 w-4" />
            Grant Concession
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm border-l-4 border-l-rose-600">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Concessions Value</p>
            <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              ₹{totalConcessionsValue.toLocaleString("en-IN")}
            </h3>
            <p className="text-[11px] text-muted-foreground">Approved hospital waivers</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-600">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Applied Vouchers</p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {discounts.filter((d) => d.status === "APPLIED").length}
            </h3>
            <p className="text-[11px] text-muted-foreground">Deducted from patient bills</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-amber-600">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pending Review</p>
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {discounts.filter((d) => d.status === "PENDING").length}
            </h3>
            <p className="text-[11px] text-muted-foreground">Awaiting director authorization</p>
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
                placeholder="Search concessions by Voucher No (DISC-XXXX), Patient, or Category..."
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
                <option value="APPLIED">APPLIED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Concessions Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-y text-muted-foreground text-left">
                <tr>
                  <th className="py-3 px-4 font-semibold">Voucher No</th>
                  <th className="py-3 px-4 font-semibold">Patient</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold text-right">Value</th>
                  <th className="py-3 px-4 font-semibold text-right">Discount (₹)</th>
                  <th className="py-3 px-4 font-semibold">Approving Authority</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDiscounts.length > 0 ? (
                  filteredDiscounts.map((d: any) => (
                    <tr key={d._id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-rose-700 dark:text-rose-400">
                        {d.concessionNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {d.patientId?.name || "Patient"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          UHID: {d.patientId?.uhid || "N/A"}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px]">
                          {d.category.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {d.applicableDepartment}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {d.discountType === "PERCENTAGE" ? `${d.discountValue}%` : `₹${d.discountValue}`}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-600">
                        ₹{Number(d.discountAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {d.approvedBy}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(d.status)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {d.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(d._id, "APPROVED")}
                                className="h-7 px-2 text-[10px] text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(d._id, "REJECTED")}
                                className="h-7 px-2 text-[10px] text-rose-600 border-rose-200 hover:bg-rose-50"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {d.status === "APPROVED" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(d._id, "APPLIED")}
                              className="h-7 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Apply to Bill
                            </Button>
                          )}
                          {d.status === "APPLIED" && (
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Applied
                            </span>
                          )}
                          {d.status === "REJECTED" && (
                            <span className="text-[10px] text-rose-500 font-medium">Voided</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-muted-foreground">
                      {loading ? "Loading concessions..." : "No concessions registered."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Grant Concession Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-background rounded-xl border max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Percent className="h-4 w-4 text-rose-600" />
                Grant Hospital Concession Voucher
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)} className="h-7 w-7 p-0">
                ✕
              </Button>
            </div>

            <form onSubmit={handleCreateDiscount} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold">Select Beneficiary Patient</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Concession Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="BPL_CARD_HOLDER">BPL Card Holder</option>
                    <option value="SENIOR_CITIZEN">Senior Citizen Concession</option>
                    <option value="STAFF_DEPENDENT">Staff Dependent</option>
                    <option value="MANAGEMENT_CONCESSION">Management Concession</option>
                    <option value="DOCTOR_DISCOUNT">Treating Doctor Waiver</option>
                    <option value="EMERGENCY_WAIVER">Emergency Humanitarian Waiver</option>
                    <option value="GOVERNMENT_SCHEME">Government Health Scheme</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold">Department Coverage</label>
                  <select
                    value={applicableDepartment}
                    onChange={(e) => setApplicableDepartment(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="All Services">All Hospital Services</option>
                    <option value="OPD Consultation">OPD Consultation</option>
                    <option value="Diagnostic Laboratory">Diagnostic Laboratory</option>
                    <option value="Radiology & Imaging">Radiology & Imaging</option>
                    <option value="Inpatient IPD">Inpatient IPD</option>
                    <option value="Emergency & Trauma">Emergency & Trauma</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT_AMOUNT">Flat Amount (₹)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold">{discountType === "PERCENTAGE" ? "Value (%)" : "Value (₹)"}</label>
                  <Input
                    type="number"
                    min="1"
                    value={discountValue}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setDiscountValue(v);
                      if (discountType === "FLAT_AMOUNT") {
                        setDiscountAmount(v);
                      }
                    }}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold">Effective Disc (₹)</label>
                  <Input
                    type="number"
                    min="1"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    required
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Authorizing Medical Official / Director</label>
                <Input
                  type="text"
                  value={approvedBy}
                  onChange={(e) => setApprovedBy(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Clinical / Welfare Justification</label>
                <Input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-rose-600 hover:bg-rose-700 text-white">
                  {submitting ? "Approving..." : `Grant ₹${discountAmount.toLocaleString("en-IN")} Voucher`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
