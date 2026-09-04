"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  IndianRupee,
  ArrowLeft,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  FileCheck,
  Printer,
  Download,
  Plus,
  X,
  FileText,
  ShieldCheck,
  ChevronRight,
  Receipt
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function SettlementPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"SETTLED" | "PENDING">("SETTLED");

  // Record Settlement Modal
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState("");
  const [amountApproved, setAmountApproved] = useState<number>(0);
  const [amountSettled, setAmountSettled] = useState<number>(0);
  const [amountDisallowed, setAmountDisallowed] = useState<number>(0);
  const [copayAmount, setCopayAmount] = useState<number>(0);
  const [settlementUtr, setSettlementUtr] = useState("");
  const [settlementDate, setSettlementDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Remittance Advice Modal
  const [viewAdviceClaim, setViewAdviceClaim] = useState<any>(null);

  const { toast } = useToast();

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/insurance/claims");
      const data = await res.json();
      if (data.success) {
        setClaims(data.data || []);
      } else {
        toast("Failed to load claims: " + data.message, "error");
      }
    } catch (err: any) {
      toast("Error fetching claims: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  // Filter settled claims
  const settledClaims = claims.filter((c) => ["SETTLED", "PARTIAL"].includes(c.status) || Boolean(c.amountSettled && c.amountSettled > 0));

  // Filter pending reconciliation claims
  const pendingClaims = claims.filter((c) => ["APPROVED", "SUBMITTED", "UNDER_REVIEW", "PENDING"].includes(c.status) && (!c.amountSettled || c.amountSettled === 0));

  // Financial Summary
  const totalSettledAmount = settledClaims.reduce((sum, c) => sum + Number(c.amountSettled || 0), 0);
  const totalDisallowedAmount = settledClaims.reduce((sum, c) => sum + Number(c.amountDisallowed || 0), 0);
  const totalPendingReceivables = pendingClaims.reduce((sum, c) => sum + Number(c.amountClaimed || 0), 0);
  const totalClaimedSettledPool = settledClaims.reduce((sum, c) => sum + Number(c.amountClaimed || 0), 0);
  const recoveryRatio = totalClaimedSettledPool > 0 ? Math.round((totalSettledAmount / totalClaimedSettledPool) * 100) : 0;

  // Selected claim object in modal
  const activeClaimForModal = claims.find((c) => c._id === selectedClaimId);

  const openRecordModalForClaim = (claim: any) => {
    setSelectedClaimId(claim._id);
    const claimed = Number(claim.amountClaimed || 0);
    const approved = Number(claim.amountApproved || claimed);
    setAmountApproved(approved);
    setAmountSettled(approved);
    setAmountDisallowed(Math.max(0, claimed - approved));
    setCopayAmount(Number(claim.copayAmount || 0));
    setSettlementUtr(`UTR-${new Date().toISOString().slice(2, 7).replace("-", "")}-${Math.floor(100000 + Math.random() * 900000)}`);
    setSettlementDate(new Date().toISOString().slice(0, 10));
    setNotes("");
    setShowRecordModal(true);
  };

  const handleClaimSelectInModal = (cId: string) => {
    setSelectedClaimId(cId);
    const target = claims.find((c) => c._id === cId);
    if (target) {
      const claimed = Number(target.amountClaimed || 0);
      const approved = Number(target.amountApproved || claimed);
      setAmountApproved(approved);
      setAmountSettled(approved);
      setAmountDisallowed(Math.max(0, claimed - approved));
      setCopayAmount(Number(target.copayAmount || 0));
    }
  };

  const handleSettledAmountChange = (val: number) => {
    setAmountSettled(val);
    if (activeClaimForModal) {
      const claimed = Number(activeClaimForModal.amountClaimed || 0);
      const diff = Math.max(0, claimed - val - copayAmount);
      setAmountDisallowed(diff);
    }
  };

  const handleRecordSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaimId) {
      toast("Please select a claim", "error");
      return;
    }
    if (amountSettled < 0) {
      toast("Settled remittance amount cannot be negative", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/insurance/settlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId: selectedClaimId,
          amountApproved,
          amountSettled,
          amountDisallowed,
          copayAmount,
          settlementUtr: settlementUtr.trim() || `UTR-${Date.now().toString().slice(-8)}`,
          settlementDate: new Date(settlementDate),
          notes: notes.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        toast("Remittance payment recorded and claim status reconciled!", "success");
        setShowRecordModal(false);
        await fetchClaims();
        setActiveTab("SETTLED");
      } else {
        toast(data.message || "Failed to record settlement", "error");
      }
    } catch (err: any) {
      toast("Error recording settlement: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter list by search & provider
  const listToDisplay = activeTab === "SETTLED" ? settledClaims : pendingClaims;
  const filteredList = listToDisplay.filter((claim) => {
    const matchesSearch =
      claim.claimNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.patientId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.patientId?.uhid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.settlementUtr?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProvider =
      providerFilter === "ALL" || (claim.providerId?._id || claim.providerId) === providerFilter;

    return matchesSearch && matchesProvider;
  });

  const uniqueProviders = Array.from(
    new Set(
      claims
        .map((c) => c.providerId)
        .filter(Boolean)
        .map((p) => JSON.stringify({ id: p._id || p, name: p.name || "Insurer" }))
    )
  ).map((str) => JSON.parse(str));

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/insurance" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" /> Insurance Hub
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-sm font-medium text-primary">Settlement Desk</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <IndianRupee className="h-6 w-6 text-primary" />
            Claim Settlement & Remittance Reconciliation
          </h1>
          <p className="text-muted-foreground text-sm">
            Reconcile electronic bank remittances, track UTR numbers, account for TPA deductions, and issue settlement advice slips in ₹.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchClaims} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (pendingClaims.length > 0) {
                openRecordModalForClaim(pendingClaims[0]);
              } else if (claims.length > 0) {
                openRecordModalForClaim(claims[0]);
              } else {
                toast("No claims available to settle", "error");
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Record Remittance
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Settled Credit</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                ₹{totalSettledAmount.toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Reconciled in hospital bank</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Awaiting Settlement</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600">
                ₹{totalPendingReceivables.toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">{pendingClaims.length} claims outstanding</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-rose-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Disallowed Deductions</p>
              <h3 className="text-2xl font-bold mt-1 text-rose-600">
                ₹{totalDisallowedAmount.toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Non-medical / tariff caps</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Settlement Ratio</p>
              <h3 className="text-2xl font-bold mt-1 text-primary">{recoveryRatio}%</h3>
              <p className="text-xs text-emerald-600 mt-1 font-medium">Claims recovery efficiency</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Receipt className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("SETTLED")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "SETTLED"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Settlement & Remittance Register
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-muted font-medium">
            {settledClaims.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "PENDING"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="h-4 w-4" />
          Pending Reconciliation
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-muted font-medium">
            {pendingClaims.length}
          </span>
        </button>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-base font-semibold">
                {activeTab === "SETTLED" ? "Settled Remittance Records" : "Claims Awaiting Remittance"}
              </CardTitle>
              <CardDescription className="text-xs">
                {activeTab === "SETTLED"
                  ? "Audit list of bank credits received and matched against hospital inpatient invoices."
                  : "Approved cashless dossiers awaiting remittance advice or bank credit."}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search claim, UHID, UTR..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
              {uniqueProviders.length > 0 && (
                <select
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value)}
                  className="h-8 text-xs rounded-md border border-input bg-background px-2.5 text-foreground focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">All Insurers</option>
                  {uniqueProviders.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground font-semibold text-xs uppercase border-b border-border/60">
                <tr>
                  <th className="p-3">Claim & Patient</th>
                  <th className="p-3">Insurer / TPA</th>
                  <th className="p-3 text-right">Claimed (₹)</th>
                  <th className="p-3 text-right">Approved (₹)</th>
                  <th className="p-3 text-right">Settled (₹)</th>
                  <th className="p-3 text-right">Deductions (₹)</th>
                  {activeTab === "SETTLED" ? (
                    <>
                      <th className="p-3">Bank UTR / Date</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Advice Slip</th>
                    </>
                  ) : (
                    <>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === "SETTLED" ? 9 : 8} className="text-center py-12 text-muted-foreground text-sm">
                      {loading ? (
                        <div className="flex justify-center items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                          <span>Loading settlement records...</span>
                        </div>
                      ) : (
                        <p>No records found matching the current criteria.</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredList.map((claim) => (
                    <tr key={claim._id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="font-mono font-semibold text-foreground text-xs">
                          {claim.claimNumber}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {claim.patientId?.name || "Patient"} •{" "}
                          <span className="font-mono text-[11px]">{claim.patientId?.uhid}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-xs font-medium text-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          {claim.providerId?.name || "Insurer / TPA"}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {claim.policyId?.policyNumber || "Policy"}
                        </div>
                      </td>
                      <td className="p-3 text-right font-medium text-foreground">
                        ₹{Number(claim.amountClaimed || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 text-right text-blue-600 font-medium">
                        ₹{Number(claim.amountApproved || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 text-right text-emerald-600 font-bold">
                        ₹{Number(claim.amountSettled || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 text-right text-rose-600 font-medium">
                        ₹{Number(claim.amountDisallowed || 0).toLocaleString("en-IN")}
                      </td>

                      {activeTab === "SETTLED" ? (
                        <>
                          <td className="p-3">
                            <div className="font-mono text-xs font-semibold text-foreground">
                              {claim.settlementUtr || "NEFT / RTGS"}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {claim.settlementDate
                                ? new Date(claim.settlementDate).toLocaleDateString("en-IN")
                                : "N/A"}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs">
                              {claim.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => setViewAdviceClaim(claim)}
                            >
                              <FileText className="h-3.5 w-3.5 mr-1" /> Advice Slip
                            </Button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className="text-xs">
                              {claim.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => openRecordModalForClaim(claim)}
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" /> Record Credit
                            </Button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* RECORD REMITTANCE MODAL */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card text-card-foreground rounded-xl border border-border shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex justify-between items-start border-b border-border/40 pb-3">
              <div>
                <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-primary" />
                  Record TPA Remittance & Settle Claim
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Record bank transfer details and reconcile deductions against inpatient billing.
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowRecordModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleRecordSettlement} className="space-y-4">
              {/* Claim Selector */}
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Select Claim</label>
                <select
                  value={selectedClaimId}
                  onChange={(e) => handleClaimSelectInModal(e.target.value)}
                  className="w-full text-xs rounded-md border border-input bg-background p-2.5 text-foreground focus:ring-1 focus:ring-primary font-mono"
                >
                  {claims.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.claimNumber} - {c.patientId?.name || "Patient"} (Claimed: ₹{Number(c.amountClaimed || 0).toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient Info Banner */}
              {activeClaimForModal && (
                <div className="p-3 bg-muted/40 rounded-lg text-xs grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-muted-foreground block">Patient Name:</span>
                    <span className="font-medium text-foreground">{activeClaimForModal.patientId?.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Insurer:</span>
                    <span className="font-medium text-foreground">{activeClaimForModal.providerId?.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Total Claimed:</span>
                    <span className="font-bold text-primary">₹{Number(activeClaimForModal.amountClaimed || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              )}

              {/* Financial Inputs Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Approved Amount (₹)
                  </label>
                  <Input
                    type="number"
                    required
                    value={amountApproved}
                    onChange={(e) => setAmountApproved(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Net Settled Remittance (₹)
                  </label>
                  <Input
                    type="number"
                    required
                    value={amountSettled}
                    onChange={(e) => handleSettledAmountChange(Number(e.target.value))}
                    className="text-xs font-semibold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Disallowed / Deductions (₹)
                  </label>
                  <Input
                    type="number"
                    value={amountDisallowed}
                    onChange={(e) => setAmountDisallowed(Number(e.target.value))}
                    className="text-xs text-rose-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Patient Co-pay Amount (₹)
                  </label>
                  <Input
                    type="number"
                    value={copayAmount}
                    onChange={(e) => setCopayAmount(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Bank Transfer Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Bank UTR / NEFT Reference Number
                  </label>
                  <Input
                    placeholder="e.g. AXISN26090401923"
                    required
                    value={settlementUtr}
                    onChange={(e) => setSettlementUtr(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Remittance Credit Date
                  </label>
                  <Input
                    type="date"
                    required
                    value={settlementDate}
                    onChange={(e) => setSettlementDate(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Reconciliation Notes / Deduction Reason
                </label>
                <Input
                  placeholder="e.g. Non-medical items deducted as per tariff; approved under GIPSA PPN"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowRecordModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  {submitting ? "Reconciling..." : "Save Settlement"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REMITTANCE ADVICE SLIP MODAL */}
      {viewAdviceClaim && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card text-card-foreground rounded-xl border border-border shadow-2xl max-w-2xl w-full p-8 space-y-6 animate-in fade-in-50 zoom-in-95">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-border/60 pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  MEDISTRA SUPER SPECIALITY HOSPITAL
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  TPA Desk & Health Insurance Claims Settlement Advice
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setViewAdviceClaim(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Slip Details Grid */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/40 border border-border/60">
                <div>
                  <span className="text-muted-foreground block">Claim Reference:</span>
                  <span className="font-mono font-bold text-foreground text-sm">{viewAdviceClaim.claimNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Settlement Status:</span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs">
                    {viewAdviceClaim.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block">Patient Name:</span>
                  <span className="font-semibold text-foreground">{viewAdviceClaim.patientId?.name || "Patient"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">UHID:</span>
                  <span className="font-mono text-foreground">{viewAdviceClaim.patientId?.uhid || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Insurer / TPA:</span>
                  <span className="font-medium text-foreground">{viewAdviceClaim.providerId?.name || "Carrier"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Policy Number:</span>
                  <span className="font-mono text-foreground">{viewAdviceClaim.policyId?.policyNumber || "N/A"}</span>
                </div>
              </div>

              {/* Financial Breakup Table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-muted text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3">Financial Head</th>
                      <th className="p-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-3 text-muted-foreground">Total Inpatient Billed / Claimed Amount</td>
                      <td className="p-3 text-right font-medium">₹{Number(viewAdviceClaim.amountClaimed || 0).toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-muted-foreground">Carrier Approved Amount</td>
                      <td className="p-3 text-right font-medium text-blue-600">₹{Number(viewAdviceClaim.amountApproved || 0).toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-muted-foreground">Deductions / Disallowed by TPA</td>
                      <td className="p-3 text-right font-medium text-rose-600">- ₹{Number(viewAdviceClaim.amountDisallowed || 0).toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-muted-foreground">Patient Co-Payment Collected</td>
                      <td className="p-3 text-right font-medium text-amber-600">- ₹{Number(viewAdviceClaim.copayAmount || 0).toLocaleString("en-IN")}</td>
                    </tr>
                    <tr className="bg-muted/40 font-bold">
                      <td className="p-3 text-foreground">Net Hospital Bank Remittance Received</td>
                      <td className="p-3 text-right text-emerald-600 text-sm">
                        ₹{Number(viewAdviceClaim.amountSettled || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bank Reconciliation Section */}
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex justify-between items-center">
                <div>
                  <span className="text-muted-foreground text-[11px] block">Electronic Bank Transfer (NEFT/RTGS UTR):</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                    {viewAdviceClaim.settlementUtr || "UTR NOT RECORDED"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground text-[11px] block">Settlement Value Date:</span>
                  <span className="font-medium text-foreground">
                    {viewAdviceClaim.settlementDate ? new Date(viewAdviceClaim.settlementDate).toLocaleDateString("en-IN") : "N/A"}
                  </span>
                </div>
              </div>

              {viewAdviceClaim.notes && (
                <div className="text-[11px] text-muted-foreground italic">
                  Audit Notes: {viewAdviceClaim.notes}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-border/60">
              <div className="text-[11px] text-muted-foreground">
                Authorized Hospital Claims Auditor
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs">
                  <Printer className="h-3.5 w-3.5 mr-1" /> Print Advice
                </Button>
                <Button size="sm" onClick={() => setViewAdviceClaim(null)} className="text-xs">
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
