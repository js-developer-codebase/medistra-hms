"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  IndianRupee,
  Building2,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  Edit3,
  X,
  Send,
  HelpCircle,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function ClaimTrackingPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [tatFilter, setTatFilter] = useState("ALL");
  const [selectedClaim, setSelectedClaim] = useState<any>(null);

  // Query Response Modal
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [queryResponseText, setQueryResponseText] = useState("");
  const [updatingQuery, setUpdatingQuery] = useState(false);

  // Status Update Modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("UNDER_REVIEW");
  const [tpaQueryInput, setTpaQueryInput] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const { toast } = useToast();

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/insurance/claims");
      const data = await res.json();
      if (data.success) {
        setClaims(data.data || []);
        if (data.data?.length > 0 && !selectedClaim) {
          setSelectedClaim(data.data[0]);
        } else if (selectedClaim) {
          const updated = data.data.find((c: any) => c._id === selectedClaim._id);
          if (updated) setSelectedClaim(updated);
        }
      } else {
        toast("Failed to load claims: " + data.message, "error");
      }
    } catch (err: any) {
      toast("Error loading tracking data: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  // Calculate TAT in days from submission date or creation date
  const calculateTatDays = (claim: any) => {
    const startDate = claim.dateSubmitted ? new Date(claim.dateSubmitted) : new Date(claim.createdAt);
    const endDate = claim.settlementDate ? new Date(claim.settlementDate) : new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter claims
  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.claimNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.patientId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.patientId?.uhid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.preAuthNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.submissionBatchId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || claim.status === statusFilter;

    const tat = calculateTatDays(claim);
    let matchesTat = true;
    if (tatFilter === "GREEN") matchesTat = tat <= 7;
    else if (tatFilter === "AMBER") matchesTat = tat > 7 && tat <= 15;
    else if (tatFilter === "RED") matchesTat = tat > 15;

    return matchesSearch && matchesStatus && matchesTat;
  });

  // Handle query response submission
  const handleAnswerQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim || !queryResponseText.trim()) {
      toast("Please enter a response to the TPA query", "error");
      return;
    }

    try {
      setUpdatingQuery(true);
      const res = await fetch(`/api/insurance/claims/${selectedClaim._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tpaQueryResponse: queryResponseText.trim(),
          status: "UNDER_REVIEW",
          notes: (selectedClaim.notes ? selectedClaim.notes + "\n" : "") + `[${new Date().toLocaleDateString()}] Hospital responded to TPA query: ${queryResponseText.trim()}`
        })
      });
      const data = await res.json();
      if (data.success) {
        toast("TPA query response transmitted. Status updated to Under Review.", "success");
        setShowQueryModal(false);
        setQueryResponseText("");
        await fetchClaims();
      } else {
        toast(data.message || "Failed to submit response", "error");
      }
    } catch (err: any) {
      toast("Error submitting query response: " + err.message, "error");
    } finally {
      setUpdatingQuery(false);
    }
  };

  // Handle status update
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    try {
      setUpdatingStatus(true);
      const payload: any = {
        status: newStatus,
        notes: (selectedClaim.notes ? selectedClaim.notes + "\n" : "") + `[${new Date().toLocaleDateString()}] Status changed to ${newStatus}. Note: ${statusNotes.trim()}`
      };

      if (newStatus === "QUERY_PENDING" && tpaQueryInput.trim()) {
        payload.tpaQuery = tpaQueryInput.trim();
      }

      const res = await fetch(`/api/insurance/claims/${selectedClaim._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast("Claim lifecycle status successfully updated", "success");
        setShowStatusModal(false);
        setStatusNotes("");
        setTpaQueryInput("");
        await fetchClaims();
      } else {
        toast(data.message || "Failed to update status", "error");
      }
    } catch (err: any) {
      toast("Error updating status: " + err.message, "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Counts for KPIs
  const inFlightCount = claims.filter((c) => ["SUBMITTED", "UNDER_REVIEW", "PENDING"].includes(c.status)).length;
  const queriesCount = claims.filter((c) => c.status === "QUERY_PENDING").length;
  const approvedCount = claims.filter((c) => c.status === "APPROVED").length;
  const settledCount = claims.filter((c) => c.status === "SETTLED").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SETTLED":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Settled</Badge>;
      case "APPROVED":
        return <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20">Approved</Badge>;
      case "QUERY_PENDING":
        return <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse">Query Pending</Badge>;
      case "UNDER_REVIEW":
        return <Badge className="bg-purple-500/10 text-purple-600 border border-purple-500/20">Under Review</Badge>;
      case "SUBMITTED":
        return <Badge className="bg-sky-500/10 text-sky-600 border border-sky-500/20">Submitted</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
            <span className="text-sm font-medium text-primary">Status Monitor</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Claim Lifecycle Tracking & TAT Monitor
          </h1>
          <p className="text-muted-foreground text-sm">
            Monitor turnaround times, resolve TPA clinical queries, and track each claim stage to final remittance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchClaims} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh Monitor
          </Button>
          <Link href="/insurance/settlement">
            <Button size="sm">
              <IndianRupee className="h-4 w-4 mr-2" /> Settlement Desk
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-sky-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In Flight (Auditing)</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{inFlightCount}</h3>
              <p className="text-xs text-sky-600 mt-1 font-medium">Under TPA adjudication</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center text-sky-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">TPA Queries Pending</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{queriesCount}</h3>
              <p className="text-xs text-amber-600 mt-1 font-medium">Action required by hospital</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <MessageSquare className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Approved by Insurer</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{approvedCount}</h3>
              <p className="text-xs text-blue-600 mt-1 font-medium">Awaiting bank remittance</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Settled & Closed</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{settledCount}</h3>
              <p className="text-xs text-emerald-600 mt-1 font-medium">Payment reconciled</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Split Grid (Left: Claims List, Right: Lifecycle Detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Claims Registry (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-semibold">Active Claims Monitor</CardTitle>
                  <span className="text-xs text-muted-foreground">{filteredClaims.length} records</span>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search claim, UHID, pre-auth..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-8 text-xs flex-1 rounded-md border border-input bg-background px-2 text-foreground focus:ring-1 focus:ring-primary"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="QUERY_PENDING">Query Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="SETTLED">Settled</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                  <select
                    value={tatFilter}
                    onChange={(e) => setTatFilter(e.target.value)}
                    className="h-8 text-xs flex-1 rounded-md border border-input bg-background px-2 text-foreground focus:ring-1 focus:ring-primary"
                  >
                    <option value="ALL">All TATs</option>
                    <option value="GREEN">≤ 7 Days (Normal)</option>
                    <option value="AMBER">8-15 Days (Aging)</option>
                    <option value="RED">&gt; 15 Days (Critical)</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 max-h-[700px] overflow-y-auto divide-y divide-border/60">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground text-sm flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                  <span>Loading tracking records...</span>
                </div>
              ) : filteredClaims.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs p-4">
                  No claims found matching the filter criteria.
                </div>
              ) : (
                filteredClaims.map((claim) => {
                  const isSelected = selectedClaim?._id === claim._id;
                  const tat = calculateTatDays(claim);
                  const isQuery = claim.status === "QUERY_PENDING";

                  return (
                    <div
                      key={claim._id}
                      onClick={() => setSelectedClaim(claim)}
                      className={`p-4 cursor-pointer transition-all hover:bg-muted/40 ${
                        isSelected ? "bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground text-sm font-mono">
                              {claim.claimNumber}
                            </span>
                            {getStatusBadge(claim.status)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {claim.patientId?.name || "Patient"} •{" "}
                            <span className="font-mono text-[11px]">{claim.patientId?.uhid}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-foreground text-sm">
                            ₹{Number(claim.amountClaimed || 0).toLocaleString("en-IN")}
                          </span>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                tat <= 7
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                                  : tat <= 15
                                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600"
                                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-600"
                              }`}
                            >
                              TAT: {tat}d
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/40">
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <Building2 className="h-3 w-3" />
                          {claim.providerId?.name || "Insurer / TPA"}
                        </span>
                        {isQuery && (
                          <span className="text-amber-600 font-medium flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> TPA Query Active
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Visual Lifecycle & Claim Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedClaim ? (
            <div className="space-y-4">
              {/* Claim Overview Card */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b border-border/40">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
                          Claim Lifecycle Record
                        </span>
                        {getStatusBadge(selectedClaim.status)}
                      </div>
                      <h2 className="text-xl font-bold text-foreground mt-0.5 font-mono">
                        {selectedClaim.claimNumber}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNewStatus(selectedClaim.status);
                          setStatusNotes("");
                          setShowStatusModal(true);
                        }}
                        className="text-xs"
                      >
                        <Edit3 className="h-3.5 w-3.5 mr-1" /> Update Status
                      </Button>
                      {selectedClaim.status === "QUERY_PENDING" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setQueryResponseText("");
                            setShowQueryModal(true);
                          }}
                          className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-1" /> Answer Query
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-5">
                  {/* Financial Snapshot */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted/40 rounded-lg text-xs">
                    <div>
                      <span className="text-muted-foreground block">Claimed Amount:</span>
                      <span className="font-bold text-foreground text-sm">
                        ₹{Number(selectedClaim.amountClaimed || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Approved Amount:</span>
                      <span className="font-semibold text-blue-600 text-sm">
                        ₹{Number(selectedClaim.amountApproved || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Settled Remittance:</span>
                      <span className="font-bold text-emerald-600 text-sm">
                        ₹{Number(selectedClaim.amountSettled || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Disallowed Deductions:</span>
                      <span className="font-semibold text-rose-600 text-sm">
                        ₹{Number(selectedClaim.amountDisallowed || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Active TPA Query Alert Box if any */}
                  {selectedClaim.tpaQuery && (
                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4" /> TPA Clinical Query Raised:
                        </span>
                        {selectedClaim.status === "QUERY_PENDING" && (
                          <Badge variant="outline" className="text-amber-700 border-amber-300 text-[10px]">
                            Awaiting Response
                          </Badge>
                        )}
                      </div>
                      <p className="text-amber-900 dark:text-amber-300 font-medium italic pl-5">
                        &quot;{selectedClaim.tpaQuery}&quot;
                      </p>
                      {selectedClaim.tpaQueryResponse && (
                        <div className="mt-2 pt-2 border-t border-amber-200/80 pl-5 text-muted-foreground">
                          <span className="font-medium text-foreground">Hospital Response Submitted: </span>
                          <span>{selectedClaim.tpaQueryResponse}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Visual Stepper / Lifecycle Milestones */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Progress Milestones & Audit Trail
                    </h3>

                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                      {/* Step 1: Pre-Authorization */}
                      <div className="relative">
                        <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-4 ring-background">
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">Pre-Authorization Approved</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Sanction ID: <span className="font-mono text-primary font-medium">{selectedClaim.preAuthNumber || "Direct Admission / Emergency"}</span>
                          </p>
                          <div className="text-[11px] text-muted-foreground mt-1">
                            Provider: {selectedClaim.providerId?.name || "Empaneled Insurer"}
                          </div>
                        </div>
                      </div>

                      {/* Step 2: Clinical Care & Discharge */}
                      <div className="relative">
                        <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-4 ring-background">
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">Hospitalization & Treatment Completed</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Diagnosis: <span className="font-medium text-foreground">{selectedClaim.diagnosis || "Acute Clinical Condition"}</span>
                          </p>
                          <div className="text-[11px] text-muted-foreground mt-1">
                            Doctor: {selectedClaim.treatingDoctor || "Consultant"} • Ward: {selectedClaim.department || "IPD"}
                          </div>
                        </div>
                      </div>

                      {/* Step 3: Electronic Batch Submission */}
                      <div className="relative">
                        <div
                          className={`absolute -left-6 top-0.5 h-5 w-5 rounded-full flex items-center justify-center text-white ring-4 ring-background ${
                            selectedClaim.submissionBatchId || selectedClaim.status !== "DRAFT"
                              ? "bg-emerald-500"
                              : "bg-muted-foreground/40"
                          }`}
                        >
                          {selectedClaim.submissionBatchId ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">Electronic Claim Dossier Dispatched</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Batch ID:{" "}
                            {selectedClaim.submissionBatchId ? (
                              <span className="font-mono text-primary font-medium">{selectedClaim.submissionBatchId}</span>
                            ) : (
                              <span className="italic">Pending Batch Generation</span>
                            )}
                          </p>
                          <div className="text-[11px] text-muted-foreground mt-1">
                            Submission Date: {selectedClaim.dateSubmitted ? new Date(selectedClaim.dateSubmitted).toLocaleString("en-IN") : "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Step 4: TPA Medical Audit & Underwriting */}
                      <div className="relative">
                        <div
                          className={`absolute -left-6 top-0.5 h-5 w-5 rounded-full flex items-center justify-center text-white ring-4 ring-background ${
                            ["APPROVED", "SETTLED"].includes(selectedClaim.status)
                              ? "bg-emerald-500"
                              : selectedClaim.status === "QUERY_PENDING"
                              ? "bg-amber-500 animate-pulse"
                              : selectedClaim.status === "UNDER_REVIEW"
                              ? "bg-purple-500"
                              : "bg-muted-foreground/40"
                          }`}
                        >
                          {["APPROVED", "SETTLED"].includes(selectedClaim.status) ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <Activity className="h-3 w-3" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">TPA Medical Audit & Review</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Current Stage: <span className="font-medium text-foreground">{selectedClaim.status}</span>
                          </p>
                          {selectedClaim.notes && (
                            <div className="mt-1 p-2 bg-muted/40 rounded text-[11px] text-muted-foreground whitespace-pre-line">
                              {selectedClaim.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Step 5: Final Settlement & Bank Remittance */}
                      <div className="relative">
                        <div
                          className={`absolute -left-6 top-0.5 h-5 w-5 rounded-full flex items-center justify-center text-white ring-4 ring-background ${
                            selectedClaim.status === "SETTLED"
                              ? "bg-emerald-500"
                              : selectedClaim.status === "PARTIAL"
                              ? "bg-amber-500"
                              : "bg-muted-foreground/40"
                          }`}
                        >
                          {selectedClaim.status === "SETTLED" ? <ShieldCheck className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">Settlement & Bank Remittance</h4>
                          {selectedClaim.settlementUtr ? (
                            <div className="space-y-0.5 mt-0.5 text-xs text-muted-foreground">
                              <p>
                                Bank UTR / NEFT: <span className="font-mono text-emerald-600 font-semibold">{selectedClaim.settlementUtr}</span>
                              </p>
                              <p>
                                Settled Date: {selectedClaim.settlementDate ? new Date(selectedClaim.settlementDate).toLocaleDateString("en-IN") : "N/A"}
                              </p>
                              <p>
                                Net Hospital Credit: <span className="font-bold text-foreground">₹{Number(selectedClaim.amountSettled || 0).toLocaleString("en-IN")}</span>
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-0.5 italic">
                              Pending bank reconciliation and remittance advice from insurer.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="p-12 text-center text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 text-primary/40" />
                <p className="font-medium text-foreground">No claim selected</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Select a claim from the active claims monitor to inspect its lifecycle timeline.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ANSWER QUERY MODAL */}
      {showQueryModal && selectedClaim && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground rounded-xl border border-border shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex justify-between items-start border-b border-border/40 pb-3">
              <div>
                <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-amber-600" />
                  Answer TPA Clinical Query
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Claim: <span className="font-mono">{selectedClaim.claimNumber}</span> • {selectedClaim.patientId?.name}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowQueryModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-xs text-amber-900 dark:text-amber-300">
              <span className="font-semibold block mb-1">Query by Carrier:</span>
              <p className="italic">&quot;{selectedClaim.tpaQuery}&quot;</p>
            </div>

            <form onSubmit={handleAnswerQuery} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Hospital Medical Desk Justification / Clinical Response
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide clinical rationale, ICD-10 justification, or reference attached OT notes / lab investigations..."
                  value={queryResponseText}
                  onChange={(e) => setQueryResponseText(e.target.value)}
                  className="w-full text-xs rounded-md border border-input bg-background p-2.5 text-foreground focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowQueryModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={updatingQuery || !queryResponseText.trim()}>
                  <Send className="h-3.5 w-3.5 mr-1" />
                  {updatingQuery ? "Transmitting..." : "Submit Response to TPA"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {showStatusModal && selectedClaim && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground rounded-xl border border-border shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex justify-between items-start border-b border-border/40 pb-3">
              <div>
                <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-primary" />
                  Update Claim Status
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Claim: <span className="font-mono">{selectedClaim.claimNumber}</span>
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowStatusModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Select New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-xs rounded-md border border-input bg-background p-2.5 text-foreground focus:ring-1 focus:ring-primary"
                >
                  <option value="UNDER_REVIEW">Under Review (TPA Medical Audit)</option>
                  <option value="QUERY_PENDING">Query Raised by TPA</option>
                  <option value="APPROVED">Approved by Insurer</option>
                  <option value="REJECTED">Rejected / Repudiated</option>
                  <option value="SETTLED">Settled & Closed</option>
                </select>
              </div>

              {newStatus === "QUERY_PENDING" && (
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    TPA Query Text / Information Requested
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter query raised by the insurer/TPA auditor..."
                    value={tpaQueryInput}
                    onChange={(e) => setTpaQueryInput(e.target.value)}
                    className="w-full text-xs rounded-md border border-input bg-background p-2.5 text-foreground focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Audit Trail Note (Optional)</label>
                <Input
                  placeholder="e.g. Discussed with TPA doctor, sanction letter received"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowStatusModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={updatingStatus}>
                  {updatingStatus ? "Saving..." : "Update Status"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
