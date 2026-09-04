"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileBadge,
  Search,
  Plus,
  RefreshCw,
  IndianRupee,
  Calendar,
  User,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function PatientPoliciesPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Add Policy Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [memberId, setMemberId] = useState("");
  const [policyType, setPolicyType] = useState("INDIVIDUAL");
  const [sumInsured, setSumInsured] = useState<number>(500000);
  const [copayPercentage, setCopayPercentage] = useState<number>(0);
  const [roomRentLimit, setRoomRentLimit] = useState<number>(5000);
  const [validFrom, setValidFrom] = useState(new Date().toISOString().slice(0, 10));
  const [validTill, setValidTill] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [polRes, patRes, provRes] = await Promise.all([
        fetch("/api/insurance/policies"),
        fetch("/api/patient"),
        fetch("/api/insurance/providers")
      ]);
      const polData = await polRes.json();
      const patData = await patRes.json();
      const provData = await provRes.json();

      if (polData.success) setPolicies(polData.data || []);
      if (patData.success) {
        setPatients(patData.data || []);
        if (patData.data?.length > 0) setPatientId(patData.data[0]._id);
      }
      if (provData.success) {
        setProviders(provData.data || []);
        if (provData.data?.length > 0) setProviderId(provData.data[0]._id);
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

  const handleAddPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !providerId || !policyNumber.trim() || sumInsured <= 0) {
      toast("Please complete all required fields", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/insurance/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          providerId,
          policyNumber,
          memberId: memberId || `MEM-${Date.now().toString().slice(-6)}`,
          policyType,
          coverageAmount: sumInsured,
          sumInsured,
          availableBalance: sumInsured,
          copayPercentage,
          roomRentLimit,
          validFrom: new Date(validFrom),
          validTill: new Date(validTill),
          status: "ACTIVE",
          notes
        })
      });
      const data = await res.json();
      if (data.success) {
        toast("Patient policy registered successfully!", "success");
        setShowAddModal(false);
        setPolicyNumber("");
        setMemberId("");
        fetchData();
      } else {
        toast(data.message || "Failed to add policy", "error");
      }
    } catch (err: any) {
      toast("Error: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPolicies = policies.filter((p) => {
    if (typeFilter !== "ALL" && p.policyType !== typeFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const pNum = (p.policyNumber || "").toLowerCase();
    const mId = (p.memberId || "").toLowerCase();
    const pName = (p.patientId?.name || "").toLowerCase();
    const pUhid = (p.patientId?.uhid || "").toLowerCase();
    const provName = (p.providerId?.name || "").toLowerCase();
    return pNum.includes(q) || mId.includes(q) || pName.includes(q) || pUhid.includes(q) || provName.includes(q);
  });

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
          <div className="p-2.5 bg-indigo-600/10 text-indigo-600 rounded-xl">
            <FileBadge className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Patient Insurance Policies</h1>
            <p className="text-sm text-muted-foreground">
              Registry of patient health insurance policies, coverage limits, copay deductions & cashless eligibility
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4" />
            Add Patient Policy
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
                placeholder="Search policies by Policy No, Member Card ID, Patient Name, or UHID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="ALL">All Policy Types</option>
                <option value="INDIVIDUAL">Individual Health</option>
                <option value="FAMILY_FLOATER">Family Floater</option>
                <option value="CORPORATE_GROUP">Corporate Group</option>
                <option value="GOVERNMENT_SCHEME">Government Scheme (PM-JAY)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-y text-muted-foreground text-left">
                <tr>
                  <th className="py-3 px-4 font-semibold">Policy / Member ID</th>
                  <th className="py-3 px-4 font-semibold">Insured Patient</th>
                  <th className="py-3 px-4 font-semibold">Insurance Provider / TPA</th>
                  <th className="py-3 px-4 font-semibold">Policy Type</th>
                  <th className="py-3 px-4 font-semibold text-right">Sum Insured (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Available Balance (₹)</th>
                  <th className="py-3 px-4 font-semibold text-center">Co-Pay</th>
                  <th className="py-3 px-4 font-semibold text-center">Validity Period</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPolicies.length > 0 ? (
                  filteredPolicies.map((p: any) => {
                    const isExpired = p.validTill ? new Date(p.validTill) < new Date() : false;
                    return (
                      <tr key={p._id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-indigo-700 dark:text-indigo-300">{p.policyNumber}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">Card: {p.memberId || "N/A"}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900 dark:text-white">{p.patientId?.name || "Patient"}</p>
                          <p className="text-[10px] text-muted-foreground">
                            UHID: {p.patientId?.uhid || "N/A"} &bull; Age: {p.patientId?.age} Y
                          </p>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                          {p.providerId?.name || "TPA Partner"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-[10px]">
                            {p.policyType?.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          ₹{Number(p.sumInsured || p.coverageAmount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{Number(p.availableBalance || p.sumInsured || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {p.copayPercentage ? `${p.copayPercentage}%` : "0%"}
                        </td>
                        <td className="py-3 px-4 text-center text-muted-foreground text-[11px]">
                          {p.validFrom ? new Date(p.validFrom).toLocaleDateString("en-IN", { month: 'short', year: 'numeric' }) : "-"}
                          {" to "}
                          {p.validTill ? new Date(p.validTill).toLocaleDateString("en-IN", { month: 'short', year: 'numeric' }) : "-"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isExpired ? (
                            <Badge variant="destructive" className="text-[10px]">EXPIRED</Badge>
                          ) : (
                            <Badge className="bg-emerald-600 text-white text-[10px]">ACTIVE</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-muted-foreground">
                      {loading ? "Loading policies..." : "No patient policies registered yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Policy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-background rounded-xl border max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FileBadge className="h-4 w-4 text-indigo-600" />
                Register Patient Health Policy
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)} className="h-7 w-7 p-0">
                ✕
              </Button>
            </div>

            <form onSubmit={handleAddPolicy} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold">Select Insured Patient</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Policy Number</label>
                  <Input
                    type="text"
                    placeholder="e.g. POL-2026-88992"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Card / Member ID</label>
                  <Input
                    type="text"
                    placeholder="e.g. TPA-MEM-00412"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Policy Type</label>
                  <select
                    value={policyType}
                    onChange={(e) => setPolicyType(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="FAMILY_FLOATER">Family Floater</option>
                    <option value="CORPORATE_GROUP">Corporate</option>
                    <option value="GOVERNMENT_SCHEME">PM-JAY Scheme</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Sum Insured (₹)</label>
                  <Input
                    type="number"
                    min="10000"
                    value={sumInsured}
                    onChange={(e) => setSumInsured(Number(e.target.value))}
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Co-Pay (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={copayPercentage}
                    onChange={(e) => setCopayPercentage(Number(e.target.value))}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Valid From</label>
                  <Input
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Valid Till</label>
                  <Input
                    type="date"
                    value={validTill}
                    onChange={(e) => setValidTill(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Policy Remarks / T&C Capping</label>
                <Input
                  type="text"
                  placeholder="e.g. Room rent 1% of sum insured limit"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {submitting ? "Registering..." : `Register Policy (₹${sumInsured.toLocaleString("en-IN")})`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
