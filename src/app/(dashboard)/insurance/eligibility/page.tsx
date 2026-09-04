"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Printer,
  ShieldCheck,
  Building2,
  Calendar,
  IndianRupee,
  RefreshCw,
  ArrowLeft,
  FileBadge
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function EligibilityVerificationPage() {
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const { toast } = useToast();

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await fetch("/api/patient");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setPatients(data.data);
          if (data.data.length > 0) setSelectedPatientId(data.data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load patients", err);
      }
    };
    loadPatients();
  }, []);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() && !selectedPatientId) {
      toast("Please enter a Member ID, Policy No, or select a patient", "error");
      return;
    }

    try {
      setVerifying(true);
      let url = "/api/insurance/eligibility?";
      if (query.trim()) {
        url += `memberId=${encodeURIComponent(query.trim())}&policyNumber=${encodeURIComponent(query.trim())}`;
      } else if (selectedPatientId) {
        url += `patientId=${encodeURIComponent(selectedPatientId)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setVerificationResult(data.data);
        if (data.data.eligible) {
          toast("Coverage Verified: Patient is eligible for cashless hospitalization!", "success");
        } else {
          toast(data.data.message || "Patient not eligible for cashless admission", "warning");
        }
      } else {
        toast(data.message || "Failed to verify eligibility", "error");
        setVerificationResult(null);
      }
    } catch (err: any) {
      toast("Error verifying eligibility: " + err.message, "error");
    } finally {
      setVerifying(false);
    }
  };

  const policy = verificationResult?.policy;
  const checks = verificationResult?.checks;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
          <Link href="/insurance">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="p-2.5 bg-teal-600/10 text-teal-600 rounded-xl">
            <UserCheck className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Insurance Eligibility & Coverage Desk</h1>
            <p className="text-sm text-muted-foreground">
              Real-time patient cashless pre-screening, coverage balance check & eligibility certificates
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/insurance/policies">
            <Button variant="outline" size="sm">
              All Policies
            </Button>
          </Link>
          <Link href="/insurance/preauth">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
              Proceed to Pre-Auth
            </Button>
          </Link>
        </div>
      </div>

      {/* Verification Query Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Insurance Verification Terminal</CardTitle>
          <CardDescription className="text-xs">
            Enter Policy Number, Card Member ID, or select registered hospital patient to inspect live coverage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold">Member Card ID / Policy Number</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="e.g. POL-2026-88992 or MEM-12345"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9 h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Or Select Hospital Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => {
                    setSelectedPatientId(e.target.value);
                    setQuery("");
                  }}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="">-- Choose Registered Patient --</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.uhid || "No UHID"} &bull; {p.contact})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="submit"
                disabled={verifying}
                className="bg-teal-600 hover:bg-teal-700 text-white gap-2 font-medium"
              >
                {verifying ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Verifying with Payer Registry...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" /> Verify Coverage & Cashless Status
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Verification Result Section */}
      {verificationResult && (
        <div className="space-y-6">
          {verificationResult.eligible ? (
            /* Eligible Banner */
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-600 text-white rounded-full">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                    ELIGIBLE FOR CASHLESS HOSPITALIZATION
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Policy is active, in-force & empaneled with Medistra Healthcare System.
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => window.print()} className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700">
                <Printer className="h-4 w-4" /> Print Certificate
              </Button>
            </div>
          ) : (
            /* Ineligible Banner */
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 rounded-xl flex items-center gap-3">
              <div className="p-3 bg-rose-600 text-white rounded-full">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-rose-900 dark:text-rose-200">
                  CASHLESS NOT ELIGIBLE / REIMBURSEMENT ONLY
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  {verificationResult.message || "Policy has expired, exhausted balance, or is not empaneled for cashless admission."}
                </p>
              </div>
            </div>
          )}

          {policy && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient & Payer Details */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Beneficiary & Policy Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Patient Name:</span>
                    <strong className="text-slate-900 dark:text-white">{policy.patientId?.name}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">UHID Number:</span>
                    <span className="font-mono font-bold text-blue-600">{policy.patientId?.uhid || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Age / Gender:</span>
                    <span>{policy.patientId?.age} Years / {policy.patientId?.gender}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Insurance Payer:</span>
                    <strong className="text-indigo-600">{policy.providerId?.name}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Policy Number:</span>
                    <span className="font-mono">{policy.policyNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Card Member ID:</span>
                    <span className="font-mono">{policy.memberId || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Policy Type:</span>
                    <Badge variant="outline">{policy.policyType?.replace(/_/g, " ")}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Limits & Coverage Verification Matrix */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Coverage & Empanelment Checks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="p-3 bg-muted/40 rounded-lg border flex justify-between items-center">
                    <div>
                      <p className="text-muted-foreground">Total Sum Insured:</p>
                      <p className="font-bold text-base text-slate-900 dark:text-white">
                        ₹{Number(policy.sumInsured || policy.coverageAmount || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Available Cashless Limit:</p>
                      <p className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                        ₹{Number(policy.availableBalance || policy.sumInsured || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between py-1 border-b">
                      <span>1. Policy Active Status</span>
                      {checks?.activeStatus ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> In-Force
                        </span>
                      ) : (
                        <span className="text-rose-600 font-semibold flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" /> Inactive
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between py-1 border-b">
                      <span>2. Policy Validity Window</span>
                      {checks?.notExpired ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Valid till {new Date(policy.validTill).toLocaleDateString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-rose-600 font-semibold flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" /> Expired
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between py-1 border-b">
                      <span>3. Cashless Empanelment</span>
                      {checks?.cashlessEmpaneled ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Empaneled Hospital
                        </span>
                      ) : (
                        <span className="text-amber-600 font-semibold flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" /> Non-Network Payer
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span>4. Patient Co-Pay Share</span>
                      <span className="font-bold">{policy.copayPercentage || 0}% of Admissible Claims</span>
                    </div>
                  </div>

                  {verificationResult.eligible && (
                    <div className="pt-2">
                      <Link href={`/insurance/preauth?patientId=${policy.patientId?._id}&policyId=${policy._id}`}>
                        <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                          Initiate Pre-Authorization Request
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
