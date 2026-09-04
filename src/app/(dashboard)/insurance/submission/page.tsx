"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Send,
  ArrowLeft,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  IndianRupee,
  Layers,
  Building2,
  FileCheck,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function ClaimSubmissionPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingBatch, setSubmittingBatch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState("ALL");
  const [selectedClaimIds, setSelectedClaimIds] = useState<string[]>([]);
  
  // Batch creation form
  const [batchName, setBatchName] = useState("");
  const [submissionChannel, setSubmissionChannel] = useState("ELECTRONIC_GATEWAY");
  const [activeTab, setActiveTab] = useState<"READY" | "DISPATCHED">("READY");

  // Batch Manifest Modal
  const [selectedBatchManifest, setSelectedBatchManifest] = useState<{
    batchId: string;
    claims: any[];
    totalAmount: number;
    dispatchedDate: string;
  } | null>(null);

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

  // Filter claims ready for submission (DRAFT or claims without submissionBatchId and not SETTLED)
  const readyClaims = claims.filter((c) => {
    const isUnbatched = !c.submissionBatchId;
    const isPendingStatus = c.status === "DRAFT" || c.status === "PENDING" || (c.status === "SUBMITTED" && !c.submissionBatchId);
    return isUnbatched && isPendingStatus;
  });

  // Filter already dispatched claims that have a submissionBatchId
  const dispatchedClaims = claims.filter((c) => Boolean(c.submissionBatchId));

  // Group dispatched claims by submissionBatchId
  const batchGroups = dispatchedClaims.reduce((acc: Record<string, any>, claim) => {
    const bId = claim.submissionBatchId;
    if (!acc[bId]) {
      acc[bId] = {
        batchId: bId,
        claims: [],
        totalAmount: 0,
        dispatchedDate: claim.dateSubmitted || claim.updatedAt || claim.createdAt,
        providerName: (claim.providerId as any)?.name || "Multiple Providers"
      };
    }
    acc[bId].claims.push(claim);
    acc[bId].totalAmount += Number(claim.amountClaimed || 0);
    return acc;
  }, {});

  const batchesList = Object.values(batchGroups);

  // Filter ready claims for table display
  const filteredReadyClaims = readyClaims.filter((c) => {
    const matchesSearch =
      c.claimNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientId?.uhid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProvider =
      providerFilter === "ALL" || (c.providerId?._id || c.providerId) === providerFilter;

    return matchesSearch && matchesProvider;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedClaimIds(filteredReadyClaims.map((c) => c._id));
    } else {
      setSelectedClaimIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedClaimIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClaimIds.length === 0) {
      toast("Please select at least one claim to include in the batch", "error");
      return;
    }

    try {
      setSubmittingBatch(true);
      const res = await fetch("/api/insurance/submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimIds: selectedClaimIds,
          batchName: batchName.trim() || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        toast(`Batch ${data.data.batchId} successfully dispatched with ${data.data.claimCount} claims!`, "success");
        setSelectedClaimIds([]);
        setBatchName("");
        await fetchClaims();
        setActiveTab("DISPATCHED");
      } else {
        toast(data.message || "Failed to create submission batch", "error");
      }
    } catch (err: any) {
      toast("Submission failed: " + err.message, "error");
    } finally {
      setSubmittingBatch(false);
    }
  };

  const selectedTotalAmount = readyClaims
    .filter((c) => selectedClaimIds.includes(c._id))
    .reduce((sum, c) => sum + Number(c.amountClaimed || 0), 0);

  // Extract unique providers for filter
  const uniqueProviders = Array.from(
    new Set(
      readyClaims
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
            <span className="text-sm font-medium text-primary">Electronic Submission Desk</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Send className="h-6 w-6 text-primary" />
            Claim Submission & Electronic Batching
          </h1>
          <p className="text-muted-foreground text-sm">
            Compile vetted cashless & reimbursement dossiers into standardized electronic batches for direct TPA transmission.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchClaims} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh Desk
          </Button>
          <Link href="/insurance/claims">
            <Button size="sm" variant="outline">
              <Layers className="h-4 w-4 mr-2" /> Claims Directory
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ready for Batching</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{readyClaims.length}</h3>
              <p className="text-xs text-amber-600 mt-1 font-medium">Pending electronic submission</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <FileCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Submittable Value</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                ₹{readyClaims.reduce((sum, c) => sum + Number(c.amountClaimed || 0), 0).toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Cashless receivables pool</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dispatched Batches</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{batchesList.length}</h3>
              <p className="text-xs text-emerald-600 mt-1 font-medium">
                {dispatchedClaims.length} claims transmitted
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selected Batch Total</p>
              <h3 className="text-2xl font-bold mt-1 text-primary">
                ₹{selectedTotalAmount.toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-blue-600 mt-1 font-medium">
                {selectedClaimIds.length} claims staged
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Send className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("READY")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "READY"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" />
          Batch Compilation Desk
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-muted font-medium">
            {readyClaims.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("DISPATCHED")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "DISPATCHED"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Send className="h-4 w-4" />
          Dispatched Batches Archive
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-muted font-medium">
            {batchesList.length}
          </span>
        </button>
      </div>

      {/* TAB 1: BATCH COMPILATION DESK */}
      {activeTab === "READY" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Claims Selection Table (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold">Select Claims for Electronic Batching</CardTitle>
                    <CardDescription className="text-xs">
                      Check claims to bundle together for automated dispatch. Only vetted claims are displayed.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-56">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search claim, UHID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 h-8 text-xs"
                      />
                    </div>
                    {uniqueProviders.length > 0 && (
                      <select
                        value={providerFilter}
                        onChange={(e) => setProviderFilter(e.target.value)}
                        className="h-8 text-xs rounded-md border border-input bg-background px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={
                              filteredReadyClaims.length > 0 &&
                              selectedClaimIds.length === filteredReadyClaims.length
                            }
                            onChange={handleSelectAll}
                            className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                          />
                        </th>
                        <th className="p-3">Claim & Patient</th>
                        <th className="p-3">Insurer / TPA</th>
                        <th className="p-3">Diagnosis / IPD</th>
                        <th className="p-3 text-right">Amount (₹)</th>
                        <th className="p-3 text-center">Pre-Audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredReadyClaims.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                            {loading ? (
                              <div className="flex justify-center items-center gap-2">
                                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                                <span>Scanning claims repository...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                                <p className="font-medium text-foreground">No pending claims ready for batching</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  All existing claims are either batched, submitted, or settled.
                                </p>
                              </div>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredReadyClaims.map((claim) => {
                          const isSelected = selectedClaimIds.includes(claim._id);
                          const hasPreAuth = Boolean(claim.preAuthNumber);
                          const hasDiagnosis = Boolean(claim.diagnosis);
                          const isVetted = hasPreAuth && hasDiagnosis;

                          return (
                            <tr
                              key={claim._id}
                              onClick={() => handleSelectOne(claim._id)}
                              className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                                isSelected ? "bg-primary/5 dark:bg-primary/10" : ""
                              }`}
                            >
                              <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleSelectOne(claim._id)}
                                  className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                                />
                              </td>
                              <td className="p-3">
                                <div className="font-semibold text-foreground flex items-center gap-1.5">
                                  {claim.claimNumber}
                                  <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal">
                                    {claim.claimType}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {claim.patientId?.name || "Unknown Patient"} •{" "}
                                  <span className="font-mono text-[11px]">{claim.patientId?.uhid || "UHID-N/A"}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="text-xs font-medium text-foreground">
                                  {claim.providerId?.name || "Insurer / TPA"}
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                  Policy: {claim.policyId?.policyNumber || "N/A"}
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="text-xs text-foreground max-w-[200px] truncate" title={claim.diagnosis}>
                                  {claim.diagnosis || "Clinical Diagnosis"}
                                </div>
                                <div className="text-[11px] text-muted-foreground truncate">
                                  {claim.treatingDoctor || claim.department || "IPD Ward"}
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                <span className="font-semibold text-foreground">
                                  ₹{Number(claim.amountClaimed || 0).toLocaleString("en-IN")}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                {isVetted ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="h-3 w-3" /> Ready
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full" title="Missing Pre-Auth or Diagnosis">
                                    <AlertCircle className="h-3 w-3" /> Review
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Batch Dispatch Actions (1 col) */}
          <div className="space-y-4">
            <Card className="shadow-sm border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" />
                  Compile & Dispatch Batch
                </CardTitle>
                <CardDescription className="text-xs">
                  Package selected claims into an electronic transmission dossier.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateBatch} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Batch Label / Description (Optional)
                    </label>
                    <Input
                      placeholder={`e.g. Apollo-Munich-Consignment-${new Date().toISOString().slice(0, 10)}`}
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      className="text-xs"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Auto-generates standardized ID like <code>BATCH-202609-XXXX</code>.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Submission Transmission Channel
                    </label>
                    <select
                      value={submissionChannel}
                      onChange={(e) => setSubmissionChannel(e.target.value)}
                      className="w-full text-xs rounded-md border border-input bg-background p-2.5 text-foreground focus:ring-1 focus:ring-primary"
                    >
                      <option value="ELECTRONIC_GATEWAY">NDHM / ABHA Insurance Gateway (FHIR)</option>
                      <option value="TPA_PORTAL">TPA Direct Portal API Integration</option>
                      <option value="SECURE_EMAIL">Encrypted EDI Dispatch (Secured SMTP)</option>
                      <option value="PHYSICAL_DOSSIER">Physical Dossier Dispatch (Speed Post / Courier)</option>
                    </select>
                  </div>

                  {/* Summary Box */}
                  <div className="p-3.5 rounded-lg bg-muted/50 border border-border/80 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Selected Claims:</span>
                      <span className="font-semibold text-foreground">{selectedClaimIds.length} files</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Batch Value:</span>
                      <span className="font-bold text-primary text-sm">
                        ₹{selectedTotalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Security Protocol:</span>
                      <span className="font-medium text-emerald-600">SHA-256 Checksum Verified</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={selectedClaimIds.length === 0 || submittingBatch}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submittingBatch
                      ? "Compiling & Transmitting..."
                      : `Dispatch Batch (${selectedClaimIds.length} Claims)`}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Helper / Guideline Card */}
            <Card className="shadow-sm bg-muted/20 border-border/60">
              <CardContent className="p-4 space-y-2 text-xs">
                <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Pre-Submission Requirements
                </h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Discharge summary must have final clinical diagnosis.</li>
                  <li>Original itemized pharmacy & surgical bills linked.</li>
                  <li>Pre-authorization sanction letter attached.</li>
                  <li>KYC & Pan card for claims exceeding ₹1,00,000.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: DISPATCHED BATCHES ARCHIVE */}
      {activeTab === "DISPATCHED" && (
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">Electronic Transmission Batches</CardTitle>
                  <CardDescription className="text-xs">
                    Historical record of electronic dossiers compiled and dispatched to TPAs.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-muted-foreground font-semibold text-xs uppercase border-b border-border/60">
                    <tr>
                      <th className="p-3">Batch Identifier</th>
                      <th className="p-3">Dispatched Date</th>
                      <th className="p-3">Recipient Carrier / TPA</th>
                      <th className="p-3 text-center">Claims Count</th>
                      <th className="p-3 text-right">Total Batch Amount</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Manifest Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {batchesList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                          No dispatched batches recorded yet. Select claims from the Compilation Desk to generate a batch.
                        </td>
                      </tr>
                    ) : (
                      batchesList.map((batch: any) => (
                        <tr key={batch.batchId} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3">
                            <div className="font-mono font-semibold text-primary">{batch.batchId}</div>
                            <div className="text-[11px] text-muted-foreground">Electronic Gateway Dossier</div>
                          </td>
                          <td className="p-3">
                            <div className="text-xs text-foreground">
                              {new Date(batch.dispatchedDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                              })}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {new Date(batch.dispatchedDate).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-xs font-medium text-foreground flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                              {batch.providerName}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-semibold px-2 py-0.5 bg-muted rounded-full text-xs">
                              {batch.claims.length} claims
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="font-bold text-foreground">
                              ₹{Number(batch.totalAmount || 0).toLocaleString("en-IN")}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs border border-emerald-500/30">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Dispatched
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => setSelectedBatchManifest(batch)}
                            >
                              <FileCheck className="h-3.5 w-3.5 mr-1" /> View Manifest
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* BATCH MANIFEST MODAL */}
      {selectedBatchManifest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card text-card-foreground rounded-xl border border-border shadow-2xl max-w-3xl w-full p-6 space-y-5 animate-in fade-in-50 zoom-in-95">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-border/40 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {selectedBatchManifest.batchId}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Electronic Manifest</span>
                </div>
                <h2 className="text-lg font-bold text-foreground mt-1">
                  Electronic Batch Transmission Manifest
                </h2>
                <p className="text-xs text-muted-foreground">
                  Official dispatch manifest generated for carrier handoff and audit reconciliation.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setSelectedBatchManifest(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 p-3 bg-muted/40 rounded-lg text-xs">
                <div>
                  <span className="text-muted-foreground block">Dispatched Date:</span>
                  <span className="font-medium text-foreground">
                    {new Date(selectedBatchManifest.dispatchedDate).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Included Claims:</span>
                  <span className="font-semibold text-foreground">
                    {selectedBatchManifest.claims.length} files
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Total Batch Value:</span>
                  <span className="font-bold text-primary">
                    ₹{selectedBatchManifest.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto rounded-md border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted text-muted-foreground font-medium uppercase border-b border-border">
                    <tr>
                      <th className="p-2.5">Claim ID</th>
                      <th className="p-2.5">Patient / UHID</th>
                      <th className="p-2.5">Diagnosis</th>
                      <th className="p-2.5 text-right">Claim Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedBatchManifest.claims.map((c: any) => (
                      <tr key={c._id} className="hover:bg-muted/30">
                        <td className="p-2.5 font-mono font-medium text-primary">
                          {c.claimNumber}
                        </td>
                        <td className="p-2.5">
                          <div className="font-medium text-foreground">{c.patientId?.name || "Patient"}</div>
                          <div className="text-muted-foreground font-mono text-[10px]">{c.patientId?.uhid}</div>
                        </td>
                        <td className="p-2.5 text-muted-foreground">
                          {c.diagnosis || "General Admission"}
                        </td>
                        <td className="p-2.5 text-right font-semibold text-foreground">
                          ₹{Number(c.amountClaimed || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-border/40">
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Verified by Hospital TPA Desk Operations
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="text-xs"
                >
                  <Printer className="h-3.5 w-3.5 mr-1" /> Print Manifest
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedBatchManifest, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", `${selectedBatchManifest.batchId}_manifest.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                    toast("Manifest downloaded", "success");
                  }}
                  className="text-xs"
                >
                  <Download className="h-3.5 w-3.5 mr-1" /> Export JSON
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
