"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileClock,
  Search,
  Plus,
  RefreshCw,
  IndianRupee,
  Calendar,
  User,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Printer,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function PreauthPage() {
  const [preauths, setPreauths] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // New Pre-Auth Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [policyId, setPolicyId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [treatingDoctor, setTreatingDoctor] = useState("Dr. Sen, Senior Consultant");
  const [department, setDepartment] = useState("General Surgery");
  const [estimatedCost, setEstimatedCost] = useState<number>(120000);
  const [requestedAmount, setRequestedAmount] = useState<number>(100000);
  const [expectedStayDays, setExpectedStayDays] = useState<number>(3);
  const [roomType, setRoomType] = useState("Semi-Private Room");
  const [submitting, setSubmitting] = useState(false);

  // Approval Modal
  const [approvalModalPreauth, setApprovalModalPreauth] = useState<any>(null);
  const [approvedAmount, setApprovedAmount] = useState<number>(0);
  const [queryDetails, setQueryDetails] = useState("");

  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paRes, patRes, provRes, polRes] = await Promise.all([
        fetch("/api/insurance/preauth"),
        fetch("/api/patient"),
        fetch("/api/insurance/providers"),
        fetch("/api/insurance/policies")
      ]);
      const paData = await paRes.json();
      const patData = await patRes.json();
      const provData = await provRes.json();
      const polData = await polRes.json();

      if (paData.success) setPreauths(paData.data || []);
      if (patData.success) {
        setPatients(patData.data || []);
        if (patData.data?.length > 0) setPatientId(patData.data[0]._id);
      }
      if (provData.success) {
        setProviders(provData.data || []);
        if (provData.data?.length > 0) setProviderId(provData.data[0]._id);
      }
      if (polData.success) {
        setPolicies(polData.data || []);
        if (polData.data?.length > 0) setPolicyId(polData.data[0]._id);
      }
    } catch (err: any) {
      toast("Error fetching pre-auths: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePreauth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !providerId || !diagnosis || requestedAmount <= 0) {
      toast("Please complete all required fields", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/insurance/preauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          providerId,
          policyId: policyId || undefined,
          diagnosis,
          treatmentPlan,
          treatingDoctor,
          department,
          estimatedCost,
          requestedAmount,
          expectedStayDays,
          roomType,
          status: "SUBMITTED"
        })
      });
      const data = await res.json();
      if (data.success) {
        toast("Pre-Authorization request submitted to TPA!", "success");
        setShowAddModal(false);
        fetchData();
      } else {
        toast(data.message || "Failed to submit pre-auth", "error");
      }
    } catch (err: any) {
      toast("Error: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string, extraData: any = {}) => {
    try {
      const res = await fetch(`/api/insurance/preauth/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, ...extraData })
      });
      const data = await res.json();
      if (data.success) {
        toast(`Pre-Auth status updated to ${newStatus}`, "success");
        setApprovalModalPreauth(null);
        fetchData();
      } else {
        toast(data.message || "Failed to update status", "error");
      }
    } catch (err: any) {
      toast("Error: " + err.message, "error");
    }
  };

  const filteredPreauths = preauths.filter((p) => {
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const paNum = (p.preAuthNumber || "").toLowerCase();
    const pName = (p.patientId?.name || "").toLowerCase();
    const pUhid = (p.patientId?.uhid || "").toLowerCase();
    const diag = (p.diagnosis || "").toLowerCase();
    return paNum.includes(q) || pName.includes(q) || pUhid.includes(q) || diag.includes(q);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-emerald-600 text-white">APPROVED</Badge>;
      case "QUERY_RAISED":
        return <Badge className="bg-amber-500 text-white">QUERY RAISED</Badge>;
      case "DENIED":
        return <Badge variant="destructive">DENIED</Badge>;
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
          <div className="p-2.5 bg-amber-600/10 text-amber-600 rounded-xl">
            <FileClock className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pre-Authorization Requests & Approvals</h1>
            <p className="text-sm text-muted-foreground">
              Cashless admission requests, clinical documentation, TPA medical queries & cashless sanctions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="h-4 w-4" />
            New Pre-Auth Request
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
                placeholder="Search preauth by Number (PA-XXXX), Patient, UHID, or Diagnosis..."
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
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="QUERY_RAISED">QUERY RAISED</option>
                <option value="APPROVED">APPROVED</option>
                <option value="DENIED">DENIED</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pre-Auths Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-y text-muted-foreground text-left">
                <tr>
                  <th className="py-3 px-4 font-semibold">Pre-Auth No</th>
                  <th className="py-3 px-4 font-semibold">Patient</th>
                  <th className="py-3 px-4 font-semibold">TPA / Payer</th>
                  <th className="py-3 px-4 font-semibold">Diagnosis / Surgery</th>
                  <th className="py-3 px-4 font-semibold text-right">Requested (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Approved Limit (₹)</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Date</th>
                  <th className="py-3 px-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPreauths.length > 0 ? (
                  filteredPreauths.map((pa: any) => (
                    <tr key={pa._id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-amber-700 dark:text-amber-400">
                        {pa.preAuthNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{pa.patientId?.name || "Patient"}</p>
                        <p className="text-[10px] text-muted-foreground">
                          UHID: {pa.patientId?.uhid || "N/A"} &bull; {pa.patientId?.gender}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {pa.providerId?.name || "Payer"}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{pa.diagnosis}</p>
                        <p className="text-[10px] text-muted-foreground">{pa.treatmentPlan || pa.department}</p>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        ₹{Number(pa.requestedAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {pa.approvedAmount > 0 ? `₹${Number(pa.approvedAmount).toLocaleString("en-IN")}` : "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(pa.status)}
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {pa.createdAt ? new Date(pa.createdAt).toLocaleDateString("en-IN", { month: 'short', day: 'numeric' }) : "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {pa.status !== "APPROVED" && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setApprovalModalPreauth(pa);
                                setApprovedAmount(pa.requestedAmount || 50000);
                              }}
                              className="h-7 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Record Approval
                            </Button>
                          )}
                          {pa.status === "APPROVED" && (
                            <Link href={`/insurance/claims?preAuthNumber=${pa.preAuthNumber}`}>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] text-blue-600 border-blue-200">
                                Create Claim
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-muted-foreground">
                      {loading ? "Loading pre-authorizations..." : "No pre-authorization requests found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Pre-Auth Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-background rounded-xl border max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FileClock className="h-4 w-4 text-amber-600" />
                Submit Cashless Pre-Authorization
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)} className="h-7 w-7 p-0">
                ✕
              </Button>
            </div>

            <form onSubmit={handleCreatePreauth} className="space-y-4 text-xs">
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
                  <label className="font-semibold">Active Policy</label>
                  <select
                    value={policyId}
                    onChange={(e) => setPolicyId(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="">-- Select Linked Policy --</option>
                    {policies.map((pol) => (
                      <option key={pol._id} value={pol._id}>
                        {pol.policyNumber} (₹{pol.availableBalance || pol.sumInsured})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Provisional Diagnosis</label>
                <Input
                  type="text"
                  placeholder="e.g. Acute Appendicitis / Cholelithiasis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Proposed Clinical Procedure / Plan</label>
                <Input
                  type="text"
                  placeholder="e.g. Laparoscopic Appendectomy under GA"
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Treating Specialist</label>
                  <Input
                    type="text"
                    value={treatingDoctor}
                    onChange={(e) => setTreatingDoctor(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="General Surgery">General Surgery</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="ICU & Critical Care">ICU & Critical Care</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Est. Package (₹)</label>
                  <Input
                    type="number"
                    min="1000"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Requested Cashless (₹)</label>
                  <Input
                    type="number"
                    min="1000"
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(Number(e.target.value))}
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Stay (Days)</label>
                  <Input
                    type="number"
                    min="1"
                    value={expectedStayDays}
                    onChange={(e) => setExpectedStayDays(Number(e.target.value))}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-amber-600 hover:bg-amber-700 text-white">
                  {submitting ? "Transmitting..." : `Submit Pre-Auth (₹${requestedAmount.toLocaleString("en-IN")})`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Approval Modal */}
      {approvalModalPreauth && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-background rounded-xl border max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Record TPA Pre-Auth Sanction
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setApprovalModalPreauth(null)} className="h-7 w-7 p-0">
                ✕
              </Button>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
              <p><strong>Pre-Auth No:</strong> {approvalModalPreauth.preAuthNumber}</p>
              <p><strong>Patient:</strong> {approvalModalPreauth.patientId?.name}</p>
              <p><strong>Diagnosis:</strong> {approvalModalPreauth.diagnosis}</p>
              <p><strong>Requested Amount:</strong> ₹{Number(approvalModalPreauth.requestedAmount).toLocaleString("en-IN")}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold">Approved Cashless Limit (₹)</label>
                <Input
                  type="number"
                  min="1"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(Number(e.target.value))}
                  className="h-9 text-xs font-bold text-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">TPA Sanction Notes / Initial Capping</label>
                <Input
                  type="text"
                  placeholder="e.g. Initial approval for 48 hrs stay"
                  value={queryDetails}
                  onChange={(e) => setQueryDetails(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => setApprovalModalPreauth(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus(approvalModalPreauth._id, "APPROVED", { approvedAmount, notes: queryDetails })}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Sanction ₹{approvedAmount.toLocaleString("en-IN")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
