"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Search,
  Plus,
  RefreshCw,
  IndianRupee,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  ArrowLeft,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function ClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create Claim Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [claimType, setClaimType] = useState("CASHLESS");
  const [amountClaimed, setAmountClaimed] = useState<number>(50000);
  const [totalBilledAmount, setTotalBilledAmount] = useState<number>(50000);
  const [preAuthNumber, setPreAuthNumber] = useState("");
  const [diagnosis, setDiagnosis] = useState("Acute appendicitis with localized peritonitis");
  const [treatingDoctor, setTreatingDoctor] = useState("Dr. Sen, General Surgeon");
  const [department, setDepartment] = useState("Inpatient (IPD)");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // View Claim Modal
  const [selectedClaim, setSelectedClaim] = useState<any>(null);

  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clmRes, patRes, provRes, invRes] = await Promise.all([
        fetch("/api/insurance/claims"),
        fetch("/api/patient"),
        fetch("/api/insurance/providers"),
        fetch("/api/invoice")
      ]);
      const clmData = await clmRes.json();
      const patData = await patRes.json();
      const provData = await provRes.json();
      const invData = await invRes.json();

      if (clmData.success) setClaims(clmData.data || []);
      if (patData.success) {
        setPatients(patData.data || []);
        if (patData.data?.length > 0) setPatientId(patData.data[0]._id);
      }
      if (provData.success) {
        setProviders(provData.data || []);
        if (provData.data?.length > 0) setProviderId(provData.data[0]._id);
      }
      if (invData.success) {
        setInvoices(invData.data || []);
      }
    } catch (err: any) {
      toast("Error fetching data: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !providerId || amountClaimed <= 0) {
      toast("Please complete all required fields", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/insurance/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          providerId,
          invoiceId: invoiceId || undefined,
          preAuthNumber,
          claimType,
          totalBilledAmount,
          amountClaimed,
          diagnosis,
          treatingDoctor,
          department,
          status: "SUBMITTED",
          notes
        })
      });
      const data = await res.json();
      if (data.success) {
        toast("Insurance claim created and filed successfully!", "success");
        setShowAddModal(false);
        fetchData();
      } else {
        toast(data.message || "Failed to create claim", "error");
      }
    } catch (err: any) {
      toast("Error: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClaims = claims.filter((c) => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const cNum = (c.claimNumber || "").toLowerCase();
    const pName = (c.patientId?.name || "").toLowerCase();
    const pUhid = (c.patientId?.uhid || "").toLowerCase();
    const provName = (c.providerId?.name || "").toLowerCase();
    return cNum.includes(q) || pName.includes(q) || pUhid.includes(q) || provName.includes(q);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SETTLED":
        return <Badge className="bg-emerald-600 text-white">SETTLED</Badge>;
      case "APPROVED":
        return <Badge className="bg-blue-600 text-white">APPROVED</Badge>;
      case "QUERY_PENDING":
        return <Badge className="bg-amber-500 text-white">QUERY PENDING</Badge>;
      case "UNDER_REVIEW":
        return <Badge className="bg-purple-600 text-white">AUDIT REVIEW</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">REJECTED</Badge>;
      default:
        return <Badge variant="outline">SUBMITTED</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
          <Link href="/insurance">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="p-2.5 bg-emerald-600/10 text-emerald-600 rounded-xl">
            <ClipboardList className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Insurance Claims Directory</h1>
            <p className="text-sm text-muted-foreground">
              Cashless hospital claims register, reimbursement filings, TPA adjudication & claim settlement logs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4" />
            File New Claim
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search claims by Claim No (CLM-XXXX), Patient Name, UHID, or Payer..."
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
                <option value="ALL">All Claim Statuses</option>
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="UNDER_REVIEW">UNDER REVIEW</option>
                <option value="QUERY_PENDING">QUERY PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="SETTLED">SETTLED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-y text-muted-foreground text-left">
                <tr>
                  <th className="py-3 px-4 font-semibold">Claim No</th>
                  <th className="py-3 px-4 font-semibold">Patient</th>
                  <th className="py-3 px-4 font-semibold">Payer / TPA</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold text-right">Billed (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Claimed (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Settled (₹)</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Date</th>
                  <th className="py-3 px-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredClaims.length > 0 ? (
                  filteredClaims.map((c: any) => (
                    <tr key={c._id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-emerald-700 dark:text-emerald-300">
                        {c.claimNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{c.patientId?.name || "Patient"}</p>
                        <p className="text-[10px] text-muted-foreground">
                          UHID: {c.patientId?.uhid || "N/A"} &bull; {c.department}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {c.providerId?.name || "Payer Partner"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px]">
                          {c.claimType || "CASHLESS"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        ₹{Number(c.totalBilledAmount || c.amountClaimed || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                        ₹{Number(c.amountClaimed || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {c.amountSettled > 0 ? `₹${Number(c.amountSettled).toLocaleString("en-IN")}` : "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(c.status)}
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN", { month: 'short', day: 'numeric' }) : "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedClaim(c)}
                            className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {c.status !== "SETTLED" && (
                            <Link href={`/insurance/settlement?claimId=${c._id}`}>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] text-emerald-600 border-emerald-200">
                                Settle
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-muted-foreground">
                      {loading ? "Loading claims..." : "No claims registered yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* File New Claim Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-background rounded-xl border max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-emerald-600" />
                File Insurance Claim
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)} className="h-7 w-7 p-0">
                ✕
              </Button>
            </div>

            <form onSubmit={handleCreateClaim} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold">Select Patient</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  required
                >
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.uhid || "No UHID"} &bull; {p.contact})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Insurance Company / TPA</label>
                  <select
                    value={providerId}
                    onChange={(e) => setProviderId(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                    required
                  >
                    {providers.map((pr) => (
                      <option key={pr._id} value={pr._id}>
                        {pr.name} ({pr.code || pr.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Claim Type</label>
                  <select
                    value={claimType}
                    onChange={(e) => setClaimType(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="CASHLESS">Cashless Hospitalization</option>
                    <option value="REIMBURSEMENT">Patient Reimbursement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Total Hospital Bill (₹)</label>
                  <Input
                    type="number"
                    min="1"
                    value={totalBilledAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTotalBilledAmount(val);
                      setAmountClaimed(val);
                    }}
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Claimed Amount (₹)</label>
                  <Input
                    type="number"
                    min="1"
                    value={amountClaimed}
                    onChange={(e) => setAmountClaimed(Number(e.target.value))}
                    required
                    className="h-9 text-xs font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Pre-Auth Number (Optional)</label>
                  <Input
                    type="text"
                    placeholder="e.g. PA-2026-0012"
                    value={preAuthNumber}
                    onChange={(e) => setPreAuthNumber(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Department</label>
                  <Input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Diagnosis / Surgery</label>
                <Input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Treating Doctor</label>
                <Input
                  type="text"
                  value={treatingDoctor}
                  onChange={(e) => setTreatingDoctor(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {submitting ? "Filing..." : `File Claim (₹${amountClaimed.toLocaleString("en-IN")})`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Claim Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-background rounded-xl border max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Claim Dossier: {selectedClaim.claimNumber}</h3>
                <p className="text-xs text-muted-foreground">Payer: {selectedClaim.providerId?.name}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedClaim(null)} className="h-7 w-7 p-0">
                ✕
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-muted/40 rounded-lg space-y-1.5 border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient Name:</span>
                  <strong>{selectedClaim.patientId?.name} (UHID: {selectedClaim.patientId?.uhid || "N/A"})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Diagnosis:</span>
                  <span>{selectedClaim.diagnosis}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Treating Doctor:</span>
                  <span>{selectedClaim.treatingDoctor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Claim Category:</span>
                  <span>{selectedClaim.claimType}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg space-y-1.5 border border-emerald-200">
                <div className="flex justify-between font-medium">
                  <span>Gross Hospital Billed:</span>
                  <span>₹{Number(selectedClaim.totalBilledAmount || selectedClaim.amountClaimed).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                  <span>Claimed from TPA:</span>
                  <span>₹{Number(selectedClaim.amountClaimed).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold border-t pt-1">
                  <span>Settled / Remitted:</span>
                  <span>₹{Number(selectedClaim.amountSettled || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span>Current Claim Status:</span>
                <div>{getStatusBadge(selectedClaim.status)}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button size="sm" onClick={() => setSelectedClaim(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
